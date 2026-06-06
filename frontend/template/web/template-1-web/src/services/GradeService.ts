import type { GradeDTO, GradeRequestDTO } from '@/dto/grade.dto';
import type { PaginationBaseResponseDTO, PageParams } from '@/dto/base.dto';
import { MOCK_MODE, MOCK_DELAY_MS } from '@/lib/config';
import { delay } from '@/lib/utils';
import { mockGrades } from '@/mock/grades.mock';
import api from '@/lib/axios';

let localGrades = [...mockGrades];

export interface IGradeService {
  findAll(params: PageParams): Promise<PaginationBaseResponseDTO<GradeDTO>>;
  findById(id: number): Promise<GradeDTO>;
  create(dto: GradeRequestDTO): Promise<GradeDTO>;
  update(id: number, dto: GradeRequestDTO): Promise<GradeDTO>;
  delete(id: number): Promise<void>;
}

class GradeServiceImpl implements IGradeService {
  async findAll({ page = 0, size = 10, q }: PageParams): Promise<PaginationBaseResponseDTO<GradeDTO>> {
    if (MOCK_MODE) {
      await delay(MOCK_DELAY_MS);
      let filtered = localGrades;
      if (q) {
        filtered = filtered.filter(g => g.name.toLowerCase().includes(q.toLowerCase()));
      }
      const start = page * size;
      const content = filtered.slice(start, start + size);
      return { content, pageNumber: page, pageSize: size, totalPages: Math.ceil(filtered.length / size), totalElements: filtered.length };
    }
    const res = await api.get<{ data: PaginationBaseResponseDTO<GradeDTO> }>('/admin/grades', { params: { page, size, q }, withCredentials: true });
    return res.data.data;
  }

  async findById(id: number): Promise<GradeDTO> {
    if (MOCK_MODE) {
      await delay(MOCK_DELAY_MS);
      const item = localGrades.find((g) => g.id === id);
      if (!item) throw new Error(`Grade ${id} not found`);
      return item;
    }
    const res = await api.get<{ data: GradeDTO }>(`/admin/grades/${id}`, { withCredentials: true });
    return res.data.data;
  }

  async create(dto: GradeRequestDTO): Promise<GradeDTO> {
    if (MOCK_MODE) {
      await delay(MOCK_DELAY_MS);
      const newItem: GradeDTO = { id: Math.max(...localGrades.map((g) => g.id)) + 1, name: dto.name, createdAt: new Date().toISOString(), updatedAt: null, createdBy: 0, updatedBy: null };
      localGrades = [...localGrades, newItem];
      return newItem;
    }
    const res = await api.post<{ data: GradeDTO }>('/admin/grades', dto, { withCredentials: true });
    return res.data.data;
  }

  async update(id: number, dto: GradeRequestDTO): Promise<GradeDTO> {
    if (MOCK_MODE) {
      await delay(MOCK_DELAY_MS);
      localGrades = localGrades.map((g) => g.id === id ? { ...g, ...dto, updatedAt: new Date().toISOString() } : g);
      const updated = localGrades.find((g) => g.id === id);
      if (!updated) throw new Error(`Grade ${id} not found`);
      return updated;
    }
    const res = await api.put<{ data: GradeDTO }>(`/admin/grades/${id}`, dto, { withCredentials: true });
    return res.data.data;
  }

  async delete(id: number): Promise<void> {
    if (MOCK_MODE) {
      await delay(MOCK_DELAY_MS);
      localGrades = localGrades.filter((g) => g.id !== id);
      return;
    }
    await api.delete(`/admin/grades/${id}`, { withCredentials: true });
  }
}

export const GradeService: IGradeService = new GradeServiceImpl();
