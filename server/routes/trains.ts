import { Router, Request, Response } from 'express';
import { getDb } from '../db';

const router = Router();

// GET /api/trains
router.get('/', (req: Request, res: Response) => {
  try {
    const db = getDb();
    let query = 'SELECT * FROM scheduled_trains';
    const params: any[] = [];
    if (req.query.corridor_id) {
      query += ' WHERE corridor_id = ?';
      params.push(req.query.corridor_id);
    }
    query += ' ORDER BY start_hour';
    res.json(db.prepare(query).all(...params));
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch trains', details: err.message });
  }
});

// POST /api/trains
router.post('/', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const b = req.body;
    const trainId = b.train_id || `TRN-${Date.now().toString(36).toUpperCase()}`;
    db.prepare(
      'INSERT INTO scheduled_trains (train_id, train_number, name, train_type, track_line, start_hour, end_hour, speed_kmh, impact_level, status, corridor_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(trainId, b.train_number, b.name, b.train_type, b.track_line, b.start_hour, b.end_hour, b.speed_kmh, b.impact_level || 'Med', b.status || 'Scheduled', b.corridor_id);
    const created = db.prepare('SELECT * FROM scheduled_trains WHERE train_id = ?').get(trainId);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create train', details: err.message });
  }
});

export default router;
