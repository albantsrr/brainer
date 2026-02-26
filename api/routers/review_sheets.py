from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..dependencies import get_current_user, get_db
from ..models import Course, Part, ReviewSheet, User
from ..schemas import ReviewSheetCreate, ReviewSheetResponse, ReviewSheetUpdate

router = APIRouter()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _get_part(db: Session, part_id: int) -> Part:
    part = db.query(Part).filter(Part.id == part_id).first()
    if not part:
        raise HTTPException(status_code=404, detail=f"Part {part_id} not found")
    return part


def _get_review_sheet(db: Session, part_id: int) -> ReviewSheet:
    sheet = db.query(ReviewSheet).filter(ReviewSheet.part_id == part_id).first()
    if not sheet:
        raise HTTPException(status_code=404, detail=f"No review sheet for part {part_id}")
    return sheet


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


@router.get("/courses/{slug}/review-sheets", response_model=list[ReviewSheetResponse])
def list_review_sheets_for_course(slug: str, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.slug == slug).first()
    if not course:
        raise HTTPException(status_code=404, detail=f"Course '{slug}' not found")
    parts = db.query(Part).filter(Part.course_id == course.id).all()
    part_ids = [p.id for p in parts]
    return db.query(ReviewSheet).filter(ReviewSheet.part_id.in_(part_ids)).all()


@router.get("/parts/{part_id}/review-sheet", response_model=ReviewSheetResponse)
def get_review_sheet(part_id: int, db: Session = Depends(get_db)):
    _get_part(db, part_id)
    return _get_review_sheet(db, part_id)


@router.post("/parts/{part_id}/review-sheet", response_model=ReviewSheetResponse, status_code=status.HTTP_201_CREATED)
def upsert_review_sheet(
    part_id: int,
    sheet_in: ReviewSheetCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    _get_part(db, part_id)
    existing = db.query(ReviewSheet).filter(ReviewSheet.part_id == part_id).first()
    if existing:
        existing.content = sheet_in.content
        db.commit()
        db.refresh(existing)
        return existing
    sheet = ReviewSheet(part_id=part_id, content=sheet_in.content)
    db.add(sheet)
    db.commit()
    db.refresh(sheet)
    return sheet


@router.delete("/parts/{part_id}/review-sheet", status_code=status.HTTP_204_NO_CONTENT)
def delete_review_sheet(
    part_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    sheet = _get_review_sheet(db, part_id)
    db.delete(sheet)
    db.commit()
