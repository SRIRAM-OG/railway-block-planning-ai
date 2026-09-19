import { 
  CorridorInfo, 
  MaintenanceTask, 
  ScheduledTrain, 
  ConflictRecord, 
  OptimizationScenario, 
  ApprovalAuditEntry 
} from '../types';

export const INITIAL_CORRIDORS: CorridorInfo[] = [
  {
    id: 'COR-GZB-ALJN',
    code: 'GZB-ALJN',
    name: 'Ghaziabad - Aligarh (HDN Route 1)',
    zone: 'Northern Railway / North Central Railway',
    division: 'Delhi / Prayagraj',
    length_km: 106.4,
    track_count: 2,
    asset_availability_pct: 97.1,
  },
  {
    id: 'COR-NDLS-CNB',
    code: 'NDLS-CNB',
    name: 'New Delhi - Kanpur Central Mainline',
    zone: 'North Central Railway',
    division: 'Prayagraj',
    length_km: 440.0,
    track_count: 3,
    asset_availability_pct: 95.8,
  },
  {
    id: 'COR-HWH-DLI',
    code: 'HWH-DLI',
    name: 'Howrah - Delhi Trunk Corridor',
    zone: 'Eastern / North Central Railway',
    division: 'Dhanbad / Pt. DD Upadhyaya',
    length_km: 1447.0,
    track_count: 2,
    asset_availability_pct: 94.5,
  },
  {
    id: 'COR-BCT-NDLS',
    code: 'BCT-NDLS',
    name: 'Mumbai Central - New Delhi Corridor',
    zone: 'Western / West Central Railway',
    division: 'Kota / Vadodara',
    length_km: 1386.0,
    track_count: 2,
    asset_availability_pct: 96.4,
  }
];

export const DEFAULT_PRIORITY_WEIGHTS = {
  w_crit: 0.20,
  w_sev: 0.25,
  w_overdue: 0.20,
  w_safety: 0.15,
  w_ops: 0.10,
  w_fail: 0.10
};

