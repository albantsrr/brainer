import type { components } from './api';

export type Course = components['schemas']['CourseResponse'];
export type CourseCreate = components['schemas']['CourseCreate'];
export type Part = components['schemas']['PartResponse'];
export type Chapter = components['schemas']['ChapterResponse'];
export type ChapterListItem = components['schemas']['ChapterListItem'];
export type Exercise = components['schemas']['ExerciseResponse'];
export type ExerciseType = 'multiple_choice' | 'code' | 'true_false';
export type MultipleChoiceContent = components['schemas']['MultipleChoiceContent'];
export type CodeContent = components['schemas']['CodeContent'];
export type TrueFalseContent = components['schemas']['TrueFalseContent'];
