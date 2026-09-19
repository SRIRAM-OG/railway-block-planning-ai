export type Department = 'ENGINEERING' | 'S_AND_T' | 'TRD' | 'TRAFFIC';

export type SourceSystem = 'TMS' | 'SMMS' | 'TDMS' | 'COA' | 'NTES' | 'FOIS';

export type DefectSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type AssetCriticality = 'A' | 'B' | 'C'; // A: High Density Network (HDN), B: Mainline, C: Branch

export type BlockStatus = 
  | 'DRAFT_PENDING'
  | 'AI_PROPOSED'
  | 'CONFLICT_FLAG'
  | 'CONFLICT_FREE'
  | 'MODIFIED_USER'
  | 'VALIDATED'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'IN_EXECUTION'
  | 'COMPLETED';

export type UserRole = 
  | 'SECTION_CONTROLLER'
  | 'DIVISIONAL_APPROVER'
  | 'ENGINEERING_PLANNER'
  | 'ST_PLANNER'
  | 'TRD_PLANNER'
  | 'SYSTEM_ADMIN';

export type ViewTab = 
  | 'COMMAND_CENTER'
  | 'CORRIDOR_GANTT'
  | 'INGESTION_STREAM'
  | 'PRIORITY_AI'
  | 'MULTI_DEPT_BUNDLE'
  | 'WEEKLY_PLANNER'
  | 'MONTHLY_PLANNER'
  | 'ANALYTICS'
  | 'APPROVAL_LEDGER'
  | 'PDR_DOCS';

export interface AssetInfo {
  asset_id: string;
  asset_type: string;
  corridor_id: string;
  section: string;
  km_post: { start: number; end: number };
  criticality_class: AssetCriticality;
  track_line: 'DN Main' | 'UP Main' | 'Loop Line 1' | 'Loop Line 2';
}

export interface DefectInfo {
  code: string;
  title: string;
  severity: DefectSeverity;
  overdue_days: number;
  reported_timestamp: string;
  gmt_accumulated?: number; // Gross Million Tonnes
  failure_probability_pct?: number;
}

export interface OperationalRequirements {
  min_block_duration_minutes: number;
  isolation_required: string[]; // e.g., ["OHE_POWER_CUT", "SIGNAL_DISCONNECTION"]
  manpower_teams: string[];
  speed_restriction_on_completion_kmh?: number;
}

export interface PriorityScoreDecomposition {
  total_score: number; // 0-100
  asset_criticality_factor: number; // weighted
  defect_severity_factor: number;
  overdue_factor: number;
  safety_vulnerability_factor: number;
  failure_risk_gmt_factor: number;
  ops_impact_factor: number;
  explanation_bullets: string[];
}

export interface PriorityWeights {
  w_crit: number;      // default 0.20
  w_sev: number;       // default 0.25
  w_overdue: number;   // default 0.20
  w_safety: number;    // default 0.15
  w_ops: number;       // default 0.10
  w_fail: number;      // default 0.10
}

export interface MaintenanceTask {
  task_id: string;
  source_system: SourceSystem;
  department: Department;
  title: string;
  asset: AssetInfo;
  defect: DefectInfo;
  operational_requirements: OperationalRequirements;
  priority_score: number;
  priority_decomposition: PriorityScoreDecomposition;
  start_hour: number; // 0 to 24 in float (e.g., 2.5 = 02:30)
  end_hour: number;
  status: BlockStatus;
  impact_level: 'Critical' | 'High' | 'Med' | 'Low';
  bundled_with_task_ids?: string[];
  is_shadow_block?: boolean;
}

export interface ScheduledTrain {
  train_id: string;
  train_number: string;
  name: string;
  train_type: 'Rajdhani / Vande Bharat' | 'Mail Express' | 'EMU Suburban' | 'Goods Freight';
  track_line: 'DN Main' | 'UP Main' | 'Loop Line 1' | 'Loop Line 2';
  start_hour: number;
  end_hour: number;
  speed_kmh: number;
  impact_level: 'Critical' | 'High' | 'Med' | 'Low';
  status: 'Scheduled' | 'Delayed' | 'Rerouted';
  corridor_id: string;
}

export interface ConflictRecord {
  id: string;
  task_id: string;
  conflicting_entity_id: string;
  conflicting_entity_type: 'TRAIN' | 'OTHER_BLOCK' | 'ISOLATION_ZONE';
  conflict_title: string;
  severity: 'CRITICAL' | 'WARNING';
  description: string;
  recommended_resolution: string;
  proposed_new_start_hour: number;
  proposed_new_end_hour: number;
  is_resolved: boolean;
}

export interface OptimizationScenario {
  id: 'BALANCED' | 'MAX_MAINTENANCE' | 'MIN_DISRUPTION';
  name: string;
  description: string;
  tasks_scheduled_count: number;
  track_downtime_minutes: number;
  train_delay_index: number; // 0-100
  asset_availability_pct: number;
  multi_dept_bundling_efficiency_pct: number;
}

export interface ApprovalAuditEntry {
  id: string;
  timestamp: string;
  user: string;
  role: UserRole;
  action: string;
  previous_status: BlockStatus;
  new_status: BlockStatus;
  comments: string;
  digital_signature_hash: string;
}

export interface CorridorInfo {
  id: string;
  code: string;
  name: string;
  zone: string;
  division: string;
  length_km: number;
  track_count: number;
  asset_availability_pct: number;
}
