import os
import json
import pathlib
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from uuid import uuid4
# Заменяем на твой путь к словарю UUID->matrix_name
from routes.UUID_MATRICES import MATRIX_UUIDS

from services.matrix_service import get_all_matrices, get_matrix_data
from utils.score_counter import calculate_order_score
from drafts.file_processor import BASE_DIR, process_input_files
from fastapi.middleware.cors import CORSMiddleware

# ===============================
# Глобальные настройки и инициализация
# ===============================
SECRET_KEY = "MY_SUPER_SECRET_KEY"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
CURRENT_BASE_DIR = pathlib.Path(__file__).parent.resolve()

app = FastAPI()
router = APIRouter()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

router = APIRouter()
app.include_router(router, tags=["Matrix Routes"])

in_memory_sessions: Dict[str, Dict[str, Any]] = {}

# ===============================
# JWT Вспомогательные функции
# ===============================

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_access_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Could not validate token")

oauth2_scheme = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(oauth2_scheme)) -> str:
    token = credentials.credentials
    payload = decode_access_token(token)
    username: str = payload.get("sub")
    if not username:
        raise HTTPException(status_code=401, detail="Invalid token: no 'sub'")
    return username

# ===============================
# Утилита для загрузки эталонной последовательности
# ===============================
TRUE_SEQ_DIR = CURRENT_BASE_DIR / "../data/processed_files/True_Seq"

def load_true_sequence(matrix_name: str) -> Dict[int, float]:
    """
    Загружает эталонную последовательность для данной матрицы по её имени
    из файла JSON (например, 'South Korea financial crisis.json').
    """
    json_path = TRUE_SEQ_DIR / f"{matrix_name}.json"
    if not json_path.exists():
        raise FileNotFoundError(f"True sequence file not found: {json_path}")
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return {int(k): float(v) for k, v in data.items()}

# Вспомогательная функция: найти uuid для матрицы
def get_uuid_by_matrix_name(matrix_name: str) -> Optional[str]:
    for uuid_key, name in MATRIX_UUIDS.items():
        if name == matrix_name:
            return uuid_key
    return None

# ===============================
# ЭНДПОИНТЫ
# ===============================

@router.get("/matrices")
def get_matrices():
    """
    Возвращает список всех матриц, доступных на сервере,
    вместе с их uuid (если он есть в словаре MATRIX_UUIDS).
    """
    try:
        matrices = get_all_matrices()  # [{'matrix_id', 'matrix_name', 'node_count', 'edge_count', 'meta'} ... ]
        result = []
        for m in matrices:
            matrix_name = m.get("matrix_name")
            matrix_uuid = get_uuid_by_matrix_name(matrix_name)
            m["uuid"] = matrix_uuid  # Вставляем uuid, если нашли (или None)
            # Если нужно, фильтруй матрицы без uuid, либо возвращай как есть
            result.append(m)
        return {"matrices": result}
    except Exception as e:
        return {"error": str(e)}

@router.get("/matrix_by_uuid/{uuid}")
def get_matrix_by_uuid(uuid: str):
    """
    Возвращает данные матрицы по её uuid.
    """
    matrix_name = MATRIX_UUIDS.get(uuid)
    if not matrix_name:
        return {"error": f"UUID '{uuid}' not found in MATRIX_UUIDS"}, 404

    # Берём данные матрицы через имя
    matrix_data = get_matrix_data_by_name(matrix_name)
    if not matrix_data:
        return {"error": f"Matrix data for '{matrix_name}' unavailable"}, 404

    return {
        "matrix_info": {"matrix_name": matrix_name, "uuid": uuid},
        "nodes": matrix_data["nodes"],
        "edges": matrix_data["edges"]
    }

def get_matrix_data_by_name(matrix_name: str) -> Dict[str, Any]:
    """
    Обёртка над get_matrix_data, если нужно. Или сразу get_matrix_data_by_name
    из services.matrix_service. Здесь, если нужно, можно адаптировать логику.
    """
    # У тебя в matrix_service есть метод get_matrix_data_by_name; можно напрямую.
    # Или, если нуждается в ID, убери ID и делай прямое чтение файла. Пример:
    from services.matrix_service import get_matrix_data_by_name
    return get_matrix_data_by_name(matrix_name)

