# Advanced FastAPI Patterns

This file contains advanced patterns and techniques for building robust FastAPI endpoints in the Brainer API.

---

## 1. Custom Validators and Business Logic

### Field-level Validators

```python
from pydantic import BaseModel, Field, field_validator
import re

class ChapterCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    slug: str = Field(..., pattern=r'^[a-z0-9-]+$')
    content: str | None = None

    @field_validator('slug')
    @classmethod
    def validate_slug(cls, v: str) -> str:
        """Ensure slug is lowercase and doesn't start/end with hyphen."""
        if not v.islower():
            raise ValueError('slug must be lowercase')
        if v.startswith('-') or v.endswith('-'):
            raise ValueError('slug cannot start or end with hyphen')
        return v

    @field_validator('content')
    @classmethod
    def sanitize_content(cls, v: str | None) -> str | None:
        """Strip dangerous HTML if needed."""
        if v:
            # Basic sanitization (use bleach in production)
            return v.strip()
        return v
```

### Model-level Validators

```python
from pydantic import model_validator

class DateRangeFilter(BaseModel):
    start_date: datetime | None = None
    end_date: datetime | None = None

    @model_validator(mode='after')
    def validate_date_range(self) -> 'DateRangeFilter':
        """Ensure end_date is after start_date."""
        if self.start_date and self.end_date:
            if self.end_date < self.start_date:
                raise ValueError('end_date must be after start_date')
        return self
```

---

## 2. Custom Dependencies

### Reusable Pagination Dependency

```python
# In dependencies.py
from fastapi import Query
from typing import Annotated

class PaginationParams:
    def __init__(
        self,
        skip: Annotated[int, Query(ge=0)] = 0,
        limit: Annotated[int, Query(ge=1, le=100)] = 10
    ):
        self.skip = skip
        self.limit = limit

# In router
@router.get("/courses")
def list_courses(
    pagination: Annotated[PaginationParams, Depends()],
    db: Session = Depends(get_db)
):
    return db.query(Course).offset(pagination.skip).limit(pagination.limit).all()
```

### Resource Ownership Verification

```python
# In dependencies.py
def verify_course_ownership(
    slug: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Course:
    """Verify user owns the course."""
    course = db.query(Course).filter(Course.slug == slug).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if course.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return course

# In router
@router.put("/courses/{slug}")
def update_course(
    course: Course = Depends(verify_course_ownership),
    course_in: CourseUpdate = ...,
    db: Session = Depends(get_db)
):
    # course is already validated and owned by user
    for key, value in course_in.model_dump(exclude_unset=True).items():
        setattr(course, key, value)
    db.commit()
    db.refresh(course)
    return course
```

---

## 3. Transaction Management

### Manual Transaction Control

```python
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

@router.post("/complex-operation")
def complex_operation(data: ComplexData, db: Session = Depends(get_db)):
    """Operation requiring multiple database writes."""
    try:
        # Start explicit transaction
        with db.begin_nested():
            # Step 1
            course = Course(**data.course_data)
            db.add(course)
            db.flush()  # Get course.id without committing

            # Step 2
            for part_data in data.parts:
                part = Part(course_id=course.id, **part_data)
                db.add(part)

            # Step 3
            db.commit()

        return {"status": "success", "course_id": course.id}

    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Database constraint violation: {str(e)}"
        )
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred"
        )
```

### Rollback on Business Logic Error

```python
@router.post("/enroll")
def enroll_in_course(
    enrollment: EnrollmentCreate,
    db: Session = Depends(get_db)
):
    """Enroll user in course with validation."""
    try:
        course = db.query(Course).filter(Course.id == enrollment.course_id).first()
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")

        # Business logic validation
        if course.max_students and course.enrolled_count >= course.max_students:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Course is full"
            )

        # Create enrollment
        enrollment_obj = Enrollment(**enrollment.model_dump())
        db.add(enrollment_obj)

        # Update counter
        course.enrolled_count += 1

        db.commit()
        db.refresh(enrollment_obj)
        return enrollment_obj

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
```

---

## 4. Response Models and Serialization

### Dynamic Response Fields

```python
from typing import Literal

@router.get("/courses/{slug}")
def get_course(
    slug: str,
    include: Literal["basic", "full", "with_stats"] = "basic",
    db: Session = Depends(get_db)
):
    """Get course with variable detail level."""
    course = _get_course(db, slug)

    if include == "basic":
        return CourseBasicResponse.model_validate(course)
    elif include == "full":
        return CourseFull Response.model_validate(course)
    else:  # with_stats
        stats = calculate_course_stats(course, db)
        return CourseWithStatsResponse(
            **course.__dict__,
            stats=stats
        )
```

