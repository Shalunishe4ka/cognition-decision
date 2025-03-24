import os
import json
import pathlib
import logging
import numpy as np
from uuid import uuid4
from datetime import datetime, timedelta
from typing import Dict, Any
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
import jwt
from fastapi.responses import JSONResponse

# Внешние импорты
from services.matrix_service import get_all_matrices, get_matrix_data_by_name
from utils.score_counter import calculate_order_score
from drafts.file_processor import BASE_DIR, process_input_files
from routes.UUID_MATRICES import MATRIX_UUIDS

# =============================== Инициализация ===============================
app = FastAPI()
router = APIRouter()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # Смотри, можно ограничивать, если требуется
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("matrix_routes")

CURRENT_DIR = pathlib.Path(__file__).parent.resolve()
USERS_ROOT = (CURRENT_DIR / "../users").resolve()
TRUE_SEQ_DIR = (CURRENT_DIR / "../data/processed_files/True_Seq").resolve()

SECRET_KEY = "MY_SUPER_SECRET_KEY"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
oauth2_scheme = HTTPBearer()

# Здесь храним сессии в памяти, ключ: user_uuid -> { matrix_uuid -> { turns, used_nodes, total_score } }
in_memory_sessions: Dict[str, Dict[str, Any]] = {}

# =============================== Утилиты ===============================
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    log.error(f"[UNHANDLED ERROR] {request.url.path} → {exc}")
    return JSONResponse(content={"error": "Internal Server Error"}, status_code=500)

def ensure_dir(path: pathlib.Path) -> pathlib.Path:
    path.mkdir(parents=True, exist_ok=True)
    return path

def save_json(filepath: pathlib.Path, data):
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)

def load_json(filepath: pathlib.Path):
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def get_user_creds_filepath(username: str) -> pathlib.Path:
    return (USERS_ROOT / username / "user_creds" / f"{username}.json").resolve()

def get_user_uuid_creds_path(user_uuid: str) -> pathlib.Path:
    return (USERS_ROOT / user_uuid / "user_creds" / f"{user_uuid}.json").resolve()

def get_user_settings_filepath(user_uuid: str, matrix_name: str) -> pathlib.Path:
    path = USERS_ROOT / user_uuid / "user_settings"
    ensure_dir(path)
    return (path / f"{matrix_name}_settings.json").resolve()

def get_default_settings_filepath(matrix_name: str) -> pathlib.Path:
    path = CURRENT_DIR / "graph_settings"
    ensure_dir(path)
    return (path / f"{matrix_name}_graph_settings.json").resolve()

def load_true_sequence(matrix_name: str) -> Dict[int, float]:
    path = TRUE_SEQ_DIR / f"{matrix_name}.json"
    if not path.exists():
        raise FileNotFoundError(f"True sequence not found: {path}")
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return {int(k): float(v) for k, v in data.items()}

# =============================== JWT ===============================
def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_access_token(token: str):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_current_user_uuid(credentials: HTTPAuthorizationCredentials = Depends(oauth2_scheme)) -> str:
    token = credentials.credentials
    payload = decode_access_token(token)
    user_uuid = payload.get("uuid")
    if not user_uuid:
        raise HTTPException(status_code=401, detail="Token missing uuid")
    return user_uuid

# =============================== Эндпоинты: Регистрация и Вход ===============================
@router.post("/sign-up")
async def sign_up(request: Request):
    try:
        data = await request.json()
        username, email, password = data.get("username"), data.get("email"), data.get("password")
        if not username or not email or not password:
            return JSONResponse({"error": "username, email и password обязательны"}, 400)

        creds_path = get_user_creds_filepath(username)
        if creds_path.exists():
            return JSONResponse({"error": "Пользователь с таким именем уже существует"}, 400)

        user_uuid = str(uuid4())
        user_data = {"username": username, "email": email, "password": password, "user_uuid": user_uuid}

        ensure_dir(creds_path.parent)
        save_json(creds_path, user_data)

        uuid_creds_path = get_user_uuid_creds_path(user_uuid)
        ensure_dir(uuid_creds_path.parent)
        save_json(uuid_creds_path, user_data)

        ensure_dir(USERS_ROOT / user_uuid / "user_settings")
        log.info(f"[REGISTER] user_uuid: {user_uuid}")
        return JSONResponse({"message": "Регистрация успешна", "user_uuid": user_uuid}, 201)
    except Exception as e:
        log.error(f"[REGISTER ERROR]: {e}")
        return JSONResponse({"error": str(e)}, 500)

