import { Router, Request, Response } from 'express';
import { getDb, parseAuditLog } from '../db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET /api/audit-logs
router.get('/', (_req: Request, res: Response) => {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 100').all();
    res.json(rows.map(parseAuditLog));
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch audit logs', details: err.message });
  }
});

// POST /api/audit-logs
router.post('/', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const b = req.body;
    const id = `AUD-${Date.now()}`;
    const now = new Date().toISOString();
    const hash = `0x${Math.random().toString(16).substring(2, 10)}...`;

    db.prepare(
      'INSERT INTO audit_logs (id, timestamp, user_name, role, action, previous_status, new_status, comments, digital_signature_hash, task_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(id, now, b.user || 'System', b.role || 'SYSTEM_ADMIN', b.action, b.previous_status, b.new_status, b.comments || '', b.digital_signature_hash || hash, b.task_id || null);

    const created = db.prepare('SELECT * FROM audit_logs WHERE id = ?').get(id);
    res.status(201).json(parseAuditLog(created));
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create audit log', details: err.message });
  }
});

export default router;
