import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageContainer, PageHeader } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { mockUsers } from '@/mock/users.mock';
import { mockGrades } from '@/mock/grades.mock';
import { mockTopics } from '@/mock/topics.mock';
import { mockSubtopics } from '@/mock/subtopics.mock';
import { mockWords } from '@/mock/words.mock';
import { mockQuestions } from '@/mock/questions.mock';
import { mockExerciseRounds } from '@/mock/exerciseRounds.mock';
import { formatDate } from '@/lib/utils';
import { Users, GraduationCap, BookOpen, List, Type, HelpCircle, Trophy, ArrowRight } from 'lucide-react';

const stats = [
  { label: 'Users', value: mockUsers.length, icon: Users, to: '/users', color: 'bg-blue-50 text-blue-600' },
  { label: 'Grades', value: mockGrades.length, icon: GraduationCap, to: '/grades', color: 'bg-green-50 text-green-600' },
  { label: 'Topics', value: mockTopics.length, icon: BookOpen, to: '/topics', color: 'bg-amber-50 text-amber-600' },
  { label: 'Subtopics', value: mockSubtopics.length, icon: List, to: '/subtopics', color: 'bg-purple-50 text-purple-600' },
  { label: 'Words', value: mockWords.length, icon: Type, to: '/words', color: 'bg-rose-50 text-rose-600' },
  { label: 'Questions', value: mockQuestions.length, icon: HelpCircle, to: '/questions', color: 'bg-cyan-50 text-cyan-600' },
];

const questionTypeLabel: Record<string, string> = {
  ENGLISH_DEFINITION_MATCH: 'Eng Def Match',
  MULTIPLE_CHOICE_C2E: 'C2E Choice',
  HANG_MAN: 'Hangman',
  FILL_IN_BLANK: 'Fill in Blank',
  CHINESE_DICTATION: 'CN Dictation',
  ENGLISH_DICTATION: 'EN Dictation',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting('Good morning');
    else if (h < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const recentRounds = [...mockExerciseRounds].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 5);

  return (
    <PageContainer>
      <PageHeader
        title={`${greeting}, ${user?.displayName ?? 'Admin'}`}
        description="Here's what's happening in your DSE platform."
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, to, color }) => (
          <Link key={to} to={to} className="group">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-4">
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg mb-3 ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
                <p className="text-xs text-slate-500 mt-0.5 group-hover:text-primary transition-colors">{label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Recent Exercise Rounds</CardTitle>
              <Link to="/exercise-rounds" className="flex items-center gap-1 text-xs text-primary hover:underline">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {recentRounds.map((round) => (
                <div key={round.id} className="flex items-center justify-between px-6 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{round.userName}</p>
                    <p className="text-xs text-slate-500 truncate">{round.subtopicName}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                    <Badge variant="info" className="text-xs">
                      {questionTypeLabel[round.questionType] ?? round.questionType}
                    </Badge>
                    <span className="text-sm font-semibold text-slate-700">{round.score.toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Quick Navigation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {[
                { to: '/users', label: 'Manage Users', icon: Users },
                { to: '/grades', label: 'Manage Grades', icon: GraduationCap },
                { to: '/topics', label: 'Manage Topics', icon: BookOpen },
                { to: '/subtopics', label: 'Manage Subtopics', icon: List },
                { to: '/words', label: 'Manage Words', icon: Type },
                { to: '/questions', label: 'Manage Questions', icon: HelpCircle },
                { to: '/subscriptions', label: 'Subscriptions', icon: Trophy },
                { to: '/exercise-rounds', label: 'Exercise Rounds', icon: Trophy },
              ].map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors"
                >
                  <Icon className="h-4 w-4 flex-shrink-0 text-slate-400" />
                  <span className="truncate">{label}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">System Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-xs text-slate-400 uppercase font-medium">Mode</p>
                {import.meta.env.MOCK_MODE === 'true' ? (
                  <Badge variant="warning" className="mt-1">Mock Data</Badge>
                ) : (
                  <Badge variant="success" className="mt-1">Real Data</Badge>
                )}
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-medium">Logged in as</p>
                <p className="font-medium text-slate-700 mt-1">{user?.name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-medium">Roles</p>
                <div className="flex gap-1 flex-wrap mt-1">
                  {user?.roles.map((r) => (
                    <Badge key={r} variant="secondary" className="text-xs">{r}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-medium">Last Round</p>
                <p className="font-medium text-slate-700 mt-1 text-xs">{formatDate(recentRounds[0]?.createdAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
