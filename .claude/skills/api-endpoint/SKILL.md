---
name: api-endpoint
description: Create, modify, or delete FastAPI endpoints following Brainer's backend architecture, best practices, and conventions. Ensures code quality, type safety, proper error handling, and database consistency.
---

# API Endpoint

## Overview

This skill guides the creation, modification, and deletion of FastAPI endpoints for the Brainer backend. It ensures consistency with the established architecture (FastAPI + SQLAlchemy + Pydantic), follows REST API best practices, and maintains code quality standards.

**Key principles:**
- RESTful API design
- Type safety with Pydantic
- Proper HTTP status codes
- Comprehensive error handling
- Database transaction management
- OpenAPI documentation
- Testing and validation

## When to Use This Skill

Invoke this skill when the user wants to:
- Create new REST API endpoints
- Modify existing endpoints while maintaining consistency
- Delete obsolete endpoints and clean up dependencies
- Add new database models and relationships
- Implement CRUD operations for resources
- Add validation rules or business logic
- Fix API bugs or improve error handling
- Ensure endpoints follow best practices

## Architecture Overview

### Project Structure

```
api/
├── main.py                    # FastAPI app, CORS, static files, router registration
├── database.py                # SQLAlchemy engine, session, Base
├── dependencies.py            # Dependency injection (get_db, auth, etc.)
├── models.py                  # SQLAlchemy ORM models (Course, Part, Chapter, Exercise)
├── schemas.py                 # Pydantic schemas (request/response models)
└── routers/
    ├── __init__.py
    ├── courses.py             # Course and Part endpoints
    ├── chapters.py            # Chapter endpoints
    ├── exercises.py           # Exercise endpoints
    └── images.py              # Image upload endpoint
```

### Data Flow

```
Request → Router → Dependency (get_db) → SQLAlchemy Model → Database
                ↓                                               ↑
         Pydantic Schema                                        |
                ↓                                               |
            Business Logic ----------------------------------------
                ↓
         Response (Pydantic Schema)
```

## Database Models (SQLAlchemy)

### Model Template

```python
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.sql import func
from .database import Base

class MyModel(Base):
    __tablename__ = "my_models"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    parent_id = Column(Integer, ForeignKey("parents.id", ondelete="CASCADE"), nullable=False)
    order = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    __table_args__ = (
        UniqueConstraint("parent_id", "order", name="uq_mymodel_parent_order"),
    )
```

**Key conventions:**
- **Table name**: Plural form (`courses`, `chapters`, `exercises`)
- **Primary key**: Always `id` with `autoincrement=True`
- **Foreign keys**: Use `ondelete="CASCADE"` for hierarchical relationships
- **Timestamps**: Use `func.now()` for `created_at` and `onupdate=func.now()` for `updated_at`
- **Unique constraints**: Use `UniqueConstraint` in `__table_args__` for composite uniqueness
- **Order fields**: Integer starting from 1, enforced by unique constraints
- **Nullable**: Explicitly set `nullable=False` for required fields

### Column Types

```python
from sqlalchemy import Boolean, Column, DateTime, Enum, Integer, JSON, String, Text

Column(Integer, ...)           # Integers, IDs
Column(String, ...)            # Short text (titles, slugs, URLs)
Column(Text, ...)              # Long text (descriptions, content)
Column(Boolean, ...)           # Flags (auto_generated, is_active)
Column(JSON, ...)              # Structured data (exercise content)
Column(DateTime, ...)          # Timestamps
Column(Enum(MyEnum), ...)      # Enums (exercise types)
```

### Enums

```python
import enum
from sqlalchemy import Enum

class ExerciseType(enum.Enum):
    multiple_choice = "multiple_choice"
    code = "code"
    true_false = "true_false"

# In model
type = Column(Enum(ExerciseType), nullable=False)
```

### Relationships (if needed)

```python
from sqlalchemy.orm import relationship

class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True)
    # ... other columns

    # Relationship (optional, for eager loading)
    parts = relationship("Part", back_populates="course", cascade="all, delete-orphan")

class Part(Base):
    __tablename__ = "parts"

    id = Column(Integer, primary_key=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"))

    # Back-reference (optional)
    course = relationship("Course", back_populates="parts")
```

**Note:** In Brainer, we generally don't use relationships for simplicity. We rely on foreign keys and manual querying.

## Pydantic Schemas

### Schema Patterns

**Create Schema** (no ID, no timestamps):
```python
from pydantic import BaseModel

class CourseCreate(BaseModel):
    title: str
    slug: str
    description: str | None = None
    image: str | None = None
```