export const INITIAL_TASKS: MaintenanceTask[] = [
  {
    task_id: 'BLK-101',
    source_system: 'TMS',
    department: 'ENGINEERING',
    title: 'Mechanized Track Tamping & Deep Screening',
    asset: {
      asset_id: 'TRK-BL-104-DN',
      asset_type: 'TURNOUT_1_IN_12',
      corridor_id: 'COR-GZB-ALJN',
      section: 'GZB-ALJN',
      km_post: { start: 48.200, end: 48.800 },
      criticality_class: 'A',
      track_line: 'DN Main'
    },
    defect: {
      code: 'TRACK_GEOMETRY_INDEX_EXCEEDANCE',
      title: 'TGI Exceedance & Ballast Fouling (Track 104)',
      severity: 'HIGH',
      overdue_days: 12,
      reported_timestamp: '2026-09-01T06:30:00Z',
      gmt_accumulated: 38.5,
      failure_probability_pct: 68
    },
    operational_requirements: {
      min_block_duration_minutes: 150,
      isolation_required: ['SIGNAL_DISCONNECTION'],
      manpower_teams: ['PW_GANG_04', 'TAMPING_EXPRESS_UNIT_02'],
      speed_restriction_on_completion_kmh: 45
    },
    priority_score: 88.4,
    priority_decomposition: {
      total_score: 88.4,
      asset_criticality_factor: 20.0,
      defect_severity_factor: 21.5,
      overdue_factor: 16.5,
      safety_vulnerability_factor: 13.8,
      failure_risk_gmt_factor: 8.6,
      ops_impact_factor: 8.0,
      explanation_bullets: [
        'High-density route turnout asset (Class A)',
        '12 days overdue past mandatory tamping cycle',
        'Imposes temporary 45 km/h TSR post execution'
      ]
    },
    start_hour: 2.0, // 02:00
    end_hour: 4.5,   // 04:30
    status: 'IN_EXECUTION',
    impact_level: 'High'
  },
  {
    task_id: 'BLK-102',
    source_system: 'SMMS',
    department: 'S_AND_T',
    title: 'Point Machine Detection & Interlocking Overhaul',
    asset: {
      asset_id: 'SIG-PT-201-UP',
      asset_type: 'ELECTRIC_POINT_MACHINE',
      corridor_id: 'COR-GZB-ALJN',
      section: 'GZB-ALJN',
      km_post: { start: 48.250, end: 48.350 },
      criticality_class: 'A',
      track_line: 'UP Main'
    },
    defect: {
      code: 'POINT_DETECTOR_MARGINAL_SLIP',
      title: 'Point Machine 201 Motor Wear & Slip Risk',
      severity: 'MEDIUM',
      overdue_days: 6,
      reported_timestamp: '2026-09-07T11:15:00Z',
      gmt_accumulated: 42.0,
      failure_probability_pct: 45
    },
    operational_requirements: {
      min_block_duration_minutes: 90,
      isolation_required: ['SIGNAL_DISCONNECTION', 'TRACK_CIRCUIT_CUT'],
      manpower_teams: ['ST_MAINT_TEAM_01'],
      speed_restriction_on_completion_kmh: 75
    },
    priority_score: 74.2,
    priority_decomposition: {
      total_score: 74.2,
      asset_criticality_factor: 19.0,
      defect_severity_factor: 17.0,
      overdue_factor: 12.0,
      safety_vulnerability_factor: 12.5,
      failure_risk_gmt_factor: 7.2,
      ops_impact_factor: 6.5,
      explanation_bullets: [
        'Mainline Electronic Interlocking node',
        'Prevents signal clearance delays at GZB junction',
        'Can be bundled with Engineering track work'
      ]
    },
    start_hour: 5.0, // 05:00
    end_hour: 6.5,   // 06:30
    status: 'DRAFT_PENDING',
    impact_level: 'Med',
    bundled_with_task_ids: ['BLK-106']
  },
  {
    task_id: 'BLK-103',
    source_system: 'TDMS',
    department: 'TRD',
    title: 'OHE Contact Wire Splice & Isolator Renewal',
    asset: {
      asset_id: 'TRD-OHE-48-DN',
      asset_type: 'OHE_CANTILEVER_ISOLATOR',
      corridor_id: 'COR-GZB-ALJN',
      section: 'GZB-ALJN',
      km_post: { start: 48.150, end: 48.500 },
      criticality_class: 'A',
      track_line: 'DN Main'
    },
    defect: {
      code: 'CONTACT_WIRE_WEAR_CRITICAL',
      title: 'OHE Wire Grooving & Pantograph Strike Risk',
      severity: 'CRITICAL',
      overdue_days: 14,
      reported_timestamp: '2026-08-31T04:15:00Z',
      gmt_accumulated: 55.0,
      failure_probability_pct: 82
    },
    operational_requirements: {
      min_block_duration_minutes: 120,
      isolation_required: ['OHE_POWER_CUT', 'TRACTION_SUBSTATION_TRIP'],
      manpower_teams: ['TRD_TOWER_WAGON_02'],
      speed_restriction_on_completion_kmh: 90
    },
    priority_score: 93.4,
    priority_decomposition: {
      total_score: 93.4,
      asset_criticality_factor: 19.0,
      defect_severity_factor: 24.0,
      overdue_factor: 18.8,
      safety_vulnerability_factor: 14.6,
      failure_risk_gmt_factor: 9.0,
      ops_impact_factor: 8.0,
      explanation_bullets: [
        'Severe 22% contact wire wear exceeding threshold',
        'Risk of pantograph entangling and full line tripping',
        'Requires 25kV OHE Power Block'
      ]
    },
    start_hour: 10.0, // 10:00
    end_hour: 12.0,  // 12:00
    status: 'IN_EXECUTION',
    impact_level: 'High'
  },
  {
    task_id: 'BLK-104',
    source_system: 'TMS',
    department: 'ENGINEERING',
    title: 'Ultrasonic Flaw Detection (USFD) Rail Replacement',
    asset: {
      asset_id: 'TRK-BL-108-UP',
      asset_type: 'RAIL_60KG_IMR_FLAW',
      corridor_id: 'COR-GZB-ALJN',
      section: 'GZB-ALJN',
      km_post: { start: 48.300, end: 48.450 },
      criticality_class: 'A',
      track_line: 'UP Main'
    },
    defect: {
      code: 'IMR_RAIL_FRACTURE_RISK',
      title: 'IMR Internal Transverse Rail Fracture Flaw',
      severity: 'CRITICAL',
      overdue_days: 10,
      reported_timestamp: '2026-09-03T08:20:00Z',
      gmt_accumulated: 48.2,
      failure_probability_pct: 91
    },
    operational_requirements: {
      min_block_duration_minutes: 180,
      isolation_required: ['OHE_POWER_CUT', 'SIGNAL_DISCONNECTION'],
      manpower_teams: ['PW_GANG_01', 'RAIL_WELDING_UNIT_03'],
      speed_restriction_on_completion_kmh: 30
    },
    priority_score: 96.1,
    priority_decomposition: {
      total_score: 96.1,
      asset_criticality_factor: 20.0,
      defect_severity_factor: 24.8,
      overdue_factor: 19.2,
      safety_vulnerability_factor: 14.9,
      failure_risk_gmt_factor: 9.2,
      ops_impact_factor: 8.0,
      explanation_bullets: [
        'Immediate Removal (IMR) defect detected by USFD car',
        'Derailment risk under loaded 25-tonne axle freight',
        'High priority block allocation mandatory'
      ]
    },
    start_hour: 13.0, // 13:00
    end_hour: 16.0,  // 16:00
    status: 'AI_PROPOSED',
    impact_level: 'High'
  },
  {
    task_id: 'BLK-105',
    source_system: 'SMMS',
    department: 'S_AND_T',
    title: 'Axle Counter & Track Circuit Calibration',
    asset: {
      asset_id: 'SIG-AXC-109-DN',
      asset_type: 'DIGITAL_AXLE_COUNTER',
      corridor_id: 'COR-GZB-ALJN',
      section: 'GZB-ALJN',
      km_post: { start: 48.100, end: 48.300 },
      criticality_class: 'B',
      track_line: 'DN Main'
    },
    defect: {
      code: 'AXLE_COUNTER_RESET_COUNT',
      title: 'Spurious Axle Count Error & Reset Spike',
      severity: 'MEDIUM',
      overdue_days: 3,
      reported_timestamp: '2026-09-10T14:00:00Z',
      gmt_accumulated: 29.0,
      failure_probability_pct: 32
    },
    operational_requirements: {
      min_block_duration_minutes: 60,
      isolation_required: ['SIGNAL_DISCONNECTION'],
      manpower_teams: ['ST_MAINT_TEAM_02'],
      speed_restriction_on_completion_kmh: 110
    },
    priority_score: 62.8,
    priority_decomposition: {
      total_score: 62.8,
      asset_criticality_factor: 15.0,
      defect_severity_factor: 15.0,
      overdue_factor: 10.0,
      safety_vulnerability_factor: 11.0,
      failure_risk_gmt_factor: 5.8,
      ops_impact_factor: 6.0,
      explanation_bullets: [
        'Intermittent block section occupancy signal drop',
        'Can be co-scheduled into BLK-103 TRD window'
      ]
    },
    start_hour: 10.15,
    end_hour: 11.15,
    status: 'AI_PROPOSED',
    impact_level: 'Med',
    is_shadow_block: true
  },
  {
    task_id: 'BLK-106',
    source_system: 'TDMS',
    department: 'TRD',
    title: 'Substation Transformer Isolator Bonding',
    asset: {
      asset_id: 'TRD-SUB-49-UP',
      asset_type: 'TRACTION_TRANSFORMER_ISOLATOR',
      corridor_id: 'COR-GZB-ALJN',
      section: 'GZB-ALJN',
      km_post: { start: 48.220, end: 48.400 },
      criticality_class: 'A',
      track_line: 'UP Main'
    },
    defect: {
      code: 'ISOLATOR_THERMAL_HOTSPOT',
      title: 'Isolator Contact Thermal Hotspot (110°C)',
      severity: 'HIGH',
      overdue_days: 8,
      reported_timestamp: '2026-09-05T09:40:00Z',
      gmt_accumulated: 36.4,
      failure_probability_pct: 71
    },
    operational_requirements: {
      min_block_duration_minutes: 75,
      isolation_required: ['OHE_POWER_CUT'],
      manpower_teams: ['TRD_SUBSTATION_CREW'],
      speed_restriction_on_completion_kmh: 100
    },
    priority_score: 81.5,
    priority_decomposition: {
      total_score: 81.5,
      asset_criticality_factor: 18.0,
      defect_severity_factor: 20.0,
      overdue_factor: 15.0,
      safety_vulnerability_factor: 13.5,
      failure_risk_gmt_factor: 8.0,
      ops_impact_factor: 7.0,
      explanation_bullets: [
        'Prevents sudden neutral section feeder trip',
        'Bundled with S&T Point Inspection BLK-102'
      ]
    },
    start_hour: 5.10,
    end_hour: 6.25,
    status: 'DRAFT_PENDING',
    impact_level: 'High',
    bundled_with_task_ids: ['BLK-102']
  }
];

