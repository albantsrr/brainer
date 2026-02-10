# Complete Endpoint Examples

This file contains complete, production-ready examples of FastAPI endpoints for common scenarios in the Brainer API.

---

## Example 1: Simple CRUD Resource

**Scenario:** A `Tag` resource for categorizing courses.

### Model (`api/models.py`)

```python
class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False, unique=True, index=True)
    slug = Column(String, nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
```

### Schemas (`api/schemas.py`)

```python
class TagCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    slug: str = Field(..., min_length=1, max_length=50, pattern=r'^[a-z0-9-]+$')
    description: str | None = Field(None, max_length=500)

    @field_validator('slug')
    @classmethod
    def validate_slug(cls, v: str) -> str:
        if not v.islower():
            raise ValueError('slug must be lowercase')
        return v


class TagUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=50)
    slug: str | None = Field(None, min_length=1, max_length=50, pattern=r'^[a-z0-9-]+$')
    description: str | None = Field(None, max_length=500)


class TagResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str
    description: str | None
    created_at: datetime
    updated_at: datetime
```

### Router (`api/routers/tags.py`)

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from ..dependencies import get_db
from ..models import Tag
from ..schemas import TagCreate, TagResponse, TagUpdate

router = APIRouter(tags=["Tags"])


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _get_tag(db: Session, tag_id: int) -> Tag:
    """Fetch tag by ID or raise 404."""
    tag = db.query(Tag).filter(Tag.id == tag_id).first()
    if not tag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tag {tag_id} not found"
        )
    return tag


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


@router.get("/tags", response_model=list[TagResponse])
def list_tags(db: Session = Depends(get_db)):
    """List all tags, ordered by name."""
    return db.query(Tag).order_by(Tag.name).all()


@router.post("/tags", response_model=TagResponse, status_code=status.HTTP_201_CREATED)
def create_tag(tag_in: TagCreate, db: Session = Depends(get_db)):
    """Create a new tag."""
    tag = Tag(**tag_in.model_dump())
    try:
        db.add(tag)
        db.commit()
        db.refresh(tag)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Tag with slug '{tag_in.slug}' already exists"
        )
    return tag


@router.get("/tags/{tag_id}", response_model=TagResponse)
def get_tag(tag_id: int, db: Session = Depends(get_db)):
    """Get a single tag by ID."""
    return _get_tag(db, tag_id)


@router.put("/tags/{tag_id}", response_model=TagResponse)
def update_tag(tag_id: int, tag_in: TagUpdate, db: Session = Depends(get_db)):
    """Update a tag."""
    tag = _get_tag(db, tag_id)
    for key, value in tag_in.model_dump(exclude_unset=True).items():
        setattr(tag, key, value)
    try:
        db.commit()
        db.refresh(tag)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Duplicate slug or constraint violation"
        )
    return tag


@router.delete("/tags/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tag(tag_id: int, db: Session = Depends(get_db)):
    """Delete a tag."""
    tag = _get_tag(db, tag_id)
    db.delete(tag)
    db.commit()
```

### Register Router (`api/main.py`)

```python
from .routers import tags

app.include_router(tags.router, prefix="/api")
```

---

## Example 2: Nested Resources with Auto-Order

**Scenario:** A `Lesson` resource nested under `Chapter` with auto-incrementing order.

### Model (`api/models.py`)

```python
class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, autoincrement=True)
    chapter_id = Column(Integer, ForeignKey("chapters.id", ondelete="CASCADE"), nullable=False)
    order = Column(Integer, nullable=False)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=True)
    video_url = Column(String, nullable=True)
    duration_minutes = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    __table_args__ = (
        UniqueConstraint("chapter_id", "order", name="uq_lesson_chapter_order"),
    )
```

### Schemas (`api/schemas.py`)

```python
class LessonCreate(BaseModel):
    title: str
    content: str | None = None
    video_url: str | None = None
    duration_minutes: int | None = Field(None, ge=0)
    # Note: order is auto-assigned, not provided by client


class LessonUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    video_url: str | None = None
    duration_minutes: int | None = Field(None, ge=0)
    order: int | None = Field(None, ge=1)


class LessonResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    chapter_id: int
    order: int
    title: str
    content: str | None
    video_url: str | None
    duration_minutes: int | None
    created_at: datetime
    updated_at: datetime
