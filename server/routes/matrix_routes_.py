import os
import json
import pathlib
import numpy as np
# import asyncio
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from routes.UUID_MATRICES import MATRIX_UUIDS
# FastAPI импорты
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials


# PyJWT для токенов
import jwt

# Исходные импорты из вашего кода
from services.matrix_service import get_all_matrices, get_matrix_data, get_response_strength, matrix_ids
from utils.score_counter import calculate_order_score
from drafts.file_processor import BASE_DIR, process_input_files

from fastapi.middleware.cors import CORSMiddleware


# Глобальные настройки для JWT
SECRET_KEY = "MY_SUPER_SECRET_KEY"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Создаём FastAPI-приложение и router (аналог Flask app и Blueprint)
app = FastAPI()
router = APIRouter()




# Разрешаем CORS, ниже – максимально «открытый» вариант:
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # Разрешить со всех доменов (для dev-режима)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

router = APIRouter()

# Ваши эндпоинты и т.д.

app.include_router(router, tags=["Matrix Routes"])


# Заменяем session на глобальный словарь: key = имя пользователя, value = данные сессии
in_memory_sessions: Dict[str, Dict[str, Any]] = {}

# ===================================
# JWT Вспомогательные функции
# ===================================

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Генерирует JWT-токен с временем жизни (по умолчанию 30 минут).
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> dict:
    """
    Декодирует JWT-токен, проверяет подпись и срок годности.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Could not validate token")

# Зависимость для FastAPI — проверяем заголовок Authorization, декодируем токен
oauth2_scheme = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(oauth2_scheme)) -> str:
    """
    Извлекает username из валидного Bearer-токена.
    """
    token = credentials.credentials  # сам JWT без "Bearer "
    payload = decode_access_token(token)
    username: str = payload.get("sub")
    if not username:
        raise HTTPException(status_code=401, detail="Invalid token: no 'sub'")
    return username

# ===================================
# ОРИГИНАЛЬНЫЕ ЭНДПОИНТЫ
# ===================================

CURRENT_BASE_DIR = pathlib.Path(__file__).parent.resolve()

# --------------------
# /matrices [GET]
# --------------------
@router.get("/matrices")
def get_matrices():
    """
    Возвращает список доступных матриц.
    """
    try:
        matrices = get_all_matrices()
        return {"matrices": matrices}
    except Exception as e:
        return {"error": str(e)}

# --------------------
# /matrix/<int:matrix_id>
# --------------------

@router.get("/matrix_by_uuid/{uuid}")
def get_matrix_by_uuid(uuid: str):
    """
    Возвращает матрицу (nodes, edges) по UUID карточки.
    """
    matrix_name = MATRIX_UUIDS.get(uuid)
    if not matrix_name:
        return {"error": "UUID not found"}, 404

    # Ищем matrix_id по matrix_name
    matrix_id = None
    for mid, name in matrix_ids.items():
        if name == matrix_name:
            matrix_id = mid
            break

    if matrix_id is None:
        return {"error": f"Matrix '{matrix_name}' not found"}, 404

    # Получаем данные матрицы
    matrix_data = get_matrix_data(matrix_id)
    if not matrix_data:
        return {"error": f"Matrix data for '{matrix_name}' unavailable"}, 404

    return {
        "matrix_info": {"matrix_name": matrix_name},
        "nodes": matrix_data["nodes"],
        "edges": matrix_data["edges"]
    }


@router.get("/matrix/{matrix_id}")
def get_matrix_info(matrix_id: int):
    """
    Возвращает информацию о конкретной матрице по её ID.
    """
    try:
        matrix_data = get_matrix_data(matrix_id)
        if matrix_data:
            return {
                "matrix_info": {"matrix_name": matrix_data["matrix_name"]},
                "nodes": matrix_data["nodes"],
                "edges": matrix_data["edges"],
            }
        else:
            return {"error": f"Matrix with ID '{matrix_id}' not found."}
    except Exception as e:
        return {"error": str(e)}

# --------------------
# /calculate_score [POST]
# --------------------
@router.post("/calculate_score")
async def calculate_score(request: Request):
    """
    Эндпоинт для расчета очков игрока с учетом порядка выбранных вершин.
    """
    try:
        body = await request.json()
        nodes = body.get('selectedNodes', {})
        matrix_name = body.get('matrixName')

        if not matrix_name:
            return {"error": "Matrix name is required"}, 400

        # Получение словаря с откликами
        response_strength = get_response_strength(matrix_name)
        if response_strength is None:
            return {"error": f"Matrix '{matrix_name}' not found"}, 404

        # Преобразуем словарь в список вершин
        node_values = list(nodes.values())

        # Здесь вместо Flask session используем глобальный словарь in_memory_sessions.
        # В оригинальном коде не было авторизации, поэтому используем фиктивное имя пользователя "anonymous".
        user_id = "anonymous"  
        if user_id not in in_memory_sessions:
            in_memory_sessions[user_id] = {
                "turns": [],
                "total_score": 0,
                "used_nodes": []
            }

        session_data = in_memory_sessions[user_id]

        # Проверка на повторение вершин
        if any(node in session_data['used_nodes'] for node in node_values):
            return {"error": "Some nodes have already been used in previous turns"}, 400

        # Сохранение текущего хода
        order_score = calculate_order_score(node_values, response_strength)

        # Защита от некорректных значений
        if not isinstance(order_score, (int, float)) or np.isnan(order_score) or order_score < 0:
            order_score = 0

        session_data['turns'].append({
            'nodes': node_values,
            'score': order_score
        })

        # Обновляем общий счет
        session_data['total_score'] = max(0, session_data['total_score'] + order_score)

        # Обновляем список использованных вершин
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
    """
    try:
        body = await request.json()
        matrix_name = body.get('matrixName')
        if not matrix_name:
            return {"error": "Matrix name is required"}, 400

        # Определяем путь к файлу report.txt
        report_file_path = BASE_DIR / "Vadimka" / f"{matrix_name}_report.txt"

        # Проверяем, существует ли report.txt
        if not report_file_path.exists():
            print(f"[INFO] Файл {report_file_path} не найден. Запускаем процесс обработки Fortran.")
            process_input_files(
                str(BASE_DIR / "../data/models"),
                str(BASE_DIR / "processed_files"),
                BASE_DIR / "edited_mils.f90"
            )

        # Читаем report.txt после выполнения Fortran, если оно было выполнено
        if report_file_path.exists():
            with open(report_file_path, "r") as report:
                lines = report.readlines()
        else:
            return {"error": "report.txt not found"}, 404

        # Обрабатываем данные
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

