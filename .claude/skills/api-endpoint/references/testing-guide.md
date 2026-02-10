# API Testing Guide

Comprehensive guide for testing FastAPI endpoints in the Brainer API.

---

## Test Structure

```
api/
├── tests/
│   ├── __init__.py
│   ├── conftest.py              # Shared fixtures
│   ├── test_courses.py          # Course endpoint tests
│   ├── test_chapters.py         # Chapter endpoint tests
│   ├── test_exercises.py        # Exercise endpoint tests
│   └── test_integration.py      # Integration tests
```

---

## Setup (pytest + FastAPI TestClient)

### Installation

```bash
pip install pytest pytest-cov httpx
```

### conftest.py (Shared Fixtures)

```python
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from api.database import Base
from api.dependencies import get_db
from api.main import app
from api.models import Course, Part, Chapter

TEST_DATABASE_URL = "sqlite:///./test.db"


@pytest.fixture(scope="function")
def test_db():
    """Create a fresh test database for each test."""
    engine = create_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
    TestSessionLocal = sessionmaker(bind=engine)

    # Create tables
    Base.metadata.create_all(bind=engine)

    # Override dependency
    def override_get_db():
        db = TestSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    db = TestSessionLocal()
    yield db

    # Cleanup
    db.close()
    Base.metadata.drop_all(bind=engine)
    app.dependency_overrides.clear()


@pytest.fixture
def client(test_db):
    """FastAPI test client."""
    return TestClient(app)


@pytest.fixture
def sample_course(test_db):
    """Create a sample course for testing."""
    course = Course(
        title="Test Course",
        slug="test-course",
        description="A test course"
    )
    test_db.add(course)
    test_db.commit()
    test_db.refresh(course)
    return course


@pytest.fixture
def sample_part(test_db, sample_course):
    """Create a sample part for testing."""
    part = Part(
        course_id=sample_course.id,
        order=1,
        title="Part 1",
        description="First part"
    )
    test_db.add(part)
    test_db.commit()
    test_db.refresh(part)
    return part
```

---

## Basic CRUD Tests

### Test GET Endpoints

```python
def test_list_courses_empty(client):
    """Test listing courses when none exist."""
    response = client.get("/api/courses")
    assert response.status_code == 200
    assert response.json() == []


def test_list_courses(client, sample_course):
    """Test listing courses."""
    response = client.get("/api/courses")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["slug"] == "test-course"


def test_get_course(client, sample_course):
    """Test getting a single course."""
    response = client.get(f"/api/courses/{sample_course.slug}")
    assert response.status_code == 200
    data = response.json()
    assert data["slug"] == sample_course.slug
    assert data["title"] == sample_course.title


def test_get_nonexistent_course(client):
    """Test 404 for nonexistent course."""
    response = client.get("/api/courses/nonexistent")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()
```

### Test POST Endpoints

```python
def test_create_course(client):
    """Test creating a course."""
    payload = {
        "title": "New Course",
        "slug": "new-course",
        "description": "A new course"
    }
    response = client.post("/api/courses", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == payload["title"]
    assert data["slug"] == payload["slug"]
    assert "id" in data
    assert "created_at" in data


def test_create_course_duplicate_slug(client, sample_course):
    """Test creating a course with duplicate slug."""
    payload = {
        "title": "Duplicate",
        "slug": sample_course.slug,  # Duplicate
        "description": "Test"
    }
    response = client.post("/api/courses", json=payload)
    assert response.status_code == 409  # Conflict
```

### Test PUT Endpoints

```python
def test_update_course(client, sample_course):
    """Test updating a course."""
    payload = {"title": "Updated Title"}
    response = client.put(f"/api/courses/{sample_course.slug}", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Updated Title"
    assert data["slug"] == sample_course.slug  # Unchanged


def test_update_course_partial(client, sample_course):
    """Test partial update (only some fields)."""
    payload = {"description": "New description"}
    response = client.put(f"/api/courses/{sample_course.slug}", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["description"] == "New description"
    assert data["title"] == sample_course.title  # Unchanged
```

