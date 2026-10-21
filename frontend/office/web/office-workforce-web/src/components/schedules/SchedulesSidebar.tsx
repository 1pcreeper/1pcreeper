import { Loader2, Sparkles, Shield, Heart, FileText } from 'lucide-react';
import { cn } from '../../lib/utils';

type TaskHistory = { id: number; title: string; status: string; rules: string };

type SchedulesSidebarProps = {
  rightSidebarMode: 'SCHEDULE' | 'FORMS';
  setRightSidebarMode: (mode: 'SCHEDULE' | 'FORMS') => void;
  setIsGenerateModalOpen: (open: boolean) => void;
  taskHistory: TaskHistory[];
  staffCount: number;
  onOpenRulesModal?: () => void;
  onOpenPreferencesModal?: () => void;
};

export function SchedulesSidebar({
  rightSidebarMode,
  setRightSidebarMode,
  setIsGenerateModalOpen,
  taskHistory,
  staffCount,
  onOpenRulesModal,
  onOpenPreferencesModal
}: SchedulesSidebarProps) {
  return (
    <aside className="w-72 bg-white border-l border-slate-200 flex flex-col shrink-0 z-20">
      {rightSidebarMode === 'SCHEDULE' ? (
        <>
          <div className="p-4 border-b border-slate-200 space-y-2">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Schedule Generator</h2>
            <button 
              onClick={() => setIsGenerateModalOpen(true)}
              className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded shadow-md hover:bg-indigo-700 flex items-center justify-center gap-2 text-xs cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              GENERATE NEW
            </button>
            {onOpenRulesModal && (
              <button 
                onClick={onOpenRulesModal}
                className="w-full bg-slate-50 border border-slate-300 text-slate-700 font-bold py-1.5 px-3 rounded hover:bg-slate-100 flex items-center justify-center gap-1.5 text-xs transition-colors cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5 text-indigo-600" />
                ROSTER RULES & QUOTAS
              </button>
            )}
            {onOpenPreferencesModal && (
              <button 
                onClick={onOpenPreferencesModal}
                className="w-full bg-slate-50 border border-slate-300 text-slate-700 font-bold py-1.5 px-3 rounded hover:bg-slate-100 flex items-center justify-center gap-1.5 text-xs transition-colors cursor-pointer"
              >
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                STAFF SHIFT PREFERENCES
              </button>
            )}
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase">Recent Generations</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {taskHistory.length === 0 && (
                <p className="text-[10px] text-slate-400 text-center py-4">No generation tasks yet.</p>
              )}
              {taskHistory.map((task) => (
                 <div key={task.id} className="p-3 bg-white border border-slate-200 rounded-lg shadow-sm relative overflow-hidden">
                   {task.status === 'PROCESSING' && (
                      <div className="absolute top-0 left-0 w-full h-0.5 bg-indigo-500" />
                   )}
                   <div className="flex justify-between items-start mb-1">
                     {task.status === 'COMPLETED' && (
                       <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[9px] font-bold">SUCCESS</span>
                     )}
                     {task.status === 'PROCESSING' && (
                       <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded text-[9px] font-bold">PROCESSING</span>
                     )}
                     {task.status === 'FAILED' && (
                       <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded text-[9px] font-bold">FAILED</span>
                     )}
                     <span className="text-[9px] text-slate-400 font-mono">#TSK-00{task.id}</span>
                   </div>
                   <p className="text-[10px] font-bold truncate">{task.title}</p>
                   <div className="flex items-center gap-2 mt-1">
                     {task.status === 'PROCESSING' && <Loader2 className="w-3 h-3 text-indigo-500 animate-spin" />}
                     <p className={cn("text-[9px]", task.status === 'FAILED' ? "text-rose-400 italic" : "text-slate-400")}>
                       {task.rules}
                     </p>
                   </div>
                 </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-200">
            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
              <span>Total Staff</span>
              <span className="text-slate-600">{staffCount}</span>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Forms Generator</h2>
            <button onClick={() => setRightSidebarMode('SCHEDULE')} className="text-[10px] text-slate-400 hover:text-slate-600">CLOSE</button>
          </div>
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase">Generated Forms</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 gap-2 py-10">
                <FileText className="w-8 h-8 text-slate-300" />
                <p className="text-xs font-medium text-slate-500">No generated forms yet.</p>
                <p className="text-[10px] text-slate-400">Form generation is not available yet.</p>
              </div>
            </div>
          </div>
        </>
      )}
    </aside>
  );
}
