import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  Layers, 
  TrendingUp, 
  ShieldAlert, 
  Zap, 
  RefreshCw 
} from 'lucide-react';
import { OptimizationScenario } from '../../types';

interface KpiRibbonProps {
  assetAvailabilityPct: number;
  activeBlocksCount: number;
  blockUtilizationPct: number;
  bundlingEfficiencyPct: number;
  activeConflictsCount: number;
  selectedScenario: OptimizationScenario;
  onSelectScenario: (scenId: 'BALANCED' | 'MAX_MAINTENANCE' | 'MIN_DISRUPTION') => void;
  onRunOptimization: () => void;
  onApproveAndPublish: () => void;
  isOptimizing: boolean;
}

export const KpiRibbon: React.FC<KpiRibbonProps> = ({
  assetAvailabilityPct,
  activeBlocksCount,
  blockUtilizationPct,
  bundlingEfficiencyPct,
  activeConflictsCount,
  selectedScenario,
  onSelectScenario,
  onRunOptimization,
  onApproveAndPublish,
  isOptimizing,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg mb-6 backdrop-blur-sm">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
        {/* Metric 1: Asset Availability */}
        <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Asset Availability</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-emerald-400 tracking-tight">
              {assetAvailabilityPct.toFixed(1)}%
            </span>
            <span className="text-[10px] text-emerald-500 font-medium bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800">
              Target: 95.0%
            </span>
          </div>
        </div>

        {/* Metric 2: Active & Scheduled Blocks */}
        <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Active / Planned Blocks</span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-blue-400 tracking-tight">
              {activeBlocksCount}
            </span>
            <span className="text-[10px] text-blue-400 font-medium bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-800">
              6 Corridors
            </span>
          </div>
        </div>

        {/* Metric 3: Block Utilization */}
        <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Block Utilization Rate</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-amber-400 tracking-tight">
              {blockUtilizationPct.toFixed(1)}%
            </span>
            <span className="text-[10px] text-amber-400 font-medium bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800">
              High Yield
            </span>
          </div>
        </div>

        {/* Metric 4: Bundling Efficiency */}
        <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Multi-Dept Bundling</span>
            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-indigo-400 tracking-tight">
              {bundlingEfficiencyPct.toFixed(1)}%
            </span>
            <span className="text-[10px] text-indigo-300 font-medium bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-800">
              -105m Saved
            </span>
          </div>
        </div>

        {/* Metric 5: Active Conflicts */}
        <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Traffic Conflicts</span>
            <ShieldAlert className={`w-4 h-4 ${activeConflictsCount > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-500'}`} />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className={`text-2xl font-black font-mono tracking-tight ${activeConflictsCount > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
              {activeConflictsCount}
            </span>
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${
              activeConflictsCount > 0 ? 'bg-rose-950/60 text-rose-300 border-rose-800' : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}>
              {activeConflictsCount > 0 ? 'Action Needed' : 'Clear'}
            </span>
          </div>
        </div>

        {/* Metric 6: Current Plan Mode */}
        <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>AI Scenario Mode</span>
            <span className="text-xs font-mono font-bold text-cyan-400">[AI OPTIMIZED]</span>
          </div>
          <div className="mt-1">
            <select
              value={selectedScenario.id}
              onChange={(e) => onSelectScenario(e.target.value as any)}
              className="w-full bg-slate-900 text-slate-200 text-xs font-semibold py-1 px-2 rounded border border-slate-700 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="BALANCED">Balanced AI Mode</option>
              <option value="MAX_MAINTENANCE">Max Maintenance</option>
              <option value="MIN_DISRUPTION">Min Delay Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Control Actions Bar */}
      <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <span className="font-semibold text-slate-300">PDR-26027 State Engine:</span>
          <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 font-mono">
            {selectedScenario.name}
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onRunOptimization}
            disabled={isOptimizing}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-2 rounded-lg font-semibold text-xs shadow-md transition-all border border-blue-400/30 disabled:opacity-50 cursor-pointer"
          >
            {isOptimizing ? (
              <RefreshCw className="w-4 h-4 animate-spin text-blue-200" />
            ) : (
              <Play className="w-4 h-4 fill-white" />
            )}
            <span>{isOptimizing ? 'Solving CP-SAT Constraints...' : 'Run AI Optimization Engine'}</span>
          </button>

          <button
            onClick={onApproveAndPublish}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-semibold text-xs shadow-md transition-all border border-emerald-400/30 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Approve & Publish Schedule</span>
          </button>
        </div>
      </div>
    </div>
  );
};
