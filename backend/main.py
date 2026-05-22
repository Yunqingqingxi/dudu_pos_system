import sys, os

# PyInstaller bundle detection
if getattr(sys, "frozen", False):
    BASE_DIR = sys._MEIPASS
else:
    BASE_DIR = os.path.dirname(__file__)

from log_config import logger
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from database import engine, Base
from routers import products, orders, dashboard, import_export

Base.metadata.create_all(bind=engine)

app = FastAPI(title="鍢熷槦 POS 绯荤粺 API", version="1.0.0")
logger.info("鍢熷槦 POS 绯荤粺鍚姩")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router)
app.include_router(orders.router)
app.include_router(dashboard.router)
app.include_router(import_export.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}


# Frontend dist path
if getattr(sys, "frozen", False):
    DIST_DIR = os.path.join(sys._MEIPASS, "frontend", "dist")
else:
    DIST_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")

if os.path.isfile(os.path.join(DIST_DIR, "index.html")):
    IS_PRODUCTION = True
    logger.info(f"Production mode: serving frontend from {DIST_DIR}")
else:
    IS_PRODUCTION = False


@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    if full_path.startswith("api"):
        raise HTTPException(status_code=404)
    if not IS_PRODUCTION:
        raise HTTPException(status_code=404, detail="Frontend not built.")
    file_path = os.path.join(DIST_DIR, full_path)
    if os.path.isfile(file_path):
        return FileResponse(file_path)
    return FileResponse(os.path.join(DIST_DIR, "index.html"))
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)