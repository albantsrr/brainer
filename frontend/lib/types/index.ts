import type { components } from './api';

export type Course = components['schemas']['CourseResponse'];
export type CourseCreate = components['schemas']['CourseCreate'];
export type CourseUpdate = components['schemas']['CourseUpdate'];
export type Part = components['schemas']['PartResponse'];
export type PartCreate = components['schemas']['PartCreate'];
export type PartUpdate = components['schemas']['PartUpdate'];
export type Chapter = components['schemas']['ChapterResponse'];
export type ChapterListItem = components['schemas']['ChapterListItem'];
export type ChapterUpdate = components['schemas']['ChapterUpdate'];
export type Exercise = components['schemas']['ExerciseResponse'];
export type ExerciseType = 'multiple_choice' | 'code' | 'true_false';
export type MultipleChoiceContent = components['schemas']['MultipleChoiceContent'];
export type CodeContent = components['schemas']['CodeContent'];
export type TrueFalseContent = components['schemas']['TrueFalseContent'];

// Review sheet types (not yet in auto-generated API)
export interface ReviewSheet {
  id: number;
  part_id: number;
  content: string;
  created_at: string;
  updated_at: string;
}

// Auth types (not yet in auto-generated API)
export interface UserResponse {
  id: number;
  email: string;
  username: string;
  is_active: boolean;
  created_at: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface UserCreate {
  email: string;
  username: string;
  password: string;
}

// Progress types (not yet in auto-generated API)
export interface ChapterProgressResponse {
  chapter_id: number;
  is_completed: boolean;
  completed_at: string | null;
}

export interface ExerciseSubmissionResponse {
  exercise_id: number;
  answer: number | boolean | string;
  is_correct: boolean;
  submitted_at: string;
}

export interface ChapterDetailProgressResponse {
  chapter_id: number;
  is_completed: boolean;
  completed_at: string | null;
  submissions: ExerciseSubmissionResponse[];
}

export interface CourseProgressResponse {
  course_id: number;
  total_chapters: number;
  completed_chapters: number;
  completion_percentage: number;
  total_exercises: number;
  answered_exercises: number;
  correct_exercises: number;
  completed_chapter_ids: number[];
}

export interface ChapterProgressUpdate {
  is_completed: boolean;
}

export interface ExerciseSubmissionCreate {
  answer: number | boolean | string;
}
