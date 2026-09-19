import React, { useState } from 'react';
import { MaintenanceTask, BlockStatus } from '../../types';
import { X, Wrench, Clock, ShieldCheck, AlertCircle, Cpu, CheckCircle2, ChevronRight } from 'lucide-react';
import { formatHour } from '../../utils/optimizerEngine';

interface TaskInspectDrawerProps {
  task: MaintenanceTask | null;
  onClose: () => void;
  onUpdateTaskTime: (taskId: string, startHour: number, endHour: number) => void;
  onStatusChange: (taskId: string, newStatus: BlockStatus) => void;
}

export const TaskInspectDrawer: React.FC<TaskInspectDrawerProps> = ({
  task,
  onClose,
  onUpdateTaskTime,
  onStatusChange,
}) => {
  if (!task) return null;

  const [startHour, setStartHour] = useState<number>(task.start_hour);
  const [endHour, setEndHour] = useState<number>(task.end_hour);

  const handleTimeSave = () => {
    onUpdateTaskTime(task.task_id, startHour, endHour);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-900 border-l border-slate-700 shadow-2xl p-6 overflow-y-auto backdrop-blur-md flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center space-x-2">
            <span className="font-mono font-bold text-base text-blue-400">{task.task_id}</span>
            <span className="text-xs font-mono bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-800">
              {task.department}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-slate-800 p-1.5 rounded-lg border border-slate-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Task Title & Status */}
        <div className="mb-5 space-y-2">
          <h3 className="text-sm font-bold text-white">{task.title}</h3>
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400">Current Status:</span>
            <span className="font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              {task.status}
            </span>
          </div>
        </div>

        {/* Asset & Defect Specs */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-xs mb-5">
          <div className="font-bold text-slate-300 border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
            <Wrench className="w-4 h-4 text-blue-400" />
            <span>Canonical Asset & Defect Record</span>
          </div>

          <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
            <div><span className="text-slate-500">Asset ID:</span> <span className="text-slate-200">{task.asset.asset_id}</span></div>
            <div><span className="text-slate-500">Track:</span> <span className="text-slate-200">{task.asset.track_line}</span></div>
            <div><span className="text-slate-500">Corridor:</span> <span className="text-slate-200">{task.asset.corridor_id}</span></div>
            <div><span className="text-slate-500">KM Post:</span> <span className="text-slate-200">{task.asset.km_post.start}-{task.asset.km_post.end}</span></div>
            <div><span className="text-slate-500">Defect Code:</span> <span className="text-rose-400">{task.defect.code}</span></div>
            <div><span className="text-slate-500">Overdue:</span> <span className="text-amber-400">{task.defect.overdue_days} Days</span></div>
          </div>
        </div>

        {/* Priority Score Breakdown */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs mb-5">
          <div className="flex justify-between items-center font-bold text-slate-300">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-amber-400" />
              AI Priority Score
            </span>
            <span className="font-mono text-base text-amber-400 font-bold">{task.priority_score}/100</span>
          </div>

          <ul className="list-disc list-inside text-slate-400 text-[11px] space-y-1 pt-2 border-t border-slate-800">
            {task.priority_decomposition.explanation_bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </div>

        {/* Time Allocation Editor */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-xs mb-5">
          <div className="font-bold text-slate-300 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Interactive Window Reschedule</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Start Hour (0-24):</label>
              <input
                type="number"
                step="0.25"
                min="0"
                max="24"
                value={startHour}
                onChange={(e) => setStartHour(parseFloat(e.target.value))}
                className="w-full bg-slate-900 text-slate-200 text-xs p-2 rounded border border-slate-700 font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">End Hour (0-24):</label>
              <input
                type="number"
                step="0.25"
                min="0"
                max="24"
                value={endHour}
                onChange={(e) => setEndHour(parseFloat(e.target.value))}
                className="w-full bg-slate-900 text-slate-200 text-xs p-2 rounded border border-slate-700 font-mono"
              />
            </div>
          </div>

          <div className="text-[11px] font-mono text-emerald-400">
            New Window: {formatHour(startHour)} - {formatHour(endHour)} ({((endHour - startHour) * 60).toFixed(0)} Mins)
          </div>

          <button
            onClick={handleTimeSave}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded text-xs border border-blue-400 transition-all cursor-pointer"
          >
            Apply Reschedule & Re-run Conflict Engine
          </button>
        </div>
      </div>

      {/* State Machine Transition Controls */}
      <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-2">
        <button
          onClick={() => onStatusChange(task.task_id, 'VALIDATED')}
          className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded text-xs border border-indigo-400 transition-all cursor-pointer"
        >
          Mark Validated
        </button>
        <button
          onClick={() => onStatusChange(task.task_id, 'APPROVED')}
          className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded text-xs border border-emerald-400 transition-all cursor-pointer"
        >
          Approve Block
        </button>
      </div>
    </div>
  );
};