# 1. Настройки графа по умолчанию
@router.post("/save-graph-settings/{matrix_name}")
async def save_graph_settings(matrix_name: str, request: Request):
    """
    Сохраняет настройки графа по умолчанию в JSON-файл.
    """
    try:
        data = await request.json()
        if not data:
            return {"error": "No data provided"}, 400
        filepath = get_default_settings_filepath(matrix_name)
        save_json(filepath, data)
        print(f"[INFO] Default settings saved at {filepath}.")
        return {"message": "Настройки графа успешно сохранены."}, 200
    except Exception as e:
        print(f"[ERROR] Ошибка при сохранении файла: {e}")
        return {"error": "Ошибка при сохранении файла."}, 500

@router.get("/load-graph-settings/{matrix_name}")
def load_graph_settings(matrix_name: str):
    """
    Загружает настройки графа по умолчанию из JSON-файла.
    """
    try:
        filepath = get_default_settings_filepath(matrix_name)
        if not os.path.exists(filepath):
            return {"error": f"Файл настроек для '{matrix_name}' не найден."}, 404
        data = load_json(filepath)
        print(f"[INFO] Default settings loaded from {filepath}.")
        return data, 200
    except Exception as e:
        print(f"[ERROR] Ошибка загрузки файла: {e}")
        return {"error": "Ошибка загрузки файла."}, 500
