import React, { useState } from 'react';
import { MaintenanceTask, CorridorInfo } from '../../types';
import { Calendar as CalendarIcon, Clock, Layers, Filter, CheckCircle2, ChevronRight, BarChart2 } from 'lucide-react';

interface WeeklyMonthlyPlannerProps {
  tasks: MaintenanceTask[];
  corridor: CorridorInfo;
}

export const WeeklyMonthlyPlanner: React.FC<WeeklyMonthlyPlannerProps> = ({
  tasks,
  corridor,
}) => {
  const [plannerMode, setPlannerMode] = useState<'WEEKLY' | 'MONTHLY'>('WEEKLY');

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="space-y-6">
      {/* Top Header & Switcher */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-400" />
            Corridor Master Weekly & Monthly Block Planning Workspace
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Long-range strategic coordination for division maintenance windows and line availability planning
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setPlannerMode('WEEKLY')}
            className={`px-4 py-2 rounded-md font-bold transition-all cursor-pointer ${
              plannerMode === 'WEEKLY' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Weekly Grid View
          </button>
          <button
            onClick={() => setPlannerMode('MONTHLY')}
            className={`px-4 py-2 rounded-md font-bold transition-all cursor-pointer ${
              plannerMode === 'MONTHLY' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Monthly Heatmap Calendar
          </button>
        </div>
      </div>

      {plannerMode === 'WEEKLY' ? (
        /* Weekly Mon-Sun Grid Matrix */
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
          <h3 className="text-xs font-bold text-slate-300 mb-4 font-mono">
            7-Day Maintenance Block Schedule Matrix • Corridor {corridor.code}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {daysOfWeek.map((day, idx) => {
              const dayTasks = tasks.slice(0, (idx % 3) + 2);

              return (
                <div key={day} className="bg-slate-950 p-3 rounded-lg border border-slate-800 min-h-[300px]">
                  <div className="font-bold text-xs text-slate-200 pb-2 mb-2 border-b border-slate-800 flex justify-between">
                    <span>{day}</span>
                    <span className="text-slate-500 font-mono text-[10px]">Sept {14 + idx}</span>
                  </div>

                  <div className="space-y-2">
                    {dayTasks.map((t) => (
                      <div
                        key={`${day}-${t.task_id}`}
                        className="bg-slate-900 p-2.5 rounded border border-slate-800 text-[11px] hover:border-blue-500 transition-all cursor-pointer"
                      >
                        <div className="font-mono font-bold text-blue-400 text-[10px] flex justify-between">
                          <span>{t.task_id}</span>
                          <span className="text-slate-400">{t.department}</span>
                        </div>
                        <div className="font-semibold text-slate-200 text-[10px] line-clamp-2 mt-1">
                          {t.title}
                        </div>
                        <div className="text-[9px] font-mono text-emerald-400 mt-1">
                          Window: 02:00-04:30
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Monthly Heatmap Calendar View */
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
          <h3 className="text-xs font-bold text-slate-300 mb-4 font-mono">
            September 2026 Asset Availability Heatmap & Major Shadow Block Schedule
          </h3>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 30 }, (_, i) => {
              const dayNum = i + 1;
              const isHeavy = dayNum % 4 === 0;
              const isMedium = dayNum % 3 === 0;

              return (
                <div
                  key={dayNum}
                  className={`p-3 rounded-lg border transition-all text-xs min-h-[80px] flex flex-col justify-between ${
                    isHeavy
                      ? 'bg-rose-950/40 border-rose-800 text-rose-200'
                      : isMedium
                      ? 'bg-amber-950/40 border-amber-800 text-amber-200'
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="font-bold font-mono text-xs flex justify-between">
                    <span>{dayNum}</span>
                    <span className="text-[10px] opacity-70">
                      {isHeavy ? '94.2%' : isMedium ? '96.5%' : '98.1%'}
                    </span>
                  </div>

                  <div className="text-[10px] font-mono">
                    {isHeavy ? '2 Major Blocks' : isMedium ? '1 Shadow Block' : 'Regular Ops'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