### Custom Response Headers

```python
from fastapi import Response

@router.get("/courses/{slug}")
def get_course(slug: str, response: Response, db: Session = Depends(get_db)):
    """Get course with custom headers."""
    course = _get_course(db, slug)

    # Add custom headers
    response.headers["X-Course-ID"] = str(course.id)
    response.headers["X-Last-Modified"] = course.updated_at.isoformat()

    return course
```

### Conditional Responses

```python
from fastapi import Header

@router.get("/courses/{slug}")
def get_course(
    slug: str,
    if_modified_since: str | None = Header(None),
    db: Session = Depends(get_db)
):
    """Return 304 Not Modified if course hasn't changed."""
    course = _get_course(db, slug)

    if if_modified_since:
        modified_since = datetime.fromisoformat(if_modified_since)
        if course.updated_at <= modified_since:
            return Response(status_code=status.HTTP_304_NOT_MODIFIED)

    return course
```

---

## 5. Advanced Querying

### Dynamic Filters

```python
from typing import Optional

@router.get("/courses")
def list_courses(
    title: Optional[str] = None,
    min_chapters: Optional[int] = None,
    tags: Optional[list[str]] = Query(None),
    db: Session = Depends(get_db)
):
    """List courses with dynamic filters."""
    query = db.query(Course)

    if title:
        query = query.filter(Course.title.ilike(f"%{title}%"))

    if min_chapters:
        query = query.join(Chapter).group_by(Course.id).having(
            func.count(Chapter.id) >= min_chapters
        )

    if tags:
        # Filter by tags (many-to-many)
        query = query.join(Course.tags).filter(Tag.slug.in_(tags))

    return query.all()
```

### Complex Aggregations

```python
from sqlalchemy import func, case

@router.get("/courses/stats")
def get_courses_stats(db: Session = Depends(get_db)):
    """Get aggregated course statistics."""
    stats = db.query(
        func.count(Course.id).label('total_courses'),
        func.avg(
            db.query(func.count(Chapter.id))
            .filter(Chapter.course_id == Course.id)
            .scalar_subquery()
        ).label('avg_chapters_per_course'),
        func.sum(
            case((Course.is_published == True, 1), else_=0)
        ).label('published_courses')
    ).first()

    return {
        "total_courses": stats.total_courses,
        "avg_chapters_per_course": float(stats.avg_chapters_per_course or 0),
        "published_courses": stats.published_courses
    }
```

### Subqueries

```python
from sqlalchemy import select

@router.get("/courses/popular")
def get_popular_courses(limit: int = 10, db: Session = Depends(get_db)):
    """Get courses ordered by enrollment count."""
    # Subquery to count enrollments
    enrollment_count = (
        select(func.count(Enrollment.id))
        .where(Enrollment.course_id == Course.id)
        .scalar_subquery()
        .label('enrollment_count')
    )

    courses = db.query(
        Course,
        enrollment_count
    ).order_by(enrollment_count.desc()).limit(limit).all()

    return [
        {**course.__dict__, "enrollment_count": count}
        for course, count in courses
    ]
```

---

## 6. File Handling

### Streaming Large Files

```python
from fastapi.responses import StreamingResponse
import io

@router.get("/courses/{slug}/export")
def export_course(slug: str, db: Session = Depends(get_db)):
    """Export course as JSON file."""
    course = _get_course(db, slug)

    # Prepare data
    data = {
        "course": CourseResponse.model_validate(course).model_dump(),
        "parts": [PartResponse.model_validate(p).model_dump() for p in course.parts],
        # ... more data
    }

    # Create in-memory file
    json_data = json.dumps(data, indent=2)
    file_like = io.BytesIO(json_data.encode('utf-8'))

    return StreamingResponse(
        file_like,
        media_type="application/json",
        headers={
            "Content-Disposition": f"attachment; filename={course.slug}.json"
        }
    )
```

### File Upload with Validation

