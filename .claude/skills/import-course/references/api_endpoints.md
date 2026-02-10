# Brainer API Endpoints for Course Import

This document describes the REST API endpoints used by the import-course skill.

## Base URL

Default: `http://localhost:8000`

Configure via environment variable: `export API_URL=http://your-api-url:port`

## Endpoints

### 1. Create Course

**POST** `/api/courses`

Creates a new course.

**Request Body:**
```json
{
  "title": "Course Title",
  "slug": "course-slug",
  "description": "Optional description"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "title": "Course Title",
  "slug": "course-slug",
  "description": "Optional description",
  "image": null,
  "created_at": "2024-02-09T10:00:00",
  "updated_at": "2024-02-09T10:00:00"
}
```

**Error:** `400 Bad Request` if slug already exists

---

### 2. Create Part

**POST** `/api/courses/{course_slug}/parts`

Creates a new part within a course.

**Request Body:**
```json
{
  "order": 1,
  "title": "Part Title",
  "description": "Optional description"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "course_id": 1,
  "order": 1,
  "title": "Part Title",
  "description": "Optional description"
}
```

**Constraints:**
- `order` must be unique within the course
- `order` should start at 1 and increment sequentially

---

### 3. Create Chapter

**POST** `/api/courses/{course_slug}/chapters`

Creates a new chapter within a course and part.

**Request Body:**
```json
{
  "part_id": 1,
  "order": 1,
  "title": "Chapter Title",
  "slug": "chapter-slug",
  "content": "<p>HTML content</p>"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "course_id": 1,
  "part_id": 1,
  "order": 1,
  "title": "Chapter Title",
  "slug": "chapter-slug",
  "content": "<p>HTML content</p>",
  "image": null,
  "created_at": "2024-02-09T10:00:00",
  "updated_at": "2024-02-09T10:00:00"
}
```

**Constraints:**
- `order` must be unique within the course
- `slug` must be unique within the course
- `part_id` must reference an existing part

---

## Error Handling

All endpoints may return:

**400 Bad Request**
- Invalid payload format
- Unique constraint violations (slug, order)
- Missing required fields

**404 Not Found**
- Course slug not found
- Part ID not found

**500 Internal Server Error**
- Database errors
- Unexpected server errors

## Example Flow

```python
# 1. Create course
POST /api/courses
{
  "title": "Fundamentals of Data Engineering",
  "slug": "fundamentals-of-data-engineering",
  "description": "by Joe Reis and Matt Housley"
}
# Returns: {"id": 1, ...}

# 2. Create parts
POST /api/courses/fundamentals-of-data-engineering/parts
{"order": 1, "title": "Foundations", "description": ""}
# Returns: {"id": 1, "course_id": 1, ...}

POST /api/courses/fundamentals-of-data-engineering/parts
{"order": 2, "title": "The Data Engineering Lifecycle", "description": ""}
# Returns: {"id": 2, "course_id": 1, ...}

# 3. Create chapters
POST /api/courses/fundamentals-of-data-engineering/chapters
{
  "part_id": 1,
  "order": 1,
  "title": "Data Engineering Described",
  "slug": "data-engineering-described",
  "content": "<p>Content here</p>"
}
# Returns: {"id": 1, ...}

POST /api/courses/fundamentals-of-data-engineering/chapters
{
  "part_id": 1,
  "order": 2,
  "title": "The Data Engineering Lifecycle",
  "slug": "the-data-engineering-lifecycle",
  "content": "<p>Content here</p>"
}
# Returns: {"id": 2, ...}
```

## Notes

- All timestamps are in ISO 8601 format
- The `image` field is optional and can be set via the image upload endpoint
- Chapter `content` field accepts HTML
- The API has CORS enabled for development (all origins allowed)
