import type { ExerciseRoundDTO } from '@/dto/exerciseRound.dto';
import type { PaginationBaseResponseDTO, PageParams } from '@/dto/base.dto';
import { MOCK_MODE, MOCK_DELAY_MS } from '@/lib/config';
import { delay } from '@/lib/utils';
import { mockExerciseRounds } from '@/mock/exerciseRounds.mock';
import api from '@/lib/axios';

let localRounds = [...mockExerciseRounds];

export interface IExerciseRoundService {
  findAll(params: PageParams & { userId?: number }): Promise<PaginationBaseResponseDTO<ExerciseRoundDTO>>;
  findById(id: number): Promise<ExerciseRoundDTO>;
  delete(id: number): Promise<void>;
}

class ExerciseRoundServiceImpl implements IExerciseRoundService {
  async findAll({ page = 0, size = 10, userId, q }: PageParams & { userId?: number }): Promise<PaginationBaseResponseDTO<ExerciseRoundDTO>> {
    if (MOCK_MODE) {
      await delay(MOCK_DELAY_MS);
      let filtered = localRounds;
      if (userId) filtered = filtered.filter((r) => r.userId === userId);
      if (q) {
        filtered = filtered.filter((r) => r.userName.toLowerCase().includes(q.toLowerCase()) || r.subtopicName.toLowerCase().includes(q.toLowerCase()));
      }
      const start = page * size;
      const content = filtered.slice(start, start + size);
      return { content, pageNumber: page, pageSize: size, totalPages: Math.ceil(filtered.length / size), totalElements: filtered.length };
    }
    const res = await api.get<{ data: PaginationBaseResponseDTO<ExerciseRoundDTO> }>('/admin/exercise-rounds', { params: { page, size, userId, q }, withCredentials: true });
    return res.data.data;
  }

  async findById(id: number): Promise<ExerciseRoundDTO> {
    if (MOCK_MODE) {
      await delay(MOCK_DELAY_MS);
      const item = localRounds.find((r) => r.id === id);
      if (!item) throw new Error(`Exercise round ${id} not found`);
      return item;
    }
    const res = await api.get<{ data: ExerciseRoundDTO }>(`/admin/exercise-rounds/${id}`, { withCredentials: true });
    return res.data.data;
  }

  async delete(id: number): Promise<void> {
    if (MOCK_MODE) {
      await delay(MOCK_DELAY_MS);
      localRounds = localRounds.filter((r) => r.id !== id);
      return;
    }
    await api.delete(`/admin/exercise-rounds/${id}`, { withCredentials: true });
  }
}

export const ExerciseRoundService: IExerciseRoundService = new ExerciseRoundServiceImpl();