### Test DELETE Endpoints

```python
def test_delete_course(client, sample_course, test_db):
    """Test deleting a course."""
    response = client.delete(f"/api/courses/{sample_course.slug}")
    assert response.status_code == 204
    assert response.content == b""

    # Verify deletion
    from api.models import Course
    course = test_db.query(Course).filter(Course.slug == sample_course.slug).first()
    assert course is None


def test_delete_nonexistent_course(client):
    """Test deleting nonexistent course."""
    response = client.delete("/api/courses/nonexistent")
    assert response.status_code == 404
```

---

## Validation Tests

### Test Pydantic Validation

```python
def test_create_course_missing_required_field(client):
    """Test validation error for missing required field."""
    payload = {"title": "Test"}  # Missing 'slug'
    response = client.post("/api/courses", json=payload)
    assert response.status_code == 422  # Unprocessable Entity
    errors = response.json()["detail"]
    assert any(err["loc"] == ["body", "slug"] for err in errors)


def test_create_course_invalid_slug_format(client):
    """Test validation error for invalid slug format."""
    payload = {
        "title": "Test",
        "slug": "INVALID SLUG!",  # Should be lowercase kebab-case
    }
    response = client.post("/api/courses", json=payload)
    assert response.status_code == 422


def test_create_course_field_too_long(client):
    """Test validation error for field exceeding max length."""
    payload = {
        "title": "x" * 300,  # Assuming max_length=200
        "slug": "test",
    }
    response = client.post("/api/courses", json=payload)
    assert response.status_code == 422
```

---

## Relationship Tests

### Test Nested Resources

```python
def test_create_part_under_course(client, sample_course):
    """Test creating a part under a course."""
    payload = {
        "order": 1,
        "title": "Part 1",
        "description": "First part"
    }
    response = client.post(f"/api/courses/{sample_course.slug}/parts", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["course_id"] == sample_course.id
    assert data["title"] == "Part 1"


def test_list_parts_for_course(client, sample_course, sample_part):
    """Test listing parts for a specific course."""
    response = client.get(f"/api/courses/{sample_course.slug}/parts")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["id"] == sample_part.id
```

### Test Cascade Deletes

```python
def test_delete_course_cascades_to_parts(client, sample_course, sample_part, test_db):
    """Test that deleting a course also deletes its parts."""
    response = client.delete(f"/api/courses/{sample_course.slug}")
    assert response.status_code == 204

    # Verify part was also deleted
    from api.models import Part
    part = test_db.query(Part).filter(Part.id == sample_part.id).first()
    assert part is None
```

---

## Integration Tests

### Test Complete Workflow

```python
def test_complete_course_creation_workflow(client):
    """Test creating course, part, chapter, and exercise."""
    # 1. Create course
    course_payload = {
        "title": "Full Course",
        "slug": "full-course",
    }
    course_response = client.post("/api/courses", json=course_payload)
    assert course_response.status_code == 201
    course = course_response.json()

    # 2. Create part
    part_payload = {
        "order": 1,
        "title": "Part 1",
    }
    part_response = client.post(
        f"/api/courses/{course['slug']}/parts",
        json=part_payload
    )
    assert part_response.status_code == 201
    part = part_response.json()

    # 3. Create chapter
    chapter_payload = {
        "part_id": part["id"],
        "order": 1,
        "title": "Chapter 1",
        "slug": "chapter-1",
        "content": "Chapter content"
    }
    chapter_response = client.post(
        f"/api/courses/{course['slug']}/chapters",
        json=chapter_payload
    )
    assert chapter_response.status_code == 201
    chapter = chapter_response.json()

    # 4. Create exercise
    exercise_payload = {
        "title": "Exercise 1",
        "type": "true_false",
        "content": {
            "statement": "Python is a programming language",
            "answer": True,
            "explanation": "Yes, it is!"
        }
    }
    exercise_response = client.post(
        f"/api/chapters/{chapter['id']}/exercises",
        json=exercise_payload
    )
    assert exercise_response.status_code == 201

    # 5. Verify complete structure
    course_response = client.get(f"/api/courses/{course['slug']}")
    assert course_response.status_code == 200
```