export const INITIAL_TRAINS: ScheduledTrain[] = [
  {
    train_id: 'TRN-201',
    train_number: '12302',
    name: 'Howrah Rajdhani Express',
    train_type: 'Rajdhani / Vande Bharat',
    track_line: 'UP Main',
    start_hour: 1.0, // 01:00
    end_hour: 4.0,   // 04:00
    speed_kmh: 130,
    impact_level: 'Critical',
    status: 'Scheduled',
    corridor_id: 'COR-GZB-ALJN'
  },
  {
    train_id: 'TRN-202',
    train_number: '5501',
    name: 'Goods Freight (Coal / Rake)',
    train_type: 'Goods Freight',
    track_line: 'DN Main',
    start_hour: 5.0, // 05:00
    end_hour: 8.0,   // 08:00
    speed_kmh: 75,
    impact_level: 'Med',
    status: 'Scheduled',
    corridor_id: 'COR-GZB-ALJN'
  },
  {
    train_id: 'TRN-203',
    train_number: '64001',
    name: 'EMU Suburban Commuter',
    train_type: 'EMU Suburban',
    track_line: 'UP Main',
    start_hour: 7.0, // 07:00
    end_hour: 10.0,  // 10:00
    speed_kmh: 90,
    impact_level: 'Low',
    status: 'Scheduled',
    corridor_id: 'COR-GZB-ALJN'
  },
  {
    train_id: 'TRN-204',
    train_number: '14005',
    name: 'Lichchavi Express Passenger',
    train_type: 'Mail Express',
    track_line: 'DN Main',
    start_hour: 16.5, // 16:30
    end_hour: 20.5,  // 20:30
    speed_kmh: 110,
    impact_level: 'High',
    status: 'Scheduled',
    corridor_id: 'COR-GZB-ALJN'
  },
  {
    train_id: 'TRN-205',
    train_number: '22436',
    name: 'Vande Bharat Express',
    train_type: 'Rajdhani / Vande Bharat',
    track_line: 'DN Main',
    start_hour: 12.5, // 12:30
    end_hour: 15.0,  // 15:00
    speed_kmh: 160,
    impact_level: 'Critical',
    status: 'Scheduled',
    corridor_id: 'COR-GZB-ALJN'
  }
];

