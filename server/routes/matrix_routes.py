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
    allow_origins=["*"],
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

in_memory_sessions: Dict[str, Dict[str, Any]] = {}

# =============================== Утилиты ===============================
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
            return {"error": "username, email и password обязательны"}, 400

        creds_path = get_user_creds_filepath(username)
        if creds_path.exists():
            return {"error": "Пользователь с таким именем уже существует"}, 400

        user_uuid = str(uuid4())
        user_data = {"username": username, "email": email, "password": password, "user_uuid": user_uuid}

        ensure_dir(creds_path.parent)
        save_json(creds_path, user_data)

        uuid_creds_path = get_user_uuid_creds_path(user_uuid)
        ensure_dir(uuid_creds_path.parent)
        save_json(uuid_creds_path, user_data)

        ensure_dir(USERS_ROOT / user_uuid / "user_settings")
        log.info(f"[REGISTER] user_uuid: {user_uuid}")
        return {"message": "Регистрация успешна", "user_uuid": user_uuid}, 201
    except Exception as e:
        log.error(f"[REGISTER ERROR]: {e}")
        return {"error": str(e)}, 500

@router.post("/sign-in")
async def sign_in(request: Request):
    try:
        data = await request.json()
        username, password = data.get("username"), data.get("password")
        if not username or not password:
            return {"error": "username и password обязательны"}, 400

        creds_path = get_user_creds_filepath(username)
        if not creds_path.exists():
            return {"error": "Пользователь не найден"}, 404

        user_data = load_json(creds_path)
        if user_data.get("password") != password:
            return {"error": "Неверный пароль"}, 401

        user_uuid = user_data.get("user_uuid")
        token = create_access_token({"sub": username, "uuid": user_uuid})
        log.info(f"[LOGIN] user_uuid: {user_uuid}")
        return {"message": "Вход выполнен", "access_token": token, "token_type": "bearer"}, 200
    except Exception as e:
        log.error(f"[LOGIN ERROR]: {e}")
        return {"error": str(e)}, 500

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
        return {"matrices": result}
    except Exception as e:
        return {"error": str(e)}

@router.get("/matrix_by_uuid/{uuid}")
def get_matrix_by_uuid(uuid: str):
    matrix_name = MATRIX_UUIDS.get(uuid)
    if not matrix_name:
        return {"error": f"UUID '{uuid}' не найден"}, 404
    data = get_matrix_data_by_name(matrix_name)
    if not data:
        return {"error": f"Данные матрицы недоступны"}, 404
    return {
        "matrix_info": {"matrix_name": matrix_name, "uuid": uuid},
        "nodes": data["nodes"],
        "edges": data["edges"]
    }

# =============================== calculate_score ===============================
@router.post("/calculate_score")
async def calculate_score(request: Request):
    try:
        body = await request.json()
        nodes = body.get('selectedNodes', {})
        matrix_uuid = body.get('uuid')

        if not matrix_uuid:
            return {"error": "Matrix UUID is required"}, 400

        matrix_name_raw = MATRIX_UUIDS.get(matrix_uuid)
        if not matrix_name_raw:
            return {"error": "Matrix UUID not found"}, 404

        matrix_name = f"{matrix_name_raw}_result"

        try:
            matrix_order = load_true_sequence(matrix_name)
        except FileNotFoundError:
            return {"error": f"True sequence for '{matrix_name}' not found"}, 404

        node_values = list(nodes.values())
        user_id = "anonymous"  # Или из токена при необходимости

        session_data = in_memory_sessions.setdefault(user_id, {
            "turns": [],
            "total_score": 0,
            "used_nodes": []
        })

        if any(node in session_data['used_nodes'] for node in node_values):
            return {"error": "Некоторые вершины уже использовались"}, 400

        order_score = calculate_order_score(node_values, matrix_order)
        order_score = max(0, order_score if isinstance(order_score, (int, float)) and not np.isnan(order_score) else 0)

        session_data['turns'].append({'nodes': node_values, 'score': order_score})
        session_data['total_score'] += order_score
        session_data['used_nodes'].extend(node_values)

        return {
            'turn_score': order_score,
            'total_score': session_data['total_score'],
            'turns': session_data['turns']
        }, 200

    except Exception as e:
        return {"error": str(e)}, 500