```

### Router (`api/routers/lessons.py`)

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..dependencies import get_db
from ..models import Chapter, Lesson
from ..schemas import LessonCreate, LessonResponse, LessonUpdate

router = APIRouter(tags=["Lessons"])


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _get_chapter(db: Session, chapter_id: int) -> Chapter:
    """Fetch chapter or raise 404."""
    chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    if not chapter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Chapter {chapter_id} not found"
        )
    return chapter


def _get_lesson(db: Session, lesson_id: int, chapter_id: int) -> Lesson:
    """Fetch lesson or raise 404."""
    lesson = db.query(Lesson).filter(
        Lesson.id == lesson_id,
        Lesson.chapter_id == chapter_id
    ).first()
    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lesson {lesson_id} not found"
        )
    return lesson


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


@router.get("/chapters/{chapter_id}/lessons", response_model=list[LessonResponse])
def list_lessons(chapter_id: int, db: Session = Depends(get_db)):
    """List all lessons for a chapter, ordered by order field."""
    chapter = _get_chapter(db, chapter_id)
    return db.query(Lesson).filter(
        Lesson.chapter_id == chapter.id
    ).order_by(Lesson.order).all()


@router.post(
    "/chapters/{chapter_id}/lessons",
    response_model=LessonResponse,
    status_code=status.HTTP_201_CREATED
)
def create_lesson(
    chapter_id: int,
    lesson_in: LessonCreate,
    db: Session = Depends(get_db)
):
    """Create a new lesson with auto-assigned order."""
    chapter = _get_chapter(db, chapter_id)

    # Auto-assign next order
    max_order = db.query(func.max(Lesson.order)).filter(
        Lesson.chapter_id == chapter.id
    ).scalar() or 0
    next_order = max_order + 1

    lesson = Lesson(
        chapter_id=chapter.id,
        order=next_order,
        **lesson_in.model_dump()
    )
    db.add(lesson)
    db.commit()
    db.refresh(lesson)
    return lesson


@router.get("/chapters/{chapter_id}/lessons/{lesson_id}", response_model=LessonResponse)
def get_lesson(chapter_id: int, lesson_id: int, db: Session = Depends(get_db)):
    """Get a specific lesson."""
    _get_chapter(db, chapter_id)
    return _get_lesson(db, lesson_id, chapter_id)


@router.put("/chapters/{chapter_id}/lessons/{lesson_id}", response_model=LessonResponse)
def update_lesson(
    chapter_id: int,
    lesson_id: int,
    lesson_in: LessonUpdate,
    db: Session = Depends(get_db)
):
    """Update a lesson."""
    _get_chapter(db, chapter_id)
    lesson = _get_lesson(db, lesson_id, chapter_id)

    for key, value in lesson_in.model_dump(exclude_unset=True).items():
        setattr(lesson, key, value)

    db.commit()
    db.refresh(lesson)
    return lesson


@router.delete(
    "/chapters/{chapter_id}/lessons/{lesson_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_lesson(chapter_id: int, lesson_id: int, db: Session = Depends(get_db)):
    """Delete a lesson."""
    _get_chapter(db, chapter_id)
    lesson = _get_lesson(db, lesson_id, chapter_id)
    db.delete(lesson)
    db.commit()
```

---

## Example 3: Search and Filtering

**Scenario:** Search courses by title or description with pagination.

### Router (`api/routers/courses.py`)

```python
from typing import Optional
from fastapi import Query

@router.get("/courses/search", response_model=list[CourseResponse])
def search_courses(
    q: Optional[str] = Query(None, min_length=1, description="Search query"),
    skip: int = Query(0, ge=0, description="Skip N courses"),
    limit: int = Query(10, ge=1, le=100, description="Max results"),
    db: Session = Depends(get_db)
):
    """
    Search courses by title or description.

    - **q**: Search query (searches in title and description)
    - **skip**: Number of courses to skip (for pagination)
    - **limit**: Max number of courses to return (1-100)
    """
    query = db.query(Course)

    if q:
        search_filter = or_(
            Course.title.ilike(f"%{q}%"),
            Course.description.ilike(f"%{q}%")
        )
        query = query.filter(search_filter)

    return query.order_by(Course.title).offset(skip).limit(limit).all()
```

---

## Example 4: Many-to-Many Relationship

**Scenario:** Courses can have multiple tags, and tags can belong to multiple courses.

### Models (`api/models.py`)

```python
from sqlalchemy import Table

# Association table
course_tags = Table(
    'course_tags',
    Base.metadata,
    Column('course_id', Integer, ForeignKey('courses.id', ondelete='CASCADE'), primary_key=True),
    Column('tag_id', Integer, ForeignKey('tags.id', ondelete='CASCADE'), primary_key=True)
)

class Course(Base):
    __tablename__ = "courses"
    # ... existing fields

    # Relationship (optional)
    tags = relationship("Tag", secondary=course_tags, backref="courses")
```

### Schemas (`api/schemas.py`)

