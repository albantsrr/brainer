from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..dependencies import get_current_user, get_db
from ..models import Chapter, Course, Exercise, ExerciseType, User, UserChapterProgress, UserExerciseSubmission
from ..schemas import (
    ChapterDetailProgressResponse,
    ChapterProgressResponse,
    ChapterProgressUpdate,
    CourseProgressResponse,
    ExerciseSubmissionCreate,
    ExerciseSubmissionResponse,
)

router = APIRouter()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _evaluate_correctness(exercise: Exercise, answer) -> bool:
    content = exercise.content
    if exercise.type == ExerciseType.true_false:
        if not isinstance(answer, bool):
            return False
        return answer == content.get("answer")
    elif exercise.type == ExerciseType.multiple_choice:
        if not isinstance(answer, int) or isinstance(answer, bool):
            return False
        options = content.get("options", [])
        if answer < 0 or answer >= len(options):
            return False
        return options[answer].get("is_correct", False)
    elif exercise.type == ExerciseType.code:
        return False
    return False


def _upsert_chapter_progress(
    db: Session, user_id: int, chapter_id: int, is_completed: bool
) -> UserChapterProgress:
    row = (
        db.query(UserChapterProgress)
        .filter_by(user_id=user_id, chapter_id=chapter_id)
        .first()
    )
    now = datetime.now(timezone.utc)
    if row is None:
        row = UserChapterProgress(
            user_id=user_id,
            chapter_id=chapter_id,
            is_completed=is_completed,
            completed_at=now if is_completed else None,
        )
        db.add(row)
    else:
        row.is_completed = is_completed
        row.completed_at = now if is_completed else None
    db.commit()
    db.refresh(row)
    return row


def _upsert_exercise_submission(
    db: Session, user_id: int, exercise_id: int, answer, is_correct: bool
) -> UserExerciseSubmission:
    row = (
        db.query(UserExerciseSubmission)
        .filter_by(user_id=user_id, exercise_id=exercise_id)
        .first()
    )
    if row is None:
        row = UserExerciseSubmission(
            user_id=user_id,
            exercise_id=exercise_id,
            answer=answer,
            is_correct=is_correct,
        )
        db.add(row)
    else:
        row.answer = answer
        row.is_correct = is_correct
    db.commit()
    db.refresh(row)
    return row


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


@router.put("/chapters/{chapter_id}/progress", response_model=ChapterProgressResponse)
def update_chapter_progress(
    chapter_id: int,
    payload: ChapterProgressUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    if not chapter:
        raise HTTPException(status_code=404, detail=f"Chapter {chapter_id} not found")

    row = _upsert_chapter_progress(db, current_user.id, chapter_id, payload.is_completed)
    return ChapterProgressResponse(
        chapter_id=row.chapter_id,
        is_completed=row.is_completed,
        completed_at=row.completed_at,
    )


@router.get("/chapters/{chapter_id}/progress", response_model=ChapterDetailProgressResponse)
def get_chapter_progress(
    chapter_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    if not chapter:
        raise HTTPException(status_code=404, detail=f"Chapter {chapter_id} not found")

    progress_row = (
        db.query(UserChapterProgress)
        .filter_by(user_id=current_user.id, chapter_id=chapter_id)
        .first()
    )

    # Get all exercises for this chapter to find submissions
    exercise_ids = [
        ex.id for ex in db.query(Exercise.id).filter(Exercise.chapter_id == chapter_id).all()
    ]
    submissions = (
        db.query(UserExerciseSubmission)
        .filter(
            UserExerciseSubmission.user_id == current_user.id,
            UserExerciseSubmission.exercise_id.in_(exercise_ids),
        )
        .all()
    )

    return ChapterDetailProgressResponse(
        chapter_id=chapter_id,
        is_completed=progress_row.is_completed if progress_row else False,
        completed_at=progress_row.completed_at if progress_row else None,
        submissions=[
            ExerciseSubmissionResponse(
                exercise_id=s.exercise_id,
                answer=s.answer,
                is_correct=s.is_correct,
                submitted_at=s.submitted_at,
            )
            for s in submissions
        ],
    )


@router.post(
    "/chapters/{chapter_id}/exercises/{exercise_id}/submit",
    response_model=ExerciseSubmissionResponse,
)
def submit_exercise_answer(
    chapter_id: int,
    exercise_id: int,
    payload: ExerciseSubmissionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    exercise = (
        db.query(Exercise)
        .filter(Exercise.id == exercise_id, Exercise.chapter_id == chapter_id)
        .first()
    )
    if not exercise:
        raise HTTPException(
            status_code=404, detail=f"Exercise {exercise_id} not found in chapter {chapter_id}"
        )

    is_correct = _evaluate_correctness(exercise, payload.answer)
    row = _upsert_exercise_submission(db, current_user.id, exercise_id, payload.answer, is_correct)

    return ExerciseSubmissionResponse(
        exercise_id=row.exercise_id,
        answer=row.answer,
        is_correct=row.is_correct,
        submitted_at=row.submitted_at,
    )


@router.get("/courses/{course_slug}/progress", response_model=CourseProgressResponse)
def get_course_progress(
    course_slug: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    course = db.query(Course).filter(Course.slug == course_slug).first()
    if not course:
        raise HTTPException(status_code=404, detail=f"Course '{course_slug}' not found")

    chapters = db.query(Chapter).filter(Chapter.course_id == course.id).all()
    chapter_ids = [c.id for c in chapters]

    completed_rows = (
        db.query(UserChapterProgress)
        .filter(
            UserChapterProgress.user_id == current_user.id,
            UserChapterProgress.chapter_id.in_(chapter_ids),
            UserChapterProgress.is_completed == True,
        )
        .all()
    )
    completed_chapter_ids = [r.chapter_id for r in completed_rows]

    exercise_ids = [
        ex.id
        for ex in db.query(Exercise.id).filter(Exercise.chapter_id.in_(chapter_ids)).all()
    ]

    submissions = (
        db.query(UserExerciseSubmission)
        .filter(
            UserExerciseSubmission.user_id == current_user.id,
            UserExerciseSubmission.exercise_id.in_(exercise_ids),
        )
        .all()
    )

    total_chapters = len(chapters)
    completed_chapters = len(completed_chapter_ids)
    completion_percentage = (completed_chapters / total_chapters * 100) if total_chapters > 0 else 0.0

    return CourseProgressResponse(
        course_id=course.id,
        total_chapters=total_chapters,
        completed_chapters=completed_chapters,
        completion_percentage=round(completion_percentage, 1),
        total_exercises=len(exercise_ids),
        answered_exercises=len(submissions),
        correct_exercises=sum(1 for s in submissions if s.is_correct),
        completed_chapter_ids=completed_chapter_ids,
    )
