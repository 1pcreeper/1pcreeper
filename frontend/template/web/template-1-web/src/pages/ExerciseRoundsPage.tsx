import { useState, useEffect, useCallback } from 'react';
import { PageContainer, PageHeader, DeleteConfirmDialog } from '@/components/AppLayout';
import { DataTable } from '@/components/DataTable';
import { SearchableDropdown } from '@/components/SearchableDropdown';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ExerciseRoundService } from '@/services/ExerciseRoundService';
import { UserService } from '@/services/UserService';
import type { ExerciseRoundDTO } from '@/dto/exerciseRound.dto';
import type { AppUserDTO } from '@/dto/user.dto';
import type { PaginationBaseResponseDTO } from '@/dto/base.dto';
import { ExerciseQuestionType } from '@/dto/enums';
import { formatDate } from '@/lib/utils';
import { Trash2, Clock, Search } from 'lucide-react';

const PAGE_SIZE = 10;

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

function ScoreBadge({ score, total }: { score: number; total: number }) {
  const pct = total > 0 ? (score / total) * 100 : 0;
  const variant = pct >= 80 ? 'success' : pct >= 50 ? 'warning' : 'destructive';
  return <Badge variant={variant}>{score.toFixed(1)} / {total}</Badge>;
}

export default function ExerciseRoundsPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [filterUserId, setFilterUserId] = useState<string>('');
  const [data, setData] = useState<PaginationBaseResponseDTO<ExerciseRoundDTO> | null>(null);
  const [users, setUsers] = useState<AppUserDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    UserService.findAll({ page: 0, size: 100 }).then((r) => setUsers(r.content));
  }, []);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await ExerciseRoundService.findAll({ page, size: PAGE_SIZE, userId: filterUserId ? Number(filterUserId) : undefined, q: search.trim() ? search.trim() : undefined });
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
      await ExerciseRoundService.delete(deleteId);
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
    { key: 'id', header: 'ID', className: 'w-12' },
    { key: 'userName', header: 'User', render: (r: ExerciseRoundDTO) => <span className="font-medium">{r.userName}</span> },
    { key: 'subtopicName', header: 'Subtopic', render: (r: ExerciseRoundDTO) => <span className="text-xs bg-slate-100 px-2 py-0.5 rounded">{r.subtopicName}</span> },
    { key: 'questionType', header: 'Type', render: (r: ExerciseRoundDTO) => <span className="text-xs">{questionTypeLabel[r.questionType]}</span> },
    { key: 'score', header: 'Score', render: (r: ExerciseRoundDTO) => <ScoreBadge score={r.score} total={r.totalQuestions} /> },
    {
      key: 'timeLimit', header: 'Time Limit',
      render: (r: ExerciseRoundDTO) => r.timeLimit
        ? <span className="flex items-center gap-1 text-xs text-slate-500"><Clock className="h-3 w-3" />{r.timeLimit}s</span>
        : <span className="text-xs text-slate-400">No limit</span>,
    },
    { key: 'createdAt', header: 'Completed', render: (r: ExerciseRoundDTO) => <span className="text-xs text-slate-500">{formatDate(r.createdAt)}</span> },
    {
      key: 'actions', header: '',
      render: (r: ExerciseRoundDTO) => (
        <div className="flex justify-end">
          <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(r.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Exercise Rounds"
        description="View and manage completed exercise sessions (read-only, delete only)"
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
        keyExtractor={(r) => r.id}
      />

      <DeleteConfirmDialog
        open={deleteId != null}
        onOpenChange={(v) => !v && setDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Exercise Round"
        description="This will permanently delete this exercise round record."
      />
    </PageContainer>
  );
}