@router.post("/calculate_score")
async def calculate_score(request: Request):
    """
    Рассчитывает очки за ход на основе uuid матрицы (вместо matrix_id или "имя"_result).
    """
    try:
        body = await request.json()
        nodes = body.get('selectedNodes', {})
        matrix_uuid = body.get('uuid')

        if not matrix_uuid:
            return {"error": "Matrix UUID is required"}, 400

        matrix_name = f"{MATRIX_UUIDS.get(matrix_uuid)}_result"
        if not matrix_name:
            return {"error": "Matrix UUID not found in MATRIX_UUIDS"}, 404

        try:
            matrix_order = load_true_sequence(matrix_name)
        except FileNotFoundError:
            return {"error": f"True sequence for '{matrix_name}' not found"}, 404

        node_values = list(nodes.values())
        user_id = "anonymous"  # При желании можешь получать user из токена

        if user_id not in in_memory_sessions:
            in_memory_sessions[user_id] = {
                "turns": [],
                "total_score": 0,
                "used_nodes": []
            }

        session_data = in_memory_sessions[user_id]

        # Проверка: не используем ли уже выбранные вершины
        if any(node in session_data['used_nodes'] for node in node_values):
            return {"error": "Some nodes have already been used in previous turns"}, 400

        # Считаем очки
        order_score = calculate_order_score(node_values, matrix_order)
        if not isinstance(order_score, (int, float)) or np.isnan(order_score) or order_score < 0:
            order_score = 0

        # Сохраняем результат хода
        session_data['turns'].append({
            'nodes': node_values,
            'score': order_score
        })
        session_data['total_score'] = max(0, session_data['total_score'] + order_score)
        session_data['used_nodes'].extend(node_values)

        return {
            'turn_score': order_score,
            'total_score': session_data['total_score'],
            'turns': session_data['turns']
        }, 200

    except Exception as e:
        return {"error": str(e)}, 500


# --------------------
# /science_table [POST]
# --------------------
@router.post("/science_table")
async def get_science_table(request: Request):
    """
    Эндпоинт, который обрабатывает report.txt (или вызывает Fortran при его отсутствии).
    Теперь тоже берём matrix_uuid из тела, конвертим в matrix_name и ищем report.txt
    """
    try:
        body = await request.json()
        matrix_uuid = body.get('matrixUuid')  # или 'uuid'
        if not matrix_uuid:
            return {"error": "Matrix uuid is required"}, 400

        matrix_name = MATRIX_UUIDS.get(matrix_uuid)
        if not matrix_name:
            return {"error": f"UUID '{matrix_uuid}' not found in MATRIX_UUIDS"}, 404

        # Формируем путь к report.txt
        report_file_path = BASE_DIR / "Vadimka" / f"{matrix_name}_report.txt"

        # Проверяем наличие report.txt
        if not report_file_path.exists():
            print(f"[INFO] Файл {report_file_path} не найден. Запускаем процесс обработки Fortran.")
            process_input_files(
                str(BASE_DIR / "../data/models"),
                str(BASE_DIR / "processed_files"),
                BASE_DIR / "edited_mils.f90"
            )

        # Снова проверяем после обработки
        if report_file_path.exists():
            with open(report_file_path, "r") as report:
                lines = report.readlines()
        else:
            return {"error": "report.txt not found"}, 404

        # Читаем данные
        u = [float(line[12:-1]) for line in lines if len(line) <= 23]
        x = [float(line[1:10]) for line in lines if len(line) <= 23]

        # Вычисляем квадраты и нормализацию
        sq_u = [num ** 2 for num in u]
        sum_sq_u = sum(sq_u)
        normalized_u = [round(value / sum_sq_u, 4) for value in sq_u] if sum_sq_u != 0 else []
        normalized_x = [num ** 2 for num in x]
        true_seq = {i + 1: value for i, value in enumerate(normalized_u)}
        sorted_true_seq = sorted(true_seq.items(), key=lambda x: x[1], reverse=True)

        print("\ntrue_seq:\t", true_seq, "\n")
        print("sorted_true_seq:\t", sorted_true_seq, "\n")

        result = {
            "x": x,
            "u": u,
            "normalized_x": normalized_x,
            "normalized_u": normalized_u,
            "matrix_name": matrix_name,
            "sorted_true_seq": sorted_true_seq
        }
        return result, 200

    except FileNotFoundError:
        return {"error": "report.txt not found"}, 404
    except Exception as e:
        return {"error": str(e)}, 500


# ===================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====================
def ensure_dir(directory):
    """Создает директорию, если она не существует."""
    os.makedirs(directory, exist_ok=True)
    return directory

