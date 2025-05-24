# ==========================  server.py  ==========================
import json, pathlib, logging, bcrypt, jwt
from uuid import uuid4
from datetime import datetime, timedelta
from typing import Dict, Any

from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os

from contextlib import asynccontextmanager

from dotenv import load_dotenv
from telegram import Update
from telegram.ext import (
    ApplicationBuilder, CommandHandler,
    MessageHandler, ContextTypes, filters
)


# ───────── внешние импорты ─────────
from services.matrix_service import get_all_matrices, get_matrix_data_by_name
from utils.score_counter      import calculate_step_score
from drafts.file_processor    import BASE_DIR, process_input_files
from routes.UUID_MATRICES     import MATRIX_UUIDS
# ────────────────────────────────────


# ==========================TG Bot=======================================
# load_tg_bot = input("Загружать ТГ бота? ").lower()
# if load_tg_bot == "yes" or load_tg_bot == "da" or load_tg_bot == "lf" or load_tg_bot == "нуы" or load_tg_bot == "да":
load_dotenv()
TELEGRAM_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
if not TELEGRAM_TOKEN:
    raise RuntimeError("TELEGRAM_BOT_TOKEN не найден в .env!")
# ─── bot handlers ───────────────────────────────────────────
async def tg_start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("Привет! Я бот для обратной связи — пишите и присылайте файлы.")
async def tg_save_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    from datetime import datetime
    user = update.effective_user
    uid = user.username or f"{user.first_name}_{user.last_name or ''}"
    uid = uid.replace(" ", "_")  # на всякий случай
    folder = pathlib.Path("feedback") / uid
    folder.mkdir(parents=True, exist_ok=True)
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    msg = update.message
    # Путь к файлу истории
    history_file = folder / "chat_history.json"
    # Загружаем старую историю (если есть)
    if history_file.exists():
        with open(history_file, "r", encoding="utf-8") as f:
            history = json.load(f)
    else:
        history = []
    entry = {
        "timestamp": ts,
        "text": None,
        "files": []
    }
    # Сохраняем текст
    text = msg.text or msg.caption
    if text:
        entry["text"] = text
    # Сохраняем медиа и заполняем ссылки на файлы
    if msg.photo:
        file = await msg.photo[-1].get_file()
        file_path = folder / f"photo_{datetime.now().strftime('%Y%m%d_%H%M%S')}.jpg"
        await file.download_to_drive(str(file_path))
        entry["files"].append(str(file_path.relative_to(folder)))
    if msg.document:
        file = await msg.document.get_file()
        file_name = msg.document.file_name or f"document_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        file_path = folder / file_name
        await file.download_to_drive(str(file_path))
        entry["files"].append(str(file_path.relative_to(folder)))
    if msg.audio:
        file = await msg.audio.get_file()
        file_name = msg.audio.file_name or f"audio_{datetime.now().strftime('%Y%m%d_%H%M%S')}.mp3"
        file_path = folder / file_name
        await file.download_to_drive(str(file_path))
        entry["files"].append(str(file_path.relative_to(folder)))
    if msg.voice:
        file = await msg.voice.get_file()
        file_path = folder / f"voice_{datetime.now().strftime('%Y%m%d_%H%M%S')}.ogg"
        await file.download_to_drive(str(file_path))
        entry["files"].append(str(file_path.relative_to(folder)))
    if msg.video:
        file = await msg.video.get_file()
        file_name = msg.video.file_name or f"video_{datetime.now().strftime('%Y%m%d_%H%M%S')}.mp4"
        file_path = folder / file_name
        await file.download_to_drive(str(file_path))
        entry["files"].append(str(file_path.relative_to(folder)))
    # Добавляем запись в историю
    history.append(entry)
    # Сохраняем историю обратно
    with open(history_file, "w", encoding="utf-8") as f:
        json.dump(history, f, ensure_ascii=False, indent=2)
    await update.message.reply_text("👍 Сохранено!")
