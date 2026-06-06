import type { ExerciseQuestionType } from './enums';

export interface QuestionDTO {
  id: number;
  questionType: ExerciseQuestionType;
  subtopicId: number;
  subtopicName: string;
  subject: string;
  answerWordId: number | null;
  answerData: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string | null;
  createdBy: number | null;
  updatedBy: number | null;
}

export interface QuestionRequestDTO {
  questionType: ExerciseQuestionType;
  subtopicId: number;
  subject: string;
  answerWordId?: number;
  answerData?: Record<string, unknown>;
}
