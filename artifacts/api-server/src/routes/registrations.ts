import { Router } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();

// Store registrations in a JSON file at the workspace root
const DATA_FILE = path.resolve('./registrations-data.json');

function readData(): Record<string, unknown>[] {
  try {
    if (!fs.existsSync(DATA_FILE)) return [];
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw) as Record<string, unknown>[];
  } catch {
    return [];
  }
}

function writeData(data: Record<string, unknown>[]) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// POST /api/registrations — submit a new registration
router.post('/registrations', (req, res) => {
  try {
    const body = req.body as Record<string, unknown>;
    if (!body || !body.teamName || !body.captainName) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const now = new Date().toISOString();
    const dateStr = now.slice(0, 10).replace(/-/g, '');
    const suffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const id = `MPCL-${dateStr}-${suffix}`;

    const registration = {
      ...body,
      id,
      state: 'Madhya Pradesh',
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    const all = readData();
    all.unshift(registration);
    writeData(all);

    res.json({ id });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Failed to save registration' });
  }
});

// GET /api/registrations — list all (admin)
router.get('/registrations', (req, res) => {
  try {
    const all = readData();
    res.json(all);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read registrations' });
  }
});

// GET /api/registrations/:id — track by ID
router.get('/registrations/:id', (req, res) => {
  try {
    const all = readData();
    const found = all.find((r) => r.id === req.params.id);
    if (!found) {
      res.status(404).json({ error: 'Registration not found' });
      return;
    }
    res.json(found);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read registration' });
  }
});

// PATCH /api/registrations/:id — approve or reject (admin)
router.patch('/registrations/:id', (req, res) => {
  try {
    const all = readData();
    const idx = all.findIndex((r) => r.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Registration not found' });
      return;
    }
    const body = req.body as Record<string, unknown>;
    all[idx] = { ...all[idx], ...body, updatedAt: new Date().toISOString() };
    writeData(all);
    res.json(all[idx]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update registration' });
  }
});

export default router;