export const INITIAL_CONFLICTS: ConflictRecord[] = [
  {
    id: 'CNF-001',
    task_id: 'BLK-104',
    conflicting_entity_id: 'TRN-205',
    conflicting_entity_type: 'TRAIN',
    conflict_title: 'Proposed Engineering Block Overlaps Vande Bharat Express Slot',
    severity: 'CRITICAL',
    description: 'Task BLK-104 (13:00 - 16:00 on UP Main) overlaps with Vande Bharat Express TRN-205 (12:30 - 15:00) window. Hard constraint violation on passenger priority line.',
    recommended_resolution: 'Shift maintenance block BLK-104 window to 21:00 - 24:00 night shadow slot or bundle with S&T maintenance on UP track.',
    proposed_new_start_hour: 21.0,
    proposed_new_end_hour: 24.0,
    is_resolved: false
  }
];

export const SCENARIOS: OptimizationScenario[] = [
  {
    id: 'BALANCED',
    name: 'Balanced AI Scenario (PDR Default)',
    description: 'Optimizes task priority completion while keeping train delay index low and bundling multi-department tasks.',
    tasks_scheduled_count: 6,
    track_downtime_minutes: 360,
    train_delay_index: 12,
    asset_availability_pct: 97.1,
    multi_dept_bundling_efficiency_pct: 58.3
  },
  {
    id: 'MAX_MAINTENANCE',
    name: 'Maximum Maintenance & Safety Scenario',
    description: 'Clears all critical overdue defects (USFD + OHE + Points) in single consolidated shadow blocks; requires minor freight train regulation.',
    tasks_scheduled_count: 6,
    track_downtime_minutes: 420,
    train_delay_index: 24,
    asset_availability_pct: 98.6,
    multi_dept_bundling_efficiency_pct: 64.0
  },
  {
    id: 'MIN_DISRUPTION',
    name: 'Minimum Train Disruption Scenario',
    description: 'Zero impact on passenger train timetables (Rajdhani/Vande Bharat). Defers non-critical S&T tasks to weekend night windows.',
    tasks_scheduled_count: 4,
    track_downtime_minutes: 240,
    train_delay_index: 2,
    asset_availability_pct: 95.4,
    multi_dept_bundling_efficiency_pct: 42.1
  }
];