# =============================== science_table ===============================
@router.post("/science_table")
async def get_science_table(request: Request):
    try:
        body = await request.json()
        matrix_uuid = body.get('matrixUuid')
        if not matrix_uuid:
            return {"error": "Matrix UUID is required"}, 400

        matrix_name = MATRIX_UUIDS.get(matrix_uuid)
        if not matrix_name:
            return {"error": "Matrix UUID not found"}, 404

        report_file_path = BASE_DIR / "Vadimka" / f"{matrix_name}_report.txt"
        if not report_file_path.exists():
            log.info(f"Report not found: {report_file_path}. Processing...")
            process_input_files(
                str(BASE_DIR / "../data/models"),
                str(BASE_DIR / "processed_files"),
                BASE_DIR / "edited_mils.f90"
            )

        if not report_file_path.exists():
            return {"error": "report.txt not found"}, 404

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

        return {
            "x": x,
            "u": u,
            "normalized_x": normalized_x,
            "normalized_u": normalized_u,
            "matrix_name": matrix_name,
            "sorted_true_seq": sorted_seq
        }, 200

    except Exception as e:
        return {"error": str(e)}, 500

# =============================== graph settings ===============================

@router.post("/save-graph-settings/{matrix_uuid}")
async def save_default_graph_settings(matrix_uuid: str, request: Request):
    """
    Сохраняет дефолтные настройки графа по UUID матрицы.
    """
    try:
        data = await request.json()
        if not data:
            return {"error": "Нет данных для сохранения"}, 400

        matrix_name = MATRIX_UUIDS.get(matrix_uuid)
        if not matrix_name:
            return {"error": "UUID не найден"}, 404

        filepath = get_default_settings_filepath(matrix_name)
        save_json(filepath, data)
        log.info(f"[SAVE DEFAULT] {filepath}")
        return {"message": "Дефолтные настройки сохранены"}, 200
    except Exception as e:
        log.error(f"[SAVE DEFAULT ERROR]: {e}")
        return {"error": str(e)}, 500

@router.get("/load-graph-settings/{matrix_uuid}")
def load_default_graph_settings(matrix_uuid: str):
    """
    Загружает дефолтные настройки графа по UUID матрицы.
    """
    try:
        matrix_name = MATRIX_UUIDS.get(matrix_uuid)
        if not matrix_name:
            return {"error": "UUID не найден"}, 404

        filepath = get_default_settings_filepath(matrix_name)
        if not filepath.exists():
            return {"error": "Файл настроек не найден"}, 404

        data = load_json(filepath)
        log.info(f"[LOAD DEFAULT] {filepath}")
        return data, 200
    except Exception as e:
        log.error(f"[LOAD DEFAULT ERROR]: {e}")
        return {"error": str(e)}, 500
    


@router.post("/{user_uuid}/save-graph-settings/{matrix_uuid}")
async def save_user_graph_settings(user_uuid: str, matrix_uuid: str, request: Request):
    """
    Сохраняет пользовательские настройки графа.
    """
    try:
        data = await request.json()
        if not data:
            return {"error": "Нет данных для сохранения"}, 400

        matrix_name = MATRIX_UUIDS.get(matrix_uuid)
        if not matrix_name:
            return {"error": "UUID не найден"}, 404

        filepath = get_user_settings_filepath(user_uuid, matrix_name)
        save_json(filepath, data)
        log.info(f"[SAVE USER] {filepath}")
        return {"message": "Настройки пользователя сохранены"}, 200
    except Exception as e:
        log.error(f"[SAVE USER ERROR]: {e}")
        return {"error": str(e)}, 500

@router.get("/{user_uuid}/load-graph-settings/{matrix_uuid}")
def load_user_graph_settings(user_uuid: str, matrix_uuid: str):
    """
    Загружает пользовательские настройки графа.
    """
    try:
        matrix_name = MATRIX_UUIDS.get(matrix_uuid)
        if not matrix_name:
            return {"error": "UUID не найден"}, 404

        filepath = get_user_settings_filepath(user_uuid, matrix_name)
        if not filepath.exists():
            return {"error": "Файл настроек не найден"}, 404

        data = load_json(filepath)
        log.info(f"[LOAD USER] {filepath}")
        return data, 200
    except Exception as e:
        log.error(f"[LOAD USER ERROR]: {e}")
        return {"error": str(e)}, 500