```python
class CourseWithTags(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    slug: str
    tags: list[TagResponse]
```

### Router (`api/routers/courses.py`)

```python
from sqlalchemy.orm import selectinload

@router.get("/courses/{slug}/tags", response_model=list[TagResponse])
def get_course_tags(slug: str, db: Session = Depends(get_db)):
    """Get all tags for a course."""
    course = _get_course(db, slug)
    # Using the relationship
    return course.tags


@router.post("/courses/{slug}/tags/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
def add_tag_to_course(slug: str, tag_id: int, db: Session = Depends(get_db)):
    """Add a tag to a course."""
    course = _get_course(db, slug)
    tag = db.query(Tag).filter(Tag.id == tag_id).first()
    if not tag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tag {tag_id} not found"
        )

    if tag in course.tags:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Tag already assigned to course"
        )

    course.tags.append(tag)
    db.commit()


@router.delete("/courses/{slug}/tags/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_tag_from_course(slug: str, tag_id: int, db: Session = Depends(get_db)):
    """Remove a tag from a course."""
    course = _get_course(db, slug)
    tag = db.query(Tag).filter(Tag.id == tag_id).first()
    if not tag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tag {tag_id} not found"
        )

    if tag not in course.tags:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tag not assigned to this course"
        )

    course.tags.remove(tag)
    db.commit()
```

---

## Example 5: Bulk Operations

**Scenario:** Create multiple chapters at once.

### Schemas (`api/schemas.py`)

```python
class BulkCreateResponse(BaseModel):
    created: int
    items: list[ChapterResponse]
```

### Router (`api/routers/chapters.py`)

```python
@router.post(
    "/courses/{slug}/chapters/bulk",
    response_model=BulkCreateResponse,
    status_code=status.HTTP_201_CREATED
)
def create_chapters_bulk(
    slug: str,
    chapters_in: list[ChapterCreate],
    db: Session = Depends(get_db)
):
    """Create multiple chapters at once."""
    course = _get_course(db, slug)

    if not chapters_in:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No chapters provided"
        )

    chapters = []
    for chapter_in in chapters_in:
        chapter = Chapter(course_id=course.id, **chapter_in.model_dump())
        chapters.append(chapter)

    try:
        db.add_all(chapters)
        db.commit()
        for ch in chapters:
            db.refresh(ch)
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Constraint violation: {str(e)}"
        )

    return BulkCreateResponse(created=len(chapters), items=chapters)
```

---

## Example 6: Custom Action Endpoint

**Scenario:** Reorder chapters within a course.

### Schemas (`api/schemas.py`)

```python
class ChapterReorderItem(BaseModel):
    id: int
    order: int = Field(..., ge=1)


class ChapterReorderRequest(BaseModel):
    items: list[ChapterReorderItem]
```

### Router (`api/routers/chapters.py`)

```python
@router.post("/courses/{slug}/chapters/reorder", status_code=status.HTTP_204_NO_CONTENT)
def reorder_chapters(
    slug: str,
    reorder_in: ChapterReorderRequest,
    db: Session = Depends(get_db)
):
    """
    Reorder chapters within a course.

    Provide a list of chapter IDs with their new order values.
    All chapters for the course must be included.
    """
    course = _get_course(db, slug)

    # Fetch all chapters for this course
    chapters = db.query(Chapter).filter(Chapter.course_id == course.id).all()
    chapter_ids = {ch.id for ch in chapters}
    reorder_ids = {item.id for item in reorder_in.items}

    # Validate that all chapter IDs are provided
    if chapter_ids != reorder_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Must provide all chapter IDs for reordering"
        )

    # Apply new order
    for item in reorder_in.items:
        chapter = next(ch for ch in chapters if ch.id == item.id)
        chapter.order = item.order

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Duplicate order values"
        )
```

---

## Example 7: Pagination with Metadata

**Scenario:** Return paginated results with total count.

### Schemas (`api/schemas.py`)

```python
from typing import Generic, TypeVar

T = TypeVar('T')

class PaginatedResponse(BaseModel, Generic[T]):
    total: int
    skip: int
    limit: int
    items: list[T]
```

### Router (`api/routers/courses.py`)

```python
@router.get("/courses/paginated", response_model=PaginatedResponse[CourseResponse])
def list_courses_paginated(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """List courses with pagination metadata."""
    total = db.query(Course).count()
    items = db.query(Course).offset(skip).limit(limit).all()

    return PaginatedResponse(
        total=total,
        skip=skip,
        limit=limit,
        items=items
    )
```

---

These examples cover most common scenarios in the Brainer API. Adapt them to your specific needs while maintaining consistency with the established patterns.
