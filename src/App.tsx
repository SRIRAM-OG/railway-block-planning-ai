import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ViewTab,
  UserRole,
  CorridorInfo,
  MaintenanceTask,
  ScheduledTrain,
  ConflictRecord,
  OptimizationScenario,
  PriorityWeights,
  ApprovalAuditEntry,
  BlockStatus
} from './types';
import { SCENARIOS, DEFAULT_PRIORITY_WEIGHTS } from './data/mockData';
import { calculatePriorityScore } from './utils/priorityEngine';
import { detectConflicts } from './utils/optimizerEngine';
import * as api from './services/api';

// Components
import { HeaderNavbar } from './components/common/HeaderNavbar';
import { KpiRibbon } from './components/command/KpiRibbon';
import { CorridorGanttTimeline } from './components/timeline/CorridorGanttTimeline';
import { ScheduleTable } from './components/timeline/ScheduleTable';
import { UnifiedDefectFeed } from './components/ingestion/UnifiedDefectFeed';
import { PriorityScoringDrawer } from './components/intelligence/PriorityScoringDrawer';
import { MultiDeptBundler } from './components/coordination/MultiDeptBundler';
import { ApprovalStateLedger } from './components/workflow/ApprovalStateLedger';
import { WeeklyMonthlyPlanner } from './components/planning/WeeklyMonthlyPlanner';
import { AvailabilityAnalytics } from './components/analytics/AvailabilityAnalytics';
import { PdrArchitectureModal } from './components/docs/PdrArchitectureModal';
import { GeminiAssistantModal } from './components/ai/GeminiAssistantModal';
import { TaskInspectDrawer } from './components/timeline/TaskInspectDrawer';
import { NotificationPanel } from './components/common/NotificationPanel';
import { CreateTaskModal } from './components/common/CreateTaskModal';