@router.post("/sign-in")
async def sign_in(request: Request):
    try:
        data = await request.json()
        username, password = data.get("username"), data.get("password")
        if not username or not password:
            return JSONResponse({"error": "username и password обязательны"}, 400)

        creds_path = get_user_creds_filepath(username)
        if not creds_path.exists():
            return JSONResponse({"error": "Пользователь не найден"}, 404)

        user_data = load_json(creds_path)
        if user_data.get("password") != password:
            return JSONResponse({"error": "Неверный пароль"}, 401)

        user_uuid = user_data.get("user_uuid")
        token = create_access_token({"sub": username, "uuid": user_uuid})
        log.info(f"[LOGIN] user_uuid: {user_uuid}")
        return JSONResponse({"message": "Вход выполнен", "access_token": token, "token_type": "bearer"}, 200)
    except Exception as e:
        log.error(f"[LOGIN ERROR]: {e}")
        return JSONResponse({"error": str(e)}, 500)

# =============================== Эндпоинты: Матрицы ===============================
@router.get("/matrices")
def get_matrices():
    try:
        matrices = get_all_matrices()
        result = []
        for m in matrices:
            matrix_name = m.get("matrix_name")
            uuid = next((k for k, v in MATRIX_UUIDS.items() if v == matrix_name), None)
            m["uuid"] = uuid
            result.append(m)
        return JSONResponse(content={"matrices": result}, status_code=200)
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

@router.get("/matrix_by_uuid/{uuid}")
def get_matrix_by_uuid(uuid: str):
    matrix_name = MATRIX_UUIDS.get(uuid)
    if not matrix_name:
        return JSONResponse({"error": f"UUID '{uuid}' не найден"}, 404)
    data = get_matrix_data_by_name(matrix_name)
    if not data:
        return JSONResponse({"error": f"Данные матрицы недоступны"}, 404)
    return JSONResponse(content={
        "matrix_info": {"matrix_name": matrix_name, "uuid": uuid},
        "nodes": data["nodes"],
        "edges": data["edges"]
    }, status_code=200)

# =============================== calculate_score ===============================
@app.post("/calculate_score")
async def calculate_score(
    request: Request,
    current_user_uuid: str = Depends(get_current_user_uuid)  # <-- привязка к пользователю
):
    try:
        body = await request.json()
        nodes = body.get('selectedNodes', {})
        matrix_uuid = body.get('uuid')

        if not matrix_uuid:
            return JSONResponse({"error": "Matrix UUID is required"}, 400)

        matrix_name_raw = MATRIX_UUIDS.get(matrix_uuid)
        if not matrix_name_raw:
            return JSONResponse({"error": "Matrix UUID not found"}, 404)

        matrix_name = f"{matrix_name_raw}_result"

        # Загружаем "идеальную" последовательность (True_Seq)
        path_to_seq = TRUE_SEQ_DIR / f"{matrix_name}.json"
        if not path_to_seq.exists():
            return JSONResponse({"error": f"True sequence for '{matrix_name}' not found"}, 404)
        with open(path_to_seq, 'r', encoding='utf-8') as f:
            data = json.load(f)
        matrix_order = {int(k): float(v) for k, v in data.items()}

        # ------------------ Ищем/создаём сессию для user_uuid + matrix_uuid ------------------ #
        if current_user_uuid not in in_memory_sessions:
            in_memory_sessions[current_user_uuid] = {}

        if matrix_uuid not in in_memory_sessions[current_user_uuid]:
            in_memory_sessions[current_user_uuid][matrix_uuid] = {
                "turns": [],
                "total_score": 0,
                "used_nodes": []
            }
        session_data = in_memory_sessions[current_user_uuid][matrix_uuid]

        node_values = list(nodes.values())
        # Проверяем, не использовались ли эти вершины ранее
        if any(node in session_data['used_nodes'] for node in node_values):
            return JSONResponse({"error": "Некоторые вершины уже использовались"}, 400)

        # Считаем score
        order_score = calculate_order_score(node_values, matrix_order)
        if not isinstance(order_score, (int, float)) or np.isnan(order_score):
            order_score = 0
        order_score = max(0, order_score)

        # Обновляем серверную сессию
        session_data['turns'].append({'nodes': node_values, 'score': order_score})
        session_data['total_score'] += order_score
        session_data['used_nodes'].extend(node_values)

        return JSONResponse({
            'turn_score': order_score,
            'total_score': session_data['total_score'],
            'turns': session_data['turns']
        }, 200)

    except Exception as e:
        return JSONResponse({"error": str(e)}, 500)


