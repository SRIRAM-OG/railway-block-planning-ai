import React from 'react';
import { MaintenanceTask } from '../../types';
import { Layers, ShieldCheck, ArrowRight, CheckCircle2, Zap, Clock } from 'lucide-react';
import { formatHour } from '../../utils/optimizerEngine';

interface MultiDeptBundlerProps {
  tasks: MaintenanceTask[];
  onTriggerBundle: () => void;
  bundlingEfficiencyPct: number;
}

export const MultiDeptBundler: React.FC<MultiDeptBundlerProps> = ({
  tasks,
  onTriggerBundle,
  bundlingEfficiencyPct,
}) => {
  // Filter candidate bundling tasks (e.g. BLK-102 and BLK-106)
  const candidateTasks = tasks.filter(t => t.department === 'ENGINEERING' || t.department === 'S_AND_T' || t.department === 'TRD');

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            Multi-Department Cross-Functional Block Coordination Engine
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Groups Engineering (Track), S&T (Signals), and TRD (Traction 25kV OHE) activities sharing spatial isolation perimeters into single integrated shadow block windows
          </p>
        </div>

        <button
          onClick={onTriggerBundle}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs px-4 py-2 rounded-lg border border-indigo-400/30 shadow flex items-center gap-2 cursor-pointer"
        >
          <Zap className="w-4 h-4 fill-white" />
          <span>Execute Spatio-Temporal Joint Bundler</span>
        </button>
      </div>

      {/* Before vs After Visual Comparison Box (PDR Requirement) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <h3 className="text-xs font-bold text-white mb-4 uppercase tracking-wider text-slate-400">
          Downtime Reduction Infographic
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Without Coordination */}
          <div className="bg-slate-950 p-5 rounded-xl border border-rose-900/40 relative">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-rose-400">WITHOUT COORDINATION</span>
              <span className="text-xs font-mono font-bold text-rose-300 bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
                180 Mins Total Track Closure
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              3 distinct uncoordinated department blocks cause cumulative traffic disruption & idle gap overheads:
            </p>

            <div className="space-y-2 text-xs font-mono">
              <div className="bg-blue-950/80 border border-blue-800 p-2.5 rounded text-blue-200 flex justify-between">
                <span>[ENG Track Tamping]</span>
                <span>60 Mins (00:00 - 01:00)</span>
              </div>
              <div className="text-slate-600 text-center text-[10px]">─── 30m Idle Gap ───</div>
              <div className="bg-amber-950/80 border border-amber-800 p-2.5 rounded text-amber-200 flex justify-between">
                <span>[S&T Point Inspection]</span>
                <span>60 Mins (01:30 - 02:30)</span>
              </div>
              <div className="text-slate-600 text-center text-[10px]">─── 30m Idle Gap ───</div>
              <div className="bg-teal-950/80 border border-teal-800 p-2.5 rounded text-teal-200 flex justify-between">
                <span>[TRD OHE Inspection]</span>
                <span>60 Mins (03:00 - 04:00)</span>
              </div>
            </div>
          </div>

          {/* Card 2: With AI Multi-Dept Co-Scheduling */}
          <div className="bg-slate-950 p-5 rounded-xl border border-indigo-500/60 relative shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                WITH AI MULTI-DEPARTMENT CO-SCHEDULING
              </span>
              <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 animate-pulse">
                75 Mins Total Closure
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              1 Integrated Shadow Block with synchronized electrical power cuts and signal isolations:
            </p>

            <div className="bg-indigo-950/90 border-2 border-indigo-500 p-4 rounded-xl text-xs space-y-2.5 shadow-inner">
              <div className="font-bold text-indigo-200 border-b border-indigo-800 pb-2 flex justify-between">
                <span>Integrated Corridor Shadow Window</span>
                <span className="font-mono text-emerald-400">75 Minutes</span>
              </div>

              <div className="pl-3 border-l-2 border-blue-500 text-blue-200 font-mono text-[11px] flex justify-between">
                <span>├─ Engineering: Turnout Tamping</span>
                <span>(00:00 - 01:00)</span>
              </div>
              <div className="pl-3 border-l-2 border-amber-500 text-amber-200 font-mono text-[11px] flex justify-between">
                <span>├─ S&T: Point Interlocking Checks</span>
                <span>(00:15 - 01:05)</span>
              </div>
              <div className="pl-3 border-l-2 border-teal-500 text-teal-200 font-mono text-[11px] flex justify-between">
                <span>└─ TRD: OHE Isolator Maintenance</span>
                <span>(00:05 - 01:15)</span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-emerald-950/50 border border-emerald-800 rounded-lg text-emerald-300 text-xs font-semibold flex items-center justify-between">
              <span>Verified Operational Result:</span>
              <span className="font-mono font-bold text-sm text-emerald-400">{bundlingEfficiencyPct.toFixed(1)}% Reduction in Track Downtime</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Bundled Tasks Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <h3 className="text-xs font-bold text-white mb-4">
          Current Co-Scheduled Department Bundles on Section GZB-ALJN
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {candidateTasks.slice(0, 4).map((task) => (
            <div key={task.task_id} className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-xs">
              <div className="flex justify-between items-center font-mono font-bold text-indigo-400 mb-1">
                <span>{task.task_id}</span>
                <span className="text-[10px] bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded border border-indigo-800">
                  {task.department}
                </span>
              </div>
              <div className="font-semibold text-white mb-2">{task.title}</div>
              <div className="text-slate-400 text-[11px] space-y-1">
                <div>Asset: {task.asset.asset_id} (KM {task.asset.km_post.start})</div>
                <div>Isolation: {task.operational_requirements.isolation_required.join(', ')}</div>
                <div className="font-mono text-emerald-400 pt-1">
                  Window: {formatHour(task.start_hour)} - {formatHour(task.end_hour)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
