import { useState, useEffect, useCallback } from 'react';
import { PageContainer, PageHeader, DeleteConfirmDialog } from '@/components/AppLayout';
import { DataTable } from '@/components/DataTable';
import { SearchableDropdown } from '@/components/SearchableDropdown';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { WordService } from '@/services/WordService';
import { SubtopicService } from '@/services/SubtopicService';
import type { WordDTO, WordRequestDTO } from '@/dto/word.dto';
import type { SubtopicDTO } from '@/dto/subtopic.dto';
import type { PaginationBaseResponseDTO } from '@/dto/base.dto';
import { Speech } from '@/dto/enums';
import { formatDate } from '@/lib/utils';
import { Plus, Pencil, Trash2, X, Search } from 'lucide-react';
import { TopicSubtopicSelector } from '@/components/TopicSubtopicSelector';
import type { TopicDTO } from '@/dto/topic.dto';
import { TopicService } from '@/services/TopicService';

const PAGE_SIZE = 10;

function WordFormDialog({
  open,
  onOpenChange,
  editing,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: WordDTO | null;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<{
    subtopicId: string;
    subject: string;
    partOfSpeech: Speech;
    chineseDefinition: string;
    englishDefinition: string;
    exampleSentences: string[];
  }>({
    subtopicId: '',
    subject: '',
    partOfSpeech: Speech.NOUN,
    chineseDefinition: '',
    englishDefinition: '',
    exampleSentences: [''],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [subtopics, setSubtopics] = useState<SubtopicDTO[]>([]);
  const [filterTopicId, setFilterTopicId] = useState<string>('');
  const [topics, setTopics] = useState<TopicDTO[]>([]);

  useEffect(() => {
    if (editing) {
      setForm({
        subtopicId: String(editing.subtopicId),
        subject: editing.subject,
        partOfSpeech: editing.partOfSpeech,
        chineseDefinition: editing.chineseDefinition,
        englishDefinition: editing.englishDefinition,
        exampleSentences: editing.exampleSentences.length ? [...editing.exampleSentences] : [''],
      });
    } else {
      setForm({ subtopicId: subtopics[0] ? String(subtopics[0].id) : '', subject: '', partOfSpeech: Speech.NOUN, chineseDefinition: '', englishDefinition: '', exampleSentences: [''] });
    }
    setError('');
  }, [editing, open, subtopics]);

  useEffect(() => {
    TopicService.findAll({ page: 0, size: 200 }).then((r) => setTopics(r.content));
    SubtopicService.findAll({ page: 0, size: 200 }).then((r) => setSubtopics(r.content));
  }, []);

  function updateSentence(idx: number, value: string) {
    setForm((f) => { const s = [...f.exampleSentences]; s[idx] = value; return { ...f, exampleSentences: s }; });
  }
  function addSentence() { setForm((f) => ({ ...f, exampleSentences: [...f.exampleSentences, ''] })); }
  function removeSentence(idx: number) { setForm((f) => ({ ...f, exampleSentences: f.exampleSentences.filter((_, i) => i !== idx) })); }

  const handleTopicChange = (topicId: string) => {
    setFilterTopicId(topicId);
    setForm((f) => ({ ...f, subtopicId: '' }));
  };

  const handleSubtopicChange = (subtopicId: string) => {
    setForm((f) => ({ ...f, subtopicId }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const dto: WordRequestDTO = {
        subtopicId: Number(form.subtopicId),
        subject: form.subject,
        partOfSpeech: form.partOfSpeech,
        chineseDefinition: form.chineseDefinition,
        englishDefinition: form.englishDefinition,
        exampleSentences: form.exampleSentences.filter((s) => s.trim()),
      };
      if (editing) await WordService.update(editing.id, dto);
      else await WordService.create(dto);
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
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit Word' : 'Create Word'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{error}</p>}
          <div className="grid grid-cols gap-3">
            <TopicSubtopicSelector
              topics={topics}
              subtopics={subtopics}
              selectedTopicId={filterTopicId}
              selectedSubtopicId={form.subtopicId}
              onTopicChange={handleTopicChange}
              onSubtopicChange={handleSubtopicChange}
            />
          </div>
          <div className="space-y-1">
            <div className="space-y-1">
              <Label>Part of Speech</Label>
              <Select value={form.partOfSpeech} onValueChange={(v) => setForm((f) => ({ ...f, partOfSpeech: v as Speech }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className='bg-white'>
                  {Object.values(Speech).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <Label>Word (Subject)</Label>
            <Input value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} required placeholder="e.g. algorithm" />
          </div>
          <div className="space-y-1">
            <Label>Chinese Definition</Label>
            <Textarea value={form.chineseDefinition} onChange={(e) => setForm((f) => ({ ...f, chineseDefinition: e.target.value }))} required rows={2} placeholder="中文定義" />
          </div>
          <div className="space-y-1">
            <Label>English Definition</Label>
            <Textarea value={form.englishDefinition} onChange={(e) => setForm((f) => ({ ...f, englishDefinition: e.target.value }))} required rows={2} placeholder="English definition..." />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label>Example Sentences</Label>
              <Button type="button" variant="ghost" size="sm" onClick={addSentence} className="text-xs">+ Add</Button>
            </div>
            <div className="space-y-2">
              {form.exampleSentences.map((s, i) => (
                <div key={i} className="flex gap-2">
                  <Input value={s} onChange={(e) => updateSentence(i, e.target.value)} placeholder={`Sentence ${i + 1}`} />
                  {form.exampleSentences.length > 1 && (
                    <Button type="button" size="icon" variant="ghost" className="flex-shrink-0" onClick={() => removeSentence(i)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
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

export default function WordsPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [filterSubtopicId, setFilterSubtopicId] = useState<string>('');
  const [filterTopicId, setFilterTopicId] = useState<string>('');
  const [data, setData] = useState<PaginationBaseResponseDTO<WordDTO> | null>(null);
  const [subtopics, setSubtopics] = useState<SubtopicDTO[]>([]);
  const [topics, setTopics] = useState<TopicDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<WordDTO | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);


  const handleTopicChange = (topicId: string) => {
    setFilterTopicId(topicId);
    setFilterSubtopicId('');
    setPage(0);
  };

  const handleSubtopicChange = (subtopicId: string) => {
    setFilterSubtopicId(subtopicId);
    setPage(0);
  };


  useEffect(() => {
    TopicService.findAll({ page: 0, size: 200 }).then((r) => setTopics(r.content));
    SubtopicService.findAll({ page: 0, size: 200 }).then((r) => setSubtopics(r.content));
  }, []);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await WordService.findAll({ page, size: PAGE_SIZE, subtopicId: filterSubtopicId ? Number(filterSubtopicId) : undefined, q: search.trim() ? search.trim() : undefined });
      setData(res);
    } finally {
      setIsLoading(false);
    }
  }, [page, filterSubtopicId, search]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete() {
    if (deleteId == null) return;
    setIsDeleting(true);
    try {
      await WordService.delete(deleteId);
      setDeleteId(null);
      load();
    } finally {
      setIsDeleting(false);
    }
  }

  const columns = [
    { key: 'id', header: 'ID', className: 'w-12' },
    { key: 'subject', header: 'Word', render: (w: WordDTO) => <span className="font-semibold text-slate-900">{w.subject}</span> },
    { key: 'partOfSpeech', header: 'POS', render: (w: WordDTO) => <Badge variant="outline" className="text-xs">{w.partOfSpeech}</Badge> },
    { key: 'subtopicName', header: 'Subtopic', render: (w: WordDTO) => <span className="text-xs bg-slate-100 px-2 py-0.5 rounded">{w.subtopicName}</span> },
    { key: 'chineseDefinition', header: 'Chinese Def.', render: (w: WordDTO) => <span className="text-sm text-slate-600 line-clamp-1">{w.chineseDefinition}</span> },
    { key: 'englishDefinition', header: 'English Def.', render: (w: WordDTO) => <span className="text-sm text-slate-600 line-clamp-1">{w.englishDefinition}</span> },
    { key: 'exampleSentences', header: 'Examples', render: (w: WordDTO) => <span className="text-xs text-slate-400">{w.exampleSentences.length} sentence(s)</span> },
    { key: 'createdAt', header: 'Created', render: (w: WordDTO) => <span className="text-xs text-slate-500">{formatDate(w.createdAt)}</span> },
    {
      key: 'actions', header: '',
      render: (w: WordDTO) => (
        <div className="flex items-center justify-end gap-1">
          <Button size="icon" variant="ghost" onClick={() => { setEditing(w); setDialogOpen(true); }}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(w.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Words"
        description="Manage vocabulary words with definitions and examples"
        action={
          <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-1" /> Add Word
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search words..."
            className="pl-9"
          />
        </div>
        <div className="w-96">
          <TopicSubtopicSelector
            topics={topics}
            subtopics={subtopics}
            selectedTopicId={filterTopicId}
            selectedSubtopicId={filterSubtopicId}
            onTopicChange={handleTopicChange}
            onSubtopicChange={handleSubtopicChange}
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
        keyExtractor={(w) => w.id}
      />

      <WordFormDialog open={dialogOpen} onOpenChange={setDialogOpen} editing={editing} onSaved={() => load()} />
      <DeleteConfirmDialog
        open={deleteId != null}
        onOpenChange={(v) => !v && setDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Word"
        description="This will permanently delete the word."
      />
    </PageContainer>
  );
}
