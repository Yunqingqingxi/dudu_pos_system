from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from database import engine, Base
from routers import products, orders, dashboard, import_export
import os

Base.metadata.create_all(bind=engine)

app = FastAPI(title="嘟嘟 POS 系统 API", version="1.0.0")

# ---- CORS (dev mode only) ----
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- API Routes ----
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(dashboard.router)
app.include_router(import_export.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}


# ---- Production: serve frontend static files (SPA fallback) ----
DIST_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
IS_PRODUCTION = os.path.isfile(os.path.join(DIST_DIR, "index.html"))


@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    if full_path.startswith("api"):
        raise HTTPException(status_code=404)
    if not IS_PRODUCTION:
        raise HTTPException(status_code=404, detail="Frontend not built. Run build.bat first.")
    file_path = os.path.join(DIST_DIR, full_path)
    if os.path.isfile(file_path):
        return FileResponse(file_path)
    # SPA fallback
    return FileResponse(os.path.join(DIST_DIR, "index.html"))