def save_json(filepath, data):
    """Сохраняет data в виде JSON в указанный filepath."""
    with open(filepath, 'w', encoding='utf-8') as file:
        json.dump(data, file, indent=2)

def load_json(filepath):
    """Читает JSON из указанного filepath."""
    with open(filepath, 'r', encoding='utf-8') as file:
        return json.load(file)

def get_default_settings_filepath(matrix_name):
    """Возвращает путь для сохранения настроек графа по умолчанию."""
    folder = os.path.join(CURRENT_BASE_DIR, "graph_settings")
    ensure_dir(folder)
    return os.path.join(folder, f"{matrix_name}_graph_settings.json")

def get_user_settings_filepath(user_id, matrix_name):
    """Возвращает путь для сохранения настроек графа для пользователя."""
    folder = os.path.join(CURRENT_BASE_DIR, "users", user_id, "user_settings")
    ensure_dir(folder)
    return os.path.join(folder, f"{matrix_name}_settings.json")

def get_user_creds_filepath(username):
    """Возвращает путь к файлу учетных данных пользователя без создания папок."""
    return os.path.join(CURRENT_BASE_DIR, "users", username, "user_creds", f"{username}.json")

# ===================== ЭНДПОИНТЫ ДЛЯ НАСТРОЕК ГРАФА =====================

@router.post("/save-graph-settings/{matrix_uuid}")
async def save_graph_settings(matrix_uuid: str, request: Request):
    """
    Сохраняет настройки графа по умолчанию в JSON-файл (уже через uuid).
    """
    try:
        data = await request.json()
        if not data:
            return {"error": "No data provided"}, 400

        matrix_name = MATRIX_UUIDS.get(matrix_uuid)
        if not matrix_name:
            return {"error": f"UUID '{matrix_uuid}' not found in MATRIX_UUIDS"}, 404

        filepath = get_default_settings_filepath(matrix_name)
        save_json(filepath, data)
        print(f"[INFO] Default settings saved at {filepath}.")
        return {"message": "Настройки графа успешно сохранены."}, 200
    except Exception as e:
        print(f"[ERROR] Ошибка при сохранении файла: {e}")
        return {"error": "Ошибка при сохранении файла."}, 500

@router.get("/load-graph-settings/{matrix_uuid}")
def load_graph_settings(matrix_uuid: str):
    """
    Загружает настройки графа по умолчанию из JSON-файла (уже через uuid).
    """
    try:
        matrix_name = MATRIX_UUIDS.get(matrix_uuid)
        if not matrix_name:
            return {"error": f"UUID '{matrix_uuid}' not found in MATRIX_UUIDS"}, 404

        filepath = get_default_settings_filepath(matrix_name)
        if not os.path.exists(filepath):
            return {"error": f"Файл настроек для '{matrix_name}' не найден."}, 404

        data = load_json(filepath)
        print(f"[INFO] Default settings loaded from {filepath}.")
        return data, 200
    except Exception as e:
        print(f"[ERROR] Ошибка загрузки файла: {e}")
        return {"error": "Ошибка загрузки файла."}, 500



# ===================== ЭНДПОИНТЫ ДЛЯ ПОЛЬЗОВАТЕЛЬСКИХ НАСТРОЕК ГРАФА =====================

def get_user_settings_filepath(user_id: str, matrix_name: str) -> str:
    """
    Возвращает путь к файлу настроек для пользователя user_id и матрицы matrix_name.
    Например:  users/<user_id>/user_settings/<matrix_name>_settings.json

    Если хочешь хранить через uuid, сделай, например:
      return os.path.join(folder, f"{matrix_uuid}_settings.json")
    """
    folder = os.path.join("users", user_id, "user_settings")
    ensure_dir(folder)
    return os.path.join(folder, f"{matrix_name}_settings.json")


@router.post("/{user_id}/save-graph-settings/{matrix_uuid}")
async def save_user_graph_settings(user_id: str, matrix_uuid: str, request: Request):
    """
    Сохраняет настройки графа для пользователя user_id.
    Принимает uuid матрицы, маппит на matrix_name, и сохраняет настройки в:
      users/<user_id>/user_settings/<matrix_name>_settings.json
    """
    try:
        data = await request.json()
        if not data:
            return {"error": "No data provided"}, 400

        matrix_name = MATRIX_UUIDS.get(matrix_uuid)
        if not matrix_name:
            return {"error": f"UUID '{matrix_uuid}' not found in MATRIX_UUIDS"}, 404

        filepath = get_user_settings_filepath(user_id, matrix_name)
        save_json(filepath, data)
        print(f"[INFO] Settings for user '{user_id}' and matrix '{matrix_name}' saved at {filepath}.")
        return {"message": "Настройки графа успешно сохранены."}, 200
    except Exception as e:
        print(f"[ERROR] Ошибка при сохранении файла для user '{user_id}': {e}")
        return {"error": "Ошибка при сохранении файла."}, 500