# ─── lifespan ───────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app):
    tg_app = ApplicationBuilder().token(TELEGRAM_TOKEN).build()
    tg_app.add_handler(CommandHandler("start", tg_start))
    tg_app.add_handler(MessageHandler(filters.ALL & ~filters.COMMAND, tg_save_message))
    # 1-2. инициализация и запуск
    await tg_app.initialize()
    await tg_app.start()
    # 3. запускаем polling асинхронно (не блокируем FastAPI)
    await tg_app.updater.start_polling()
    logging.info("[✅ BOT] polling started")
    try:
        yield                      # ← здесь FastAPI начинает работать
    finally:
        logging.info("[⏳ BOT] stopping…")
        # 4. корректная остановка
        await tg_app.updater.stop()
        await tg_app.stop()
        await tg_app.shutdown()
        logging.info("[✅ BOT] stopped")
# ------------------- базовая инициализация -------------------
# app = FastAPI(lifespan=lifespan)
# else:
app = FastAPI()
router = APIRouter()
app.include_router(router, tags=["Matrix Routes"])


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"],
)
logging.basicConfig(level=logging.INFO)
log = logging.getLogger("matrix_routes")

CURRENT_DIR  = pathlib.Path(__file__).parent.resolve()
USERS_ROOT   = (CURRENT_DIR / "../users").resolve()
TRUE_SEQ_DIR = (CURRENT_DIR / "../data/RU/processed_files/True_Seq").resolve()

SECRET_KEY = "MY_SUPER_SECRET_KEY"
ALGORITHM  = "HS256"
ACCESS_TOKEN_TTL = 3000  # минут
oauth2  = HTTPBearer()

# ------------------- in-memory игровые сессии -------------------
in_memory_sessions : Dict[str, Dict[str, Any]] = {}
# ----------------------------------------------------------------

# =================================================================
#                          HELPERS
# =================================================================
def ensure_dir(p: pathlib.Path) -> pathlib.Path:
    p.mkdir(parents=True, exist_ok=True)
    return p

def save_json(path: pathlib.Path, data): path.write_text(json.dumps(data, indent=2), encoding='utf-8')
def load_json(path: pathlib.Path):        return json.loads(path.read_text(encoding='utf-8'))

# --- Path-генераторы (из твоего оригинала) -----------------------
def get_user_uuid_creds_path(u):      return USERS_ROOT/u/"user_creds"/f"{u}.json"
def get_user_settings_filepath(u,n):  return ensure_dir(USERS_ROOT/u/"user_settings") / f"{n}_settings.json"
def get_default_settings_filepath(n): return ensure_dir(CURRENT_DIR/"../data/RU/graph_settings") / f"{n}_graph_settings.json"
def fp_history(u,n):                  return ensure_dir(USERS_ROOT/u/"history") / f"{n}_history.json"
# -----------------------------------------------------------------

# >>> HISTORY : сохранить сыгранную игру
def save_game_to_history(uid: str, matrix_name: str, game: dict):
    f = fp_history(uid, matrix_name)
    history = load_json(f) if f.exists() else []
    history = history if isinstance(history, list) else []
    history.append(game)
    save_json(f, history)

