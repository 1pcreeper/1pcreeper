export interface SubtopicSubscriptionDTO {
  id: number;
  userId: number;
  userName: string;
  subtopicId: number;
  subtopicName: string;
  createdAt: string;
}

export interface SubtopicSubscriptionRequestDTO {
  userId: number;
  subtopicId: number;
}
