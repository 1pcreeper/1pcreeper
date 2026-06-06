import { useState, useEffect, useCallback } from 'react';
import { PageContainer, PageHeader, DeleteConfirmDialog } from '@/components/AppLayout';
import { DataTable } from '@/components/DataTable';
import { SearchableDropdown } from '@/components/SearchableDropdown';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { TopicService } from '@/services/TopicService';
import { GradeService } from '@/services/GradeService';
import type { TopicDTO, TopicRequestDTO } from '@/dto/topic.dto';
import type { GradeDTO } from '@/dto/grade.dto';
import type { PaginationBaseResponseDTO } from '@/dto/base.dto';
import { formatDate } from '@/lib/utils';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';

const PAGE_SIZE = 10;

function TopicFormDialog({
  open,
  onOpenChange,
  editing,
  grades,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: TopicDTO | null;
  grades: GradeDTO[];
  onSaved: () => void;
}) {
  const [form, setForm] = useState({ gradeId: '', name: '', shortDesc: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editing) {
      setForm({ gradeId: String(editing.gradeId), name: editing.name, shortDesc: editing.shortDesc ?? '' });
    } else {
      setForm({ gradeId: grades[0] ? String(grades[0].id) : '', name: '', shortDesc: '' });
    }
    setError('');
  }, [editing, open, grades]);

  const gradeItems = grades.map((g) => ({ value: String(g.id), label: g.name }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.gradeId) { setError('Please select a grade'); return; }
    setIsLoading(true);
    setError('');
    try {
      const dto: TopicRequestDTO = { gradeId: Number(form.gradeId), name: form.name, shortDesc: form.shortDesc || undefined };
      if (editing) await TopicService.update(editing.id, dto);
      else await TopicService.create(dto);
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
          <DialogTitle>{editing ? 'Edit Topic' : 'Create Topic'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{error}</p>}
          <SearchableDropdown
            label="Grade"
            placeholder="Select grade..."
            items={gradeItems}
            selected={form.gradeId}
            onSelect={(v) => setForm((f) => ({ ...f, gradeId: v }))}
            clearable={false}
          />
          <div className="space-y-1">
            <Label>Topic Name</Label>
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required placeholder="e.g. Daily Life" />
          </div>
          <div className="space-y-1">
            <Label>Short Description</Label>
            <Textarea value={form.shortDesc} onChange={(e) => setForm((f) => ({ ...f, shortDesc: e.target.value }))} placeholder="Optional description" rows={3} />
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

export default function TopicsPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [filterGradeId, setFilterGradeId] = useState<string>('');
  const [data, setData] = useState<PaginationBaseResponseDTO<TopicDTO> | null>(null);
  const [grades, setGrades] = useState<GradeDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TopicDTO | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    GradeService.findAll({ page: 0, size: 100 }).then((r) => setGrades(r.content));
  }, []);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await TopicService.findAll({
        page, size: PAGE_SIZE, gradeId: filterGradeId ? Number(filterGradeId) : undefined, q: search.trim() ? search.trim() : undefined
      });
      setData(res);
    } finally {
      setIsLoading(false);
    }
  }, [page, filterGradeId, search]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete() {
    if (deleteId == null) return;
    setIsDeleting(true);
    try {
      await TopicService.delete(deleteId);
      setDeleteId(null);
      load();
    } finally {
      setIsDeleting(false);
    }
  }

  const gradeItems = [{ value: '', label: 'All Grades' }, ...grades.map((g) => ({ value: String(g.id), label: g.name }))];

  const columns = [
    { key: 'id', header: 'ID', className: 'w-16' },
    { key: 'gradeName', header: 'Grade', render: (t: TopicDTO) => <span className="text-xs bg-slate-100 px-2 py-0.5 rounded">{t.gradeName}</span> },
    { key: 'name', header: 'Name', render: (t: TopicDTO) => <span className="font-medium">{t.name}</span> },
    { key: 'shortDesc', header: 'Description', render: (t: TopicDTO) => <span className="text-sm text-slate-500 line-clamp-1">{t.shortDesc ?? '-'}</span> },
    { key: 'createdAt', header: 'Created', render: (t: TopicDTO) => <span className="text-xs text-slate-500">{formatDate(t.createdAt)}</span> },
    {
      key: 'actions', header: '',
      render: (t: TopicDTO) => (
        <div className="flex items-center justify-end gap-1">
          <Button size="icon" variant="ghost" onClick={() => { setEditing(t); setDialogOpen(true); }}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(t.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Topics"
        description="Manage topics grouped by grade"
        action={
          <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-1" /> Add Topic
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search topics..."
            className="pl-9"
          />
        </div>
        <div className="w-52">
          <SearchableDropdown
            placeholder="All Grades"
            items={gradeItems}
            selected={filterGradeId}
            onSelect={(v) => { setFilterGradeId(v); setPage(0); }}
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
        keyExtractor={(t) => t.id}
      />

      <TopicFormDialog open={dialogOpen} onOpenChange={setDialogOpen} editing={editing} grades={grades} onSaved={load} />
      <DeleteConfirmDialog
        open={deleteId != null}
        onOpenChange={(v) => !v && setDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Topic"
        description="Deleting this topic will also remove all associated subtopics, words, and questions."
      />
    </PageContainer>
  );
}
