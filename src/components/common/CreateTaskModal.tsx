import React, { useState } from 'react';
import { X, Plus, Wrench, AlertCircle } from 'lucide-react';
import { CorridorInfo } from '../../types';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (task: any) => void;
  corridors: CorridorInfo[];
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose, onCreateTask, corridors }) => {
  const [formData, setFormData] = useState({
    title: '',
    department: 'ENGINEERING',
    source_system: 'TMS',
    severity: 'MEDIUM',
    overdue_days: 0,
    corridor_id: corridors[0]?.id || '',
    track_line: 'DN Main',
    km_start: 48.0,
    km_end: 48.5,
    criticality_class: 'A',
    asset_type: 'TRACK_SECTION',
    defect_code: '',
    defect_title: '',
    min_block_minutes: 60,
    start_hour: 2.0,
    end_hour: 4.0,
    impact_level: 'Med',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.title.trim()) e.title = 'Task title is required';
    if (!formData.defect_title.trim()) e.defect_title = 'Defect description is required';
    if (formData.start_hour >= formData.end_hour) e.time = 'End time must be after start time';
    if (formData.km_start >= formData.km_end) e.km = 'End KM must be after start KM';
    if (formData.min_block_minutes < 15) e.duration = 'Minimum block duration must be at least 15 minutes';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onCreateTask({
        title: formData.title,
        department: formData.department,
        source_system: formData.source_system,
        asset: {
          asset_id: `AST-${Date.now().toString(36).toUpperCase()}`,
          asset_type: formData.asset_type,
          corridor_id: formData.corridor_id,
          section: corridors.find(c => c.id === formData.corridor_id)?.code || 'GZB-ALJN',
          km_post: { start: formData.km_start, end: formData.km_end },
          criticality_class: formData.criticality_class,
          track_line: formData.track_line,
        },
        defect: {
          code: formData.defect_code || formData.title.toUpperCase().replace(/\s+/g, '_').substring(0, 30),
          title: formData.defect_title,
          severity: formData.severity,
          overdue_days: formData.overdue_days,
          reported_timestamp: new Date().toISOString(),
          gmt_accumulated: 30,
          failure_probability_pct: formData.severity === 'CRITICAL' ? 85 : formData.severity === 'HIGH' ? 65 : 40,
        },
        operational_requirements: {
          min_block_duration_minutes: formData.min_block_minutes,
          isolation_required: formData.department === 'TRD' ? ['OHE_POWER_CUT'] : ['SIGNAL_DISCONNECTION'],
          manpower_teams: [`${formData.department}_TEAM_01`],
          speed_restriction_on_completion_kmh: 75,
        },
        start_hour: formData.start_hour,
        end_hour: formData.end_hour,
        status: 'DRAFT_PENDING',
        impact_level: formData.impact_level,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
    <div>
      <label className="block text-[11px] text-slate-400 mb-1 font-medium">{label}</label>
      {children}
      {error && <p className="text-rose-400 text-[10px] mt-0.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
    </div>
  );

  const inputClass = "w-full bg-slate-950 text-slate-200 text-xs px-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500 transition-colors";
  const selectClass = inputClass + " cursor-pointer";

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="bg-emerald-600/20 p-2 rounded-lg border border-emerald-500/30">
              <Plus className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Create Maintenance Task</h3>
              <p className="text-[11px] text-slate-400">Register new defect or maintenance requirement</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white bg-slate-800 p-1.5 rounded-lg border border-slate-700 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Task Title *" error={errors.title}>
              <input type="text" value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} placeholder="e.g., Track Tamping & Screening" className={inputClass} />
            </Field>
            <Field label="Department *">
              <select value={formData.department} onChange={e => setFormData(p => ({ ...p, department: e.target.value }))} className={selectClass}>
                <option value="ENGINEERING">Engineering (Track)</option>
                <option value="S_AND_T">S&T (Signals)</option>
                <option value="TRD">TRD (Traction)</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Source System">
              <select value={formData.source_system} onChange={e => setFormData(p => ({ ...p, source_system: e.target.value }))} className={selectClass}>
                <option value="TMS">TMS (Track)</option>
                <option value="SMMS">SMMS (Signals)</option>
                <option value="TDMS">TDMS (Traction)</option>
                <option value="COA">COA (Traffic)</option>
              </select>
            </Field>
            <Field label="Defect Severity">
              <select value={formData.severity} onChange={e => setFormData(p => ({ ...p, severity: e.target.value }))} className={selectClass}>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </Field>
            <Field label="Impact Level">
              <select value={formData.impact_level} onChange={e => setFormData(p => ({ ...p, impact_level: e.target.value }))} className={selectClass}>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Med">Medium</option>
                <option value="Low">Low</option>
              </select>
            </Field>
          </div>

          <Field label="Defect Description *" error={errors.defect_title}>
            <input type="text" value={formData.defect_title} onChange={e => setFormData(p => ({ ...p, defect_title: e.target.value }))} placeholder="e.g., TGI Exceedance & Ballast Fouling" className={inputClass} />
          </Field>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Field label="Corridor">
              <select value={formData.corridor_id} onChange={e => setFormData(p => ({ ...p, corridor_id: e.target.value }))} className={selectClass}>
                {corridors.map(c => <option key={c.id} value={c.id}>{c.code}</option>)}
              </select>
            </Field>
            <Field label="Track Line">
              <select value={formData.track_line} onChange={e => setFormData(p => ({ ...p, track_line: e.target.value }))} className={selectClass}>
                <option value="DN Main">DN Main</option>
                <option value="UP Main">UP Main</option>
                <option value="Loop Line 1">Loop Line 1</option>
              </select>
            </Field>
            <Field label="KM Start" error={errors.km}>
              <input type="number" step="0.1" value={formData.km_start} onChange={e => setFormData(p => ({ ...p, km_start: parseFloat(e.target.value) }))} className={inputClass} />
            </Field>
            <Field label="KM End">
              <input type="number" step="0.1" value={formData.km_end} onChange={e => setFormData(p => ({ ...p, km_end: parseFloat(e.target.value) }))} className={inputClass} />
            </Field>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Field label="Start Hour (0-24)" error={errors.time}>
              <input type="number" step="0.25" min="0" max="24" value={formData.start_hour} onChange={e => setFormData(p => ({ ...p, start_hour: parseFloat(e.target.value) }))} className={inputClass} />
            </Field>
            <Field label="End Hour (0-24)">
              <input type="number" step="0.25" min="0" max="24" value={formData.end_hour} onChange={e => setFormData(p => ({ ...p, end_hour: parseFloat(e.target.value) }))} className={inputClass} />
            </Field>
            <Field label="Min Block (mins)" error={errors.duration}>
              <input type="number" min="15" value={formData.min_block_minutes} onChange={e => setFormData(p => ({ ...p, min_block_minutes: parseInt(e.target.value) }))} className={inputClass} />
            </Field>
            <Field label="Overdue Days">
              <input type="number" min="0" value={formData.overdue_days} onChange={e => setFormData(p => ({ ...p, overdue_days: parseInt(e.target.value) }))} className={inputClass} />
            </Field>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 cursor-pointer transition-all">Cancel</button>
          <button onClick={handleSubmit} disabled={submitting} className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 border border-emerald-400 shadow cursor-pointer transition-all disabled:opacity-50 flex items-center gap-2">
            {submitting ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Wrench className="w-3.5 h-3.5" />}
            <span>{submitting ? 'Creating...' : 'Create Task'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
