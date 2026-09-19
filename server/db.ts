import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const DB_PATH = path.join(process.cwd(), 'data', 'pdr26027.db');

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    // Ensure data directory exists
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema();
    seedIfEmpty();
  }
  return db;
}

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS corridors (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      zone TEXT NOT NULL,
      division TEXT NOT NULL,
      length_km REAL NOT NULL,
      track_count INTEGER NOT NULL,
      asset_availability_pct REAL NOT NULL DEFAULT 95.0
    );

    CREATE TABLE IF NOT EXISTS maintenance_tasks (
      task_id TEXT PRIMARY KEY,
      source_system TEXT NOT NULL,
      department TEXT NOT NULL,
      title TEXT NOT NULL,
      asset_json TEXT NOT NULL,
      defect_json TEXT NOT NULL,
      operational_requirements_json TEXT NOT NULL,
      priority_score REAL NOT NULL DEFAULT 0,
      priority_decomposition_json TEXT NOT NULL DEFAULT '{}',
      start_hour REAL NOT NULL DEFAULT 0,
      end_hour REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'DRAFT_PENDING',
      impact_level TEXT NOT NULL DEFAULT 'Med',
      bundled_with_task_ids TEXT,
      is_shadow_block INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      deleted_at TEXT
    );

    CREATE TABLE IF NOT EXISTS scheduled_trains (
      train_id TEXT PRIMARY KEY,
      train_number TEXT NOT NULL,
      name TEXT NOT NULL,
      train_type TEXT NOT NULL,
      track_line TEXT NOT NULL,
      start_hour REAL NOT NULL,
      end_hour REAL NOT NULL,
      speed_kmh INTEGER NOT NULL,
      impact_level TEXT NOT NULL DEFAULT 'Med',
      status TEXT NOT NULL DEFAULT 'Scheduled',
      corridor_id TEXT NOT NULL,
      FOREIGN KEY (corridor_id) REFERENCES corridors(id)
    );

    CREATE TABLE IF NOT EXISTS conflicts (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      conflicting_entity_id TEXT NOT NULL,
      conflicting_entity_type TEXT NOT NULL,
      conflict_title TEXT NOT NULL,
      severity TEXT NOT NULL,
      description TEXT NOT NULL,
      recommended_resolution TEXT NOT NULL,
      proposed_new_start_hour REAL NOT NULL,
      proposed_new_end_hour REAL NOT NULL,
      is_resolved INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL DEFAULT (datetime('now')),
      user_name TEXT NOT NULL,
      role TEXT NOT NULL,
      action TEXT NOT NULL,
      previous_status TEXT,
      new_status TEXT,
      comments TEXT,
      digital_signature_hash TEXT,
      task_id TEXT
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      severity TEXT NOT NULL DEFAULT 'INFO',
      is_read INTEGER NOT NULL DEFAULT 0,
      link_tab TEXT,
      link_task_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_tasks_status ON maintenance_tasks(status);
    CREATE INDEX IF NOT EXISTS idx_tasks_dept ON maintenance_tasks(department);
    CREATE INDEX IF NOT EXISTS idx_tasks_deleted ON maintenance_tasks(deleted_at);
    CREATE INDEX IF NOT EXISTS idx_trains_corridor ON scheduled_trains(corridor_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
    CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp);
  `);
}

function seedIfEmpty() {
  const count = db.prepare('SELECT COUNT(*) as c FROM corridors').get() as any;
  if (count.c > 0) return;

  // Seed corridors
  const insertCorridor = db.prepare(
    'INSERT INTO corridors (id, code, name, zone, division, length_km, track_count, asset_availability_pct) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );

  const corridors = [
    ['COR-GZB-ALJN', 'GZB-ALJN', 'Ghaziabad - Aligarh (HDN Route 1)', 'Northern Railway / North Central Railway', 'Delhi / Prayagraj', 106.4, 2, 97.1],
    ['COR-NDLS-CNB', 'NDLS-CNB', 'New Delhi - Kanpur Central Mainline', 'North Central Railway', 'Prayagraj', 440.0, 3, 95.8],
    ['COR-HWH-DLI', 'HWH-DLI', 'Howrah - Delhi Trunk Corridor', 'Eastern / North Central Railway', 'Dhanbad / Pt. DD Upadhyaya', 1447.0, 2, 94.5],
    ['COR-BCT-NDLS', 'BCT-NDLS', 'Mumbai Central - New Delhi Corridor', 'Western / West Central Railway', 'Kota / Vadodara', 1386.0, 2, 96.4],
  ];

  const insertMany = db.transaction(() => {
    for (const c of corridors) {
      insertCorridor.run(...c);
    }
  });
  insertMany();

  // Seed maintenance tasks
  const insertTask = db.prepare(`
    INSERT INTO maintenance_tasks (task_id, source_system, department, title, asset_json, defect_json, operational_requirements_json, priority_score, priority_decomposition_json, start_hour, end_hour, status, impact_level, bundled_with_task_ids, is_shadow_block)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const tasks = [
    {
      task_id: 'BLK-101', source_system: 'TMS', department: 'ENGINEERING',
      title: 'Mechanized Track Tamping & Deep Screening',
      asset: { asset_id: 'TRK-BL-104-DN', asset_type: 'TURNOUT_1_IN_12', corridor_id: 'COR-GZB-ALJN', section: 'GZB-ALJN', km_post: { start: 48.200, end: 48.800 }, criticality_class: 'A', track_line: 'DN Main' },
      defect: { code: 'TRACK_GEOMETRY_INDEX_EXCEEDANCE', title: 'TGI Exceedance & Ballast Fouling (Track 104)', severity: 'HIGH', overdue_days: 12, reported_timestamp: '2026-09-01T06:30:00Z', gmt_accumulated: 38.5, failure_probability_pct: 68 },
      operational_requirements: { min_block_duration_minutes: 150, isolation_required: ['SIGNAL_DISCONNECTION'], manpower_teams: ['PW_GANG_04', 'TAMPING_EXPRESS_UNIT_02'], speed_restriction_on_completion_kmh: 45 },
      priority_score: 88.4,
      priority_decomposition: { total_score: 88.4, asset_criticality_factor: 20.0, defect_severity_factor: 21.5, overdue_factor: 16.5, safety_vulnerability_factor: 13.8, failure_risk_gmt_factor: 8.6, ops_impact_factor: 8.0, explanation_bullets: ['High-density route turnout asset (Class A)', '12 days overdue past mandatory tamping cycle', 'Imposes temporary 45 km/h TSR post execution'] },
      start_hour: 2.0, end_hour: 4.5, status: 'IN_EXECUTION', impact_level: 'High', bundled_with_task_ids: null, is_shadow_block: 0
    },
    {
      task_id: 'BLK-102', source_system: 'SMMS', department: 'S_AND_T',
      title: 'Point Machine Detection & Interlocking Overhaul',
      asset: { asset_id: 'SIG-PT-201-UP', asset_type: 'ELECTRIC_POINT_MACHINE', corridor_id: 'COR-GZB-ALJN', section: 'GZB-ALJN', km_post: { start: 48.250, end: 48.350 }, criticality_class: 'A', track_line: 'UP Main' },
      defect: { code: 'POINT_DETECTOR_MARGINAL_SLIP', title: 'Point Machine 201 Motor Wear & Slip Risk', severity: 'MEDIUM', overdue_days: 6, reported_timestamp: '2026-09-07T11:15:00Z', gmt_accumulated: 42.0, failure_probability_pct: 45 },
      operational_requirements: { min_block_duration_minutes: 90, isolation_required: ['SIGNAL_DISCONNECTION', 'TRACK_CIRCUIT_CUT'], manpower_teams: ['ST_MAINT_TEAM_01'], speed_restriction_on_completion_kmh: 75 },
      priority_score: 74.2,
      priority_decomposition: { total_score: 74.2, asset_criticality_factor: 19.0, defect_severity_factor: 17.0, overdue_factor: 12.0, safety_vulnerability_factor: 12.5, failure_risk_gmt_factor: 7.2, ops_impact_factor: 6.5, explanation_bullets: ['Mainline Electronic Interlocking node', 'Prevents signal clearance delays at GZB junction', 'Can be bundled with Engineering track work'] },
      start_hour: 5.0, end_hour: 6.5, status: 'DRAFT_PENDING', impact_level: 'Med', bundled_with_task_ids: JSON.stringify(['BLK-106']), is_shadow_block: 0
    },
    {
      task_id: 'BLK-103', source_system: 'TDMS', department: 'TRD',
      title: 'OHE Contact Wire Splice & Isolator Renewal',
      asset: { asset_id: 'TRD-OHE-48-DN', asset_type: 'OHE_CANTILEVER_ISOLATOR', corridor_id: 'COR-GZB-ALJN', section: 'GZB-ALJN', km_post: { start: 48.150, end: 48.500 }, criticality_class: 'A', track_line: 'DN Main' },
      defect: { code: 'CONTACT_WIRE_WEAR_CRITICAL', title: 'OHE Wire Grooving & Pantograph Strike Risk', severity: 'CRITICAL', overdue_days: 14, reported_timestamp: '2026-08-31T04:15:00Z', gmt_accumulated: 55.0, failure_probability_pct: 82 },
      operational_requirements: { min_block_duration_minutes: 120, isolation_required: ['OHE_POWER_CUT', 'TRACTION_SUBSTATION_TRIP'], manpower_teams: ['TRD_TOWER_WAGON_02'], speed_restriction_on_completion_kmh: 90 },
      priority_score: 93.4,
      priority_decomposition: { total_score: 93.4, asset_criticality_factor: 19.0, defect_severity_factor: 24.0, overdue_factor: 18.8, safety_vulnerability_factor: 14.6, failure_risk_gmt_factor: 9.0, ops_impact_factor: 8.0, explanation_bullets: ['Severe 22% contact wire wear exceeding threshold', 'Risk of pantograph entangling and full line tripping', 'Requires 25kV OHE Power Block'] },
      start_hour: 10.0, end_hour: 12.0, status: 'IN_EXECUTION', impact_level: 'High', bundled_with_task_ids: null, is_shadow_block: 0
    },
    {
      task_id: 'BLK-104', source_system: 'TMS', department: 'ENGINEERING',
      title: 'Ultrasonic Flaw Detection (USFD) Rail Replacement',
      asset: { asset_id: 'TRK-BL-108-UP', asset_type: 'RAIL_60KG_IMR_FLAW', corridor_id: 'COR-GZB-ALJN', section: 'GZB-ALJN', km_post: { start: 48.300, end: 48.450 }, criticality_class: 'A', track_line: 'UP Main' },
      defect: { code: 'IMR_RAIL_FRACTURE_RISK', title: 'IMR Internal Transverse Rail Fracture Flaw', severity: 'CRITICAL', overdue_days: 10, reported_timestamp: '2026-09-03T08:20:00Z', gmt_accumulated: 48.2, failure_probability_pct: 91 },
      operational_requirements: { min_block_duration_minutes: 180, isolation_required: ['OHE_POWER_CUT', 'SIGNAL_DISCONNECTION'], manpower_teams: ['PW_GANG_01', 'RAIL_WELDING_UNIT_03'], speed_restriction_on_completion_kmh: 30 },
      priority_score: 96.1,
      priority_decomposition: { total_score: 96.1, asset_criticality_factor: 20.0, defect_severity_factor: 24.8, overdue_factor: 19.2, safety_vulnerability_factor: 14.9, failure_risk_gmt_factor: 9.2, ops_impact_factor: 8.0, explanation_bullets: ['Immediate Removal (IMR) defect detected by USFD car', 'Derailment risk under loaded 25-tonne axle freight', 'High priority block allocation mandatory'] },
      start_hour: 13.0, end_hour: 16.0, status: 'AI_PROPOSED', impact_level: 'High', bundled_with_task_ids: null, is_shadow_block: 0
    },
    {
      task_id: 'BLK-105', source_system: 'SMMS', department: 'S_AND_T',
      title: 'Axle Counter & Track Circuit Calibration',
      asset: { asset_id: 'SIG-AXC-109-DN', asset_type: 'DIGITAL_AXLE_COUNTER', corridor_id: 'COR-GZB-ALJN', section: 'GZB-ALJN', km_post: { start: 48.100, end: 48.300 }, criticality_class: 'B', track_line: 'DN Main' },
      defect: { code: 'AXLE_COUNTER_RESET_COUNT', title: 'Spurious Axle Count Error & Reset Spike', severity: 'MEDIUM', overdue_days: 3, reported_timestamp: '2026-09-10T14:00:00Z', gmt_accumulated: 29.0, failure_probability_pct: 32 },
      operational_requirements: { min_block_duration_minutes: 60, isolation_required: ['SIGNAL_DISCONNECTION'], manpower_teams: ['ST_MAINT_TEAM_02'], speed_restriction_on_completion_kmh: 110 },
      priority_score: 62.8,
      priority_decomposition: { total_score: 62.8, asset_criticality_factor: 15.0, defect_severity_factor: 15.0, overdue_factor: 10.0, safety_vulnerability_factor: 11.0, failure_risk_gmt_factor: 5.8, ops_impact_factor: 6.0, explanation_bullets: ['Intermittent block section occupancy signal drop', 'Can be co-scheduled into BLK-103 TRD window'] },
      start_hour: 10.15, end_hour: 11.15, status: 'AI_PROPOSED', impact_level: 'Med', bundled_with_task_ids: null, is_shadow_block: 1
    },
    {
      task_id: 'BLK-106', source_system: 'TDMS', department: 'TRD',
      title: 'Substation Transformer Isolator Bonding',
      asset: { asset_id: 'TRD-SUB-49-UP', asset_type: 'TRACTION_TRANSFORMER_ISOLATOR', corridor_id: 'COR-GZB-ALJN', section: 'GZB-ALJN', km_post: { start: 48.220, end: 48.400 }, criticality_class: 'A', track_line: 'UP Main' },
      defect: { code: 'ISOLATOR_THERMAL_HOTSPOT', title: 'Isolator Contact Thermal Hotspot (110°C)', severity: 'HIGH', overdue_days: 8, reported_timestamp: '2026-09-05T09:40:00Z', gmt_accumulated: 36.4, failure_probability_pct: 71 },
      operational_requirements: { min_block_duration_minutes: 75, isolation_required: ['OHE_POWER_CUT'], manpower_teams: ['TRD_SUBSTATION_CREW'], speed_restriction_on_completion_kmh: 100 },
      priority_score: 81.5,
      priority_decomposition: { total_score: 81.5, asset_criticality_factor: 18.0, defect_severity_factor: 20.0, overdue_factor: 15.0, safety_vulnerability_factor: 13.5, failure_risk_gmt_factor: 8.0, ops_impact_factor: 7.0, explanation_bullets: ['Prevents sudden neutral section feeder trip', 'Bundled with S&T Point Inspection BLK-102'] },
      start_hour: 5.10, end_hour: 6.25, status: 'DRAFT_PENDING', impact_level: 'High', bundled_with_task_ids: JSON.stringify(['BLK-102']), is_shadow_block: 0
    }
  ];

  const insertTasks = db.transaction(() => {
    for (const t of tasks) {
      insertTask.run(
        t.task_id, t.source_system, t.department, t.title,
        JSON.stringify(t.asset), JSON.stringify(t.defect), JSON.stringify(t.operational_requirements),
        t.priority_score, JSON.stringify(t.priority_decomposition),
        t.start_hour, t.end_hour, t.status, t.impact_level,
        t.bundled_with_task_ids, t.is_shadow_block
      );
    }
  });
  insertTasks();

  // Seed trains
  const insertTrain = db.prepare(
    'INSERT INTO scheduled_trains (train_id, train_number, name, train_type, track_line, start_hour, end_hour, speed_kmh, impact_level, status, corridor_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );

  const trains = [
    ['TRN-201', '12302', 'Howrah Rajdhani Express', 'Rajdhani / Vande Bharat', 'UP Main', 1.0, 4.0, 130, 'Critical', 'Scheduled', 'COR-GZB-ALJN'],
    ['TRN-202', '5501', 'Goods Freight (Coal / Rake)', 'Goods Freight', 'DN Main', 5.0, 8.0, 75, 'Med', 'Scheduled', 'COR-GZB-ALJN'],
    ['TRN-203', '64001', 'EMU Suburban Commuter', 'EMU Suburban', 'UP Main', 7.0, 10.0, 90, 'Low', 'Scheduled', 'COR-GZB-ALJN'],
    ['TRN-204', '14005', 'Lichchavi Express Passenger', 'Mail Express', 'DN Main', 16.5, 20.5, 110, 'High', 'Scheduled', 'COR-GZB-ALJN'],
    ['TRN-205', '22436', 'Vande Bharat Express', 'Rajdhani / Vande Bharat', 'DN Main', 12.5, 15.0, 160, 'Critical', 'Scheduled', 'COR-GZB-ALJN'],
  ];

  const insertTrains = db.transaction(() => {
    for (const tr of trains) {
      insertTrain.run(...tr);
    }
  });
  insertTrains();

  // Seed audit logs
  const insertAudit = db.prepare(
    'INSERT INTO audit_logs (id, timestamp, user_name, role, action, previous_status, new_status, comments, digital_signature_hash, task_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );

  const auditLogs = [
    ['AUD-901', '2026-09-13T19:30:00Z', 'Deepak Kumar (Sr. DEN / Engg)', 'ENGINEERING_PLANNER', 'REGISTER_DEFECT', 'DRAFT_PENDING', 'DRAFT_PENDING', 'USFD defect identified at KM 48.300 (IMR flaw). High priority block requested.', '0x8f9a...3b21', 'BLK-104'],
    ['AUD-902', '2026-09-13T20:15:00Z', 'OR-Tools CP-SAT Engine', 'SYSTEM_ADMIN', 'AI_OPTIMIZATION_RUN', 'DRAFT_PENDING', 'AI_PROPOSED', 'Generated candidate multi-department block windows. Detected conflict CNF-001 with Vande Bharat Express.', '0x1c4d...9e78', null],
    ['AUD-903', '2026-09-13T21:00:00Z', 'R. K. Sharma (Section Controller)', 'SECTION_CONTROLLER', 'E_SIGN_VALIDATION', 'AI_PROPOSED', 'VALIDATED', 'Approved 75-min shadow block combining BLK-102 (S&T) and BLK-106 (TRD). Validated for ground execution.', '0x7e22...4fa0', 'BLK-102'],
  ];

  const insertAudits = db.transaction(() => {
    for (const a of auditLogs) {
      insertAudit.run(...a);
    }
  });
  insertAudits();

  // Seed notifications
  const insertNotification = db.prepare(
    'INSERT INTO notifications (id, type, title, message, severity, is_read, link_tab, link_task_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );

  const notifications = [
    [uuidv4(), 'CRITICAL_DEFECT', 'IMR Rail Fracture Detected', 'USFD car detected internal transverse flaw at KM 48.300 on UP Main. Immediate block allocation required.', 'CRITICAL', 0, 'COMMAND_CENTER', 'BLK-104'],
    [uuidv4(), 'AI_PLAN_GENERATED', 'AI Optimization Complete', 'CP-SAT engine generated 3 candidate scenarios for corridor GZB-ALJN with 58.3% bundling efficiency.', 'INFO', 0, 'PRIORITY_AI', null],
    [uuidv4(), 'CONFLICT_DETECTED', 'Train-Block Conflict CNF-001', 'BLK-104 (13:00-16:00) conflicts with Vande Bharat Express TRN-205. Resolution recommended: shift to night window.', 'WARNING', 0, 'COMMAND_CENTER', 'BLK-104'],
    [uuidv4(), 'APPROVAL_REQUIRED', 'Plan Awaiting Approval', 'Shadow block combining BLK-102 (S&T) and BLK-106 (TRD) requires Section Controller sign-off.', 'INFO', 1, 'APPROVAL_LEDGER', 'BLK-102'],
  ];

  const insertNotifs = db.transaction(() => {
    for (const n of notifications) {
      insertNotification.run(...n);
    }
  });
  insertNotifs();
}

// === HELPER FUNCTIONS ===

export function parseTask(row: any) {
  return {
    task_id: row.task_id,
    source_system: row.source_system,
    department: row.department,
    title: row.title,
    asset: JSON.parse(row.asset_json),
    defect: JSON.parse(row.defect_json),
    operational_requirements: JSON.parse(row.operational_requirements_json),
    priority_score: row.priority_score,
    priority_decomposition: JSON.parse(row.priority_decomposition_json),
    start_hour: row.start_hour,
    end_hour: row.end_hour,
    status: row.status,
    impact_level: row.impact_level,
    bundled_with_task_ids: row.bundled_with_task_ids ? JSON.parse(row.bundled_with_task_ids) : undefined,
    is_shadow_block: row.is_shadow_block === 1,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function parseAuditLog(row: any) {
  return {
    id: row.id,
    timestamp: row.timestamp,
    user: row.user_name,
    role: row.role,
    action: row.action,
    previous_status: row.previous_status,
    new_status: row.new_status,
    comments: row.comments,
    digital_signature_hash: row.digital_signature_hash,
    task_id: row.task_id,
  };
}

export function parseNotification(row: any) {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    message: row.message,
    severity: row.severity,
    is_read: row.is_read === 1,
    link_tab: row.link_tab,
    link_task_id: row.link_task_id,
    created_at: row.created_at,
  };
}
