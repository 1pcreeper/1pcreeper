import { useState, useEffect, useCallback } from 'react';
import { PageContainer, PageHeader, DeleteConfirmDialog } from '@/components/AppLayout';
import { DataTable } from '@/components/DataTable';
import { SearchableDropdown } from '@/components/SearchableDropdown';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { UserService } from '@/services/UserService';
import type { AppUserDTO, AppUserRequestDTO, AppUserUpdateDTO } from '@/dto/user.dto';
import type { PaginationBaseResponseDTO } from '@/dto/base.dto';
import { AppUserRole } from '@/dto/enums';
import { formatDate } from '@/lib/utils';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { USERNAME_REGEX, EMAIL_REGEX, PHONE_REGEX } from '@/utils/regex';

const PAGE_SIZE = 10;

const roleVariant: Record<AppUserRole, 'default' | 'destructive' | 'success'> = {
  ADMIN: 'destructive',
  USER: 'success',
};

function UserFormDialog({
  open,
  onOpenChange,
  editing,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: AppUserDTO | null;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', displayName: '', password: '', roles: [AppUserRole.USER] as AppUserRole[] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (editing) {
      setForm({ name: editing.name, email: editing.email, phone: editing.phone ?? '', displayName: editing.displayName, password: '', roles: [...editing.roles] });
    } else {
      setForm({ name: '', email: '', phone: '', displayName: '', password: '', roles: [AppUserRole.USER] });
    }
    setError('');
  }, [editing, open]);

  useEffect(() => {
    const newErrors: { [key: string]: string } = {};
    if (editing) {
      if (!editing.name) newErrors.name = 'Username is required';
      if (!editing.email) newErrors.email = 'Email is required';
      if (!editing.displayName) newErrors.displayName = 'Display Name is required';
      if (USERNAME_REGEX.test(editing.name) === false) newErrors.name = 'Username can only contain letters, numbers';
      if (EMAIL_REGEX.test(editing.email) === false) newErrors.email = 'Invalid email format';
      if (editing.phone && PHONE_REGEX.test(editing.phone) === false) newErrors.phone = 'Phone must be 8 digits';
    }
    if (!editing) {
      if (!form.name) newErrors.name = 'Username is required';
      if (!form.email) newErrors.email = 'Email is required';
      if (!form.displayName) newErrors.displayName = 'Display Name is required';
      if (!form.password) newErrors.password = 'Password is required';
      if (USERNAME_REGEX.test(form.name) === false) newErrors.name = 'Username can only contain letters, numbers';
      if (EMAIL_REGEX.test(form.email) === false) newErrors.email = 'Invalid email format';
      if (form.phone && PHONE_REGEX.test(form.phone) === false) newErrors.phone = 'Phone must be 8 digits';
    }
    setErrors(newErrors);
  }, [form, editing]);

  function toggleRole(role: AppUserRole) {
    setForm((f) => ({
      ...f,
      roles: f.roles.includes(role) ? f.roles.filter((r) => r !== role) : [...f.roles, role],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      if (editing) {
        const dto: AppUserUpdateDTO = { email: form.email, phone: form.phone || undefined, displayName: form.displayName, name: form.name, password: '', roles: form.roles };
        if (form.password) dto.password = form.password;
        await UserService.update(editing.id, dto);
        await UserService.updateRoles(editing.id, { roles: form.roles });
      } else {
        const dto: AppUserRequestDTO = { name: form.name, email: form.email, phone: form.phone || undefined, displayName: form.displayName, password: form.password, roles: form.roles };
        await UserService.create(dto);
      }
      onSaved();
      onOpenChange(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit User' : 'Create User'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{error}</p>}
          {!editing && (
            <div className="space-y-1">
              <Label>Username</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required placeholder="e.g. john_doe" />
              {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
            </div>
          )}
          <div className="space-y-1">
            <Label>Display Name</Label>
            <Input value={form.displayName} onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))} required placeholder="John Doe" />
          </div>
          <div className="space-y-1">
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
            {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
          </div>
          <div className="space-y-1">
            <Label>Phone</Label>
            <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="8-digit number (optional)" />
            {errors.phone && <p className="text-xs text-red-600">{errors.phone}</p>}
          </div>
          <div className="space-y-1">
            <Label>Password {editing && <span className="text-xs text-slate-400">(leave blank to keep current)</span>}</Label>
            <Input type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required={!editing} />
            {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
          </div>
          <div className="space-y-1">
            <Label>Roles</Label>
            <div className="flex gap-2">
              {Object.values(AppUserRole).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => toggleRole(role)}
                  className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors ${form.roles.includes(role) ? 'bg-primary text-white border-primary' : 'border-input text-slate-600 hover:bg-slate-50'}`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function UsersPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<string>('');
  const [data, setData] = useState<PaginationBaseResponseDTO<AppUserDTO> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AppUserDTO | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await UserService.findAll({
        page, size: PAGE_SIZE, q: search.trim() ? search.trim() : undefined,
        role: filterRole ? filterRole : undefined
      });
      setData({ ...res });
    } finally {
      setIsLoading(false);
    }
  }, [page, search, filterRole]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete() {
    if (deleteId == null) return;
    setIsDeleting(true);
    try {
      await UserService.delete(deleteId);
      setDeleteId(null);
      load();
    } finally {
      setIsDeleting(false);
    }
  }

  const roleItems = [
    { value: '', label: 'All Roles' },
    ...Object.values(AppUserRole).map((r) => ({ value: r, label: r })),
  ];

  const columns = [
    { key: 'id', header: 'ID', className: 'w-16' },
    { key: 'name', header: 'Username', render: (u: AppUserDTO) => <span className="font-medium">{u.name}</span> },
    { key: 'displayName', header: 'Display Name' },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone', render: (u: AppUserDTO) => u.phone ?? '-' },
    {
      key: 'roles', header: 'Roles',
      render: (u: AppUserDTO) => (
        <div className="flex gap-1 flex-wrap">
          {u.roles.map((r) => <Badge key={r} variant={roleVariant[r]}>{r}</Badge>)}
        </div>
      ),
    },
    { key: 'createdAt', header: 'Created', render: (u: AppUserDTO) => <span className="text-xs text-slate-500">{formatDate(u.createdAt)}</span> },
    {
      key: 'actions', header: '',
      render: (u: AppUserDTO) => (
        <div className="flex items-center justify-end gap-1">
          <Button size="icon" variant="ghost" onClick={() => { setEditing(u); setDialogOpen(true); }}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(u.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Users"
        description="Manage platform users and their roles"
        action={
          <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-1" /> Add User
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search by name, email..."
            className="pl-9"
          />
        </div>
        <div className="w-40">
          <SearchableDropdown
            placeholder="All Roles"
            items={roleItems}
            selected={filterRole}
            onSelect={(v) => { setFilterRole(v); setPage(0); }}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.content ?? []}
        isLoading={isLoading}
        page={page}
        totalPages={data?.totalPages ?? 1}
        totalElements={data?.totalElements ?? 0}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        keyExtractor={(u) => u.id}
      />

      <UserFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        onSaved={load}
      />

      <DeleteConfirmDialog
        open={deleteId != null}
        onOpenChange={(v) => !v && setDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete User"
        description="This will permanently delete the user and all associated data."
      />
    </PageContainer>
  );
}
