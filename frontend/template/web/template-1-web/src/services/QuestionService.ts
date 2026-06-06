import type { QuestionDTO, QuestionRequestDTO } from '@/dto/question.dto';
import type { PaginationBaseResponseDTO, PageParams } from '@/dto/base.dto';
import { MOCK_MODE, MOCK_DELAY_MS } from '@/lib/config';
import { delay } from '@/lib/utils';
import { mockQuestions } from '@/mock/questions.mock';
import { mockSubtopics } from '@/mock/subtopics.mock';
import api from '@/lib/axios';

let localQuestions = [...mockQuestions];

export interface IQuestionService {
  findAll(params: PageParams & { subtopicId?: number; questionType?: string }): Promise<PaginationBaseResponseDTO<QuestionDTO>>;
  findById(id: number): Promise<QuestionDTO>;
  findBySubtopic(subtopicId: number, params: PageParams): Promise<PaginationBaseResponseDTO<QuestionDTO>>;
  create(dto: QuestionRequestDTO): Promise<QuestionDTO>;
  update(id: number, dto: QuestionRequestDTO): Promise<QuestionDTO>;
  delete(id: number): Promise<void>;
}

class QuestionServiceImpl implements IQuestionService {
  async findAll({ page = 0, size = 10, subtopicId, questionType, q }: PageParams & { subtopicId?: number; questionType?: string }): Promise<PaginationBaseResponseDTO<QuestionDTO>> {
    if (MOCK_MODE) {
      await delay(MOCK_DELAY_MS);
      let filtered = subtopicId ? localQuestions.filter((q) => q.subtopicId === subtopicId) : localQuestions;
      if (questionType) {
        filtered = filtered.filter(item => item.questionType === questionType);
      }
      if (q) {
        filtered = filtered.filter(item => item.subject.toLowerCase().includes(q.toLowerCase()));
      }
      const start = page * size;
      const content = filtered.slice(start, start + size);
      return { content, pageNumber: page, pageSize: size, totalPages: Math.ceil(filtered.length / size), totalElements: filtered.length };
    }
    const res = await api.get<{ data: PaginationBaseResponseDTO<QuestionDTO> }>('/admin/questions', { params: { page, size, subtopicId, questionType, q }, withCredentials: true });
    return res.data.data;
  }

  async findBySubtopic(subtopicId: number, { page = 0, size = 10, q }: PageParams): Promise<PaginationBaseResponseDTO<QuestionDTO>> {
    return this.findAll({ page, size, subtopicId, q });
  }

  async findById(id: number): Promise<QuestionDTO> {
    if (MOCK_MODE) {
      await delay(MOCK_DELAY_MS);
      const item = localQuestions.find((q) => q.id === id);
      if (!item) throw new Error(`Question ${id} not found`);
      return item;
    }
    const res = await api.get<{ data: QuestionDTO }>(`/admin/questions/${id}`, { withCredentials: true });
    return res.data.data;
  }

  async create(dto: QuestionRequestDTO): Promise<QuestionDTO> {
    if (MOCK_MODE) {
      await delay(MOCK_DELAY_MS);
      const subtopic = mockSubtopics.find((s) => s.id === dto.subtopicId);
      const newItem: QuestionDTO = {
        id: Math.max(...localQuestions.map((q) => q.id)) + 1,
        questionType: dto.questionType,
        subtopicId: dto.subtopicId,
        subtopicName: subtopic?.name ?? '',
        subject: dto.subject,
        answerWordId: dto.answerWordId ?? null,
        answerData: dto.answerData ?? null,
        createdAt: new Date().toISOString(),
        updatedAt: null,
        createdBy: 0,
        updatedBy: null,
      };
      localQuestions = [...localQuestions, newItem];
      return newItem;
    }
    const res = await api.post<{ data: QuestionDTO }>('/admin/questions', dto, { withCredentials: true });
    return res.data.data;
  }

  async update(id: number, dto: QuestionRequestDTO): Promise<QuestionDTO> {
    if (MOCK_MODE) {
      await delay(MOCK_DELAY_MS);
      const subtopic = mockSubtopics.find((s) => s.id === dto.subtopicId);
      localQuestions = localQuestions.map((q) =>
        q.id === id
          ? { ...q, ...dto, subtopicName: subtopic?.name ?? q.subtopicName, answerWordId: dto.answerWordId ?? null, answerData: dto.answerData ?? null, updatedAt: new Date().toISOString() }
          : q
      );
      const updated = localQuestions.find((q) => q.id === id);
      if (!updated) throw new Error(`Question ${id} not found`);
      return updated;
    }
    const res = await api.put<{ data: QuestionDTO }>(`/admin/questions/${id}`, dto, { withCredentials: true });
    return res.data.data;
  }

  async delete(id: number): Promise<void> {
    if (MOCK_MODE) {
      await delay(MOCK_DELAY_MS);
      localQuestions = localQuestions.filter((q) => q.id !== id);
      return;
    }
    await api.delete(`/admin/questions/${id}`, { withCredentials: true });
  }
}

export const QuestionService: IQuestionService = new QuestionServiceImpl();
