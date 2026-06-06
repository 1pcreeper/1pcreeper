import type { ExerciseDifficulty } from './enums';

export interface SubtopicDTO {
  id: number;
  topicId: number;
  topicName: string;
  name: string;
  difficulty: ExerciseDifficulty;
  createdAt: string;
  updatedAt: string | null;
  createdBy: number | null;
  updatedBy: number | null;
}

export interface SubtopicRequestDTO {
  topicId: number;
  name: string;
  difficulty: ExerciseDifficulty;
}
