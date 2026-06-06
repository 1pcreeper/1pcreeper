export interface GradeDTO {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string | null;
  createdBy: number | null;
  updatedBy: number | null;
}

export interface GradeRequestDTO {
  name: string;
}
