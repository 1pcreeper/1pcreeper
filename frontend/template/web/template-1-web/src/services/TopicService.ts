import type { TopicDTO, TopicRequestDTO } from '@/dto/topic.dto';
import type { PaginationBaseResponseDTO, PageParams } from '@/dto/base.dto';
import { MOCK_MODE, MOCK_DELAY_MS } from '@/lib/config';
import { delay } from '@/lib/utils';
import { mockTopics } from '@/mock/topics.mock';
import { mockGrades } from '@/mock/grades.mock';
import api from '@/lib/axios';

let localTopics = [...mockTopics];

export interface ITopicService {
  findAll(params: PageParams & { gradeId?: number }): Promise<PaginationBaseResponseDTO<TopicDTO>>;
  findById(id: number): Promise<TopicDTO>;
  findByGrade(gradeId: number, params: PageParams): Promise<PaginationBaseResponseDTO<TopicDTO>>;
  create(dto: TopicRequestDTO): Promise<TopicDTO>;
  update(id: number, dto: TopicRequestDTO): Promise<TopicDTO>;
  delete(id: number): Promise<void>;
}

class TopicServiceImpl implements ITopicService {
  async findAll({ page = 0, size = 10, gradeId, q }: PageParams & { gradeId?: number }): Promise<PaginationBaseResponseDTO<TopicDTO>> {
    if (MOCK_MODE) {
      await delay(MOCK_DELAY_MS);
      let filtered = gradeId ? localTopics.filter((t) => t.gradeId === gradeId) : localTopics;
      if (q) {
        filtered = filtered.filter(t => t.name.toLowerCase().includes(q.toLowerCase()));
      }
      const start = page * size;
      const content = filtered.slice(start, start + size);
      return { content, pageNumber: page, pageSize: size, totalPages: Math.ceil(filtered.length / size), totalElements: filtered.length };
    }
    const res = await api.get<{ data: PaginationBaseResponseDTO<TopicDTO> }>('/admin/topics', { params: { page, size, gradeId, q }, withCredentials: true });
    return res.data.data;
  }

  async findByGrade(gradeId: number, { page = 0, size = 10, q }: PageParams): Promise<PaginationBaseResponseDTO<TopicDTO>> {
    return this.findAll({ page, size, gradeId, q });
  }

  async findById(id: number): Promise<TopicDTO> {
    if (MOCK_MODE) {
      await delay(MOCK_DELAY_MS);
      const item = localTopics.find((t) => t.id === id);
      if (!item) throw new Error(`Topic ${id} not found`);
      return item;
    }
    const res = await api.get<{ data: TopicDTO }>(`/admin/topics/${id}`, { withCredentials: true });
    return res.data.data;
  }

  async create(dto: TopicRequestDTO): Promise<TopicDTO> {
    if (MOCK_MODE) {
      await delay(MOCK_DELAY_MS);
      const grade = mockGrades.find((g) => g.id === dto.gradeId);
      const newItem: TopicDTO = {
        id: Math.max(...localTopics.map((t) => t.id)) + 1,
        gradeId: dto.gradeId,
        gradeName: grade?.name ?? '',
        name: dto.name,
        shortDesc: dto.shortDesc ?? null,
        createdAt: new Date().toISOString(),
        updatedAt: null,
        createdBy: 0,
        updatedBy: null,
      };
      localTopics = [...localTopics, newItem];
      return newItem;
    }
    const res = await api.post<{ data: TopicDTO }>('/admin/topics', dto, { withCredentials: true });
    return res.data.data;
  }

  async update(id: number, dto: TopicRequestDTO): Promise<TopicDTO> {
    if (MOCK_MODE) {
      await delay(MOCK_DELAY_MS);
      const grade = mockGrades.find((g) => g.id === dto.gradeId);
      localTopics = localTopics.map((t) =>
        t.id === id ? { ...t, ...dto, gradeName: grade?.name ?? t.gradeName, updatedAt: new Date().toISOString() } : t
      );
      const updated = localTopics.find((t) => t.id === id);
      if (!updated) throw new Error(`Topic ${id} not found`);
      return updated;
    }
    const res = await api.put<{ data: TopicDTO }>(`/admin/topics/${id}`, dto, { withCredentials: true });
    return res.data.data;
  }

  async delete(id: number): Promise<void> {
    if (MOCK_MODE) {
      await delay(MOCK_DELAY_MS);
      localTopics = localTopics.filter((t) => t.id !== id);
      return;
    }
    await api.delete(`/admin/topics/${id}`, { withCredentials: true });
  }
}

export const TopicService: ITopicService = new TopicServiceImpl();