# ---------------- JWT helpers ----------------
def make_token(data, ttl=ACCESS_TOKEN_TTL):
    payload = {**data, "exp": datetime.utcnow() + timedelta(minutes=ttl)}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(tok:str):
    try:    return jwt.decode(tok, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError: raise HTTPException(401, "Token expired")
    except jwt.JWTError:              raise HTTPException(401, "Bad token")

def get_current_user_uuid(credentials:HTTPAuthorizationCredentials=Depends(oauth2)) -> str:
    uid = decode_token(credentials.credentials).get("uuid")
    if not uid:
        raise HTTPException(401,"Token missing uuid")
    return uid
# ---------------------------------------------

@app.exception_handler(Exception)
async def global_exc(req:Request, exc:Exception):
    log.error(f"[UNHANDLED] {req.url.path} → {exc}")
    return JSONResponse({"error":"Internal Server Error"}, 500)

# =================================================================
#                 РЕГИСТРАЦИЯ / ЛОГИН / REFRESH
# =================================================================
def _find_user_file_by(key,val):
    for d in USERS_ROOT.iterdir():
        f = get_user_uuid_creds_path(d.name)
        if f.exists() and load_json(f).get(key)==val:
            return f
    return None

@router.post("/sign-up")
async def sign_up(req:Request):
    data = await req.json()
    u,e,p = data.get("username"),data.get("email"),data.get("password")
    if not all((u,e,p)):  return JSONResponse({"error":"username, email, password обязательны"},400)
    if _find_user_file_by("username",u): return JSONResponse({"error":"username занят"},400)
    if _find_user_file_by("email",e):    return JSONResponse({"error":"email занят"},400)

    uid=str(uuid4())
    creds={"username":u,"email":e,"password":bcrypt.hashpw(p.encode(),bcrypt.gensalt()).decode(),
           "user_uuid":uid,"science_clicks":2}
    ensure_dir(get_user_uuid_creds_path(uid).parent)
    save_json(get_user_uuid_creds_path(uid),creds)
    ensure_dir(USERS_ROOT/uid/"user_settings")
    return JSONResponse({"user_uuid":uid,"message":"OK"},201)

@router.post("/sign-in")
async def sign_in(req:Request):
    d=await req.json(); user,pw=d.get("username"),d.get("password")
    if not all((user,pw)): return JSONResponse({"error":"username и password обязательны"},400)
    f=_find_user_file_by("username",user)
    if not f: return JSONResponse({"error":"not found"},404)
    ud=load_json(f)
    if not bcrypt.checkpw(pw.encode(),ud["password"].encode()): return JSONResponse({"error":"bad password"},401)
    uid=ud["user_uuid"]
    return {"access_token":make_token({"sub":user,"uuid":uid}),
            "refresh_token":make_token({"sub":user,"uuid":uid},ttl=60*24*30),
            "token_type":"bearer"}

@router.post("/refresh")
async def refresh(req:Request):
    rt=(await req.json()).get("refresh_token")
    if not rt: raise HTTPException(400,"refresh_token required")
    pl=decode_token(rt)
    return {"access_token":make_token({"sub":pl["sub"],"uuid":pl["uuid"]})}
# =================================================================


# =================================================================
#               МАТРИЦЫ (список / по uuid)
# =================================================================
@router.get("/matrices")
def all_matrices():
    mats=[]
    for m in get_all_matrices():
        m["uuid"]=next((k for k,v in MATRIX_UUIDS.items() if v==m["matrix_name"]),None)
        mats.append(m)
    return {"matrices":mats}

@router.get("/matrix_by_uuid/{uuid}")
def matrix_by_uuid(uuid:str):
    name=MATRIX_UUIDS.get(uuid)
    if not name:return JSONResponse({"error":"uuid not found"},404)
    data=get_matrix_data_by_name(name)
    if not data:return JSONResponse({"error":"data not ready"},404)
    return {"matrix_info":{"matrix_name":name,"uuid":uuid},**data}
# =================================================================


# =================================================================
#                          GAME API
# =================================================================
@router.post("/calculate_score")
async def calc_score(req:Request, uid:str=Depends(get_current_user_uuid)):
    b=await req.json(); m_uuid=b.get("uuid"); step=b.get("selectedNodes",{})
    if not m_uuid: return JSONResponse({"error":"matrix uuid required"},400)
    base=MATRIX_UUIDS.get(m_uuid)
    if not base: return JSONResponse({"error":"uuid not found"},404)

    seq=TRUE_SEQ_DIR/f"{base}_result.json"
    if not seq.exists(): return JSONResponse({"error":"true seq missing"},404)
    order={int(k):v for k,v in load_json(seq).items()}

    sess=in_memory_sessions.setdefault(uid,{}).setdefault(m_uuid,{"used_nodes":[],
                "turns":[],"total_score":0})
    nodes=list(step.values())
    if any(n in sess["used_nodes"] for n in nodes):
        return JSONResponse({"error":"node reused"},400)

    res=calculate_step_score(nodes,sess["used_nodes"],order)
    sess["used_nodes"]+=nodes
    sess["turns"].append({"nodes":nodes,"score":res["step_score"]})
    sess["total_score"]=min(round(sess["total_score"]+res["step_score"],2),100)
    return {"step_score":res["step_score"],"total_score":sess["total_score"],"turns":sess["turns"]}

@router.post("/reset-game")
async def reset_game(req:Request, uid:str=Depends(get_current_user_uuid)):
    m_uuid=(await req.json()).get("uuid")
    if not m_uuid:return JSONResponse({"error":"uuid required"},400)
    name=MATRIX_UUIDS.get(m_uuid)

    sess=in_memory_sessions.get(uid,{}).get(m_uuid)
    if name and sess and sess["turns"]:
        save_game_to_history(uid,name,{"timestamp":datetime.utcnow().isoformat(),
                                       "turns":sess["turns"],
                                       "final_score":sess["total_score"]})
    in_memory_sessions.setdefault(uid,{})[m_uuid]={"used_nodes":[],"turns":[],"total_score":0}
    return {"message":"reset OK","matrix_uuid":m_uuid}
# =================================================================


# =================================================================
#                       HISTORY END-POINT
# =================================================================
@router.get("/history/{matrix_uuid}")
async def history(matrix_uuid:str, uid:str=Depends(get_current_user_uuid)):
    name=MATRIX_UUIDS.get(matrix_uuid)
    if not name: return JSONResponse({"error":"uuid not found"},404)
    f=fp_history(uid,name)
    return {"history":load_json(f) if f.exists() else []}


# =============================== science ===============================
science_attempts: Dict[str, int] = {}

@router.post("/science_attempt")
async def science_attempt(
    request: Request,
    current_user_uuid: str = Depends(get_current_user_uuid)
):
    try:
        # Получаем путь к файлу учетных данных пользователя по user_uuid
        user_file = get_user_uuid_creds_path(current_user_uuid)
        if not user_file.exists():
            return JSONResponse({"error": "Пользователь не найден"}, 404)
        
        user_data = load_json(user_file)
        clicks_left = user_data.get("science_clicks", 0)
        if clicks_left <= 0:
            return JSONResponse({"error": "Попытки исчерпаны"}, status_code=403)
        
        # Уменьшаем счетчик на 1 и сохраняем
        user_data["science_clicks"] = clicks_left - 1
        save_json(user_file, user_data)
        log.info(f"[SCIENCE ATTEMPT] User {current_user_uuid} осталось попыток: {user_data['science_clicks']}")
        
        return JSONResponse({"message": "Научный запрос принят", "science_clicks": user_data["science_clicks"]}, status_code=200)
    except Exception as e:
        log.error(f"[SCIENCE ATTEMPT ERROR]: {e}")
        return JSONResponse({"error": str(e)}, status_code=500)

@router.get("/science_clicks")
async def get_science_clicks(current_user_uuid: str = Depends(get_current_user_uuid)):
    user_file = get_user_uuid_creds_path(current_user_uuid)
    if not user_file.exists():
        return JSONResponse({"error": "Пользователь не найден"}, 404)

    user_data = load_json(user_file)
    clicks_left = user_data.get("science_clicks", 0)
    return JSONResponse({"science_clicks": clicks_left}, 200)


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

        report_file_path = BASE_DIR / "../data/RU/processed_files/Reports" / f"{matrix_name}_report.txt"

        if not report_file_path.exists():
            log.info(f"Report not found: {report_file_path}. Processing...")
            process_input_files(
                str(BASE_DIR / "../data/RU/models"),
                str(BASE_DIR / "../data/RU/processed_files/Models"),
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
    if request.client.host not in ("127.0.0.1", "::1"):
        return JSONResponse({"error": "Access denied"}, status_code=403)
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
    