**Update Schema** (all fields optional):
```python
class CourseUpdate(BaseModel):
    title: str | None = None
    slug: str | None = None
    description: str | None = None
    image: str | None = None
```

**Response Schema** (full model with timestamps):
```python
from datetime import datetime
from pydantic import ConfigDict

class CourseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    slug: str
    description: str | None
    image: str | None
    created_at: datetime
    updated_at: datetime
```

**List Item Schema** (lightweight, no heavy fields):
```python
class ChapterListItem(BaseModel):
    """Lightweight version for lists - excludes 'content' field."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    order: int
    title: str
    slug: str
    part_id: int
```

### Validation

```python
from pydantic import BaseModel, Field, field_validator

class CourseCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    slug: str = Field(..., min_length=1, max_length=100, pattern=r'^[a-z0-9-]+$')
    description: str | None = Field(None, max_length=1000)

    @field_validator('slug')
    @classmethod
    def validate_slug(cls, v: str) -> str:
        if not v.islower():
            raise ValueError('slug must be lowercase')
        return v
```

### Polymorphic Content (Union types)

```python
from typing import Union
from pydantic import BaseModel

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

# Union type for polymorphic content
ExerciseContentUnion = Union[MultipleChoiceContent, CodeContent, TrueFalseContent]

class ExerciseCreate(BaseModel):
    title: str
    type: ExerciseType
    content: ExerciseContentUnion  # Pydantic will validate based on type
```

## Router Patterns

### Basic CRUD Router

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..dependencies import get_db
from ..models import MyModel
from ..schemas import MyModelCreate, MyModelResponse, MyModelUpdate

router = APIRouter()

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _get_my_model(db: Session, id: int) -> MyModel:
    """Helper to fetch model or raise 404."""
    obj = db.query(MyModel).filter(MyModel.id == id).first()
    if not obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"MyModel {id} not found"
        )
    return obj

# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.get("/my-models", response_model=list[MyModelResponse])
def list_my_models(db: Session = Depends(get_db)):
    """List all resources."""
    return db.query(MyModel).order_by(MyModel.id).all()

@router.post("/my-models", response_model=MyModelResponse, status_code=status.HTTP_201_CREATED)
def create_my_model(obj_in: MyModelCreate, db: Session = Depends(get_db)):
    """Create a new resource."""
    obj = MyModel(**obj_in.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

@router.get("/my-models/{id}", response_model=MyModelResponse)
def get_my_model(id: int, db: Session = Depends(get_db)):
    """Get a single resource by ID."""
    return _get_my_model(db, id)

@router.put("/my-models/{id}", response_model=MyModelResponse)
def update_my_model(id: int, obj_in: MyModelUpdate, db: Session = Depends(get_db)):
    """Update a resource."""
    obj = _get_my_model(db, id)
    for key, value in obj_in.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)
    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/my-models/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_my_model(id: int, db: Session = Depends(get_db)):
    """Delete a resource."""
    obj = _get_my_model(db, id)
    db.delete(obj)
    db.commit()
```

### Nested Resource Router

For resources nested under a parent (e.g., `/courses/{slug}/parts`):

```python
@router.get("/courses/{slug}/parts", response_model=list[PartResponse])
def list_parts(slug: str, db: Session = Depends(get_db)):
    """List all parts for a course."""
    course = _get_course(db, slug)
    return db.query(Part).filter(Part.course_id == course.id).order_by(Part.order).all()

@router.post("/courses/{slug}/parts", response_model=PartResponse, status_code=status.HTTP_201_CREATED)
def create_part(slug: str, part_in: PartCreate, db: Session = Depends(get_db)):
    """Create a new part under a course."""
    course = _get_course(db, slug)
    part = Part(course_id=course.id, **part_in.model_dump())
    db.add(part)
    db.commit()
    db.refresh(part)
    return part

@router.get("/courses/{slug}/parts/{part_id}", response_model=PartResponse)
def get_part(slug: str, part_id: int, db: Session = Depends(get_db)):
    """Get a specific part."""
    course = _get_course(db, slug)
    return _get_part(db, course.id, part_id)
```

## HTTP Status Codes

Use appropriate status codes:

```python
from fastapi import status

# Success
status.HTTP_200_OK                  # GET, PUT (default)
status.HTTP_201_CREATED             # POST (resource created)
status.HTTP_204_NO_CONTENT          # DELETE (no response body)

