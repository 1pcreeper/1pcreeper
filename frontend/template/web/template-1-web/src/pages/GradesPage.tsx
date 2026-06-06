import { useState, useEffect, useCallback } from 'react';
import { PageContainer, PageHeader, DeleteConfirmDialog } from '@/components/AppLayout';
import { DataTable } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { GradeService } from '@/services/GradeService';
import type { GradeDTO, GradeRequestDTO } from '@/dto/grade.dto';
import type { PaginationBaseResponseDTO } from '@/dto/base.dto';
import { formatDate } from '@/lib/utils';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';

const PAGE_SIZE = 10;

function GradeFormDialog({
  open,
  onOpenChange,
  editing,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: GradeDTO | null;
  onSaved: () => void;
}) {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setName(editing?.name ?? '');
    setError('');
  }, [editing, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const dto: GradeRequestDTO = { name };
      if (editing) await GradeService.update(editing.id, dto);
      else await GradeService.create(dto);
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
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit Grade' : 'Create Grade'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{error}</p>}
          <div className="space-y-1">
            <Label>Grade Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. DSE Level 1" />
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

export default function GradesPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [data, setData] = useState<PaginationBaseResponseDTO<GradeDTO> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<GradeDTO | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await GradeService.findAll({ page, size: PAGE_SIZE, q: search.trim() ? search.trim() : undefined });
      setData(res);
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete() {
    if (deleteId == null) return;
    setIsDeleting(true);
    try {
      await GradeService.delete(deleteId);
      setDeleteId(null);
      load();
    } finally {
      setIsDeleting(false);
    }
  }

  const columns = [
    { key: 'id', header: 'ID', className: 'w-16' },
    { key: 'name', header: 'Name', render: (g: GradeDTO) => <span className="font-medium">{g.name}</span> },
    { key: 'createdAt', header: 'Created', render: (g: GradeDTO) => <span className="text-xs text-slate-500">{formatDate(g.createdAt)}</span> },
    { key: 'updatedAt', header: 'Updated', render: (g: GradeDTO) => <span className="text-xs text-slate-500">{formatDate(g.updatedAt)}</span> },
    {
      key: 'actions', header: '',
      render: (g: GradeDTO) => (
        <div className="flex items-center justify-end gap-1">
          <Button size="icon" variant="ghost" onClick={() => { setEditing(g); setDialogOpen(true); }}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(g.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Grades"
        description="Manage grade levels for DSE topics"
        action={
          <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-1" /> Add Grade
          </Button>
        }
      />

      <div className="mb-4 flex items-center gap-3">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search grades..."
            className="pl-9"
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
        keyExtractor={(g) => g.id}
      />

      <GradeFormDialog open={dialogOpen} onOpenChange={setDialogOpen} editing={editing} onSaved={load} />
      <DeleteConfirmDialog
        open={deleteId != null}
        onOpenChange={(v) => !v && setDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Grade"
        description="Deleting this grade will also remove all associated topics, subtopics, words, and questions."
      />
    </PageContainer>
  );
}