# ===================== Сброс игры (reset-game) =====================
@app.post("/reset-game")
async def reset_game(
    request: Request,
    current_user_uuid: str = Depends(get_current_user_uuid)
):
    """
    Сбрасывает состояние (used_nodes, turns, total_score) для конкретной матрицы у конкретного user_uuid
    """
    try:
        body = await request.json()
        matrix_uuid = body.get("uuid")
        if not matrix_uuid:
            return JSONResponse({"error": "uuid is required"}, 400)

        if current_user_uuid not in in_memory_sessions:
            in_memory_sessions[current_user_uuid] = {}

        in_memory_sessions[current_user_uuid][matrix_uuid] = {
            "turns": [],
            "total_score": 0,
            "used_nodes": []
        }

        return JSONResponse({"message": "Game session reset", "matrix_uuid": matrix_uuid}, 200)

    except Exception as e:
        log.error(f"[RESET GAME ERROR]: {e}")
        return JSONResponse({"error": str(e)}, 500)


# =============================== science_table ===============================

@router.post("/science_table")
async def get_science_table(request: Request):
    try:
        body = await request.json()
        matrix_uuid = body.get('matrixUuid')
        if not matrix_uuid:
            return JSONResponse({"error": "Matrix UUID is required"}, 400)

        matrix_name = MATRIX_UUIDS.get(matrix_uuid)
        if not matrix_name:
            return JSONResponse({"error": "Matrix UUID not found"}, 404)

        report_file_path = BASE_DIR / "../data/processed_files/Reports" / f"{matrix_name}_report.txt"

        if not report_file_path.exists():
            log.info(f"Report not found: {report_file_path}. Processing...")
            process_input_files(
                str(BASE_DIR / "../data/models"),
                str(BASE_DIR / "processed_files"),
                BASE_DIR / "edited_mils.f90"
            )

        if not report_file_path.exists():
            return JSONResponse({"error": "report.txt not found"}, 404)

        with open(report_file_path, "r") as f:
            lines = f.readlines()

        u = [float(line[12:-1]) for line in lines if len(line) <= 23]
        x = [float(line[1:10]) for line in lines if len(line) <= 23]

        sq_u = [num ** 2 for num in u]
        sum_sq_u = sum(sq_u)
        normalized_u = [round(v / sum_sq_u, 4) for v in sq_u] if sum_sq_u else []
        normalized_x = [num ** 2 for num in x]

        true_seq = {i + 1: v for i, v in enumerate(normalized_u)}
        sorted_seq = sorted(true_seq.items(), key=lambda item: item[1], reverse=True)

        return JSONResponse(content={
            "x": x,
            "u": u,
            "normalized_x": normalized_x,
            "normalized_u": normalized_u,
            "matrix_name": matrix_name,
            "sorted_true_seq": sorted_seq
        }, status_code=200)

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)