# Client Errors
status.HTTP_400_BAD_REQUEST         # Validation error
status.HTTP_404_NOT_FOUND           # Resource not found
status.HTTP_409_CONFLICT            # Conflict (e.g., duplicate slug)
status.HTTP_422_UNPROCESSABLE_ENTITY # Pydantic validation (automatic)

# Server Errors
status.HTTP_500_INTERNAL_SERVER_ERROR # Unexpected error
```

## Error Handling

### Raising HTTPException

```python
from fastapi import HTTPException, status

# Not found
raise HTTPException(
    status_code=status.HTTP_404_NOT_FOUND,
    detail=f"Course '{slug}' not found"
)

# Validation error
raise HTTPException(
    status_code=status.HTTP_400_BAD_REQUEST,
    detail="Invalid slug format"
)

# Conflict (duplicate)
raise HTTPException(
    status_code=status.HTTP_409_CONFLICT,
    detail=f"Course with slug '{slug}' already exists"
)
```

### Database Integrity Errors

```python
from sqlalchemy.exc import IntegrityError

try:
    db.add(obj)
    db.commit()
except IntegrityError as e:
    db.rollback()
    raise HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail=f"Duplicate or constraint violation: {str(e)}"
    )
```

### Helper Functions

```python
def _get_course(db: Session, slug: str) -> Course:
    """Fetch course by slug or raise 404."""
    course = db.query(Course).filter(Course.slug == slug).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Course '{slug}' not found"
        )
    return course
```

## Dependencies

### Database Session

```python
from fastapi import Depends
from sqlalchemy.orm import Session
from ..dependencies import get_db

@router.get("/my-endpoint")
def my_endpoint(db: Session = Depends(get_db)):
    # db is automatically injected and closed after the request
    return db.query(MyModel).all()
```

### Custom Dependencies

```python
# In dependencies.py
def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    # Validate token, return user
    pass

