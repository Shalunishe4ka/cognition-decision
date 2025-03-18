import uvicorn
from routes.matrix_routes import app, router
app.include_router(router, tags=["Matrix Routes"])

if __name__ == "__main__":
    uvicorn.run("routes.matrix_routes:app", host="0.0.0.0", port=8000, reload=True)
