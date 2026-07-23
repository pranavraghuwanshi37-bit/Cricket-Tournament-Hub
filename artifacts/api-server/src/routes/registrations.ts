import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { db, registrationsTable } from '@workspace/db';
import { eq, desc } from 'drizzle-orm';

const router = Router();

// Define durable paths for data storage to avoid data loss across container restarts
const HOME_DATA_DIR = path.join(os.homedir() || os.tmpdir(), '.mpcl-cricket-data');
const DATA_DIR = process.env.DATA_DIR 
  ? path.resolve(process.env.DATA_DIR) 
  : path.resolve(process.cwd(), 'data');

const DATA_FILES = [
  path.join(HOME_DATA_DIR, 'registrations-data.json'),
  path.join(DATA_DIR, 'registrations-data.json'),
  path.resolve('./registrations-data.json'),
];

// Ensure fallback data directories exist
DATA_FILES.forEach((filePath) => {
  try {
    const parentDir = path.dirname(filePath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
  } catch (e) {
    console.warn(`Could not create directory for ${filePath}:`, e);
  }
});

function readLocalFilesData(): Record<string, any>[] {
  const mergedMap = new Map<string, Record<string, any>>();

  for (const filePath of DATA_FILES) {
    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(raw);
        if (Array.isArray(data)) {
          for (const item of data) {
            if (item && item.id) {
              if (!mergedMap.has(item.id)) {
                mergedMap.set(item.id, item);
              }
            }
          }
        }
      }
    } catch {
      // Continue reading other file locations
    }
  }

  return Array.from(mergedMap.values()).sort(
    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );
}

function writeLocalFilesData(data: Record<string, any>[]) {
  for (const filePath of DATA_FILES) {
    try {
      const parentDir = path.dirname(filePath);
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.warn(`Failed writing to ${filePath}:`, err);
    }
  }
}

async function getAllRegistrations(): Promise<Record<string, any>[]> {
  const localData = readLocalFilesData();

  if (db) {
    try {
      const dbRows = await db.select().from(registrationsTable).orderBy(desc(registrationsTable.createdAt));
      if (dbRows && dbRows.length > 0) {
        // Sync local files with DB data
        writeLocalFilesData(dbRows);
        return dbRows;
      } else if (localData.length > 0) {
        // Seed DB with local data if DB is empty but local data exists
        for (const item of localData) {
          try {
            await db.insert(registrationsTable).values({
              id: String(item.id),
              teamName: String(item.teamName || ''),
              captainName: String(item.captainName || ''),
              captainPhone: String(item.captainPhone || ''),
              captainEmail: String(item.captainEmail || ''),
              city: String(item.city || ''),
              state: String(item.state || 'Madhya Pradesh'),
              category: String(item.category || ''),
              transactionId: String(item.transactionId || ''),
              paymentProofUrl: item.paymentProofUrl ? String(item.paymentProofUrl) : null,
              status: String(item.status || 'pending'),
              rejectionReason: item.rejectionReason ? String(item.rejectionReason) : null,
              createdAt: String(item.createdAt || new Date().toISOString()),
              updatedAt: String(item.updatedAt || new Date().toISOString()),
            }).onConflictDoNothing();
          } catch (e) {
            console.warn('Failed seeding record to DB:', e);
          }
        }
        return localData;
      }
    } catch (err) {
      console.error('Error fetching from database, falling back to local files:', err);
    }
  }

  return localData;
}

// POST /api/registrations — submit a new registration
router.post('/registrations', async (req, res) => {
  try {
    const body = req.body as Record<string, any>;
    if (!body || !body.teamName || !body.captainName) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const now = new Date().toISOString();
    const dateStr = now.slice(0, 10).replace(/-/g, '');
    const suffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const id = `MPCL-${dateStr}-${suffix}`;

    const registration = {
      id,
      teamName: String(body.teamName),
      captainName: String(body.captainName),
      captainPhone: String(body.captainPhone || ''),
      captainEmail: String(body.captainEmail || ''),
      city: String(body.city || ''),
      state: String(body.state || 'Madhya Pradesh'),
      category: String(body.category || ''),
      transactionId: String(body.transactionId || ''),
      paymentProofUrl: body.paymentProofUrl ? String(body.paymentProofUrl) : null,
      status: 'pending',
      rejectionReason: null,
      createdAt: now,
      updatedAt: now,
    };

    // Save to Database if DB is available
    if (db) {
      try {
        await db.insert(registrationsTable).values(registration);
      } catch (dbErr) {
        console.error('Database insert error:', dbErr);
      }
    }

    // Always save to persistent local files as backup/cache
    const allLocal = readLocalFilesData();
    allLocal.unshift(registration);
    writeLocalFilesData(allLocal);

    res.json({ id });
  } catch (err) {
    console.error('Registration submission error:', err);
    res.status(500).json({ error: 'Failed to save registration' });
  }
});

// GET /api/registrations — list all (admin)
router.get('/registrations', async (req, res) => {
  try {
    const all = await getAllRegistrations();
    res.json(all);
  } catch (err) {
    console.error('Error fetching registrations:', err);
    res.status(500).json({ error: 'Failed to read registrations' });
  }
});

// GET /api/registrations/:id — track by ID
router.get('/registrations/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (db) {
      try {
        const foundDb = await db.select().from(registrationsTable).where(eq(registrationsTable.id, id));
        if (foundDb && foundDb.length > 0) {
          res.json(foundDb[0]);
          return;
        }
      } catch (err) {
        console.error('DB read by ID error:', err);
      }
    }

    const all = readLocalFilesData();
    const found = all.find((r) => r.id === id);
    if (!found) {
      res.status(404).json({ error: 'Registration not found' });
      return;
    }
    res.json(found);
  } catch (err) {
    console.error('Error fetching registration by ID:', err);
    res.status(500).json({ error: 'Failed to read registration' });
  }
});

// PATCH /api/registrations/:id — approve or reject (admin)
router.patch('/registrations/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const body = req.body as Record<string, any>;
    const updatedAt = new Date().toISOString();

    const updatePayload: Record<string, any> = { updatedAt };
    if (body.status !== undefined) updatePayload.status = String(body.status);
    if (body.rejectionReason !== undefined) updatePayload.rejectionReason = String(body.rejectionReason);

    let updatedRecord: Record<string, any> | null = null;

    if (db) {
      try {
        await db.update(registrationsTable)
          .set(updatePayload)
          .where(eq(registrationsTable.id, id));
        const resDb = await db.select().from(registrationsTable).where(eq(registrationsTable.id, id));
        if (resDb && resDb.length > 0) {
          updatedRecord = resDb[0];
        }
      } catch (err) {
        console.error('DB update error:', err);
      }
    }

    // Update local files
    const all = readLocalFilesData();
    const idx = all.findIndex((r) => r.id === id);
    if (idx !== -1) {
      all[idx] = { ...all[idx], ...updatePayload };
      writeLocalFilesData(all);
      if (!updatedRecord) updatedRecord = all[idx];
    }

    if (!updatedRecord) {
      res.status(404).json({ error: 'Registration not found' });
      return;
    }

    res.json(updatedRecord);
  } catch (err) {
    console.error('Error updating registration:', err);
    res.status(500).json({ error: 'Failed to update registration' });
  }
});

export default router;