@router.post("/log-science-query")
async def log_science_query(request: Request):
    try:
        body = await request.json()
        matrix_uuid = body.get('matrixUuid')
        user_uuid = body.get('userUuid')

        if not matrix_uuid or not user_uuid:
            return JSONResponse({"error": "matrixUuid и userUuid обязательны"}, status_code=400)

        log.info(f"[LOG QUERY] userUuid: {user_uuid}, matrixUuid: {matrix_uuid}")
        # Тут можно добавить сохранение в файл или базу, если нужно.

        return JSONResponse({"message": "Научный запрос успешно залогирован"}, status_code=200)

    except Exception as e:
        log.error(f"[LOG QUERY ERROR]: {e}")
        return JSONResponse({"error": str(e)}, status_code=500)
# =============================== graph settings ===============================

@router.post("/save-graph-settings/{matrix_uuid}")
async def save_default_graph_settings(matrix_uuid: str, request: Request):
    """
    Сохраняет дефолтные настройки графа по UUID матрицы.
    """
    try:
        data = await request.json()
        if not data:
            return JSONResponse({"error": "Нет данных для сохранения"}, 400)

        matrix_name = MATRIX_UUIDS.get(matrix_uuid)
        if not matrix_name:
            return JSONResponse({"error": "UUID не найден"}, 404)

        filepath = get_default_settings_filepath(matrix_name)
        save_json(filepath, data)
        log.info(f"[SAVE DEFAULT] {filepath}")
        return JSONResponse({"message": "Дефолтные настройки сохранены"}, 200)
    except Exception as e:
        log.error(f"[SAVE DEFAULT ERROR]: {e}")
        return JSONResponse({"error": str(e)}, 500)

@router.get("/load-graph-settings/{matrix_uuid}")
def load_default_graph_settings(matrix_uuid: str):
    """
    Загружает дефолтные настройки графа по UUID матрицы.
    """
    try:
        matrix_name = MATRIX_UUIDS.get(matrix_uuid)
        if not matrix_name:
            return JSONResponse({"error": "UUID не найден"}, 404)

        filepath = get_default_settings_filepath(matrix_name)
        if not filepath.exists():
            return JSONResponse({"error": "Файл настроек не найден"}, 404)

        data = load_json(filepath)
        log.info(f"[LOAD DEFAULT] {filepath}")
        return JSONResponse(content=data, status_code=200)
    except Exception as e:
        log.error(f"[LOAD DEFAULT ERROR]: {e}")
        return JSONResponse({"error": str(e)}, 500)
    


@router.post("/{user_uuid}/save-graph-settings/{matrix_uuid}")
async def save_user_graph_settings(user_uuid: str, matrix_uuid: str, request: Request):
    """
    Сохраняет пользовательские настройки графа.
    """
    try:
        data = await request.json()
        if not data:
            return JSONResponse({"error": "Нет данных для сохранения"}, 400)

        matrix_name = MATRIX_UUIDS.get(matrix_uuid)
        if not matrix_name:
            return JSONResponse({"error": "UUID не найден"}, 404)

        filepath = get_user_settings_filepath(user_uuid, matrix_name)
        save_json(filepath, data)
        log.info(f"[SAVE USER] {filepath}")
        return JSONResponse({"message": "Настройки пользователя сохранены"}, 200)
    except Exception as e:
        log.error(f"[SAVE USER ERROR]: {e}")
        return JSONResponse({"error": str(e)}, 500)

@router.get("/{user_uuid}/load-graph-settings/{matrix_uuid}")
def load_user_graph_settings(user_uuid: str, matrix_uuid: str):
    """
    Загружает пользовательские настройки графа.
    """
    try:
        matrix_name = MATRIX_UUIDS.get(matrix_uuid)
        if not matrix_name:
            return JSONResponse({"error": "UUID не найден"}, 404)

        filepath = get_user_settings_filepath(user_uuid, matrix_name)
        if not filepath.exists():
            return JSONResponse({"error": "Файл настроек не найден"}, 404)

        data = load_json(filepath)
        log.info(f"[LOAD USER] {filepath}")
        return JSONResponse(content=data, status_code=200)
    except Exception as e:
        log.error(f"[LOAD USER ERROR]: {e}")
        return JSONResponse({"error": str(e)}, 500)