import { useState, useEffect, useCallback } from 'react';
import { PageContainer, PageHeader, DeleteConfirmDialog } from '@/components/AppLayout';
import { DataTable } from '@/components/DataTable';
import { AnswerDataForm } from '@/components/AnswerDataForm';
import { TopicSubtopicSelector } from '@/components/TopicSubtopicSelector';
import { SearchableDropdown } from '@/components/SearchableDropdown';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { QuestionService } from '@/services/QuestionService';
import { SubtopicService } from '@/services/SubtopicService';
import { TopicService } from '@/services/TopicService';
import { WordService } from '@/services/WordService';
import type { QuestionDTO, QuestionRequestDTO } from '@/dto/question.dto';
import type { SubtopicDTO } from '@/dto/subtopic.dto';
import type { TopicDTO } from '@/dto/topic.dto';
import type { WordDTO } from '@/dto/word.dto';
import type { PaginationBaseResponseDTO } from '@/dto/base.dto';
import { ExerciseQuestionType, QUESTION_TYPES_WITH_ANSWER_DATA } from '@/dto/enums';
import { formatDate } from '@/lib/utils';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';

const PAGE_SIZE = 10;

const questionTypeBadge: Record<ExerciseQuestionType, 'default' | 'secondary' | 'info' | 'success' | 'warning' | 'destructive'> = {
  ENGLISH_DEFINITION_MATCH: 'info',
  MULTIPLE_CHOICE_C2E: 'secondary',
  HANG_MAN: 'warning',
  FILL_IN_BLANK: 'success',
  CHINESE_DICTATION: 'destructive',
  ENGLISH_DICTATION: 'default',
  DRAW_LINE_MATCH: 'info',
  REARRANGE_SENTENCE: 'secondary',
};

const questionTypeLabel: Record<ExerciseQuestionType, string> = {
  ENGLISH_DEFINITION_MATCH: 'Def Match',
  MULTIPLE_CHOICE_C2E: 'C2E Choice',
  HANG_MAN: 'Hangman',
  FILL_IN_BLANK: 'Fill Blank',
  CHINESE_DICTATION: 'CN Dict.',
  ENGLISH_DICTATION: 'EN Dict.',
  DRAW_LINE_MATCH: 'Draw Match',
  REARRANGE_SENTENCE: 'Rearrange',
};

