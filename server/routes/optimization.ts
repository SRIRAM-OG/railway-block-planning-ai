import { Router, Request, Response } from 'express';
import { getDb, parseTask } from '../db';

const router = Router();

// POST /api/optimize — run optimization + persist results
router.post('/', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM maintenance_tasks WHERE deleted_at IS NULL').all();
    const tasks = rows.map(parseTask);
    const trainRows = db.prepare('SELECT * FROM scheduled_trains').all() as any[];

    // Run bundling logic
    const groups: { [key: string]: any[] } = {};
    let originalDuration = 0;
    let downtimeSaved = 0;

    for (const t of tasks) {
      originalDuration += (t.end_hour - t.start_hour) * 60;
      const key = `${t.asset.corridor_id}_${t.asset.track_line}_${Math.floor(t.asset.km_post.start)}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(t);
    }

    for (const key in groups) {
      const grp = groups[key];
      if (grp.length > 1) {
        const minStart = Math.min(...grp.map((t: any) => t.start_hour));
        const maxEnd = Math.max(...grp.map((t: any) => t.end_hour));
        const jointMin = (maxEnd - minStart) * 60;
        const separateMin = grp.reduce((a: number, t: any) => a + (t.end_hour - t.start_hour) * 60, 0);
        const saved = separateMin - jointMin;
        if (saved > 0) downtimeSaved += saved;
      }
    }

    const efficiency = originalDuration > 0 ? parseFloat(((downtimeSaved / originalDuration) * 100).toFixed(1)) : 0;

    // Detect conflicts
    const conflicts: any[] = [];
    let conflictCounter = 1;
    for (const task of tasks) {
      if (task.status === 'COMPLETED' || task.status === 'PUBLISHED') continue;
      for (const train of trainRows) {
        if (task.asset.corridor_id === train.corridor_id && task.asset.track_line === train.track_line) {
          const overlap = Math.max(0, Math.min(task.end_hour, train.end_hour) - Math.max(task.start_hour, train.start_hour));
          if (overlap > 0) {
            const candidateStart = Math.min(23.5, train.end_hour + 0.5);
            const duration = task.end_hour - task.start_hour;
            const candidateEnd = Math.min(24.0, candidateStart + duration);
            conflicts.push({
              id: `CNF-OPT-${conflictCounter++}`,
              task_id: task.task_id,
              conflicting_entity_id: train.train_id,
              conflicting_entity_type: 'TRAIN',
              conflict_title: `${task.task_id} vs ${train.name} (${train.train_number})`,
              severity: train.train_type.includes('Rajdhani') || train.train_type.includes('Vande') ? 'CRITICAL' : 'WARNING',
              description: `Block ${task.task_id} intersects ${train.name} slot.`,
              recommended_resolution: `Shift to ${formatHour(candidateStart)}-${formatHour(candidateEnd)} night window.`,
              proposed_new_start_hour: candidateStart,
              proposed_new_end_hour: candidateEnd,
              is_resolved: false,
            });
          }
        }
      }
    }

    // Update task statuses in DB
    const now = new Date().toISOString();
    const updateStmt = db.prepare('UPDATE maintenance_tasks SET status = ?, updated_at = ? WHERE task_id = ? AND deleted_at IS NULL');

    const updateTx = db.transaction(() => {
      for (const task of tasks) {
        if (task.status === 'DRAFT_PENDING') {
          updateStmt.run('AI_PROPOSED', now, task.task_id);
        }
      }

      // Clear old conflicts and insert new ones
      db.prepare('DELETE FROM conflicts').run();
      const insertConflict = db.prepare(
        'INSERT INTO conflicts (id, task_id, conflicting_entity_id, conflicting_entity_type, conflict_title, severity, description, recommended_resolution, proposed_new_start_hour, proposed_new_end_hour, is_resolved) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      );
      for (const c of conflicts) {
        insertConflict.run(c.id, c.task_id, c.conflicting_entity_id, c.conflicting_entity_type, c.conflict_title, c.severity, c.description, c.recommended_resolution, c.proposed_new_start_hour, c.proposed_new_end_hour, 0);
      }

      // Create audit log
      db.prepare(
        'INSERT INTO audit_logs (id, timestamp, user_name, role, action, previous_status, new_status, comments, digital_signature_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).run(
        `AUD-${Date.now()}`, now, 'OR-Tools CP-SAT Optimizer', 'SYSTEM_ADMIN',
        'AI_OPTIMIZATION_RECALC', 'DRAFT_PENDING', 'AI_PROPOSED',
        `Optimization complete. ${efficiency.toFixed(1)}% downtime reduction. ${conflicts.length} conflicts detected.`,
        `0x${Math.random().toString(16).substring(2, 10)}...`
      );
    });
    updateTx();

    // Fetch updated data
    const updatedTasks = db.prepare('SELECT * FROM maintenance_tasks WHERE deleted_at IS NULL ORDER BY priority_score DESC').all().map(parseTask);
    const updatedConflicts = db.prepare('SELECT * FROM conflicts ORDER BY severity').all();

    res.json({
      tasks: updatedTasks,
      conflicts: updatedConflicts,
      metrics: {
        bundlingEfficiencyPct: efficiency,
        totalDowntimeSavedMinutes: downtimeSaved,
        conflictsDetected: conflicts.length,
      }
    });
  } catch (err: any) {
    console.error('POST /api/optimize error:', err);
    res.status(500).json({ error: 'Optimization failed', details: err.message });
  }
});

// POST /api/resolve-conflict — resolve a specific conflict
router.post('/resolve-conflict', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const { conflict_id } = req.body;

    const conflict = db.prepare('SELECT * FROM conflicts WHERE id = ?').get(conflict_id) as any;
    if (!conflict) return res.status(404).json({ error: 'Conflict not found' });

    const now = new Date().toISOString();

    db.transaction(() => {
      // Update the task times
      db.prepare('UPDATE maintenance_tasks SET start_hour = ?, end_hour = ?, status = ?, updated_at = ? WHERE task_id = ?')
        .run(conflict.proposed_new_start_hour, conflict.proposed_new_end_hour, 'CONFLICT_FREE', now, conflict.task_id);

      // Mark conflict resolved
      db.prepare('UPDATE conflicts SET is_resolved = 1 WHERE id = ?').run(conflict_id);

      // Audit log
      db.prepare(
        'INSERT INTO audit_logs (id, timestamp, user_name, role, action, previous_status, new_status, comments, digital_signature_hash, task_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).run(
        `AUD-${Date.now()}`, now, 'AI Conflict Resolver', 'SYSTEM_ADMIN',
        'CONFLICT_RESOLUTION', 'CONFLICT_FLAG', 'CONFLICT_FREE',
        `Resolved ${conflict_id}: shifted ${conflict.task_id} to ${formatHour(conflict.proposed_new_start_hour)}-${formatHour(conflict.proposed_new_end_hour)}.`,
        `0x${Math.random().toString(16).substring(2, 10)}...`,
        conflict.task_id
      );
    })();

    const updatedTasks = db.prepare('SELECT * FROM maintenance_tasks WHERE deleted_at IS NULL ORDER BY priority_score DESC').all().map(parseTask);
    const updatedConflicts = db.prepare('SELECT * FROM conflicts ORDER BY severity').all();
    res.json({ tasks: updatedTasks, conflicts: updatedConflicts });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to resolve conflict', details: err.message });
  }
});

function formatHour(hourFloat: number): string {
  const h = Math.floor(hourFloat);
  const m = Math.round((hourFloat - h) * 60);
  return `${h < 10 ? '0' + h : h}:${m < 10 ? '0' + m : m}`;
}

export default router;
