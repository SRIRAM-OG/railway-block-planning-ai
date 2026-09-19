import React, { useState } from 'react';
import { MaintenanceTask, SourceSystem } from '../../types';
import { Database, Activity, Code, Eye, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';

interface UnifiedDefectFeedProps {
  tasks: MaintenanceTask[];
  onAddSimulatedDefect: () => void;
}

export const UnifiedDefectFeed: React.FC<UnifiedDefectFeedProps> = ({
  tasks,
  onAddSimulatedDefect,
}) => {
  const [selectedSource, setSelectedSource] = useState<SourceSystem | 'ALL'>('ALL');
  const [inspectingTask, setInspectingTask] = useState<MaintenanceTask | null>(tasks[0] || null);

  const filteredTasks = tasks.filter(t => selectedSource === 'ALL' || t.source_system === selectedSource);

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-400" />
            Ingestion & Canonical Master Asset Data Streams (PDR-26027)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Standardized ETL pipelines from legacy silos: TMS (Track), SMMS (Signals), TDMS (Traction 25kV OHE), COA (Traffic Timetables)
          </p>
        </div>

        <button
          onClick={onAddSimulatedDefect}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-3.5 py-2 rounded-lg border border-indigo-400 shadow flex items-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Simulate Live Ingestion Stream Event</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Stream Items List */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          {/* Source Tabs */}
          <div className="flex items-center space-x-2 pb-3 mb-4 border-b border-slate-800 text-xs overflow-x-auto">
            <button
              onClick={() => setSelectedSource('ALL')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                selectedSource === 'ALL' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              All Ingested Streams ({tasks.length})
            </button>
            <button
              onClick={() => setSelectedSource('TMS')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                selectedSource === 'TMS' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              TMS Track
            </button>
            <button
              onClick={() => setSelectedSource('SMMS')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                selectedSource === 'SMMS' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              SMMS Signals
            </button>
            <button
              onClick={() => setSelectedSource('TDMS')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                selectedSource === 'TDMS' ? 'bg-teal-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              TDMS Traction
            </button>
          </div>

          {/* Cards List */}
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {filteredTasks.map((t) => (
              <div
                key={t.task_id}
                onClick={() => setInspectingTask(t)}
                className={`p-4 rounded-lg border transition-all cursor-pointer ${
                  inspectingTask?.task_id === t.task_id
                    ? 'bg-slate-800/90 border-indigo-500 shadow-lg'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-xs text-indigo-400">{t.task_id}</span>
                    <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                      SYSTEM: {t.source_system}
                    </span>
                    <span className="text-[10px] font-bold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800">
                      {t.defect.severity}
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-500 font-mono">
                    Overdue: {t.defect.overdue_days} Days
                  </span>
                </div>

                <h4 className="text-xs font-bold text-white mb-1">{t.title}</h4>

                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mt-2 pt-2 border-t border-slate-800/60">
                  <span>Asset: {t.asset.asset_id}</span>
                  <span>KM {t.asset.km_post.start}-{t.asset.km_post.end}</span>
                  <span className="text-indigo-400 font-bold">Score: {t.priority_score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Canonical JSON Viewer */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
            <h3 className="text-xs font-bold text-white flex items-center gap-2">
              <Code className="w-4 h-4 text-emerald-400" />
              Canonical Normalized Schema
            </h3>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              Validated JSON
            </span>
          </div>

          {inspectingTask ? (
            <pre className="bg-slate-950 p-4 rounded-lg text-emerald-300 font-mono text-[11px] overflow-x-auto max-h-[480px] border border-slate-800 leading-relaxed">
{JSON.stringify({
  task_id: inspectingTask.task_id,
  source_system: inspectingTask.source_system,
  department: inspectingTask.department,
  asset: {
    asset_id: inspectingTask.asset.asset_id,
    asset_type: inspectingTask.asset.asset_type,
    corridor_id: inspectingTask.asset.corridor_id,
    section: inspectingTask.asset.section,
    km_post: inspectingTask.asset.km_post,
    criticality_class: inspectingTask.asset.criticality_class
  },
  defect: {
    code: inspectingTask.defect.code,
    severity: inspectingTask.defect.severity,
    overdue_days: inspectingTask.defect.overdue_days,
    reported_timestamp: inspectingTask.defect.reported_timestamp,
    gmt_accumulated: inspectingTask.defect.gmt_accumulated,
    failure_probability_pct: inspectingTask.defect.failure_probability_pct
  },
  operational_requirements: inspectingTask.operational_requirements
}, null, 2)}
            </pre>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              Select a task from the stream list to inspect canonical JSON.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
