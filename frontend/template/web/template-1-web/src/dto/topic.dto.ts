export interface TopicDTO {
  id: number;
  gradeId: number;
  gradeName: string;
  name: string;
  shortDesc: string | null;
  createdAt: string;
  updatedAt: string | null;
  createdBy: number | null;
  updatedBy: number | null;
}

export interface TopicRequestDTO {
  gradeId: number;
  name: string;
  shortDesc?: string;
}
