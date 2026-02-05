from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..dependencies import get_db
from ..models import Chapter, Exercise
from ..schemas import ExerciseCreate, ExerciseResponse, ExerciseUpdate

router = APIRouter()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _get_chapter(db: Session, chapter_id: int) -> Chapter:
    chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    if not chapter:
        raise HTTPException(status_code=404, detail=f"Chapter {chapter_id} not found")
    return chapter


def _get_exercise(db: Session, chapter_id: int, exercise_id: int) -> Exercise:
    exercise = (
        db.query(Exercise)
        .filter(Exercise.id == exercise_id, Exercise.chapter_id == chapter_id)
        .first()
    )
    if not exercise:
        raise HTTPException(status_code=404, detail=f"Exercise {exercise_id} not found")
    return exercise


def _next_order(db: Session, chapter_id: int) -> int:
    result = db.query(func.max(Exercise.order)).filter(Exercise.chapter_id == chapter_id).scalar()
    return (result or 0) + 1


# ---------------------------------------------------------------------------
# Exercises
# ---------------------------------------------------------------------------


@router.get("/chapters/{chapter_id}/exercises", response_model=list[ExerciseResponse])
def list_exercises(chapter_id: int, db: Session = Depends(get_db)):
    _get_chapter(db, chapter_id)
    return db.query(Exercise).filter(Exercise.chapter_id == chapter_id).order_by(Exercise.order).all()


@router.post("/chapters/{chapter_id}/exercises", response_model=ExerciseResponse, status_code=status.HTTP_201_CREATED)
def create_exercise(chapter_id: int, exercise_in: ExerciseCreate, db: Session = Depends(get_db)):
    _get_chapter(db, chapter_id)
    data = exercise_in.model_dump()
    # content est un BaseModel dans le schema — model_dump() le convertit en dict (bon pour la colonne JSON)
    exercise = Exercise(chapter_id=chapter_id, order=_next_order(db, chapter_id), **data)
    db.add(exercise)
    db.commit()
    db.refresh(exercise)
    return exercise


@router.get("/chapters/{chapter_id}/exercises/{exercise_id}", response_model=ExerciseResponse)
def get_exercise(chapter_id: int, exercise_id: int, db: Session = Depends(get_db)):
    _get_chapter(db, chapter_id)
    return _get_exercise(db, chapter_id, exercise_id)


@router.put("/chapters/{chapter_id}/exercises/{exercise_id}", response_model=ExerciseResponse)
def update_exercise(
    chapter_id: int, exercise_id: int, exercise_in: ExerciseUpdate, db: Session = Depends(get_db)
):
    _get_chapter(db, chapter_id)
    exercise = _get_exercise(db, chapter_id, exercise_id)
    for key, value in exercise_in.model_dump(exclude_unset=True).items():
        setattr(exercise, key, value)
    db.commit()
    db.refresh(exercise)
    return exercise


@router.delete("/chapters/{chapter_id}/exercises/{exercise_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_exercise(chapter_id: int, exercise_id: int, db: Session = Depends(get_db)):
    _get_chapter(db, chapter_id)
    exercise = _get_exercise(db, chapter_id, exercise_id)
    db.delete(exercise)
    db.commit()