export const INITIAL_AUDIT_LOGS: ApprovalAuditEntry[] = [
  {
    id: 'AUD-901',
    timestamp: '2026-09-13T19:30:00Z',
    user: 'Deepak Kumar (Sr. DEN / Engg)',
    role: 'ENGINEERING_PLANNER',
    action: 'REGISTER_DEFECT',
    previous_status: 'DRAFT_PENDING',
    new_status: 'DRAFT_PENDING',
    comments: 'USFD defect identified at KM 48.300 (IMR flaw). High priority block requested.',
    digital_signature_hash: '0x8f9a...3b21'
  },
  {
    id: 'AUD-902',
    timestamp: '2026-09-13T20:15:00Z',
    user: 'OR-Tools CP-SAT Engine',
    role: 'SYSTEM_ADMIN',
    action: 'AI_OPTIMIZATION_RUN',
    previous_status: 'DRAFT_PENDING',
    new_status: 'AI_PROPOSED',
    comments: 'Generated candidate multi-department block windows. Detected conflict CNF-001 with Vande Bharat Express.',
    digital_signature_hash: '0x1c4d...9e78'
  },
  {
    id: 'AUD-903',
    timestamp: '2026-09-13T21:00:00Z',
    user: 'R. K. Sharma (Section Controller)',
    role: 'SECTION_CONTROLLER',
    action: 'E_SIGN_VALIDATION',
    previous_status: 'AI_PROPOSED',
    new_status: 'VALIDATED',
    comments: 'Approved 75-min shadow block combining BLK-102 (S&T) and BLK-106 (TRD). Validated for ground execution.',
    digital_signature_hash: '0x7e22...4fa0'
  }
];
