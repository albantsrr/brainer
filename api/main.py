from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .database import Base, engine
from .routers import chapters, courses, exercises, images

app = FastAPI(title="Brainer API", version="0.1.0")

# CORS — allow all in dev; tighten allow_origins in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Tables (idempotent — no-op si déjà créées)
Base.metadata.create_all(bind=engine)

# Static files : images uploadées
_static_dir = Path(__file__).parent / "static"
_static_dir.mkdir(exist_ok=True)
(_static_dir / "images").mkdir(exist_ok=True)
app.mount("/static", StaticFiles(directory=_static_dir), name="static")

# Routers
app.include_router(courses.router, prefix="/api")
app.include_router(chapters.router, prefix="/api")
app.include_router(exercises.router, prefix="/api")
app.include_router(images.router, prefix="/api")