@router.get("/load-graph-settings-uuid/{uuid}")



# 2. Пользовательские настройки графа (координат)
@router.post("/{user_id}/save-graph-settings/{matrix_name}")
async def save_user_graph_settings(user_id: str, matrix_name: str, request: Request):
    """
    Сохраняет настройки графа для пользователя.
    Сохраняет данные в:
      users/<user_id>/user_settings/<matrix_name>_settings.json
    """
    try:
        data = await request.json()
        if not data:
            return {"error": "No data provided"}, 400
        filepath = get_user_settings_filepath(user_id, matrix_name)
        save_json(filepath, data)
        print(f"[INFO] Settings for user '{user_id}' saved at {filepath}.")
        return {"message": "Настройки графа успешно сохранены."}, 200
    except Exception as e:
        print(f"[ERROR] Ошибка при сохранении файла for user '{user_id}': {e}")
        return {"error": "Ошибка при сохранении файла."}, 500

@router.get("/{user_id}/load-graph-settings/{matrix_name}")
def load_user_graph_settings(user_id: str, matrix_name: str):
    """
    Загружает настройки графа для пользователя из файла:
      users/<user_id>/user_settings/<matrix_name>_settings.json
    """
    try:
        filepath = get_user_settings_filepath(user_id, matrix_name)
        if not os.path.exists(filepath):
            return {"error": f"Файл настроек для '{matrix_name}' пользователя '{user_id}' не найден."}, 404
        data = load_json(filepath)
        print(f"[INFO] Settings for user '{user_id}' loaded from {filepath}.")
        return data, 200
    except Exception as e:
        print(f"[ERROR] Ошибка загрузки файла for user '{user_id}': {e}")
        return {"error": "Ошибка загрузки файла."}, 500

# ===================== ЭНДПОИНТЫ ДЛЯ АВТОРИЗАЦИИ =====================

@router.post("/sign-up")
async def sign_up(request: Request):
    """
    Роутер для регистрации пользователя.
    Ожидает JSON с полями: username, email, password.
    Данные сохраняются в: ./users/<username>/user_creds/<username>.json
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
            "password": password  # Пароль хранится в открытом виде (не рекомендуется для продакшена)
        }
        save_json(creds_filepath, user_data)
        print(f"[INFO] User '{username}' registered with credentials stored at {creds_filepath}.")
        return {"message": "Пользователь успешно зарегистрирован"}, 201
    except Exception as e:
        return {"error": str(e)}, 500

@router.post("/sign-in")
async def sign_in(request: Request):
    """
    Роутер для входа пользователя.
    Ожидает JSON с полями: username и password.
    При успешной аутентификации имя пользователя сохраняется в "сессии" — 
    однако в данном FastAPI-примере вместо session используется JWT-токен.
    """
    try:
        data = await request.json()
        username = data.get("username")
        password = data.get("password")
        if not username or not password:
            return {"error": "username и password обязательны"}, 400

        creds_filepath = get_user_creds_filepath(username)
        if not os.path.exists(creds_filepath):
            return {"error": "Пользователь не найден"}, 404

        user_data = load_json(creds_filepath)
        if user_data.get("password") != password:
            return {"error": "Неверный пароль"}, 401

        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": username},
            expires_delta=access_token_expires
        )
        print(f"[INFO] User '{username}' logged in successfully.")
        return {
            "message": "Вход выполнен успешно",
            "access_token": access_token,
            "token_type": "bearer"
        }, 200
    except Exception as e:
        return {"error": str(e)}, 500

# ====================================
# РЕГИСТРАЦИЯ РОУТЕРА И ЗАПУСК ПРИЛОЖЕНИЯ
# ====================================
app.include_router(router, tags=["Matrix Routes"])

# Если хотите запускать напрямую (например, python main.py):
# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=8000)
