import React, { useState } from 'react';
import { MaintenanceTask, ScheduledTrain, ConflictRecord } from '../../types';
import { Clock, Info, AlertTriangle, ShieldCheck, Wrench, Train } from 'lucide-react';
import { formatHour } from '../../utils/optimizerEngine';

interface CorridorGanttTimelineProps {
  tasks: MaintenanceTask[];
  trains: ScheduledTrain[];
  conflicts: ConflictRecord[];
  onSelectTask: (task: MaintenanceTask) => void;
  onResolveConflict: (conflictId: string) => void;
  onUpdateTaskTime: (taskId: string, newStart: number, newEnd: number) => void;
}

export const CorridorGanttTimeline: React.FC<CorridorGanttTimelineProps> = ({
  tasks,
  trains,
  conflicts,
  onSelectTask,
  onResolveConflict,
  onUpdateTaskTime,
}) => {
  const [hoveredEntity, setHoveredEntity] = useState<{
    type: 'TASK' | 'TRAIN';
    item: MaintenanceTask | ScheduledTrain;
    x: number;
    y: number;
  } | null>(null);

  const tracks: Array<'DN Main' | 'UP Main' | 'Loop Line 1'> = ['DN Main', 'UP Main', 'Loop Line 1'];

  // Convert hour (0-24) to percentage (0-100%)
  const hourToPct = (h: number) => (h / 24) * 100;

  const getDeptColor = (dept: string, isShadow?: boolean) => {
    if (isShadow) return 'bg-indigo-600/90 border-indigo-400 text-indigo-100 shadow-indigo-900/40';
    switch (dept) {
      case 'ENGINEERING':
        return 'bg-blue-600/90 border-blue-400 text-blue-100 shadow-blue-900/40';
      case 'S_AND_T':
        return 'bg-amber-600/90 border-amber-400 text-amber-100 shadow-amber-900/40';
      case 'TRD':
        return 'bg-teal-600/90 border-teal-400 text-teal-100 shadow-teal-900/40';
      default:
        return 'bg-slate-700 border-slate-500 text-slate-100';
    }
  };

  const getTrainColor = (trainType: string) => {
    if (trainType.includes('Rajdhani')) return 'bg-rose-700/90 border-rose-400 text-rose-100';
    if (trainType.includes('Goods')) return 'bg-emerald-700/90 border-emerald-400 text-emerald-100';
    if (trainType.includes('EMU')) return 'bg-purple-700/90 border-purple-400 text-purple-100';
    return 'bg-amber-700/90 border-amber-400 text-amber-100';
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl mb-6 relative">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            24-Hour Corridor Operational Gantt & Traffic Schedule
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time visual alignment of COA passenger/freight trains and AI-scheduled maintenance blocks
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-slate-300">
            <span className="w-3 h-3 rounded bg-blue-600 border border-blue-400 inline-block"></span>
            Engineering
          </span>
          <span className="flex items-center gap-1 text-slate-300">
            <span className="w-3 h-3 rounded bg-amber-600 border border-amber-400 inline-block"></span>
            S&T
          </span>
          <span className="flex items-center gap-1 text-slate-300">
            <span className="w-3 h-3 rounded bg-teal-600 border border-teal-400 inline-block"></span>
            Traction (TRD)
          </span>
          <span className="flex items-center gap-1 text-slate-300">
            <span className="w-3 h-3 rounded bg-indigo-600 border border-indigo-400 inline-block"></span>
            Shadow Block (Multi-Dept)
          </span>
          <span className="flex items-center gap-1 text-slate-300">
            <span className="w-3 h-3 rounded bg-rose-700 border border-rose-400 inline-block"></span>
            Timetabled Train
          </span>
        </div>
      </div>

      {/* Main Timeline Grid Container */}
      <div className="overflow-x-auto">
        <div className="min-w-[900px]">
          {/* Time Header Scale */}
          <div className="flex border-b border-slate-800 pb-2 mb-2 text-[11px] font-mono text-slate-400 pl-28">
            {Array.from({ length: 25 }, (_, i) => (
              <div key={i} className="flex-1 text-center border-l border-slate-800/60 first:border-l-0">
                {i < 10 ? `0${i}:00` : `${i}:00`}
              </div>
            ))}
          </div>

          {/* Track Lanes */}
          {tracks.map((trackName) => {
            const trackTasks = tasks.filter(t => t.asset.track_line === trackName);
            const trackTrains = trains.filter(t => t.track_line === trackName);

            return (
              <div key={trackName} className="mb-4 bg-slate-950/70 rounded-lg p-3 border border-slate-800/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-200 tracking-wide font-mono flex items-center gap-2">
                    <Train className="w-3.5 h-3.5 text-blue-400" />
                    {trackName}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {trackTrains.length} Trains • {trackTasks.length} Blocks
                  </span>
                </div>

                {/* Combined Interactive Timeline Layer */}
                <div className="relative h-28 bg-slate-900/90 rounded border border-slate-800 overflow-hidden">
                  {/* Vertical Hour Grid Lines */}
                  <div className="absolute inset-0 flex pointer-events-none">
                    {Array.from({ length: 24 }, (_, i) => (
                      <div key={i} className="flex-1 border-r border-slate-800/40"></div>
                    ))}
                  </div>

                  {/* Sub-Lane 1: Timetabled Trains (Top Half) */}
                  <div className="absolute top-1 left-0 right-0 h-12">
                    {trackTrains.map((train) => {
                      const leftPct = hourToPct(train.start_hour);
                      const widthPct = hourToPct(train.end_hour - train.start_hour);

                      return (
                        <div
                          key={train.train_id}
                          style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setHoveredEntity({ type: 'TRAIN', item: train, x: rect.left, y: rect.top - 70 });
                          }}
                          onMouseLeave={() => setHoveredEntity(null)}
                          className={`absolute top-0 h-11 rounded border px-2 text-[10px] font-medium flex items-center justify-between shadow-md cursor-pointer transition-all hover:scale-[1.01] hover:z-20 ${getTrainColor(train.train_type)}`}
                        >
                          <div className="truncate font-semibold flex items-center gap-1">
                            <Train className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{train.train_number} {train.name}</span>
                          </div>
                          <span className="font-mono text-[9px] opacity-80 ml-1 flex-shrink-0">
                            {formatHour(train.start_hour)}-{formatHour(train.end_hour)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Sub-Lane 2: Maintenance Blocks (Bottom Half) */}
                  <div className="absolute bottom-1 left-0 right-0 h-12">
                    {trackTasks.map((task) => {
                      const leftPct = hourToPct(task.start_hour);
                      const widthPct = hourToPct(task.end_hour - task.start_hour);

                      // Is there a conflict for this task?
                      const taskConflict = conflicts.find(c => c.task_id === task.task_id && !c.is_resolved);

                      return (
                        <div
                          key={task.task_id}
                          style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                          onClick={() => onSelectTask(task)}
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setHoveredEntity({ type: 'TASK', item: task, x: rect.left, y: rect.top - 80 });
                          }}
                          onMouseLeave={() => setHoveredEntity(null)}
                          className={`absolute bottom-0 h-11 rounded-md border-2 px-2 text-[10px] font-medium flex items-center justify-between shadow-md cursor-pointer transition-all hover:scale-[1.02] hover:z-30 ${
                            taskConflict ? 'bg-rose-950/90 border-rose-500 text-rose-100 animate-pulse' : getDeptColor(task.department, task.is_shadow_block)
                          }`}
                        >
                          <div className="truncate flex items-center gap-1.5">
                            <Wrench className="w-3 h-3 flex-shrink-0" />
                            <span className="font-bold font-mono">{task.task_id}</span>
                            <span className="truncate hidden sm:inline text-slate-200">{task.title}</span>
                          </div>

                          <div className="flex items-center gap-1 font-mono text-[9px] ml-1 flex-shrink-0">
                            {taskConflict && (
                              <span className="bg-rose-500 text-white font-bold px-1 rounded text-[8px]">
                                CONFLICT
                              </span>
                            )}
                            <span className="bg-slate-950/60 px-1 py-0.5 rounded text-slate-200">
                              {formatHour(task.start_hour)}-{formatHour(task.end_hour)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Detailed Tooltip */}
      {hoveredEntity && (
        <div
          style={{ left: `${Math.min(window.innerWidth - 300, Math.max(20, hoveredEntity.x))}px`, top: `${hoveredEntity.y}px` }}
          className="fixed z-50 bg-slate-950 border border-slate-700 text-slate-100 p-3 rounded-lg shadow-2xl text-xs w-72 pointer-events-none backdrop-blur-md"
        >
          {hoveredEntity.type === 'TRAIN' ? (
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-1 mb-1.5 font-bold text-rose-400">
                <span>{(hoveredEntity.item as ScheduledTrain).name}</span>
                <span className="font-mono">#{(hoveredEntity.item as ScheduledTrain).train_number}</span>
              </div>
              <p className="text-slate-300">Type: {(hoveredEntity.item as ScheduledTrain).train_type}</p>
              <p className="text-slate-300">Track: {(hoveredEntity.item as ScheduledTrain).track_line}</p>
              <p className="text-slate-400 font-mono mt-1">
                Window: {formatHour((hoveredEntity.item as ScheduledTrain).start_hour)} - {formatHour((hoveredEntity.item as ScheduledTrain).end_hour)}
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-1 mb-1.5 font-bold text-blue-400">
                <span>{(hoveredEntity.item as MaintenanceTask).task_id}</span>
                <span className="text-[10px] bg-blue-950 text-blue-300 px-1.5 py-0.5 rounded border border-blue-800">
                  {(hoveredEntity.item as MaintenanceTask).department}
                </span>
              </div>
              <p className="font-semibold text-white">{(hoveredEntity.item as MaintenanceTask).title}</p>
              <p className="text-slate-300 text-[11px] mt-1">
                Asset: {(hoveredEntity.item as MaintenanceTask).asset.asset_id} (KM {(hoveredEntity.item as MaintenanceTask).asset.km_post.start})
              </p>
              <div className="mt-2 flex items-center justify-between font-mono text-[11px]">
                <span className="text-amber-400 font-bold">
                  Score: {(hoveredEntity.item as MaintenanceTask).priority_score}/100
                </span>
                <span className="text-slate-400">
                  {formatHour((hoveredEntity.item as MaintenanceTask).start_hour)} - {formatHour((hoveredEntity.item as MaintenanceTask).end_hour)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Conflicts Bar if any */}
      {conflicts.filter(c => !c.is_resolved).length > 0 && (
        <div className="mt-3 bg-rose-950/60 border border-rose-800/80 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-rose-300 text-xs">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 animate-bounce" />
            <span className="font-semibold">
              Deterministic Conflict Detected: {conflicts.filter(c => !c.is_resolved)[0].conflict_title}
            </span>
          </div>

          <button
            onClick={() => onResolveConflict(conflicts.filter(c => !c.is_resolved)[0].id)}
            className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-3 py-1.5 rounded border border-rose-400 transition-all flex items-center gap-1 cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Apply AI Conflict Reschedule (Night Slot)</span>
          </button>
        </div>
      )}
    </div>
  );
};
