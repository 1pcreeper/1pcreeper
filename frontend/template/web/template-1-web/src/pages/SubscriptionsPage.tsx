import { useState, useEffect, useCallback } from 'react';
import { PageContainer, PageHeader, DeleteConfirmDialog } from '@/components/AppLayout';
import { DataTable } from '@/components/DataTable';
import { SearchableDropdown } from '@/components/SearchableDropdown';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { SubscriptionService } from '@/services/SubscriptionService';
import { UserService } from '@/services/UserService';
import { SubtopicService } from '@/services/SubtopicService';
import type { SubtopicSubscriptionDTO, SubtopicSubscriptionRequestDTO } from '@/dto/subscription.dto';
import type { AppUserDTO } from '@/dto/user.dto';
import type { SubtopicDTO } from '@/dto/subtopic.dto';
import type { PaginationBaseResponseDTO } from '@/dto/base.dto';
import { formatDate } from '@/lib/utils';
import { Plus, Trash2, Search } from 'lucide-react';

const PAGE_SIZE = 10;

function SubscriptionFormDialog({
  open,
  onOpenChange,
  users,
  subtopics,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  users: AppUserDTO[];
  subtopics: SubtopicDTO[];
  onSaved: () => void;
}) {
  const [form, setForm] = useState({ userId: '', subtopicId: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm({ userId: users[0] ? String(users[0].id) : '', subtopicId: subtopics[0] ? String(subtopics[0].id) : '' });
    setError('');
  }, [open, users, subtopics]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const dto: SubtopicSubscriptionRequestDTO = { userId: Number(form.userId), subtopicId: Number(form.subtopicId) };
      await SubscriptionService.create(dto);
      onSaved();
      onOpenChange(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsLoading(false);
    }
  }

  const userItems = users.map((u) => ({ value: String(u.id), label: u.displayName, meta: u.name }));
  const subtopicItems = subtopics.map((s) => ({ value: String(s.id), label: s.name, meta: s.difficulty }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add Subscription</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{error}</p>}
          <SearchableDropdown
            label="User"
            placeholder="Select user"
            items={userItems}
            selected={form.userId}
            onSelect={(v) => setForm((f) => ({ ...f, userId: v }))}
            clearable={false}
          />
          <SearchableDropdown
            label="Subtopic"
            placeholder="Select subtopic"
            items={subtopicItems}
            selected={form.subtopicId}
            onSelect={(v) => setForm((f) => ({ ...f, subtopicId: v }))}
            clearable={false}
          />
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function SubscriptionsPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [filterUserId, setFilterUserId] = useState<string>('');
  const [data, setData] = useState<PaginationBaseResponseDTO<SubtopicSubscriptionDTO> | null>(null);
  const [users, setUsers] = useState<AppUserDTO[]>([]);
  const [subtopics, setSubtopics] = useState<SubtopicDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    UserService.findAll({ page: 0, size: 100 }).then((r) => setUsers(r.content));
    SubtopicService.findAll({ page: 0, size: 100 }).then((r) => setSubtopics(r.content));
  }, []);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await SubscriptionService.findAll({ page, size: PAGE_SIZE, userId: filterUserId ? Number(filterUserId) : undefined, q: search.trim() ? search.trim() : undefined });
      setData(res);
    } finally {
      setIsLoading(false);
    }
  }, [page, filterUserId, search]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete() {
    if (deleteId == null) return;
    setIsDeleting(true);
    try {
      await SubscriptionService.delete(deleteId);
      setDeleteId(null);
      load();
    } finally {
      setIsDeleting(false);
    }
  }

  const userItems = [
    { value: '', label: 'All Users' },
    ...users.map((u) => ({ value: String(u.id), label: u.displayName, meta: u.name })),
  ];

  const columns = [
    { key: 'id', header: 'ID', className: 'w-16' },
    { key: 'userName', header: 'User', render: (s: SubtopicSubscriptionDTO) => <span className="font-medium">{s.userName}</span> },
    { key: 'subtopicName', header: 'Subtopic', render: (s: SubtopicSubscriptionDTO) => <span className="text-sm">{s.subtopicName}</span> },
    { key: 'createdAt', header: 'Subscribed On', render: (s: SubtopicSubscriptionDTO) => <span className="text-xs text-slate-500">{formatDate(s.createdAt)}</span> },
    {
      key: 'actions', header: '',
      render: (s: SubtopicSubscriptionDTO) => (
        <div className="flex justify-end">
          <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(s.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Subscriptions"
        description="Manage which users are subscribed to which subtopics"
        action={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add Subscription
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search by user or subtopic..."
            className="pl-9"
          />
        </div>
        <div className="w-52">
          <SearchableDropdown
            placeholder="All Users"
            items={userItems}
            selected={filterUserId}
            onSelect={(v) => { setFilterUserId(v); setPage(0); }}
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
        keyExtractor={(s) => s.id}
      />

      <SubscriptionFormDialog open={dialogOpen} onOpenChange={setDialogOpen} users={users} subtopics={subtopics} onSaved={load} />
      <DeleteConfirmDialog
        open={deleteId != null}
        onOpenChange={(v) => !v && setDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Remove Subscription"
        description="This will unsubscribe the user from the subtopic."
      />
    </PageContainer>
  );
}
