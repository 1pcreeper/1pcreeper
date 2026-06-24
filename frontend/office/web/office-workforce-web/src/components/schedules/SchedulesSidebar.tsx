import { Loader2, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

type TaskHistory = { id: number; title: string; status: string; rules: string };

type SchedulesSidebarProps = {
  rightSidebarMode: 'SCHEDULE' | 'FORMS';
  setRightSidebarMode: (mode: 'SCHEDULE' | 'FORMS') => void;
  setIsGenerateModalOpen: (open: boolean) => void;
  isGenerating: boolean;
  setIsGenerating: (generating: boolean) => void;
  taskHistory: TaskHistory[];
};

export function SchedulesSidebar({
  rightSidebarMode,
  setRightSidebarMode,
  setIsGenerateModalOpen,
  isGenerating,
  setIsGenerating,
  taskHistory
}: SchedulesSidebarProps) {
  return (
    <aside className="w-72 bg-white border-l border-slate-200 flex flex-col shrink-0 z-20">
      {rightSidebarMode === 'SCHEDULE' ? (
        <>
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Schedule Generator</h2>
            <button 
              onClick={() => setIsGenerateModalOpen(true)}
              className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded shadow-md hover:bg-indigo-700 flex items-center justify-center gap-2 text-xs"
            >
              <Sparkles className="w-3 h-3" />
              GENERATE NEW
            </button>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase">Recent Generations</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
            <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-2 uppercase">
              <span>Total Staff: 124</span>
              <span>Active: 89</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full">
              <div className="bg-indigo-500 h-1.5 rounded-full w-[72%]"></div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Forms Generator</h2>
            <button onClick={() => setRightSidebarMode('SCHEDULE')} className="text-[10px] text-slate-400 hover:text-slate-600">CLOSE</button>
          </div>
          <div className="p-4 border-b border-slate-200">
            <button 
              onClick={() => {
                setIsGenerating(true);
                setTimeout(() => setIsGenerating(false), 2000);
              }}
              disabled={isGenerating}
              className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded shadow-md hover:bg-indigo-700 flex items-center justify-center gap-2 text-xs"
            >
              {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              GENERATE FORMS
            </button>
          </div>
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase">Recent Submissions</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                <div className="flex justify-between items-start mb-1">
                  <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[9px] font-bold">COMPLETED</span>
                  <span className="text-[9px] text-slate-400 font-mono">#FRM-001</span>
                </div>
                <p className="text-[10px] font-bold truncate">Time Off Requests</p>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                <div className="flex justify-between items-start mb-1">
                  <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded text-[9px] font-bold">PROCESSING</span>
                  <span className="text-[9px] text-slate-400 font-mono">#FRM-002</span>
                </div>
                <p className="text-[10px] font-bold truncate">Availability Survey</p>
              </div>
            </div>
          </div>
        </>
      )}
    </aside>
  );
}
