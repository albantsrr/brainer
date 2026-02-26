from datetime import datetime
from typing import Union

from pydantic import BaseModel, ConfigDict

from .models import ExerciseType


# ---------------------------------------------------------------------------
# Exercise content — polymorphique selon le type
# ---------------------------------------------------------------------------


class MultipleChoiceOption(BaseModel):
    text: str
    is_correct: bool


class MultipleChoiceContent(BaseModel):
    question: str
    options: list[MultipleChoiceOption]
    explanation: str


class CodeContent(BaseModel):
    instructions: str
    starter_code: str
    solution: str
    tests: str
    language: str


class TrueFalseContent(BaseModel):
    statement: str
    answer: bool
    explanation: str


ExerciseContentUnion = Union[MultipleChoiceContent, CodeContent, TrueFalseContent]


# ---------------------------------------------------------------------------
# Course
# ---------------------------------------------------------------------------


class CourseCreate(BaseModel):
    title: str
    slug: str
    description: str | None = None
    image: str | None = None


class CourseUpdate(BaseModel):
    title: str | None = None
    slug: str | None = None
    description: str | None = None
    image: str | None = None


class CourseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    slug: str
    description: str | None
    image: str | None
    created_at: datetime
    updated_at: datetime


# ---------------------------------------------------------------------------
# Part
# ---------------------------------------------------------------------------


class PartCreate(BaseModel):
    order: int
    title: str
    description: str | None = None


class PartUpdate(BaseModel):
    order: int | None = None
    title: str | None = None
    description: str | None = None


class PartResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    course_id: int
    order: int
    title: str
    description: str | None


# ---------------------------------------------------------------------------
# Chapter
# ---------------------------------------------------------------------------


class ChapterCreate(BaseModel):
    part_id: int | None = None
    order: int
    title: str
    slug: str
    content: str | None = None
    synopsis: str | None = None
    image: str | None = None


class ChapterUpdate(BaseModel):
    part_id: int | None = None
    order: int | None = None
    title: str | None = None
    slug: str | None = None
    content: str | None = None
    synopsis: str | None = None
    image: str | None = None


class ChapterListItem(BaseModel):
    """Version légère pour les listes — sans le champ content."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    order: int
    title: str
    slug: str
    part_id: int | None
    synopsis: str | None


class ChapterResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    course_id: int
    part_id: int | None
    order: int
    title: str
    slug: str
    content: str | None
    synopsis: str | None
    image: str | None
    created_at: datetime
    updated_at: datetime


# ---------------------------------------------------------------------------
# Exercise
# ---------------------------------------------------------------------------


class ExerciseCreate(BaseModel):
    title: str
    type: ExerciseType
    content: ExerciseContentUnion
    image: str | None = None
    auto_generated: bool = False


class ExerciseUpdate(BaseModel):
    title: str | None = None
    type: ExerciseType | None = None
    content: ExerciseContentUnion | None = None
    image: str | None = None
    auto_generated: bool | None = None


class ExerciseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    chapter_id: int
    order: int
    title: str
    type: ExerciseType
    content: dict
    image: str | None
    auto_generated: bool
    created_at: datetime
    updated_at: datetime


# ---------------------------------------------------------------------------
# Image upload
# ---------------------------------------------------------------------------


class ImageUploadResponse(BaseModel):
    url: str


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------


class LoginCredentials(BaseModel):
    email: str
    password: str


class UserCreate(BaseModel):
    email: str
    username: str
    password: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    username: str
    is_active: bool
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ---------------------------------------------------------------------------
# Progress
# ---------------------------------------------------------------------------


class ChapterProgressUpdate(BaseModel):
    is_completed: bool


class ChapterProgressResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    chapter_id: int
    is_completed: bool
    completed_at: datetime | None


class ExerciseSubmissionCreate(BaseModel):
    answer: int | bool | str


class ExerciseSubmissionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    exercise_id: int
    answer: dict | int | bool | str
    is_correct: bool
    submitted_at: datetime


class ChapterDetailProgressResponse(BaseModel):
    chapter_id: int
    is_completed: bool
    completed_at: datetime | None
    submissions: list[ExerciseSubmissionResponse]


class CourseProgressResponse(BaseModel):
    course_id: int
    total_chapters: int
    completed_chapters: int
    completion_percentage: float
    total_exercises: int
    answered_exercises: int
    correct_exercises: int
    completed_chapter_ids: list[int]


# ---------------------------------------------------------------------------
# Review Sheets
# ---------------------------------------------------------------------------


class ReviewSheetCreate(BaseModel):
    content: str


class ReviewSheetUpdate(BaseModel):
    content: str | None = None


class ReviewSheetResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    part_id: int
    content: str
    created_at: datetime
    updated_at: datetime