```python
from fastapi import UploadFile, File
import magic  # python-magic

ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

@router.post("/images/upload")
async def upload_image(file: UploadFile = File(...)):
    """Upload image with validation."""
    # Read file content
    content = await file.read()

    # Validate size
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Max size: {MAX_FILE_SIZE} bytes"
        )

    # Validate MIME type with magic
    mime_type = magic.from_buffer(content, mime=True)
    if mime_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed: {ALLOWED_MIME_TYPES}"
        )

    # Save file
    filename = f"{uuid.uuid4()}.{mime_type.split('/')[-1]}"
    file_path = Path(__file__).parent / "static" / "images" / filename

    with open(file_path, "wb") as f:
        f.write(content)

    return {"url": f"/static/images/{filename}"}
```

---

## 7. Background Tasks

### Simple Background Task

```python
from fastapi import BackgroundTasks

def send_notification_email(email: str, course_title: str):
    """Send email notification (runs in background)."""
    # Email sending logic
    print(f"Sending email to {email} about {course_title}")

@router.post("/enroll")
def enroll_in_course(
    enrollment: EnrollmentCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Enroll user and send confirmation email in background."""
    # Create enrollment
    enrollment_obj = Enrollment(**enrollment.model_dump())
    db.add(enrollment_obj)
    db.commit()

    # Schedule background task
    background_tasks.add_task(
        send_notification_email,
        enrollment_obj.user_email,
        enrollment_obj.course.title
    )

    return enrollment_obj
```

---

## 8. Caching

### Simple In-Memory Cache

```python
from functools import lru_cache
from datetime import datetime, timedelta

# Cache course stats for 5 minutes
_cache = {}
_cache_ttl = {}

def get_cached_course_stats(course_id: int, db: Session):
    """Get course stats with caching."""
    now = datetime.now()

    # Check cache
    if course_id in _cache and _cache_ttl.get(course_id, datetime.min) > now:
        return _cache[course_id]

    # Calculate stats
    stats = calculate_course_stats(course_id, db)

    # Store in cache
    _cache[course_id] = stats
    _cache_ttl[course_id] = now + timedelta(minutes=5)

    return stats

@router.get("/courses/{slug}/stats")
def get_course_stats(slug: str, db: Session = Depends(get_db)):
    """Get cached course statistics."""
    course = _get_course(db, slug)
    return get_cached_course_stats(course.id, db)
```

---

## 9. Rate Limiting

### Custom Rate Limiter (Simple)

```python
from fastapi import Request
from time import time
from collections import defaultdict

# Simple rate limiter: 10 requests per minute per IP
_rate_limit_storage = defaultdict(list)
RATE_LIMIT = 10
RATE_WINDOW = 60  # seconds

def check_rate_limit(request: Request):
    """Check if request exceeds rate limit."""
    client_ip = request.client.host
    now = time()

    # Clean old requests
    _rate_limit_storage[client_ip] = [
        req_time for req_time in _rate_limit_storage[client_ip]
        if now - req_time < RATE_WINDOW
    ]

    # Check limit
    if len(_rate_limit_storage[client_ip]) >= RATE_LIMIT:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded"
        )

    # Add current request
    _rate_limit_storage[client_ip].append(now)

@router.post("/courses", dependencies=[Depends(check_rate_limit)])
def create_course(course_in: CourseCreate, db: Session = Depends(get_db)):
    """Create course with rate limiting."""
    # ... implementation
```

---

## 10. Testing Helpers

### Test Database Fixture

```python
# In conftest.py
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from api.database import Base
from api.dependencies import get_db
from api.main import app

TEST_DATABASE_URL = "sqlite:///./test.db"

@pytest.fixture
def test_db():
    """Create test database."""
    engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
    TestSessionLocal = sessionmaker(bind=engine)

    Base.metadata.create_all(bind=engine)

    def override_get_db():
        db = TestSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    yield TestSessionLocal()

    Base.metadata.drop_all(bind=engine)
    app.dependency_overrides.clear()
```

### Testing Endpoints

```python
# In test_courses.py
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)

def test_create_course(test_db):
    """Test course creation."""
    response = client.post("/api/courses", json={
        "title": "Test Course",
        "slug": "test-course",
        "description": "A test course"
    })

    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test Course"
    assert data["slug"] == "test-course"

def test_get_nonexistent_course(test_db):
    """Test 404 for nonexistent course."""
    response = client.get("/api/courses/nonexistent")
    assert response.status_code == 404
```

---

These advanced patterns provide robust solutions for common challenges in API development. Adapt them to fit your specific use cases while maintaining consistency with Brainer's architecture.
