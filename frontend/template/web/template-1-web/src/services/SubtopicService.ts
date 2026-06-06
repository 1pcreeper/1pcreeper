import type { SubtopicDTO, SubtopicRequestDTO } from '@/dto/subtopic.dto';
import type { PaginationBaseResponseDTO, PageParams } from '@/dto/base.dto';
import { MOCK_MODE, MOCK_DELAY_MS } from '@/lib/config';
import { delay } from '@/lib/utils';
import { mockSubtopics } from '@/mock/subtopics.mock';
import { mockTopics } from '@/mock/topics.mock';
import api from '@/lib/axios';

let localSubtopics = [...mockSubtopics];

export interface ISubtopicService {
  findAll(params: PageParams & { topicId?: number }): Promise<PaginationBaseResponseDTO<SubtopicDTO>>;
  findById(id: number): Promise<SubtopicDTO>;
  findByTopic(topicId: number, params: PageParams): Promise<PaginationBaseResponseDTO<SubtopicDTO>>;
  create(dto: SubtopicRequestDTO): Promise<SubtopicDTO>;
  update(id: number, dto: SubtopicRequestDTO): Promise<SubtopicDTO>;
  delete(id: number): Promise<void>;
}

class SubtopicServiceImpl implements ISubtopicService {
  async findAll({ page = 0, size = 10, topicId, q }: PageParams & { topicId?: number }): Promise<PaginationBaseResponseDTO<SubtopicDTO>> {
    if (MOCK_MODE) {
      await delay(MOCK_DELAY_MS);
      let filtered = topicId ? localSubtopics.filter((s) => s.topicId === topicId) : localSubtopics;
      if (q) {
        filtered = filtered.filter(s => s.name.toLowerCase().includes(q.toLowerCase()));
      }
      const start = page * size;
      const content = filtered.slice(start, start + size);
      return { content, pageNumber: page, pageSize: size, totalPages: Math.ceil(filtered.length / size), totalElements: filtered.length };
    }
    const res = await api.get<{ data: PaginationBaseResponseDTO<SubtopicDTO> }>('/admin/subtopics', { params: { page, size, topicId, q }, withCredentials: true });
    return res.data.data;
  }

  async findByTopic(topicId: number, { page = 0, size = 10, q }: PageParams): Promise<PaginationBaseResponseDTO<SubtopicDTO>> {
    return this.findAll({ page, size, topicId, q });
  }

  async findById(id: number): Promise<SubtopicDTO> {
    if (MOCK_MODE) {
      await delay(MOCK_DELAY_MS);
      const item = localSubtopics.find((s) => s.id === id);
      if (!item) throw new Error(`Subtopic ${id} not found`);
      return item;
    }
    const res = await api.get<{ data: SubtopicDTO }>(`/admin/subtopics/${id}`, { withCredentials: true });
    return res.data.data;
  }

  async create(dto: SubtopicRequestDTO): Promise<SubtopicDTO> {
    if (MOCK_MODE) {
      await delay(MOCK_DELAY_MS);
      const topic = mockTopics.find((t) => t.id === dto.topicId);
      const newItem: SubtopicDTO = {
        id: Math.max(...localSubtopics.map((s) => s.id)) + 1,
        topicId: dto.topicId,
        topicName: topic?.name ?? '',
        name: dto.name,
        difficulty: dto.difficulty,
        createdAt: new Date().toISOString(),
        updatedAt: null,
        createdBy: 0,
        updatedBy: null,
      };
      localSubtopics = [...localSubtopics, newItem];
      return newItem;
    }
    const res = await api.post<{ data: SubtopicDTO }>('/admin/subtopics', dto, { withCredentials: true });
    return res.data.data;
  }

  async update(id: number, dto: SubtopicRequestDTO): Promise<SubtopicDTO> {
    if (MOCK_MODE) {
      await delay(MOCK_DELAY_MS);
      const topic = mockTopics.find((t) => t.id === dto.topicId);
      localSubtopics = localSubtopics.map((s) =>
        s.id === id ? { ...s, ...dto, topicName: topic?.name ?? s.topicName, updatedAt: new Date().toISOString() } : s
      );
      const updated = localSubtopics.find((s) => s.id === id);
      if (!updated) throw new Error(`Subtopic ${id} not found`);
      return updated;
    }
    const res = await api.put<{ data: SubtopicDTO }>(`/admin/subtopics/${id}`, dto, { withCredentials: true });
    return res.data.data;
  }

  async delete(id: number): Promise<void> {
    if (MOCK_MODE) {
      await delay(MOCK_DELAY_MS);
      localSubtopics = localSubtopics.filter((s) => s.id !== id);
      return;
    }
    await api.delete(`/admin/subtopics/${id}`, { withCredentials: true });
  }
}

export const SubtopicService: ISubtopicService = new SubtopicServiceImpl();