---

## Parametrized Tests

### Test Multiple Scenarios

```python
import pytest

@pytest.mark.parametrize("slug,expected_status", [
    ("valid-slug", 200),
    ("another-valid-slug", 200),
    ("", 422),  # Empty slug
    ("UPPERCASE", 422),  # Invalid format
    ("with space", 422),  # Spaces not allowed
])
def test_slug_validation(client, slug, expected_status):
    """Test various slug formats."""
    if expected_status == 200:
        # Create course first
        client.post("/api/courses", json={"title": "Test", "slug": slug})
        response = client.get(f"/api/courses/{slug}")
    else:
        response = client.post("/api/courses", json={"title": "Test", "slug": slug})

    assert response.status_code == expected_status
```

---

## Mocking External Services

### Mock File Upload

```python
from io import BytesIO
from unittest.mock import patch

def test_image_upload(client):
    """Test image upload."""
    # Create fake image
    fake_image = BytesIO(b"fake image content")
    fake_image.name = "test.png"

    response = client.post(
        "/api/images/upload",
        files={"file": ("test.png", fake_image, "image/png")}
    )

    assert response.status_code == 200
    data = response.json()
    assert "url" in data
    assert data["url"].endswith(".png")
```

---

## Performance Tests

### Test Query Performance

```python
import time

def test_list_courses_performance(client, test_db):
    """Test that listing many courses is performant."""
    # Create 100 courses
    from api.models import Course
    courses = [
        Course(title=f"Course {i}", slug=f"course-{i}")
        for i in range(100)
    ]
    test_db.add_all(courses)
    test_db.commit()

    # Measure response time
    start = time.time()
    response = client.get("/api/courses")
    duration = time.time() - start

    assert response.status_code == 200
    assert len(response.json()) == 100
    assert duration < 1.0  # Should complete in under 1 second
```

---

## Coverage

### Run Tests with Coverage

```bash
# Install coverage
pip install pytest-cov

# Run tests with coverage
pytest --cov=api --cov-report=html

# View coverage report
open htmlcov/index.html
```

### Target Coverage Levels

- **Models**: 100% (simple code, easy to test)
- **Schemas**: 90%+ (Pydantic handles most validation)
- **Routers**: 80%+ (focus on business logic and edge cases)
- **Dependencies**: 70%+ (some are difficult to test in isolation)

---

## Testing Checklist

Before merging endpoint changes:

- [ ] All CRUD operations tested (GET, POST, PUT, DELETE)
- [ ] 404 errors tested for nonexistent resources
- [ ] Validation errors tested (missing fields, invalid formats)
- [ ] Duplicate/conflict scenarios tested
- [ ] Nested resource operations tested
- [ ] Cascade deletes verified (if applicable)
- [ ] Integration tests for complete workflows
- [ ] Edge cases covered (empty lists, null values, etc.)
- [ ] Performance acceptable for large datasets
- [ ] Test coverage >80% for new code

---

## Running Tests

```bash
# Run all tests
pytest

# Run specific test file
pytest api/tests/test_courses.py

# Run specific test
pytest api/tests/test_courses.py::test_create_course

# Run with verbose output
pytest -v

# Run with coverage
pytest --cov=api

# Run only failed tests from last run
pytest --lf

# Run in parallel (requires pytest-xdist)
pytest -n auto
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: API Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.12'

      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install pytest pytest-cov

      - name: Run tests
        run: pytest --cov=api --cov-report=xml

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage.xml
```

---

These testing patterns ensure robust, reliable API endpoints. Always write tests alongside new endpoints!
