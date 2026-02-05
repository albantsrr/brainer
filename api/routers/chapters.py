from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..dependencies import get_db
from ..models import Chapter, Course
from ..schemas import (
    ChapterCreate,
    ChapterListItem,
    ChapterResponse,
    ChapterUpdate,
)

router = APIRouter()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _get_course(db: Session, slug: str) -> Course:
    course = db.query(Course).filter(Course.slug == slug).first()
    if not course:
        raise HTTPException(status_code=404, detail=f"Course '{slug}' not found")
    return course


def _get_chapter(db: Session, course_id: int, chapter_id: int) -> Chapter:
    chapter = (
        db.query(Chapter)
        .filter(Chapter.id == chapter_id, Chapter.course_id == course_id)
        .first()
    )
    if not chapter:
        raise HTTPException(status_code=404, detail=f"Chapter {chapter_id} not found")
    return chapter


# ---------------------------------------------------------------------------
# Chapters
# ---------------------------------------------------------------------------


@router.get("/courses/{slug}/chapters", response_model=list[ChapterListItem])
def list_chapters(slug: str, db: Session = Depends(get_db)):
    course = _get_course(db, slug)
    return db.query(Chapter).filter(Chapter.course_id == course.id).order_by(Chapter.order).all()


@router.post("/courses/{slug}/chapters", response_model=ChapterResponse, status_code=status.HTTP_201_CREATED)
def create_chapter(slug: str, chapter_in: ChapterCreate, db: Session = Depends(get_db)):
    course = _get_course(db, slug)
    chapter = Chapter(course_id=course.id, **chapter_in.model_dump())
    db.add(chapter)
    db.commit()
    db.refresh(chapter)
    return chapter


@router.get("/courses/{slug}/chapters/{chapter_id}", response_model=ChapterResponse)
def get_chapter(slug: str, chapter_id: int, db: Session = Depends(get_db)):
    course = _get_course(db, slug)
    return _get_chapter(db, course.id, chapter_id)


@router.put("/courses/{slug}/chapters/{chapter_id}", response_model=ChapterResponse)
def update_chapter(slug: str, chapter_id: int, chapter_in: ChapterUpdate, db: Session = Depends(get_db)):
    course = _get_course(db, slug)
    chapter = _get_chapter(db, course.id, chapter_id)
    for key, value in chapter_in.model_dump(exclude_unset=True).items():
        setattr(chapter, key, value)
    db.commit()
    db.refresh(chapter)
    return chapter


@router.delete("/courses/{slug}/chapters/{chapter_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_chapter(slug: str, chapter_id: int, db: Session = Depends(get_db)):
    course = _get_course(db, slug)
    chapter = _get_chapter(db, course.id, chapter_id)
    db.delete(chapter)
    db.commit()
