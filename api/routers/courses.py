from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..dependencies import get_db
from ..models import Course, Part
from ..schemas import (
    CourseCreate,
    CourseResponse,
    CourseUpdate,
    PartCreate,
    PartResponse,
    PartUpdate,
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


def _get_part(db: Session, course_id: int, part_id: int) -> Part:
    part = db.query(Part).filter(Part.id == part_id, Part.course_id == course_id).first()
    if not part:
        raise HTTPException(status_code=404, detail=f"Part {part_id} not found")
    return part


# ---------------------------------------------------------------------------
# Courses
# ---------------------------------------------------------------------------


@router.get("/courses", response_model=list[CourseResponse])
def list_courses(db: Session = Depends(get_db)):
    return db.query(Course).order_by(Course.id).all()


@router.post("/courses", response_model=CourseResponse, status_code=status.HTTP_201_CREATED)
def create_course(course_in: CourseCreate, db: Session = Depends(get_db)):
    course = Course(**course_in.model_dump())
    db.add(course)
    db.commit()
    db.refresh(course)
    return course


@router.get("/courses/{slug}", response_model=CourseResponse)
def get_course(slug: str, db: Session = Depends(get_db)):
    return _get_course(db, slug)


@router.put("/courses/{slug}", response_model=CourseResponse)
def update_course(slug: str, course_in: CourseUpdate, db: Session = Depends(get_db)):
    course = _get_course(db, slug)
    for key, value in course_in.model_dump(exclude_unset=True).items():
        setattr(course, key, value)
    db.commit()
    db.refresh(course)
    return course


@router.delete("/courses/{slug}", status_code=status.HTTP_204_NO_CONTENT)
def delete_course(slug: str, db: Session = Depends(get_db)):
    course = _get_course(db, slug)
    db.delete(course)
    db.commit()


# ---------------------------------------------------------------------------
# Parts  (imbriqués sous /courses/{slug}/parts)
# ---------------------------------------------------------------------------


@router.get("/courses/{slug}/parts", response_model=list[PartResponse])
def list_parts(slug: str, db: Session = Depends(get_db)):
    course = _get_course(db, slug)
    return db.query(Part).filter(Part.course_id == course.id).order_by(Part.order).all()


@router.post("/courses/{slug}/parts", response_model=PartResponse, status_code=status.HTTP_201_CREATED)
def create_part(slug: str, part_in: PartCreate, db: Session = Depends(get_db)):
    course = _get_course(db, slug)
    part = Part(course_id=course.id, **part_in.model_dump())
    db.add(part)
    db.commit()
    db.refresh(part)
    return part


@router.get("/courses/{slug}/parts/{part_id}", response_model=PartResponse)
def get_part(slug: str, part_id: int, db: Session = Depends(get_db)):
    course = _get_course(db, slug)
    return _get_part(db, course.id, part_id)


@router.put("/courses/{slug}/parts/{part_id}", response_model=PartResponse)
def update_part(slug: str, part_id: int, part_in: PartUpdate, db: Session = Depends(get_db)):
    course = _get_course(db, slug)
    part = _get_part(db, course.id, part_id)
    for key, value in part_in.model_dump(exclude_unset=True).items():
        setattr(part, key, value)
    db.commit()
    db.refresh(part)
    return part


@router.delete("/courses/{slug}/parts/{part_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_part(slug: str, part_id: int, db: Session = Depends(get_db)):
    course = _get_course(db, slug)
    part = _get_part(db, course.id, part_id)
    db.delete(part)
    db.commit()
