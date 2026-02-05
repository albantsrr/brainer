import uuid
from pathlib import Path

from fastapi import APIRouter, File, UploadFile

from ..schemas import ImageUploadResponse

router = APIRouter()

IMAGES_DIR = Path(__file__).resolve().parent.parent / "static" / "images"


@router.post("/images/upload", response_model=ImageUploadResponse)
async def upload_image(file: UploadFile = File(...)):
    ext = Path(file.filename or "file").suffix or ".bin"
    filename = f"{uuid.uuid4()}{ext}"
    dest = IMAGES_DIR / filename

    IMAGES_DIR.mkdir(parents=True, exist_ok=True)
    with open(dest, "wb") as out:
        while chunk := await file.read(1024 * 1024):
            out.write(chunk)

    return {"url": f"/static/images/{filename}"}
