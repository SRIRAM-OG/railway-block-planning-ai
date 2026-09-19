import React from 'react';
import { MaintenanceTask, PriorityWeights } from '../../types';
import { Cpu, Sliders, CheckCircle, Info, RotateCcw, Zap } from 'lucide-react';
import { calculatePriorityScore } from '../../utils/priorityEngine';

interface PriorityScoringDrawerProps {
  tasks: MaintenanceTask[];
  weights: PriorityWeights;
  onUpdateWeights: (weights: PriorityWeights) => void;
  selectedTask: MaintenanceTask | null;
  onSelectTask: (task: MaintenanceTask) => void;
}

export const PriorityScoringDrawer: React.FC<PriorityScoringDrawerProps> = ({
  tasks,
  weights,
  onUpdateWeights,
  selectedTask,
  onSelectTask,
}) => {
  const currentTask = selectedTask || tasks[0];

  const currentDecomposition = currentTask
    ? calculatePriorityScore(currentTask, weights)
    : null;

  const handleSliderChange = (key: keyof PriorityWeights, val: number) => {
    const updated = { ...weights, [key]: val };
    onUpdateWeights(updated);
  };

  const resetDefaultWeights = () => {
    onUpdateWeights({
      w_crit: 0.20,
      w_sev: 0.25,
      w_overdue: 0.20,
      w_safety: 0.15,
      w_ops: 0.10,
      w_fail: 0.10
    });
  };

  return (
    <div className="space-y-6">
      {/* Title & Formula Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3 pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="bg-amber-500/20 p-2 rounded-lg border border-amber-500/30">
              <Cpu className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Explainable Multi-Factor Priority Scoring Engine (XGBoost + Additive Model)
              </h2>
              <p className="text-xs text-slate-400">
                Transparent mathematical utility model combining technical severity, safety risk, overdue duration, and failure probability
              </p>
            </div>
          </div>

          <button
            onClick={resetDefaultWeights}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded text-xs border border-slate-700 flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Standard Weights</span>
          </button>
        </div>

        {/* Mathematical Expression Banner */}
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-amber-300 flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-slate-400 font-bold">PDR Formula: </span>
            <span>P = w₁·Crit + w₂·Sev + w₃·Overdue + w₄·Safety + w₅·OpsRisk + w₆·FailProb</span>
          </div>
          <span className="text-slate-500 text-[11px]">Σ wᵢ = 1.00</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Weight Sliders & Recalibration */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <h3 className="text-xs font-bold text-white mb-4 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            Dynamic Multi-Attribute Weight Recalibration
          </h3>

          <div className="space-y-4 text-xs">
            {/* Slider 1: Defect Severity */}
            <div>
              <div className="flex justify-between font-semibold text-slate-300 mb-1">
                <span>w₂: Defect Severity (Technical Tolerance)</span>
                <span className="font-mono text-amber-400">{(weights.w_sev * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.40"
                step="0.05"
                value={weights.w_sev}
                onChange={(e) => handleSliderChange('w_sev', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Slider 2: Asset Criticality */}
            <div>
              <div className="flex justify-between font-semibold text-slate-300 mb-1">
                <span>w₁: Asset Criticality (HDN Line Class)</span>
                <span className="font-mono text-amber-400">{(weights.w_crit * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.40"
                step="0.05"
                value={weights.w_crit}
                onChange={(e) => handleSliderChange('w_crit', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Slider 3: Overdue Duration */}
            <div>
              <div className="flex justify-between font-semibold text-slate-300 mb-1">
                <span>w₃: Maintenance Overdue Duration</span>
                <span className="font-mono text-amber-400">{(weights.w_overdue * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.40"
                step="0.05"
                value={weights.w_overdue}
                onChange={(e) => handleSliderChange('w_overdue', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Slider 4: Safety Risk */}
            <div>
              <div className="flex justify-between font-semibold text-slate-300 mb-1">
                <span>w₄: Safety Vulnerability & Derailment Risk</span>
                <span className="font-mono text-amber-400">{(weights.w_safety * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.40"
                step="0.05"
                value={weights.w_safety}
                onChange={(e) => handleSliderChange('w_safety', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Slider 5: Failure Risk / GMT */}
            <div>
              <div className="flex justify-between font-semibold text-slate-300 mb-1">
                <span>w₆: Failure Risk / Accumulated GMT</span>
                <span className="font-mono text-amber-400">{(weights.w_fail * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.30"
                step="0.05"
                value={weights.w_fail}
                onChange={(e) => handleSliderChange('w_fail', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Slider 6: Ops Impact */}
            <div>
              <div className="flex justify-between font-semibold text-slate-300 mb-1">
                <span>w₅: Operational Impact & Line Capacity</span>
                <span className="font-mono text-amber-400">{(weights.w_ops * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.30"
                step="0.05"
                value={weights.w_ops}
                onChange={(e) => handleSliderChange('w_ops', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Selected Task Score Decomposition Tree */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          {/* Task Selection Dropdown */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-300">Selected Task Breakdown:</span>
            <select
              value={currentTask.task_id}
              onChange={(e) => {
                const found = tasks.find(t => t.task_id === e.target.value);
                if (found) onSelectTask(found);
              }}
              className="bg-slate-950 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded border border-slate-700 focus:outline-none"
            >
              {tasks.map(t => (
                <option key={t.task_id} value={t.task_id}>
                  {t.task_id}: {t.title} ({t.department})
                </option>
              ))}
            </select>
          </div>

          {currentDecomposition && (
            <div className="space-y-4">
              {/* Score Highlight Box */}
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400">Computed AI Priority Score</div>
                  <div className="text-3xl font-black font-mono text-amber-400 mt-0.5">
                    {currentDecomposition.total_score} <span className="text-sm font-normal text-slate-500">/ 100</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-white">{currentTask.title}</div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {currentTask.asset.asset_id} • {currentTask.department}
                  </div>
                </div>
              </div>

              {/* Tree Breakdown Cards */}
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-xs space-y-2">
                <div className="text-slate-400 font-bold border-b border-slate-800 pb-1 mb-2">
                  Priority Score Factor Decomposition Tree:
                </div>

                <div className="flex justify-between items-center text-slate-300">
                  <span>├── Defect Severity (Weight {(weights.w_sev * 100).toFixed(0)}%):</span>
                  <span className="text-amber-400 font-bold">{currentDecomposition.defect_severity_factor.toFixed(1)} / {(100 * weights.w_sev).toFixed(1)}</span>
                </div>

                <div className="flex justify-between items-center text-slate-300">
                  <span>├── Asset Criticality (Weight {(weights.w_crit * 100).toFixed(0)}%):</span>
                  <span className="text-amber-400 font-bold">{currentDecomposition.asset_criticality_factor.toFixed(1)} / {(100 * weights.w_crit).toFixed(1)}</span>
                </div>

                <div className="flex justify-between items-center text-slate-300">
                  <span>├── Overdue Factor (Weight {(weights.w_overdue * 100).toFixed(0)}%):</span>
                  <span className="text-amber-400 font-bold">{currentDecomposition.overdue_factor.toFixed(1)} / {(100 * weights.w_overdue).toFixed(1)}</span>
                </div>

                <div className="flex justify-between items-center text-slate-300">
                  <span>├── Safety Vulnerability (Weight {(weights.w_safety * 100).toFixed(0)}%):</span>
                  <span className="text-amber-400 font-bold">{currentDecomposition.safety_vulnerability_factor.toFixed(1)} / {(100 * weights.w_safety).toFixed(1)}</span>
                </div>

                <div className="flex justify-between items-center text-slate-300">
                  <span>├── Failure Risk / GMT (Weight {(weights.w_fail * 100).toFixed(0)}%):</span>
                  <span className="text-amber-400 font-bold">{currentDecomposition.failure_risk_gmt_factor.toFixed(1)} / {(100 * weights.w_fail).toFixed(1)}</span>
                </div>

                <div className="flex justify-between items-center text-slate-300">
                  <span>└── Ops Impact Factor (Weight {(weights.w_ops * 100).toFixed(0)}%):</span>
                  <span className="text-amber-400 font-bold">{currentDecomposition.ops_impact_factor.toFixed(1)} / {(100 * weights.w_ops).toFixed(1)}</span>
                </div>
              </div>

              {/* Rationale Bullet List */}
              <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800/80 text-xs">
                <div className="font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Explainability Audit Rationale:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  {currentDecomposition.explanation_bullets.map((b, idx) => (
                    <li key={idx}>{b}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
