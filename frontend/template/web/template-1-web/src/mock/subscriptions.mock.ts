import type { SubtopicSubscriptionDTO } from '@/dto/subscription.dto';

export const mockSubscriptions: SubtopicSubscriptionDTO[] = [
  { id: 1, userId: 2, userName: 'student_lee', subtopicId: 1, subtopicName: 'Morning Routines', createdAt: '2024-03-01T10:00:00' },
  { id: 2, userId: 2, userName: 'student_lee', subtopicId: 3, subtopicName: 'Restaurant Vocabulary', createdAt: '2024-03-01T10:05:00' },
  { id: 3, userId: 2, userName: 'student_lee', subtopicId: 5, subtopicName: 'Body Parts', createdAt: '2024-03-02T09:00:00' },
  { id: 4, userId: 3, userName: 'student_wong', subtopicId: 1, subtopicName: 'Morning Routines', createdAt: '2024-03-05T09:00:00' },
  { id: 5, userId: 3, userName: 'student_wong', subtopicId: 2, subtopicName: 'Shopping & Transport', createdAt: '2024-03-05T09:05:00' },
  { id: 6, userId: 3, userName: 'student_wong', subtopicId: 7, subtopicName: 'Climate Change', createdAt: '2024-03-06T09:00:00' },
  { id: 7, userId: 5, userName: 'student_ng', subtopicId: 8, subtopicName: 'Digital Technology', createdAt: '2024-03-10T09:00:00' },
  { id: 8, userId: 5, userName: 'student_ng', subtopicId: 9, subtopicName: 'Medical Science', createdAt: '2024-03-10T09:10:00' },
  { id: 9, userId: 5, userName: 'student_ng', subtopicId: 10, subtopicName: 'Financial Terms', createdAt: '2024-03-10T09:20:00' },
];