export default function App() {
  // === UI State ===
  const [activeTab, setActiveTab] = useState<ViewTab>('COMMAND_CENTER');
  const [activeRole, setActiveRole] = useState<UserRole>('SECTION_CONTROLLER');
  const [selectedTaskForDrawer, setSelectedTaskForDrawer] = useState<MaintenanceTask | null>(null);
  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState(false);
  const [isGeminiModalOpen, setIsGeminiModalOpen] = useState(false);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [prevTab, setPrevTab] = useState<ViewTab>('COMMAND_CENTER');
  const [tabTransition, setTabTransition] = useState(false);

  // === Data State (API-backed) ===
  const [corridors, setCorridors] = useState<CorridorInfo[]>([]);
  const [selectedCorridor, setSelectedCorridor] = useState<CorridorInfo | null>(null);
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [trains, setTrains] = useState<ScheduledTrain[]>([]);
  const [conflicts, setConflicts] = useState<ConflictRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<ApprovalAuditEntry[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [priorityWeights, setPriorityWeights] = useState<PriorityWeights>(DEFAULT_PRIORITY_WEIGHTS);
  const [selectedScenario, setSelectedScenario] = useState<OptimizationScenario>(SCENARIOS[0]);

  // === Loading / Error State ===
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Toast auto-dismiss
  useEffect(() => {
    if (toastMessage) {
      const t = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toastMessage]);

  // === Initial Data Load ===
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [corData, taskData, trainData, auditData, notifData] = await Promise.all([
        api.fetchCorridors(),
        api.fetchTasks(),
        api.fetchTrains(),
        api.fetchAuditLogs(),
        api.fetchNotifications(),
      ]);

      setCorridors(corData);
      if (corData.length > 0 && !selectedCorridor) setSelectedCorridor(corData[0]);
      setTasks(taskData);
      setTrains(trainData);
      setAuditLogs(auditData);
      setNotifications(notifData);

      // Detect conflicts client-side
      const detectedConflicts = detectConflicts(taskData, trainData);
      setConflicts(detectedConflicts);
    } catch (err: any) {
      console.error('Failed to load data:', err);
      setError(err.message || 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // === Recalculate Priority Scores ===
  useEffect(() => {
    if (tasks.length === 0) return;
    setTasks(prevTasks =>
      prevTasks.map(t => {
        const decomp = calculatePriorityScore(t, priorityWeights);
        return { ...t, priority_score: decomp.total_score, priority_decomposition: decomp };
      })
    );
  }, [priorityWeights]);

  // === Recalculate Conflicts ===
  useEffect(() => {
    if (tasks.length === 0 || trains.length === 0) return;
    const updatedConflicts = detectConflicts(tasks, trains);
    setConflicts(updatedConflicts);
  }, [tasks, trains]);

  // Tab transition
  const handleTabChange = (tab: ViewTab) => {
    if (tab === activeTab) return;
    setPrevTab(activeTab);
    setTabTransition(true);
    setTimeout(() => {
      setActiveTab(tab);
      setTimeout(() => setTabTransition(false), 50);
    }, 150);
  };

  // === Run AI Optimization (API) ===
  const handleRunOptimization = async () => {
    setIsOptimizing(true);
    try {
      const result = await api.runOptimization();
      setTasks(result.tasks);
      setConflicts(result.conflicts);
      setToastMessage({ text: `AI Optimization complete. ${result.metrics.conflictsDetected} conflicts detected. ${result.metrics.bundlingEfficiencyPct}% downtime reduction.`, type: 'success' });

      // Reload audit logs
      const auditData = await api.fetchAuditLogs();
      setAuditLogs(auditData);
    } catch (err: any) {
      setToastMessage({ text: `Optimization failed: ${err.message}`, type: 'error' });
    } finally {
      setIsOptimizing(false);
    }
  };

  // === Resolve Conflict (API) ===
  const handleResolveConflict = async (conflictId: string) => {
    try {
      const result = await api.resolveConflict(conflictId);
      setTasks(result.tasks);
      setConflicts(result.conflicts);
      setToastMessage({ text: 'Conflict resolved and schedule updated.', type: 'success' });
      const auditData = await api.fetchAuditLogs();
      setAuditLogs(auditData);
    } catch (err: any) {
      setToastMessage({ text: `Failed to resolve conflict: ${err.message}`, type: 'error' });
    }
  };

  // === Update Task Time (API) ===
  const handleUpdateTaskTime = async (taskId: string, startHour: number, endHour: number) => {
    try {
      const updated = await api.updateTask(taskId, { start_hour: startHour, end_hour: endHour, status: 'MODIFIED_USER' });
      setTasks(prev => prev.map(t => t.task_id === taskId ? updated : t));
      setToastMessage({ text: `${taskId} rescheduled successfully.`, type: 'success' });
    } catch (err: any) {
      setToastMessage({ text: `Failed to update ${taskId}: ${err.message}`, type: 'error' });
    }
  };

  // === Change Task Status (API) ===
  const handleStatusChange = async (taskId: string, newStatus: BlockStatus) => {
    try {
      const updated = await api.updateTask(taskId, { status: newStatus });
      setTasks(prev => prev.map(t => t.task_id === taskId ? updated : t));
      setToastMessage({ text: `${taskId} status → ${newStatus}`, type: 'info' });
    } catch (err: any) {
      setToastMessage({ text: `Failed to update status: ${err.message}`, type: 'error' });
    }
  };

  // === Approve & Publish (API) ===
  const handleApproveAndPublish = async () => {
    try {
      const updates = tasks
        .filter(t => t.status !== 'COMPLETED')
        .map(t => ({ ...t, status: 'PUBLISHED' as BlockStatus }));
      const result = await api.bulkUpdateTasks(updates);
      setTasks(result);

      await api.createAuditLog({
        user: `${activeRole} (Official Dispatcher)`,
        role: activeRole,
        action: 'APPROVE_AND_PUBLISH',
        previous_status: 'VALIDATED',
        new_status: 'PUBLISHED',
        comments: 'Schedule approved and dispatched to COA Section Controller for field execution.',
      });

      const auditData = await api.fetchAuditLogs();
      setAuditLogs(auditData);
      setToastMessage({ text: 'Schedule approved and published successfully.', type: 'success' });
    } catch (err: any) {
      setToastMessage({ text: `Failed to publish: ${err.message}`, type: 'error' });
    }
  };

  // === Add Simulated Defect (API) ===
  const handleAddSimulatedDefect = async () => {
    try {
      const newTask = await api.createTask({
        source_system: 'TMS',
        department: 'ENGINEERING',
        title: 'Emergency Rail Joint Inspection & Sleeper Tightening',
        asset: {
          asset_id: `TRK-BL-${110 + tasks.length}-DN`,
          asset_type: 'RAIL_JOINT',
          corridor_id: selectedCorridor?.id || 'COR-GZB-ALJN',
          section: 'GZB-ALJN',
          km_post: { start: 49.100, end: 49.300 },
          criticality_class: 'A',
          track_line: 'DN Main'
        },
        defect: {
          code: 'RAIL_JOINT_GAP_EXCEEDANCE',
          title: 'Thermal Rail Joint Gap Exceedance (18mm)',
          severity: 'HIGH',
          overdue_days: 5,
          reported_timestamp: new Date().toISOString(),
          gmt_accumulated: 34.0,
          failure_probability_pct: 62
        },
        operational_requirements: {
          min_block_duration_minutes: 60,
          isolation_required: ['SIGNAL_DISCONNECTION'],
          manpower_teams: ['PW_GANG_05'],
          speed_restriction_on_completion_kmh: 60
        },
        priority_score: 82.5,
        priority_decomposition: {
          total_score: 82.5,
          asset_criticality_factor: 20.0,
          defect_severity_factor: 20.0,
          overdue_factor: 15.0,
          safety_vulnerability_factor: 13.5,
          failure_risk_gmt_factor: 7.0,
          ops_impact_factor: 7.0,
          explanation_bullets: ['Real-time streaming ingestion defect record registered from USFD vehicle']
        },
        start_hour: 17.0,
        end_hour: 18.0,
        status: 'DRAFT_PENDING',
        impact_level: 'High'
      });
      setTasks(prev => [newTask, ...prev]);
      setToastMessage({ text: `New defect ${newTask.task_id} ingested from live stream.`, type: 'info' });
    } catch (err: any) {
      setToastMessage({ text: `Failed to create defect: ${err.message}`, type: 'error' });
    }
  };

  // === Create Task from Modal (API) ===
  const handleCreateTask = async (taskData: any) => {
    try {
      const newTask = await api.createTask(taskData);
      setTasks(prev => [newTask, ...prev]);
      setIsCreateTaskModalOpen(false);
      setToastMessage({ text: `Task ${newTask.task_id} created successfully.`, type: 'success' });
    } catch (err: any) {
      setToastMessage({ text: `Failed to create task: ${err.message}`, type: 'error' });
    }
  };

  // === Computed Metrics ===
  const activeConflictsCount = conflicts.filter(c => !c.is_resolved).length;
  const activeBlocksCount = tasks.filter(t => t.status !== 'COMPLETED').length;

  const totalBlockMinutes = tasks.reduce((a, t) => a + (t.end_hour - t.start_hour) * 60, 0);
  const blockUtilizationPct = totalBlockMinutes > 0 ? Math.min(99, parseFloat((totalBlockMinutes / (24 * 60) * 100 * 1.5).toFixed(1))) : 0;

  const deptGroups: { [key: string]: MaintenanceTask[] } = {};
  for (const t of tasks) {
    const key = `${t.asset.track_line}_${Math.floor(t.asset.km_post?.start || 0)}`;
    if (!deptGroups[key]) deptGroups[key] = [];
    deptGroups[key].push(t);
  }
  let totalOrig = 0, savedMin = 0;
  for (const k in deptGroups) {
    const grp = deptGroups[k];
    totalOrig += grp.reduce((a, t) => a + (t.end_hour - t.start_hour) * 60, 0);
    if (grp.length > 1) {
      const minS = Math.min(...grp.map(t => t.start_hour));
      const maxE = Math.max(...grp.map(t => t.end_hour));
      const sep = grp.reduce((a, t) => a + (t.end_hour - t.start_hour) * 60, 0);
      savedMin += Math.max(0, sep - (maxE - minS) * 60);
    }
  }
  const bundlingEfficiencyPct = totalOrig > 0 ? parseFloat(((savedMin / totalOrig) * 100).toFixed(1)) : 0;

  // === Loading Screen ===
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="text-white font-bold text-lg">Initializing AI Platform</div>
          <div className="text-slate-400 text-sm">Connecting to database & loading corridor data...</div>
        </div>
      </div>
    );
  }

  // === Error Screen ===
  if (error && corridors.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="bg-slate-900 border border-rose-800 rounded-xl p-8 max-w-md text-center space-y-4">
          <div className="text-rose-400 text-4xl">⚠</div>
          <div className="text-white font-bold text-lg">Connection Error</div>
          <p className="text-slate-400 text-sm">{error}</p>
          <button onClick={loadData} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-bold transition-all">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const currentCorridor = selectedCorridor || corridors[0];
  if (!currentCorridor) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500 selection:text-white flex flex-col">
      {/* Top Navbar */}
      <HeaderNavbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        selectedCorridor={currentCorridor}
        corridors={corridors}
        setSelectedCorridor={setSelectedCorridor}
        activeConflictsCount={activeConflictsCount}
        onOpenArchitectureModal={() => setIsArchitectureModalOpen(true)}
        onOpenGeminiAssistant={() => setIsGeminiModalOpen(true)}
        notifications={notifications}
        onMarkNotificationRead={async (id) => { await api.markNotificationRead(id); setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n)); }}
        onMarkAllRead={async () => { await api.markAllNotificationsRead(); setNotifications(prev => prev.map(n => ({ ...n, is_read: true }))); }}
        onNavigateTab={handleTabChange}
        onOpenCreateTask={() => setIsCreateTaskModalOpen(true)}
      />

      {/* Main Operational Container */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6">
        {/* Executive KPI Ribbon */}
        <KpiRibbon
          assetAvailabilityPct={currentCorridor.asset_availability_pct}
          activeBlocksCount={activeBlocksCount}
          blockUtilizationPct={blockUtilizationPct}
          bundlingEfficiencyPct={bundlingEfficiencyPct}
          activeConflictsCount={activeConflictsCount}
          selectedScenario={selectedScenario}
          onSelectScenario={(scenId) => {
            const found = SCENARIOS.find(s => s.id === scenId);
            if (found) setSelectedScenario(found);
          }}
          onRunOptimization={handleRunOptimization}
          onApproveAndPublish={handleApproveAndPublish}
          isOptimizing={isOptimizing}
        />

        {/* Tab Views with transition */}
        <div className={`transition-all duration-200 ${tabTransition ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
          {activeTab === 'COMMAND_CENTER' && (
            <div className="space-y-6 animate-fadeIn">
              <CorridorGanttTimeline
                tasks={tasks} trains={trains} conflicts={conflicts}
                onSelectTask={setSelectedTaskForDrawer}
                onResolveConflict={handleResolveConflict}
                onUpdateTaskTime={handleUpdateTaskTime}
              />
              <ScheduleTable
                tasks={tasks} onSelectTask={setSelectedTaskForDrawer}
                onStatusChange={handleStatusChange}
              />
            </div>
          )}

          {activeTab === 'CORRIDOR_GANTT' && (
            <div className="animate-fadeIn">
              <CorridorGanttTimeline
                tasks={tasks} trains={trains} conflicts={conflicts}
                onSelectTask={setSelectedTaskForDrawer}
                onResolveConflict={handleResolveConflict}
                onUpdateTaskTime={handleUpdateTaskTime}
              />
            </div>
          )}

          {activeTab === 'INGESTION_STREAM' && (
            <div className="animate-fadeIn">
              <UnifiedDefectFeed tasks={tasks} onAddSimulatedDefect={handleAddSimulatedDefect} />
            </div>
          )}

          {activeTab === 'PRIORITY_AI' && (
            <div className="animate-fadeIn">
              <PriorityScoringDrawer
                tasks={tasks} weights={priorityWeights}
                onUpdateWeights={setPriorityWeights}
                selectedTask={selectedTaskForDrawer} onSelectTask={setSelectedTaskForDrawer}
              />
            </div>
          )}

          {activeTab === 'MULTI_DEPT_BUNDLE' && (
            <div className="animate-fadeIn">
              <MultiDeptBundler
                tasks={tasks} onTriggerBundle={handleRunOptimization}
                bundlingEfficiencyPct={bundlingEfficiencyPct}
              />
            </div>
          )}

          {activeTab === 'WEEKLY_PLANNER' && (
            <div className="animate-fadeIn">
              <WeeklyMonthlyPlanner tasks={tasks} corridor={currentCorridor} />
            </div>
          )}

          {activeTab === 'ANALYTICS' && (
            <div className="animate-fadeIn">
              <AvailabilityAnalytics tasks={tasks} corridor={currentCorridor} />
            </div>
          )}

          {activeTab === 'APPROVAL_LEDGER' && (
            <div className="animate-fadeIn">
              <ApprovalStateLedger
                tasks={tasks} auditLogs={auditLogs} activeRole={activeRole}
                onApproveTask={async (taskId, comments) => {
                  await handleStatusChange(taskId, 'APPROVED');
                  await api.createAuditLog({
                    user: `${activeRole}`, role: activeRole,
                    action: 'E_SIGN_APPROVE', previous_status: 'VALIDATED', new_status: 'APPROVED',
                    comments: comments, task_id: taskId,
                  });
                  const auditData = await api.fetchAuditLogs();
                  setAuditLogs(auditData);
                }}
                onPublishTask={(taskId) => handleStatusChange(taskId, 'PUBLISHED')}
              />
            </div>
          )}

          {activeTab === 'PDR_DOCS' && (
            <div className="animate-fadeIn">
              <PdrArchitectureModal isOpen={true} onClose={() => handleTabChange('COMMAND_CENTER')} embedded={true} />
            </div>
          )}
        </div>
      </main>

      {/* Task Inspection Drawer */}
      <TaskInspectDrawer
        task={selectedTaskForDrawer}
        onClose={() => setSelectedTaskForDrawer(null)}
        onUpdateTaskTime={handleUpdateTaskTime}
        onStatusChange={handleStatusChange}
      />

      {/* PDR Architecture Documentation Modal */}
      <PdrArchitectureModal
        isOpen={isArchitectureModalOpen}
        onClose={() => setIsArchitectureModalOpen(false)}
      />

      {/* Gemini AI Copilot Modal */}
      <GeminiAssistantModal
        isOpen={isGeminiModalOpen}
        onClose={() => setIsGeminiModalOpen(false)}
        selectedCorridor={currentCorridor}
        tasks={tasks}
      />

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        onCreateTask={handleCreateTask}
        corridors={corridors}
      />

      {/* Toast Notifications */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-[100] max-w-md animate-slideInUp`}>
          <div className={`px-5 py-3 rounded-xl shadow-2xl border text-sm font-medium flex items-center gap-3 backdrop-blur-md ${
            toastMessage.type === 'success' ? 'bg-emerald-950/90 border-emerald-700 text-emerald-200' :
            toastMessage.type === 'error' ? 'bg-rose-950/90 border-rose-700 text-rose-200' :
            'bg-blue-950/90 border-blue-700 text-blue-200'
          }`}>
            <span>{toastMessage.type === 'success' ? '✓' : toastMessage.type === 'error' ? '✕' : 'ⓘ'}</span>
            <span>{toastMessage.text}</span>
            <button onClick={() => setToastMessage(null)} className="ml-2 opacity-60 hover:opacity-100 text-lg leading-none">×</button>
          </div>
        </div>
      )}

      {/* Control Room Footer */}
      <footer className="bg-slate-900/80 border-t border-slate-800 text-slate-500 text-xs py-3 px-4 text-center backdrop-blur-sm">
        <div className="max-w-[1440px] mx-auto flex flex-wrap justify-between items-center gap-2">
          <span>AI Platform • Automatic Block Planning</span>
          <span className="font-mono text-[11px]">OR-Tools CP-SAT Engine • SQLite Persistence • Unified Canonical Schema</span>
        </div>
      </footer>
    </div>
  );
}
