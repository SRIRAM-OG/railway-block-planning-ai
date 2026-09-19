import { Router, Request, Response } from 'express';
import { getDb } from '../db';

const router = Router();

// GET /api/corridors
router.get('/', (_req: Request, res: Response) => {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM corridors ORDER BY code').all();
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch corridors', details: err.message });
  }
});

// GET /api/corridors/:id
router.get('/:id', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const row = db.prepare('SELECT * FROM corridors WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Corridor not found' });
    res.json(row);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch corridor', details: err.message });
  }
});

// PUT /api/corridors/:id — update corridor availability
router.put('/:id', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const { asset_availability_pct } = req.body;
    if (asset_availability_pct !== undefined) {
      db.prepare('UPDATE corridors SET asset_availability_pct = ? WHERE id = ?').run(asset_availability_pct, req.params.id);
    }
    const updated = db.prepare('SELECT * FROM corridors WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update corridor', details: err.message });
  }
});

export default router;
