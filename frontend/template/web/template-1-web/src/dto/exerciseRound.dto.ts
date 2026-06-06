import type { ExerciseQuestionType } from './enums';

export interface ExerciseRoundDTO {
  id: number;
  userId: number;
  userName: string;
  subtopicId: number;
  subtopicName: string;
  questionType: ExerciseQuestionType;
  totalQuestions: number;
  timeLimit: number | null;
  score: number;
  createdAt: string;
}
