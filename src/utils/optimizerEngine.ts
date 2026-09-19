import { MaintenanceTask, ScheduledTrain, ConflictRecord } from '../types';

export function detectConflicts(
  tasks: MaintenanceTask[],
  trains: ScheduledTrain[]
): ConflictRecord[] {
  const conflicts: ConflictRecord[] = [];
  let conflictIdCounter = 1;

  for (const task of tasks) {
    if (task.status === 'COMPLETED' || task.status === 'PUBLISHED') continue;

    for (const train of trains) {
      // Same track line and corridor?
      if (
        task.asset.corridor_id === train.corridor_id &&
        task.asset.track_line === train.track_line
      ) {
        // Interval overlap check: [start_1, end_1] intersects [start_2, end_2]
        const overlap = Math.max(0, Math.min(task.end_hour, train.end_hour) - Math.max(task.start_hour, train.start_hour));
        
        if (overlap > 0) {
          // Find safe new window (e.g. after train leaves + 0.5h buffer)
          const candidateStart = Math.min(23.5, train.end_hour + 0.5);
          const duration = task.end_hour - task.start_hour;
          const candidateEnd = Math.min(24.0, candidateStart + duration);

          conflicts.push({
            id: `CNF-AUTO-${conflictIdCounter++}`,
            task_id: task.task_id,
            conflicting_entity_id: train.train_id,
            conflicting_entity_type: 'TRAIN',
            conflict_title: `Conflict: ${task.task_id} (${task.title}) vs ${train.name} (${train.train_number})`,
            severity: train.train_type.includes('Rajdhani') ? 'CRITICAL' : 'WARNING',
            description: `Block ${task.task_id} on ${task.asset.track_line} (${formatHour(task.start_hour)} - ${formatHour(task.end_hour)}) intersects ${train.name} slot (${formatHour(train.start_hour)} - ${formatHour(train.end_hour)}).`,
            recommended_resolution: `Reschedule ${task.task_id} to night window (${formatHour(candidateStart)} - ${formatHour(candidateEnd)}) or request train traffic regulation.`,
            proposed_new_start_hour: candidateStart,
            proposed_new_end_hour: candidateEnd,
            is_resolved: false
          });
        }
      }
    }
  }

  return conflicts;
}

export function bundleMultiDepartmentTasks(tasks: MaintenanceTask[]): {
  bundledTasks: MaintenanceTask[];
  totalDowntimeSavedMinutes: number;
  bundlingEfficiencyPct: number;
} {
  // Identify tasks within 500m (same km_post section) and close timing
  let downtimeSaved = 0;
  let originalDuration = 0;
  let optimizedDuration = 0;

  const copyTasks = JSON.parse(JSON.stringify(tasks)) as MaintenanceTask[];

  // Group candidate tasks by section and track line
  const groups: { [key: string]: MaintenanceTask[] } = {};
  for (const t of copyTasks) {
    originalDuration += (t.end_hour - t.start_hour) * 60;
    const key = `${t.asset.corridor_id}_${t.asset.track_line}_${Math.floor(t.asset.km_post.start)}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(t);
  }

  for (const key in groups) {
    const groupTasks = groups[key];
    if (groupTasks.length > 1) {
      // Find joint start and end
      const minStart = Math.min(...groupTasks.map(t => t.start_hour));
      const maxEnd = Math.max(...groupTasks.map(t => t.end_hour));
      const jointDurationMin = (maxEnd - minStart) * 60;
      const separateDurationMin = groupTasks.reduce((acc, t) => acc + (t.end_hour - t.start_hour) * 60, 0);

      const saved = separateDurationMin - jointDurationMin;
      if (saved > 0) {
        downtimeSaved += saved;
        // Mark primary task as bundled shadow block
        groupTasks[0].is_shadow_block = true;
        groupTasks[0].bundled_with_task_ids = groupTasks.slice(1).map(x => x.task_id);
      }
    }
  }

  optimizedDuration = originalDuration - downtimeSaved;
  const efficiency = originalDuration > 0 ? parseFloat(((downtimeSaved / originalDuration) * 100).toFixed(1)) : 0;

  return {
    bundledTasks: copyTasks,
    totalDowntimeSavedMinutes: downtimeSaved,
    bundlingEfficiencyPct: efficiency
  };
}

export function formatHour(hourFloat: number): string {
  const h = Math.floor(hourFloat);
  const m = Math.round((hourFloat - h) * 60);
  const hStr = h < 10 ? `0${h}` : `${h}`;
  const mStr = m < 10 ? `0${m}` : `${m}`;
  return `${hStr}:${mStr}`;
}
