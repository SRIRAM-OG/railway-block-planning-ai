import { Router, Request, Response } from 'express';
import { getDb, parseTask } from '../db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET /api/tasks — list all tasks (with optional filters)
router.get('/', (req: Request, res: Response) => {
  try {
    const db = getDb();
    let query = 'SELECT * FROM maintenance_tasks WHERE deleted_at IS NULL';
    const params: any[] = [];

    if (req.query.department && req.query.department !== 'ALL') {
      query += ' AND department = ?';
      params.push(req.query.department);
    }
    if (req.query.status) {
      query += ' AND status = ?';
      params.push(req.query.status);
    }
    if (req.query.corridor_id) {
      query += ` AND json_extract(asset_json, '$.corridor_id') = ?`;
      params.push(req.query.corridor_id);
    }

    query += ' ORDER BY priority_score DESC';

    const rows = db.prepare(query).all(...params);
    res.json(rows.map(parseTask));
  } catch (err: any) {
    console.error('GET /api/tasks error:', err);
    res.status(500).json({ error: 'Failed to fetch tasks', details: err.message });
  }
});

// GET /api/tasks/:id — single task
router.get('/:id', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const row = db.prepare('SELECT * FROM maintenance_tasks WHERE task_id = ? AND deleted_at IS NULL').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Task not found' });
    res.json(parseTask(row));
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch task', details: err.message });
  }
});

// POST /api/tasks — create new task
router.post('/', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const body = req.body;

    // Validation
    if (!body.title || !body.department) {
      return res.status(400).json({ error: 'title and department are required' });
    }

    const taskId = body.task_id || `BLK-${Date.now().toString(36).toUpperCase()}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO maintenance_tasks (task_id, source_system, department, title, asset_json, defect_json, operational_requirements_json, priority_score, priority_decomposition_json, start_hour, end_hour, status, impact_level, bundled_with_task_ids, is_shadow_block, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      taskId,
      body.source_system || 'TMS',
      body.department,
      body.title,
      JSON.stringify(body.asset || {}),
      JSON.stringify(body.defect || {}),
      JSON.stringify(body.operational_requirements || {}),
      body.priority_score || 0,
      JSON.stringify(body.priority_decomposition || {}),
      body.start_hour || 0,
      body.end_hour || 0,
      body.status || 'DRAFT_PENDING',
      body.impact_level || 'Med',
      body.bundled_with_task_ids ? JSON.stringify(body.bundled_with_task_ids) : null,
      body.is_shadow_block ? 1 : 0,
      now, now
    );

    const created = db.prepare('SELECT * FROM maintenance_tasks WHERE task_id = ?').get(taskId);
    res.status(201).json(parseTask(created));
  } catch (err: any) {
    console.error('POST /api/tasks error:', err);
    res.status(500).json({ error: 'Failed to create task', details: err.message });
  }
});

// PUT /api/tasks/:id — update task
router.put('/:id', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const existing = db.prepare('SELECT * FROM maintenance_tasks WHERE task_id = ? AND deleted_at IS NULL').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Task not found' });

    const body = req.body;
    const now = new Date().toISOString();

    const updates: string[] = [];
    const params: any[] = [];

    if (body.title !== undefined) { updates.push('title = ?'); params.push(body.title); }
    if (body.department !== undefined) { updates.push('department = ?'); params.push(body.department); }
    if (body.source_system !== undefined) { updates.push('source_system = ?'); params.push(body.source_system); }
    if (body.status !== undefined) { updates.push('status = ?'); params.push(body.status); }
    if (body.start_hour !== undefined) { updates.push('start_hour = ?'); params.push(body.start_hour); }
    if (body.end_hour !== undefined) { updates.push('end_hour = ?'); params.push(body.end_hour); }
    if (body.impact_level !== undefined) { updates.push('impact_level = ?'); params.push(body.impact_level); }
    if (body.priority_score !== undefined) { updates.push('priority_score = ?'); params.push(body.priority_score); }
    if (body.priority_decomposition !== undefined) { updates.push('priority_decomposition_json = ?'); params.push(JSON.stringify(body.priority_decomposition)); }
    if (body.asset !== undefined) { updates.push('asset_json = ?'); params.push(JSON.stringify(body.asset)); }
    if (body.defect !== undefined) { updates.push('defect_json = ?'); params.push(JSON.stringify(body.defect)); }
    if (body.operational_requirements !== undefined) { updates.push('operational_requirements_json = ?'); params.push(JSON.stringify(body.operational_requirements)); }
    if (body.bundled_with_task_ids !== undefined) { updates.push('bundled_with_task_ids = ?'); params.push(body.bundled_with_task_ids ? JSON.stringify(body.bundled_with_task_ids) : null); }
    if (body.is_shadow_block !== undefined) { updates.push('is_shadow_block = ?'); params.push(body.is_shadow_block ? 1 : 0); }

    updates.push('updated_at = ?');
    params.push(now);
    params.push(req.params.id);

    if (updates.length > 1) {
      db.prepare(`UPDATE maintenance_tasks SET ${updates.join(', ')} WHERE task_id = ?`).run(...params);
    }

    const updated = db.prepare('SELECT * FROM maintenance_tasks WHERE task_id = ?').get(req.params.id);
    res.json(parseTask(updated));
  } catch (err: any) {
    console.error('PUT /api/tasks error:', err);
    res.status(500).json({ error: 'Failed to update task', details: err.message });
  }
});

// DELETE /api/tasks/:id — soft delete
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const now = new Date().toISOString();
    const result = db.prepare('UPDATE maintenance_tasks SET deleted_at = ? WHERE task_id = ? AND deleted_at IS NULL').run(now, req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Task not found' });
    res.json({ success: true, message: 'Task archived' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete task', details: err.message });
  }
});

// POST /api/tasks/bulk-update — update multiple tasks at once
router.post('/bulk-update', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const { updates } = req.body; // Array of { task_id, ...fields }
    if (!Array.isArray(updates)) return res.status(400).json({ error: 'updates array required' });

    const now = new Date().toISOString();
    const stmt = db.prepare('UPDATE maintenance_tasks SET status = ?, start_hour = ?, end_hour = ?, is_shadow_block = ?, bundled_with_task_ids = ?, priority_score = ?, priority_decomposition_json = ?, updated_at = ? WHERE task_id = ?');

    const bulkUpdate = db.transaction(() => {
      for (const u of updates) {
        stmt.run(
          u.status, u.start_hour, u.end_hour,
          u.is_shadow_block ? 1 : 0,
          u.bundled_with_task_ids ? JSON.stringify(u.bundled_with_task_ids) : null,
          u.priority_score || 0,
          JSON.stringify(u.priority_decomposition || {}),
          now, u.task_id
        );
      }
    });
    bulkUpdate();

    const rows = db.prepare('SELECT * FROM maintenance_tasks WHERE deleted_at IS NULL ORDER BY priority_score DESC').all();
    res.json(rows.map(parseTask));
  } catch (err: any) {
    res.status(500).json({ error: 'Bulk update failed', details: err.message });
  }
});

export default router;