function QuestionFormDialog({
  open,
  onOpenChange,
  editing,
  topics,
  subtopics,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: QuestionDTO | null;
  topics: TopicDTO[];
  subtopics: SubtopicDTO[];
  onSaved: () => void;
}) {
  const [form, setForm] = useState<{
    questionType: ExerciseQuestionType;
    topicId: string;
    subtopicId: string;
    subject: string;
    answerWordId: string;
    answerData: Record<string, unknown> | null;
  }>({
    questionType: ExerciseQuestionType.ENGLISH_DEFINITION_MATCH,
    topicId: '',
    subtopicId: '',
    subject: '',
    answerWordId: '',
    answerData: null,
  });
  const [words, setWords] = useState<WordDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const usesAnswerData = QUESTION_TYPES_WITH_ANSWER_DATA.includes(form.questionType);

  useEffect(() => {
    if (editing) {
      const subtopic = subtopics.find((s) => s.id === editing.subtopicId);
      setForm({
        questionType: editing.questionType,
        topicId: subtopic ? String(subtopic.topicId) : '',
        subtopicId: String(editing.subtopicId),
        subject: editing.subject,
        answerWordId: editing.answerWordId ? String(editing.answerWordId) : '',
        answerData: editing.answerData ?? null,
      });
    } else {
      setForm({
        questionType: ExerciseQuestionType.ENGLISH_DEFINITION_MATCH,
        topicId: '',
        subtopicId: '',
        subject: '',
        answerWordId: '',
        answerData: null,
      });
    }
    setError('');
  }, [editing, open, subtopics]);

  useEffect(() => {
    if (form.subtopicId) {
      WordService.findAll({ page: 0, size: 100, subtopicId: Number(form.subtopicId) }).then((r) => setWords(r.content));
    } else {
      setWords([]);
    }
  }, [form.subtopicId]);

  const handleTopicChange = (topicId: string) => {
    setForm((f) => ({ ...f, topicId, subtopicId: '', answerWordId: '' }));
  };

  const handleSubtopicChange = (subtopicId: string) => {
    setForm((f) => ({ ...f, subtopicId, answerWordId: '' }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.subtopicId) { setError('Please select a subtopic'); return; }
    setIsLoading(true);
    setError('');
    try {
      const dto: QuestionRequestDTO = {
        questionType: form.questionType,
        subtopicId: Number(form.subtopicId),
        subject: form.subject,
      };
      if (usesAnswerData) {
        if (form.answerData) dto.answerData = form.answerData;
      } else {
        if (form.answerWordId) dto.answerWordId = Number(form.answerWordId);
      }
      if (editing) await QuestionService.update(editing.id, dto);
      else await QuestionService.create(dto);
      onSaved();
      onOpenChange(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsLoading(false);
    }
  }

  const wordItems = words.map((w) => ({ value: String(w.id), label: w.subject, meta: w.partOfSpeech }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit Question' : 'Create Question'}</DialogTitle>
          <DialogDescription>
            Select a topic then a subtopic. Standard types link to an answer word; Fill-in-blank and Hangman use structured answer data.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{error}</p>}

          <TopicSubtopicSelector
            topics={topics}
            subtopics={subtopics}
            selectedTopicId={form.topicId}
            selectedSubtopicId={form.subtopicId}
            onTopicChange={handleTopicChange}
            onSubtopicChange={handleSubtopicChange}
          />

          <div className="space-y-1">
            <Label>Question Type</Label>
            <Select
              value={form.questionType}
              onValueChange={(v) => setForm((f) => ({ ...f, questionType: v as ExerciseQuestionType, answerWordId: '', answerData: null }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className='bg-white'>
                {Object.values(ExerciseQuestionType).map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Subject / Question Text</Label>
            <Textarea
              value={form.subject}
              onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              required
              rows={2}
              placeholder="Enter the question text or word subject..."
            />
          </div>

          {usesAnswerData ? (
            <AnswerDataForm
              questionType={form.questionType as 'DRAW_LINE_MATCH' | 'REARRANGE_SENTENCE'}
              value={form.answerData}
              onChange={(data) => setForm((f) => ({ ...f, answerData: data }))}
            />
          ) : (
            <div className="space-y-1">
              <SearchableDropdown
                label="Answer Word"
                placeholder={form.subtopicId ? (words.length === 0 ? 'No words in this subtopic' : 'Select answer word') : 'Select a subtopic first'}
                items={wordItems}
                selected={form.answerWordId}
                onSelect={(v) => setForm((f) => ({ ...f, answerWordId: v }))}
                disabled={!form.subtopicId || words.length === 0}
              />
              <p className="text-xs text-slate-400">Standard answer: links to a vocabulary word.</p>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function QuestionsPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [filterTopicId, setFilterTopicId] = useState<string>('');
  const [filterSubtopicId, setFilterSubtopicId] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [data, setData] = useState<PaginationBaseResponseDTO<QuestionDTO> | null>(null);
  const [topics, setTopics] = useState<TopicDTO[]>([]);
  const [subtopics, setSubtopics] = useState<SubtopicDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<QuestionDTO | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    TopicService.findAll({ page: 0, size: 200 }).then((r) => setTopics(r.content));
    SubtopicService.findAll({ page: 0, size: 200 }).then((r) => setSubtopics(r.content));
  }, []);

  const filteredSubtopicsForFilter = filterTopicId
    ? subtopics.filter((s) => String(s.topicId) === filterTopicId)
    : subtopics;

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await QuestionService.findAll({
        page,
        size: PAGE_SIZE,
        subtopicId: filterSubtopicId ? Number(filterSubtopicId) : undefined,
        questionType: filterType || undefined,
        q: search.trim() ? search.trim() : undefined
      });
      setData(res);
    } finally {
      setIsLoading(false);
    }
  }, [page, filterSubtopicId, filterType, search]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete() {
    if (deleteId == null) return;
    setIsDeleting(true);
    try {
      await QuestionService.delete(deleteId);
      setDeleteId(null);
      load();
    } finally {
      setIsDeleting(false);
    }
  }

  const topicItems = [{ value: '', label: 'All Topics' }, ...topics.map((t) => ({ value: String(t.id), label: t.name }))];
  const subtopicItems = [
    { value: '', label: filterTopicId ? 'All Subtopics' : 'Select topic first' },
    ...filteredSubtopicsForFilter.map((s) => ({ value: String(s.id), label: s.name, meta: s.difficulty })),
  ];
  const typeItems = [
    { value: '', label: 'All Types' },
    ...Object.values(ExerciseQuestionType).map((t) => ({ value: t, label: questionTypeLabel[t] })),
  ];

  const columns = [
    { key: 'id', header: 'ID', className: 'w-12' },
    { key: 'questionType', header: 'Type', render: (q: QuestionDTO) => <Badge variant={questionTypeBadge[q.questionType]} className="text-xs whitespace-nowrap">{questionTypeLabel[q.questionType]}</Badge> },
    { key: 'subtopicName', header: 'Subtopic', render: (q: QuestionDTO) => <span className="text-xs bg-slate-100 px-2 py-0.5 rounded">{q.subtopicName}</span> },
    { key: 'subject', header: 'Subject', render: (q: QuestionDTO) => <span className="text-sm line-clamp-1">{q.subject}</span> },
    {
      key: 'answer', header: 'Answer', render: (q: QuestionDTO) => (
        q.answerWordId
          ? <span className="text-xs text-blue-600">Word ID: {q.answerWordId}</span>
          : q.answerData
            ? <span className="text-xs text-amber-600">Structured Data</span>
            : <span className="text-xs text-slate-400">-</span>
      ),
    },
    { key: 'createdAt', header: 'Created', render: (q: QuestionDTO) => <span className="text-xs text-slate-500">{formatDate(q.createdAt)}</span> },
    {
      key: 'actions', header: '',
      render: (q: QuestionDTO) => (
        <div className="flex items-center justify-end gap-1">
          <Button size="icon" variant="ghost" onClick={() => { setEditing(q); setDialogOpen(true); }}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(q.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Questions"
        description="Manage exercise questions. Standard questions link to a word; Fill-in-blank and Hangman use structured answer data."
        action={
          <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-1" /> Add Question
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search questions..."
            className="pl-9"
          />
        </div>
        <div className="w-44">
          <SearchableDropdown
            placeholder="All Topics"
            items={topicItems}
            selected={filterTopicId}
            onSelect={(v) => { setFilterTopicId(v); setFilterSubtopicId(''); setPage(0); }}
          />
        </div>
        <div className="w-48">
          <SearchableDropdown
            placeholder={filterTopicId ? 'All Subtopics' : 'Select topic first'}
            items={subtopicItems}
            selected={filterSubtopicId}
            onSelect={(v) => { setFilterSubtopicId(v); setPage(0); }}
            disabled={!filterTopicId}
          />
        </div>
        <div className="w-40">
          <SearchableDropdown
            placeholder="All Types"
            items={typeItems}
            selected={filterType}
            onSelect={(v) => { setFilterType(v); setPage(0); }}
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
        keyExtractor={(q) => q.id}
      />

      <QuestionFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        topics={topics}
        subtopics={subtopics}
        onSaved={load}
      />
      <DeleteConfirmDialog
        open={deleteId != null}
        onOpenChange={(v) => !v && setDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Question"
        description="This will permanently delete the question."
      />
    </PageContainer>
  );
}
