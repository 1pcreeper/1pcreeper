import type { SubtopicSubscriptionDTO, SubtopicSubscriptionRequestDTO } from '@/dto/subscription.dto';
import type { PaginationBaseResponseDTO, PageParams } from '@/dto/base.dto';
import { MOCK_MODE, MOCK_DELAY_MS } from '@/lib/config';
import { delay } from '@/lib/utils';
import { mockSubscriptions } from '@/mock/subscriptions.mock';
import api from '@/lib/axios';

let localSubs = [...mockSubscriptions];

export interface ISubscriptionService {
  findAll(params: PageParams & { userId?: number }): Promise<PaginationBaseResponseDTO<SubtopicSubscriptionDTO>>;
  create(dto: SubtopicSubscriptionRequestDTO): Promise<SubtopicSubscriptionDTO>;
  delete(id: number): Promise<void>;
}

class SubscriptionServiceImpl implements ISubscriptionService {
  async findAll({ page = 0, size = 10, userId, q }: PageParams & { userId?: number }): Promise<PaginationBaseResponseDTO<SubtopicSubscriptionDTO>> {
    if (MOCK_MODE) {
      await delay(MOCK_DELAY_MS);
      let filtered = userId ? localSubs.filter((s) => s.userId === userId) : localSubs;
      const start = page * size;
      const content = filtered.slice(start, start + size);
      return { content, pageNumber: page, pageSize: size, totalPages: Math.ceil(filtered.length / size), totalElements: filtered.length };
    }
    const res = await api.get<{ data: PaginationBaseResponseDTO<SubtopicSubscriptionDTO> }>('/admin/subscriptions', { params: { page, size, userId, q }, withCredentials: true });
    return res.data.data;
  }

  async create(dto: SubtopicSubscriptionRequestDTO): Promise<SubtopicSubscriptionDTO> {
    if (MOCK_MODE) {
      await delay(MOCK_DELAY_MS);
      const newItem: SubtopicSubscriptionDTO = {
        id: Math.max(...localSubs.map((s) => s.id)) + 1,
        userId: dto.userId,
        userName: `user_${dto.userId}`,
        subtopicId: dto.subtopicId,
        subtopicName: `subtopic_${dto.subtopicId}`,
        createdAt: new Date().toISOString(),
      };
      localSubs = [...localSubs, newItem];
      return newItem;
    }
    const res = await api.post<{ data: SubtopicSubscriptionDTO }>('/admin/subscriptions', dto, { withCredentials: true });
    return res.data.data;
  }

  async delete(id: number): Promise<void> {
    if (MOCK_MODE) {
      await delay(MOCK_DELAY_MS);
      localSubs = localSubs.filter((s) => s.id !== id);
      return;
    }
    await api.delete(`/admin/subscriptions/${id}`, { withCredentials: true });
  }
}

export const SubscriptionService: ISubscriptionService = new SubscriptionServiceImpl();
