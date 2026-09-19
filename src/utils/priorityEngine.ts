import { MaintenanceTask, PriorityWeights, PriorityScoreDecomposition } from '../types';

export function calculatePriorityScore(
  task: MaintenanceTask,
  weights: PriorityWeights
): PriorityScoreDecomposition {
  // 1. Asset Criticality (C in [0, 100])
  const classScore = task.asset.criticality_class === 'A' ? 100 : task.asset.criticality_class === 'B' ? 75 : 50;
  const cFactor = classScore * weights.w_crit;

  // 2. Defect Severity (S in [0, 100])
  const sevScore = task.defect.severity === 'CRITICAL' ? 100 : task.defect.severity === 'HIGH' ? 80 : task.defect.severity === 'MEDIUM' ? 50 : 25;
  const sFactor = sevScore * weights.w_sev;

  // 3. Overdue Duration (D in [0, 100]) -> Sigmoid scaling past service threshold
  const overdueDays = Math.max(0, task.defect.overdue_days);
  const overdueScore = Math.min(100, Math.round((1 / (1 + Math.exp(-0.25 * (overdueDays - 7)))) * 100));
  const dFactor = overdueScore * weights.w_overdue;

  // 4. Safety Vulnerability (Rs in [0, 100])
  const isUSFDorIMR = task.defect.code.includes('IMR') || task.defect.code.includes('RAIL_FRACTURE');
  const isOHEGroove = task.defect.code.includes('CONTACT_WIRE');
  const safetyScore = isUSFDorIMR ? 98 : isOHEGroove ? 92 : task.defect.severity === 'CRITICAL' ? 85 : 65;
  const rsFactor = safetyScore * weights.w_safety;

  // 5. Failure Risk / GMT (F in [0, 100])
  const gmt = task.defect.gmt_accumulated || 30;
  const failScore = Math.min(100, Math.round((gmt / 50) * 80 + (task.defect.failure_probability_pct || 40) * 0.2));
  const fFactor = failScore * weights.w_fail;

  // 6. Ops Impact (O in [0, 100])
  const opsScore = task.asset.track_line.includes('Main') ? 85 : 60;
  const oFactor = opsScore * weights.w_ops;

  const totalScore = parseFloat((cFactor + sFactor + dFactor + rsFactor + fFactor + oFactor).toFixed(1));

  const explanation_bullets: string[] = [
    `Asset Criticality (${task.asset.criticality_class}): ${cFactor.toFixed(1)} / ${(100 * weights.w_crit).toFixed(1)} pts`,
    `Defect Severity (${task.defect.severity}): ${sFactor.toFixed(1)} / ${(100 * weights.w_sev).toFixed(1)} pts`,
    `Overdue Factor (${overdueDays} days): ${dFactor.toFixed(1)} / ${(100 * weights.w_overdue).toFixed(1)} pts`,
    `Safety Risk Index: ${rsFactor.toFixed(1)} / ${(100 * weights.w_safety).toFixed(1)} pts`,
    `Failure Risk (GMT ${gmt}T): ${fFactor.toFixed(1)} / ${(100 * weights.w_fail).toFixed(1)} pts`,
    `Ops Impact (Track ${task.asset.track_line}): ${oFactor.toFixed(1)} / ${(100 * weights.w_ops).toFixed(1)} pts`
  ];

  return {
    total_score: totalScore,
    asset_criticality_factor: parseFloat(cFactor.toFixed(1)),
    defect_severity_factor: parseFloat(sFactor.toFixed(1)),
    overdue_factor: parseFloat(dFactor.toFixed(1)),
    safety_vulnerability_factor: parseFloat(rsFactor.toFixed(1)),
    failure_risk_gmt_factor: parseFloat(fFactor.toFixed(1)),
    ops_impact_factor: parseFloat(oFactor.toFixed(1)),
    explanation_bullets
  };
}
