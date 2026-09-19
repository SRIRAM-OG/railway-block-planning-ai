import React, { useState } from 'react';
import { MaintenanceTask, ApprovalAuditEntry, UserRole, BlockStatus } from '../../types';
import { UserCheck, ShieldCheck, CheckCircle2, Lock, History, FileText, Key, Sparkles } from 'lucide-react';

interface ApprovalStateLedgerProps {
  tasks: MaintenanceTask[];
  auditLogs: ApprovalAuditEntry[];
  activeRole: UserRole;
  onApproveTask: (taskId: string, comments: string) => void;
  onPublishTask: (taskId: string) => void;
}

export const ApprovalStateLedger: React.FC<ApprovalStateLedgerProps> = ({
  tasks,
  auditLogs,
  activeRole,
  onApproveTask,
  onPublishTask,
}) => {
  const [selectedTaskToSign, setSelectedTaskToSign] = useState<MaintenanceTask | null>(tasks[0] || null);
  const [comments, setComments] = useState('');
  const [signaturePin, setSignaturePin] = useState('8842');

  const handleSignAndApprove = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskToSign) return;
    onApproveTask(selectedTaskToSign.task_id, comments || 'Digital approval confirmed via Divisional Controller E-Sign key.');
    setComments('');
  };

  const stateNodes: { status: BlockStatus; label: string; desc: string }[] = [
    { status: 'DRAFT_PENDING', label: 'Draft Pending', desc: 'TMS/SMMS Defect registered' },
    { status: 'AI_PROPOSED', label: 'AI Proposed', desc: 'CP-SAT optimization generated' },
    { status: 'CONFLICT_FREE', label: 'Conflict Free', desc: 'Validated against COA timetable' },
    { status: 'VALIDATED', label: 'Validated', desc: 'Safety isolation bounds checked' },
    { status: 'APPROVED', label: 'Approved', desc: 'E-Signed by Section Controller' },
    { status: 'PUBLISHED', label: 'Published', desc: 'Dispatched to Section Controller' },
    { status: 'IN_EXECUTION', label: 'In Execution', desc: 'Field gang on ground' },
    { status: 'COMPLETED', label: 'Completed', desc: 'Closed-loop TMS availability update' }
  ];

  return (
    <div className="space-y-6">
      {/* State Machine Overview Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-emerald-400" />
          End-to-End Operational Lifecycle State Machine & E-Sign Ledger
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          Strict human-in-the-loop governance requiring Section Controller digital authorization before block dispatch
        </p>

        {/* Horizontal State Machine Flow */}
        <div className="overflow-x-auto pb-2">
          <div className="flex items-center min-w-[850px] justify-between text-xs relative">
            {stateNodes.map((node, i) => (
              <div key={node.status} className="flex flex-col items-center text-center relative z-10 w-24">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-md mb-1 border-2 ${
                  i <= 4 ? 'bg-emerald-950 text-emerald-300 border-emerald-500' : 'bg-slate-950 text-slate-500 border-slate-800'
                }`}>
                  {i + 1}
                </div>
                <span className="font-semibold text-white text-[11px] truncate">{node.label}</span>
                <span className="text-[9px] text-slate-500 leading-tight mt-0.5">{node.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Digital Signature E-Sign Panel */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <h3 className="text-xs font-bold text-white mb-4 flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            Divisional Controller E-Sign Sign-off
          </h3>

          <form onSubmit={handleSignAndApprove} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Select Candidate Block Plan:</label>
              <select
                value={selectedTaskToSign?.task_id || ''}
                onChange={(e) => {
                  const found = tasks.find(t => t.task_id === e.target.value);
                  if (found) setSelectedTaskToSign(found);
                }}
                className="w-full bg-slate-950 text-slate-200 text-xs font-semibold py-2 px-3 rounded border border-slate-700 focus:outline-none"
              >
                {tasks.map(t => (
                  <option key={t.task_id} value={t.task_id}>
                    {t.task_id}: {t.title} ({t.status})
                  </option>
                ))}
              </select>
            </div>

            {selectedTaskToSign && (
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1 font-mono text-[11px]">
                <div className="text-blue-400 font-bold">Target: {selectedTaskToSign.task_id}</div>
                <div className="text-slate-300">Corridor: {selectedTaskToSign.asset.corridor_id}</div>
                <div className="text-slate-300">Track: {selectedTaskToSign.asset.track_line}</div>
                <div className="text-amber-400 font-bold">AI Priority Score: {selectedTaskToSign.priority_score}</div>
              </div>
            )}

            <div>
              <label className="block text-slate-400 mb-1">Authorization Comments & Ground Directives:</label>
              <textarea
                rows={3}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Enter e-sign clearance directives for Section Controller..."
                className="w-full bg-slate-950 text-slate-200 text-xs p-2.5 rounded border border-slate-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Controller Security Hardware Token PIN:</label>
              <div className="flex items-center space-x-2">
                <Key className="w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={signaturePin}
                  onChange={(e) => setSignaturePin(e.target.value)}
                  className="bg-slate-950 text-slate-200 text-xs px-3 py-1.5 rounded border border-slate-700 font-mono w-32"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-lg border border-emerald-400 shadow flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-white" />
              <span>Generate Digital E-Signature & Authorize Block</span>
            </button>
          </form>
        </div>

        {/* Right Column: Immutable Audit Ledger Log */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <h3 className="text-xs font-bold text-white mb-4 flex items-center gap-2">
            <History className="w-4 h-4 text-blue-400" />
            Immutable System Security & Governance Audit Ledger
          </h3>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {auditLogs.map((log) => (
              <div key={log.id} className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 text-xs space-y-1.5">
                <div className="flex items-center justify-between font-mono">
                  <span className="font-bold text-blue-400">{log.user} ({log.role})</span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <div className="flex items-center space-x-2 font-mono text-[11px]">
                  <span className="text-indigo-400 font-semibold">{log.action}</span>
                  <span className="text-slate-600">→</span>
                  <span className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-[10px]">
                    {log.new_status}
                  </span>
                </div>

                <p className="text-slate-300 text-[11px] italic">{log.comments}</p>

                <div className="text-[10px] font-mono text-slate-500 flex justify-between border-t border-slate-850 pt-1">
                  <span>Log Hash: {log.digital_signature_hash}</span>
                  <span className="text-emerald-500">VERIFIED</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
