import { useState, useEffect, useCallback } from 'react';
import { PageContainer, PageHeader, DeleteConfirmDialog } from '@/components/AppLayout';
import { DataTable } from '@/components/DataTable';
import { SearchableDropdown } from '@/components/SearchableDropdown';
import { TopicSubtopicSelector } from '@/components/TopicSubtopicSelector';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { SubtopicService } from '@/services/SubtopicService';
import { TopicService } from '@/services/TopicService';
import type { SubtopicDTO, SubtopicRequestDTO } from '@/dto/subtopic.dto';
import type { TopicDTO } from '@/dto/topic.dto';
import type { PaginationBaseResponseDTO } from '@/dto/base.dto';
import { ExerciseDifficulty } from '@/dto/enums';
import { formatDate } from '@/lib/utils';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';

const PAGE_SIZE = 10;

const difficultyVariant: Record<ExerciseDifficulty, 'success' | 'info' | 'warning' | 'destructive'> = {
  EASY: 'success',
  MEDIUM: 'info',
  HARD: 'warning',
  ADVANCED: 'destructive',
};

function SubtopicFormDialog({
  open,
  onOpenChange,
  editing,
  topics,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: SubtopicDTO | null;
  topics: TopicDTO[];
  onSaved: () => void;
}) {
  const [form, setForm] = useState<{ topicId: string; name: string; difficulty: ExerciseDifficulty }>({ topicId: '', name: '', difficulty: ExerciseDifficulty.EASY });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editing) {
      setForm({ topicId: String(editing.topicId), name: editing.name, difficulty: editing.difficulty });
    } else {
      setForm({ topicId: '', name: '', difficulty: ExerciseDifficulty.EASY });
    }
    setError('');
  }, [editing, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.topicId) { setError('Please select a topic'); return; }
    setIsLoading(true);
    setError('');
    try {
      const dto: SubtopicRequestDTO = { topicId: Number(form.topicId), name: form.name, difficulty: form.difficulty };
      if (editing) await SubtopicService.update(editing.id, dto);
      else await SubtopicService.create(dto);
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
          <DialogTitle>{editing ? 'Edit Subtopic' : 'Create Subtopic'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{error}</p>}
          <TopicSubtopicSelector
            topics={topics}
            subtopics={[]}
            selectedTopicId={form.topicId}
            selectedSubtopicId=""
            onTopicChange={(v) => setForm((f) => ({ ...f, topicId: v }))}
            onSubtopicChange={() => { }}
            showTopicOnly
            topicLabel="Topic"
            layout="vertical"
          />
          <div className="space-y-1">
            <Label>Subtopic Name</Label>
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required placeholder="e.g. Morning Routines" />
          </div>
          <div className="space-y-1">
            <Label>Difficulty</Label>
            <Select value={form.difficulty} onValueChange={(v) => setForm((f) => ({ ...f, difficulty: v as ExerciseDifficulty }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className='bg-white'>
                {Object.values(ExerciseDifficulty).map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
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

export default function SubtopicsPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [filterTopicId, setFilterTopicId] = useState<string>('');
  const [data, setData] = useState<PaginationBaseResponseDTO<SubtopicDTO> | null>(null);
  const [topics, setTopics] = useState<TopicDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SubtopicDTO | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    TopicService.findAll({ page: 0, size: 100 }).then((r) => setTopics(r.content));
  }, []);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await SubtopicService.findAll(
        { page, size: PAGE_SIZE, topicId: filterTopicId ? Number(filterTopicId) : undefined, q: search.trim() ? search.trim() : undefined }
      );
      setData(res);
    } finally {
      setIsLoading(false);
    }
  }, [page, filterTopicId, search]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete() {
    if (deleteId == null) return;
    setIsDeleting(true);
    try {
      await SubtopicService.delete(deleteId);
      setDeleteId(null);
      load();
    } finally {
      setIsDeleting(false);
    }
  }

  const topicItems = [{ value: '', label: 'All Topics' }, ...topics.map((t) => ({ value: String(t.id), label: t.name }))];

  const columns = [
    { key: 'id', header: 'ID', className: 'w-16' },
    { key: 'topicName', header: 'Topic', render: (s: SubtopicDTO) => <span className="text-xs bg-slate-100 px-2 py-0.5 rounded">{s.topicName}</span> },
    { key: 'name', header: 'Name', render: (s: SubtopicDTO) => <span className="font-medium">{s.name}</span> },
    { key: 'difficulty', header: 'Difficulty', render: (s: SubtopicDTO) => <Badge variant={difficultyVariant[s.difficulty]}>{s.difficulty}</Badge> },
    { key: 'createdAt', header: 'Created', render: (s: SubtopicDTO) => <span className="text-xs text-slate-500">{formatDate(s.createdAt)}</span> },
    {
      key: 'actions', header: '',
      render: (s: SubtopicDTO) => (
        <div className="flex items-center justify-end gap-1">
          <Button size="icon" variant="ghost" onClick={() => { setEditing(s); setDialogOpen(true); }}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
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
        title="Subtopics"
        description="Manage subtopics with difficulty levels"
        action={
          <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-1" /> Add Subtopic
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search subtopics..."
            className="pl-9"
          />
        </div>
        <div className="w-52">
          <SearchableDropdown
            placeholder="All Topics"
            items={topicItems}
            selected={filterTopicId}
            onSelect={(v) => { setFilterTopicId(v); setPage(0); }}
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

      <SubtopicFormDialog open={dialogOpen} onOpenChange={setDialogOpen} editing={editing} topics={topics} onSaved={load} />
      <DeleteConfirmDialog
        open={deleteId != null}
        onOpenChange={(v) => !v && setDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Subtopic"
        description="Deleting this subtopic will also remove all associated words and questions."
      />
    </PageContainer>
  );
}
