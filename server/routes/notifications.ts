import { Router, Request, Response } from 'express';
import { getDb, parseNotification } from '../db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET /api/notifications
router.get('/', (_req: Request, res: Response) => {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50').all();
    res.json(rows.map(parseNotification));
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch notifications', details: err.message });
  }
});

// POST /api/notifications
router.post('/', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const b = req.body;
    const id = uuidv4();
    db.prepare(
      'INSERT INTO notifications (id, type, title, message, severity, is_read, link_tab, link_task_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(id, b.type, b.title, b.message, b.severity || 'INFO', 0, b.link_tab || null, b.link_task_id || null);
    const created = db.prepare('SELECT * FROM notifications WHERE id = ?').get(id);
    res.status(201).json(parseNotification(created));
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create notification', details: err.message });
  }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', (req: Request, res: Response) => {
  try {
    const db = getDb();
    db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to mark notification as read', details: err.message });
  }
});

// PUT /api/notifications/read-all
router.put('/read-all', (_req: Request, res: Response) => {
  try {
    const db = getDb();
    db.prepare('UPDATE notifications SET is_read = 1 WHERE is_read = 0').run();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to mark all as read', details: err.message });
  }
});

export default router;
