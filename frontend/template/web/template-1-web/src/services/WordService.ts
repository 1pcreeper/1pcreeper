import type { WordDTO, WordRequestDTO } from '@/dto/word.dto';
import type { PaginationBaseResponseDTO, PageParams } from '@/dto/base.dto';
import { MOCK_MODE, MOCK_DELAY_MS } from '@/lib/config';
import { delay } from '@/lib/utils';
import { mockWords } from '@/mock/words.mock';
import { mockSubtopics } from '@/mock/subtopics.mock';
import api from '@/lib/axios';

let localWords = [...mockWords];

export interface IWordService {
  findAll(params: PageParams & { subtopicId?: number }): Promise<PaginationBaseResponseDTO<WordDTO>>;
  findById(id: number): Promise<WordDTO>;
  findBySubtopic(subtopicId: number, params: PageParams): Promise<PaginationBaseResponseDTO<WordDTO>>;
  create(dto: WordRequestDTO): Promise<WordDTO>;
  update(id: number, dto: WordRequestDTO): Promise<WordDTO>;
  delete(id: number): Promise<void>;
}

class WordServiceImpl implements IWordService {
  async findAll({ page = 0, size = 10, subtopicId, q }: PageParams & { subtopicId?: number }): Promise<PaginationBaseResponseDTO<WordDTO>> {
    if (MOCK_MODE) {
      await delay(MOCK_DELAY_MS);
      let filtered = subtopicId ? localWords.filter((w) => w.subtopicId === subtopicId) : localWords;
      if (q) {
        filtered = filtered.filter(item => item.subject.toLowerCase().includes(q.toLowerCase()));
      }
      const start = page * size;
      const content = filtered.slice(start, start + size);
      return { content, pageNumber: page, pageSize: size, totalPages: Math.ceil(filtered.length / size), totalElements: filtered.length };
    }
    const res = await api.get<{ data: PaginationBaseResponseDTO<WordDTO> }>('/admin/words', { params: { page, size, subtopicId, q }, withCredentials: true });
    return res.data.data;
  }

  async findBySubtopic(subtopicId: number, { page = 0, size = 10, q }: PageParams): Promise<PaginationBaseResponseDTO<WordDTO>> {
    return this.findAll({ page, size, subtopicId, q });
  }

  async findById(id: number): Promise<WordDTO> {
    if (MOCK_MODE) {
      await delay(MOCK_DELAY_MS);
      const item = localWords.find((w) => w.id === id);
      if (!item) throw new Error(`Word ${id} not found`);
      return item;
    }
    const res = await api.get<{ data: WordDTO }>(`/admin/words/${id}`, { withCredentials: true });
    return res.data.data;
  }

  async create(dto: WordRequestDTO): Promise<WordDTO> {
    if (MOCK_MODE) {
      await delay(MOCK_DELAY_MS);
      const subtopic = mockSubtopics.find((s) => s.id === dto.subtopicId);
      const newItem: WordDTO = {
        id: Math.max(...localWords.map((w) => w.id)) + 1,
        subtopicId: dto.subtopicId,
        subtopicName: subtopic?.name ?? '',
        subject: dto.subject,
        partOfSpeech: dto.partOfSpeech,
        chineseDefinition: dto.chineseDefinition,
        englishDefinition: dto.englishDefinition,
        exampleSentences: dto.exampleSentences,
        createdAt: new Date().toISOString(),
        updatedAt: null,
        createdBy: 0,
        updatedBy: null,
      };
      localWords = [...localWords, newItem];
      return newItem;
    }
    const res = await api.post<{ data: WordDTO }>('/admin/words', dto, { withCredentials: true });
    return res.data.data;
  }

  async update(id: number, dto: WordRequestDTO): Promise<WordDTO> {
    if (MOCK_MODE) {
      await delay(MOCK_DELAY_MS);
      const subtopic = mockSubtopics.find((s) => s.id === dto.subtopicId);
      localWords = localWords.map((w) =>
        w.id === id ? { ...w, ...dto, subtopicName: subtopic?.name ?? w.subtopicName, updatedAt: new Date().toISOString() } : w
      );
      const updated = localWords.find((w) => w.id === id);
      if (!updated) throw new Error(`Word ${id} not found`);
      return updated;
    }
    const res = await api.put<{ data: WordDTO }>(`/admin/words/${id}`, dto, { withCredentials: true });
    return res.data.data;
  }

  async delete(id: number): Promise<void> {
    if (MOCK_MODE) {
      await delay(MOCK_DELAY_MS);
      localWords = localWords.filter((w) => w.id !== id);
      return;
    }
    await api.delete(`/admin/words/${id}`, { withCredentials: true });
  }
}

export const WordService: IWordService = new WordServiceImpl();