# In router
@router.get("/protected")
def protected_endpoint(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    return {"user": user.email}
```

## Query Patterns

### Simple Query

```python
# Get all
courses = db.query(Course).all()

# Get by ID
course = db.query(Course).filter(Course.id == course_id).first()

# Get by slug
course = db.query(Course).filter(Course.slug == slug).first()

# Ordered
parts = db.query(Part).filter(Part.course_id == course_id).order_by(Part.order).all()
```

### Filtering

```python
# Multiple filters
chapters = db.query(Chapter).filter(
    Chapter.course_id == course_id,
    Chapter.part_id == part_id
).all()

# OR conditions
from sqlalchemy import or_
results = db.query(Course).filter(
    or_(Course.slug == slug, Course.title.like(f"%{search}%"))
).all()
```

### Joins (if using relationships)

```python
# Join with filter
chapters = db.query(Chapter).join(Part).filter(
    Part.course_id == course_id
).all()
```

### Count

```python
total = db.query(Course).count()
```

### Pagination

```python
from fastapi import Query

@router.get("/courses", response_model=list[CourseResponse])
def list_courses(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    return db.query(Course).offset(skip).limit(limit).all()
```

## Registration in main.py

```python
# In main.py
from .routers import my_router

app.include_router(my_router.router, prefix="/api", tags=["my-resource"])
```

**Tags** are used for OpenAPI documentation grouping.

## File Upload Pattern

```python
from fastapi import APIRouter, UploadFile, File
from pathlib import Path
import uuid

router = APIRouter()

@router.post("/images/upload", response_model=ImageUploadResponse)
async def upload_image(file: UploadFile = File(...)):
    """Upload an image and return its URL."""
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )

    # Generate unique filename
    ext = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{ext}"

    # Save file
    file_path = Path(__file__).parent / "static" / "images" / filename
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    # Return URL
    url = f"/static/images/{filename}"
    return ImageUploadResponse(url=url)
```

## Testing Checklist

Before finalizing an endpoint:

- [ ] Endpoint follows RESTful naming conventions
- [ ] Appropriate HTTP method (GET, POST, PUT, DELETE)
- [ ] Correct status codes (200, 201, 204, 404, etc.)
- [ ] Pydantic schemas defined (Create, Update, Response)
- [ ] Database model has proper constraints
- [ ] Helper functions for repetitive queries
- [ ] Error handling for 404, 409, 500
- [ ] Database transactions properly managed (commit/rollback)
- [ ] `response_model` specified on decorator
- [ ] OpenAPI docs are clear (docstrings)
- [ ] No SQL injection vulnerabilities (use ORM, not raw SQL)
- [ ] Foreign key cascades configured correctly
- [ ] Unique constraints enforced
- [ ] Test the endpoint manually or with automated tests
- [ ] Frontend types regenerated (`npm run generate:types`)

## Common Patterns

### Auto-increment Order Field

When creating a resource with an `order` field, auto-assign the next value:

```python
@router.post("/chapters", response_model=ChapterResponse, status_code=status.HTTP_201_CREATED)
def create_chapter(chapter_in: ChapterCreate, db: Session = Depends(get_db)):
    # Auto-assign order if not provided
    if not chapter_in.order:
        max_order = db.query(func.max(Chapter.order)).filter(
            Chapter.course_id == chapter_in.course_id
        ).scalar() or 0
        chapter_in.order = max_order + 1

    chapter = Chapter(**chapter_in.model_dump())
    db.add(chapter)
    db.commit()
    db.refresh(chapter)
    return chapter
```

### Soft Delete (if needed)

```python
# In model
is_deleted = Column(Boolean, default=False)
deleted_at = Column(DateTime, nullable=True)

# In endpoint
@router.delete("/courses/{slug}")
def delete_course(slug: str, db: Session = Depends(get_db)):
    course = _get_course(db, slug)
    course.is_deleted = True
    course.deleted_at = func.now()
    db.commit()
    return {"message": "Course deleted"}
```

### Bulk Operations

```python
@router.post("/chapters/bulk", response_model=list[ChapterResponse])
def create_chapters_bulk(chapters_in: list[ChapterCreate], db: Session = Depends(get_db)):
    chapters = [Chapter(**ch.model_dump()) for ch in chapters_in]
    db.add_all(chapters)
    db.commit()
    for ch in chapters:
        db.refresh(ch)
    return chapters
```

## Important Conventions

1. **Router file naming:** Plural form (`courses.py`, `chapters.py`, `exercises.py`)
2. **Endpoint paths:** Lowercase, kebab-case (`/my-resources`, `/courses/{slug}/parts`)
3. **Path parameters:** Use `{id}` for integers, `{slug}` for string identifiers
4. **Helper functions:** Prefix with `_` (e.g., `_get_course`, `_get_part`)
5. **Docstrings:** Add to all endpoints for OpenAPI docs
6. **Type hints:** Always use type hints (`db: Session`, `slug: str`)
7. **Pydantic schemas:** Separate Create, Update, and Response schemas
8. **Status codes:** Explicit `status_code` on POST and DELETE
9. **Ordering:** Use `.order_by()` for consistent list ordering
10. **Exclude unset:** Use `model_dump(exclude_unset=True)` in PUT to only update provided fields
11. **Database prefix:** All API routes use `/api` prefix
12. **CORS:** Already configured in `main.py` for all origins (tighten in production)

## OpenAPI Documentation

FastAPI auto-generates OpenAPI docs. Enhance them with:

```python
@router.get(
    "/courses/{slug}",
    response_model=CourseResponse,
    summary="Get a course by slug",
    description="Retrieve detailed information about a course using its unique slug identifier.",
    responses={
        200: {"description": "Course found"},
        404: {"description": "Course not found"}
    }
)
def get_course(slug: str, db: Session = Depends(get_db)):
    """Get course by slug."""
    return _get_course(db, slug)
```

Access docs at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Performance Considerations

### Database Indexes

```python
# In model
slug = Column(String, unique=True, nullable=False, index=True)
```

Use `index=True` for fields frequently used in queries.

### N+1 Query Problem

```python
# ❌ Bad: N+1 queries
courses = db.query(Course).all()
for course in courses:
    parts = db.query(Part).filter(Part.course_id == course.id).all()

# ✅ Good: Single query with join or selectinload
from sqlalchemy.orm import selectinload
courses = db.query(Course).options(selectinload(Course.parts)).all()
```

### Pagination

Always paginate large result sets:

```python
@router.get("/courses")
def list_courses(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Course).offset(skip).limit(limit).all()
```

## Migration Pattern (manual)

When adding new fields to existing models:

1. **Update model** in `models.py`
2. **Drop and recreate database** (for small projects):
   ```bash
   rm brainer.db
   uvicorn api.main:app --reload
   ```
3. **For production:** Use Alembic for migrations

## Resources

- FastAPI docs: https://fastapi.tiangolo.com
- SQLAlchemy docs: https://docs.sqlalchemy.org
- Pydantic docs: https://docs.pydantic.dev
- HTTP status codes: https://httpstatuses.com
- REST API best practices: https://restfulapi.net
