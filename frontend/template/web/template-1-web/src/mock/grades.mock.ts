import type { GradeDTO } from '@/dto/grade.dto';

export const mockGrades: GradeDTO[] = [
  {
    id: 1,
    name: 'DSE Level 1',
    createdAt: '2024-01-05T08:00:00',
    updatedAt: null,
    createdBy: 0,
    updatedBy: null,
  },
  {
    id: 2,
    name: 'DSE Level 2',
    createdAt: '2024-01-05T08:05:00',
    updatedAt: null,
    createdBy: 0,
    updatedBy: null,
  },
  {
    id: 3,
    name: 'DSE Level 3',
    createdAt: '2024-01-05T08:10:00',
    updatedAt: null,
    createdBy: 0,
    updatedBy: null,
  },
  {
    id: 4,
    name: 'DSE Level 4',
    createdAt: '2024-01-05T08:15:00',
    updatedAt: '2024-03-10T12:00:00',
    createdBy: 0,
    updatedBy: 4,
  },
  {
    id: 5,
    name: 'DSE Level 5*',
    createdAt: '2024-01-05T08:20:00',
    updatedAt: null,
    createdBy: 0,
    updatedBy: null,
  },
];