@router.get("/{user_id}/load-graph-settings/{matrix_uuid}")
def load_user_graph_settings(user_id: str, matrix_uuid: str):
    """
    Загружает настройки графа для пользователя user_id.
    Принимает uuid матрицы, маппит на matrix_name, и ищет файл:
      users/<user_id>/user_settings/<matrix_name>_settings.json
    """
    try:
        matrix_name = MATRIX_UUIDS.get(matrix_uuid)
        if not matrix_name:
            return {"error": f"UUID '{matrix_uuid}' not found in MATRIX_UUIDS"}, 404

        filepath = get_user_settings_filepath(user_id, matrix_name)
        if not os.path.exists(filepath):
            return {"error": f"Файл настроек для '{matrix_name}' пользователя '{user_id}' не найден."}, 404

        data = load_json(filepath)
        print(f"[INFO] Settings for user '{user_id}' and matrix '{matrix_name}' loaded from {filepath}.")
        return data, 200
    except Exception as e:
        print(f"[ERROR] Ошибка загрузки файла для user '{user_id}': {e}")
        return {"error": "Ошибка загрузки файла."}, 500


# ===================== ЭНДПОИНТЫ ДЛЯ АВТОРИЗАЦИИ =====================

@router.post("/sign-up")
async def sign_up(request: Request):
    """
    Роутер для регистрации пользователя.
    Ожидает JSON с полями: username, email, password.
    Данные сохраняются в:  ./users/<username>/user_creds/<username>.json

    В продакшене пароль НЕ хранится в открытом виде, используется хэширование (bcrypt, argon2 и т.д.).
    """
    try:
        data = await request.json()
        username = data.get("username")
        email = data.get("email")
        password = data.get("password")

        if not username or not email or not password:
            return {"error": "username, email и password обязательны"}, 400

        creds_filepath = get_user_creds_filepath(username)
        if os.path.exists(creds_filepath):
            return {"error": "Пользователь с таким именем уже существует"}, 400

        folder = os.path.dirname(creds_filepath)
        os.makedirs(folder, exist_ok=True)

        user_data = {
            "username": username,
            "email": email,
            # Здесь желательно хранить ХЭШ пароля, а не сам пароль
            "password": password
        }
        save_json(creds_filepath, user_data)
        print(f"[INFO] User '{username}' registered with credentials at {creds_filepath}.")
        return {"message": "Пользователь успешно зарегистрирован"}, 201
    except Exception as e:
        return {"error": str(e)}, 500


@router.post("/sign-up")
async def sign_up(request: Request):
    try:
        data = await request.json()
        username = data.get("username")
        email = data.get("email")
        password = data.get("password")

        if not username or not email or not password:
            return {"error": "username, email и password обязательны"}, 400

        # Проверяем: существует ли такой username?
        creds_filepath = get_user_creds_filepath(username)
        if os.path.exists(creds_filepath):
            return {"error": "Пользователь с таким именем уже существует"}, 400

        user_uuid = str(uuid4())

        user_data = {
            "username": username,
            "email": email,
            "password": password,
            "user_uuid": user_uuid
        }

        folder = os.path.dirname(creds_filepath)
        os.makedirs(folder, exist_ok=True)
        save_json(creds_filepath, user_data)

        # Создаём папку под user_uuid
        user_folder = CURRENT_BASE_DIR / "users" / user_uuid
        os.makedirs(user_folder / "user_settings", exist_ok=True)
        os.makedirs(user_folder / "user_creds", exist_ok=True)

        # Дублируем креды в папку UUID (чтобы все запросы шли через uuid)
        uuid_creds_path = user_folder / "user_creds" / f"{user_uuid}.json"
        save_json(uuid_creds_path, user_data)

        return {
            "message": "Пользователь успешно зарегистрирован",
            "user_uuid": user_uuid
        }, 201
    except Exception as e:
        return {"error": str(e)}, 500

# ===============================
# Регистрация роутера
# ===============================
app.include_router(router, tags=["Matrix Routes"])
