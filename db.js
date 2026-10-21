const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'data.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    public_id TEXT UNIQUE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    district TEXT NOT NULL,
    landmark TEXT,
    category TEXT NOT NULL DEFAULT 'Other',
    urgency TEXT NOT NULL DEFAULT 'Normal' CHECK (urgency IN ('Normal','High')),
    status TEXT NOT NULL DEFAULT 'New'
      CHECK (status IN ('New','Under review','Assigned','In progress','Resolved','Rejected')),
    lat REAL,
    lng REAL,
    partner TEXT,
    ai_summary TEXT,
    contact_name TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    photo_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS timeline (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    note TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
  CREATE INDEX IF NOT EXISTS idx_reports_district ON reports(district);
  CREATE INDEX IF NOT EXISTS idx_timeline_report ON timeline(report_id);
`);

// Seed initial reports if table is empty
const reportCount = db.prepare('SELECT COUNT(*) as count FROM reports').get().count;
if (reportCount === 0) {
  const insertReport = db.prepare(`
    INSERT INTO reports (public_id, title, description, district, landmark, category, urgency, status, lat, lng, partner, ai_summary, contact_name, contact_phone, contact_email)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertTimeline = db.prepare(`
    INSERT INTO timeline (report_id, status, note)
    VALUES (?, ?, ?)
  `);

  const r1 = insertReport.run(
    'TNCR-2048',
    'Streetlights out on Anna Salai near Teynampet junction',
    'Two high-mast streetlights near Teynampet metro intersection on Anna Salai have been completely dead for 4 evenings.',
    'Chennai', 'Teynampet Metro Gate 3', 'Street lighting', 'Normal', 'Under review',
    13.0418, 80.2481, 'TANGEDCO Electricity Board',
    'High-mast lights failed at Teynampet intersection creating pedestrian safety hazard.',
    'S. Ramachandran', '+91 98401 23456', 'ramachandran.s@example.com'
  );
  insertTimeline.run(r1.lastInsertRowid, 'Received', 'Report logged via citizen portal. AI triage completed.');
  insertTimeline.run(r1.lastInsertRowid, 'Under review', 'Admin assigned TANGEDCO Central Division for cable fault inspection.');

  const r2 = insertReport.run(
    'TNCR-2047',
    'Water stagnation and clogged storm drain near Ukkadam market',
    'Rainwater and sewage pooling across 40-meter stretch beside Ukkadam market entrance.',
    'Coimbatore', 'Ukkadam Market Western Gate', 'Water & drainage', 'High', 'In progress',
    10.9931, 76.9612, 'TWAD Board',
    'Severe sewage stagnation blocking market access. Emergency desilting required.',
    'M. Kavitha', '+91 97890 54321', 'kavitha.cbe@example.com'
  );
  insertTimeline.run(r2.lastInsertRowid, 'Received', 'High urgency flagged due to public market footfall.');
  insertTimeline.run(r2.lastInsertRowid, 'In progress', 'Excavator and suction tanker deployed on site.');

  console.log('🌱 Seeded initial reports into SQLite database.');
}

module.exports = db;