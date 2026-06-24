import { format, isSameMonth, isSameDay, isToday } from 'date-fns';
import { cn } from '../../lib/utils';
import React from 'react';

type Shift = {
  id: string;
  placeId: string;
  date: Date;
  staffName: string;
  role: string;
  startTime: string;
  endTime: string;
  status: 'ACTIVE' | 'DRAFT';
};

type SchedulesCalendarGridProps = {
  days: Date[];
  monthStart: Date;
  visibleShifts: Shift[];
  selectedDates: string[];
  selectedShiftIds: string[];
  selectionMode: 'IDLE' | 'MULTIPLE' | 'CREATE';
  handleDayClick: (day: Date) => void;
  handleShiftClick: (e: React.MouseEvent, shift: Shift) => void;
};

export function SchedulesCalendarGrid({
  days,
  monthStart,
  visibleShifts,
  selectedDates,
  selectedShiftIds,
  selectionMode,
  handleDayClick,
  handleShiftClick
}: SchedulesCalendarGridProps) {
  const dateFormat = "d";

  return (
    <div className="flex-1 overflow-hidden p-4">
      <div className="h-full bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col">
        
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-slate-200 shrink-0">
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
            <div key={day} className="p-2 text-center bg-slate-50 border-r border-slate-200 last:border-r-0">
               <p className="text-[10px] font-bold text-slate-400 uppercase">{day}</p>
            </div>
          ))}
        </div>
        
        {/* Days Grid - Scrollable */}
        <div className="flex-1 grid grid-cols-7 grid-rows-5 gap-0 overflow-y-auto">
          {days.map((day) => {
            const isCurrentMonth = isSameMonth(day, monthStart);
            const dateStr = day.toISOString();
            const isSelectedDate = selectedDates.includes(dateStr);
            
            const dayShifts = visibleShifts.filter(s => isSameDay(s.date, day));

            return (
              <div 
                key={day.toString()} 
                onClick={() => handleDayClick(day)}
                className={cn(
                  "p-1.5 border-b border-r border-slate-100 min-h-[120px] flex flex-col gap-1 transition-colors relative",
                  !isCurrentMonth && "bg-slate-50/50",
                  selectionMode === 'CREATE' ? "cursor-pointer hover:bg-indigo-50/50" : "",
                  isSelectedDate ? "bg-indigo-50 ring-inset ring-2 ring-indigo-500" : ""
                )}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={cn(
                    "text-[10px] font-bold", 
                    isToday(day) ? "text-indigo-600" : "text-slate-500",
                    !isCurrentMonth && "text-slate-300"
                  )}>
                    {format(day, dateFormat)}
                  </span>
                </div>

                <div className="flex-1 flex flex-col gap-1 overflow-y-auto hide-scrollbar">
                  {dayShifts.map((shift: Shift) => {
                    const isSelectedShift = selectedShiftIds.includes(shift.id);
                    return (
                      <div 
                        key={shift.id}
                        onClick={(e) => handleShiftClick(e, shift)}
                        className={cn(
                          "border rounded p-1 mb-0.5 transition-all text-left",
                          selectionMode === 'MULTIPLE' ? "cursor-pointer hover:opacity-80" : "cursor-default",
                          shift.status === 'ACTIVE' 
                            ? "bg-emerald-50 border-emerald-200" 
                            : "bg-amber-50 border-amber-200 border-dashed",
                          isSelectedShift 
                            ? "ring-2 ring-indigo-500 ring-offset-1" 
                            : ""
                        )}
                      >
                         <p className={cn(
                           "text-[10px] font-bold truncate",
                           shift.status === 'ACTIVE' ? "text-emerald-800" : "text-amber-800"
                         )}>
                           {shift.status === 'DRAFT' && "DRAFT: "}{shift.staffName}
                         </p>
                         <p className={cn(
                           "text-[9px] uppercase truncate",
                           shift.status === 'ACTIVE' ? "text-emerald-600" : "text-amber-600"
                         )}>
                           {shift.startTime} - {shift.endTime}
                         </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
