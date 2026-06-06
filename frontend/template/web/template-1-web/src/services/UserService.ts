import type { AppUserDTO, AppUserRequestDTO, AppUserUpdateDTO, UpdateRolesRequestDTO } from '@/dto/user.dto';
import type { PaginationBaseResponseDTO, PageParams } from '@/dto/base.dto';
import { MOCK_MODE, MOCK_DELAY_MS } from '@/lib/config';
import { delay } from '@/lib/utils';
import { mockUsers } from '@/mock/users.mock';
import api from '@/lib/axios';
import { AppUserRole } from '@/dto/enums';

let localUsers = [...mockUsers];

export interface IUserService {
  findAll(params: PageParams & { role?: string }): Promise<PaginationBaseResponseDTO<AppUserDTO>>;
  findById(id: number): Promise<AppUserDTO>;
  create(dto: AppUserRequestDTO): Promise<AppUserDTO>;
  update(id: number, dto: AppUserUpdateDTO): Promise<AppUserDTO>;
  updateRoles(id: number, dto: UpdateRolesRequestDTO): Promise<AppUserDTO>;
  delete(id: number): Promise<void>;
}

class UserServiceImpl implements IUserService {
  async findAll({ page = 0, size = 10, q, role }: PageParams & { role?: string }): Promise<PaginationBaseResponseDTO<AppUserDTO>> {
    if (MOCK_MODE) {
      await delay(MOCK_DELAY_MS);
      let filtered = localUsers;
      if (role) {
        filtered = filtered.filter(u => u.roles.includes(role as AppUserRole));
      }
      if (q) {
        filtered = filtered.filter(u => u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase()));
      }
      const start = page * size;
      const content = filtered.slice(start, start + size);
      return {
        content,
        pageNumber: page,
        pageSize: size,
        totalPages: Math.ceil(filtered.length / size),
        totalElements: filtered.length,
      };
    }
    const res = await api.get<{ data: PaginationBaseResponseDTO<AppUserDTO> }>('/admin/users', {
      params: { page, size, q, role },
      withCredentials: true,
    });
    return res.data.data;
  }

  async findById(id: number): Promise<AppUserDTO> {
    if (MOCK_MODE) {
      await delay(MOCK_DELAY_MS);
      const user = localUsers.find((u) => u.id === id);
      if (!user) throw new Error(`User ${id} not found`);
      return user;
    }
    const res = await api.get<{ data: AppUserDTO }>(`/admin/users/${id}`, { withCredentials: true });
    return res.data.data;
  }

  async create(dto: AppUserRequestDTO): Promise<AppUserDTO> {
    if (MOCK_MODE) {
      await delay(MOCK_DELAY_MS);
      const newUser: AppUserDTO = {
        id: Math.max(...localUsers.map((u) => u.id)) + 1,
        name: dto.name,
        email: dto.email,
        phone: dto.phone ?? null,
        displayName: dto.displayName,
        roles: dto.roles,
        createdAt: new Date().toISOString(),
        updatedAt: null,
      };
      localUsers = [...localUsers, newUser];
      return newUser;
    }
    const res = await api.post<{ data: AppUserDTO }>('/admin/users', dto, { withCredentials: true });
    return res.data.data;
  }

  async update(id: number, dto: AppUserUpdateDTO): Promise<AppUserDTO> {
    if (MOCK_MODE) {
      await delay(MOCK_DELAY_MS);
      localUsers = localUsers.map((u) =>
        u.id === id ? { ...u, ...dto, updatedAt: new Date().toISOString() } : u
      );
      const updated = localUsers.find((u) => u.id === id);
      if (!updated) throw new Error(`User ${id} not found`);
      return updated;
    }
    const res = await api.put<{ data: AppUserDTO }>(`/admin/users/${id}`, dto, { withCredentials: true });
    return res.data.data;
  }

  async updateRoles(id: number, dto: UpdateRolesRequestDTO): Promise<AppUserDTO> {
    if (MOCK_MODE) {
      await delay(MOCK_DELAY_MS);
      localUsers = localUsers.map((u) =>
        u.id === id ? { ...u, roles: dto.roles, updatedAt: new Date().toISOString() } : u
      );
      const updated = localUsers.find((u) => u.id === id);
      if (!updated) throw new Error(`User ${id} not found`);
      return updated;
    }
    const res = await api.put<{ data: AppUserDTO }>(`/admin/users/${id}/roles`, dto, { withCredentials: true });
    return res.data.data;
  }

  async delete(id: number): Promise<void> {
    if (MOCK_MODE) {
      await delay(MOCK_DELAY_MS);
      localUsers = localUsers.filter((u) => u.id !== id);
      return;
    }
    await api.delete(`/admin/users/${id}`, { withCredentials: true });
  }
}

export const UserService: IUserService = new UserServiceImpl();
