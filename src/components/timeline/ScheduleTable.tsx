import React, { useState } from 'react';
import { MaintenanceTask, Department, BlockStatus } from '../../types';
import { Search, Filter, Cpu, Wrench, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { formatHour } from '../../utils/optimizerEngine';

interface ScheduleTableProps {
  tasks: MaintenanceTask[];
  onSelectTask: (task: MaintenanceTask) => void;
  onStatusChange: (taskId: string, newStatus: BlockStatus) => void;
}

export const ScheduleTable: React.FC<ScheduleTableProps> = ({
  tasks,
  onSelectTask,
  onStatusChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<Department | 'ALL'>('ALL');

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.task_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.asset.asset_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDept = selectedDept === 'ALL' || task.department === selectedDept;

    return matchesSearch && matchesDept;
  });

  const getDeptBadge = (dept: Department) => {
    switch (dept) {
      case 'ENGINEERING':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'S_AND_T':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'TRD':
        return 'bg-teal-500/10 text-teal-400 border-teal-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getStatusBadge = (status: BlockStatus) => {
    switch (status) {
      case 'IN_EXECUTION':
      case 'PUBLISHED':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'APPROVED':
      case 'VALIDATED':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      case 'AI_PROPOSED':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'CONFLICT_FLAG':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'Critical':
      case 'High':
        return 'text-rose-400 font-bold';
      case 'Med':
        return 'text-amber-400 font-medium';
      default:
        return 'text-slate-400';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
      {/* Table Header & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600/20 p-2 rounded-lg border border-blue-500/30">
            <Wrench className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              Master Maintenance Task & Block Allocation Ledger
            </h3>
            <p className="text-xs text-slate-400">
              Canonical TMS / SMMS / TDMS defect records aligned with corridor block windows
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Filter Task ID, Asset, Defect..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-950 text-slate-200 text-xs pl-8 pr-3 py-1.5 rounded-md border border-slate-700 focus:outline-none focus:border-blue-500 w-52"
            />
          </div>

          {/* Dept Filter Tabs */}
          <div className="flex items-center bg-slate-950 p-1 rounded-md border border-slate-800 text-xs">
            <button
              onClick={() => setSelectedDept('ALL')}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                selectedDept === 'ALL' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedDept('ENGINEERING')}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                selectedDept === 'ENGINEERING' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-blue-300'
              }`}
            >
              Engg
            </button>
            <button
              onClick={() => setSelectedDept('S_AND_T')}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                selectedDept === 'S_AND_T' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-amber-300'
              }`}
            >
              S&T
            </button>
            <button
              onClick={() => setSelectedDept('TRD')}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                selectedDept === 'TRD' ? 'bg-teal-600 text-white font-bold' : 'text-slate-400 hover:text-teal-300'
              }`}
            >
              TRD
            </button>
          </div>
        </div>
      </div>

      {/* High Density Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950 text-slate-400 text-xs font-mono border-b border-slate-800">
              <th className="py-3 px-3">Task ID</th>
              <th className="py-3 px-3">Dept</th>
              <th className="py-3 px-3">Task Description</th>
              <th className="py-3 px-3">Track Line</th>
              <th className="py-3 px-3">Start (h)</th>
              <th className="py-3 px-3">End (h)</th>
              <th className="py-3 px-3">Impact</th>
              <th className="py-3 px-3">AI Score</th>
              <th className="py-3 px-3">Lifecycle Status</th>
              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {filteredTasks.map((task) => (
              <tr
                key={task.task_id}
                className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                onClick={() => onSelectTask(task)}
              >
                {/* Task ID */}
                <td className="py-3 px-3 font-mono font-bold text-blue-400 group-hover:underline">
                  {task.task_id}
                  {task.is_shadow_block && (
                    <span className="ml-1 text-[9px] bg-indigo-900/80 text-indigo-300 px-1 rounded border border-indigo-700">
                      SHADOW
                    </span>
                  )}
                </td>

                {/* Dept */}
                <td className="py-3 px-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getDeptBadge(task.department)}`}>
                    {task.department === 'S_AND_T' ? 'S&T' : task.department}
                  </span>
                </td>

                {/* Description */}
                <td className="py-3 px-3 max-w-xs">
                  <div className="font-semibold text-slate-200 truncate">{task.title}</div>
                  <div className="text-[11px] text-slate-400 truncate">
                    Asset: {task.asset.asset_id} • KM {task.asset.km_post.start}
                  </div>
                </td>

                {/* Track */}
                <td className="py-3 px-3 font-mono text-slate-300">{task.asset.track_line}</td>

                {/* Start */}
                <td className="py-3 px-3 font-mono text-slate-300">{formatHour(task.start_hour)}</td>

                {/* End */}
                <td className="py-3 px-3 font-mono text-slate-300">{formatHour(task.end_hour)}</td>

                {/* Impact */}
                <td className={`py-3 px-3 font-mono ${getImpactBadge(task.impact_level)}`}>
                  {task.impact_level}
                </td>

                {/* AI Score */}
                <td className="py-3 px-3">
                  <span className="font-mono font-bold text-amber-400 flex items-center gap-1">
                    <Cpu className="w-3 h-3 text-amber-500" />
                    {task.priority_score.toFixed(1)}
                  </span>
                </td>

                {/* Status */}
                <td className="py-3 px-3">
                  <span className={`px-2.5 py-1 rounded text-[10px] font-bold border ${getStatusBadge(task.status)}`}>
                    {task.status}
                  </span>
                </td>

                {/* Actions */}
                <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onSelectTask(task)}
                    className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded text-[11px] border border-slate-700 inline-flex items-center gap-1 transition-all"
                  >
                    <span>Inspect</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
