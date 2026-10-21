const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware - Crucial for allowing frontend (port 5500) to communicate with backend (port 5000)
app.use(cors());
app.use(express.json());

// In-Memory Database (Mock Reports for Tamil Nadu Societal Challenges)
let reports = [
  {
    id: 1,
    public_id: 'TNCR-101',
    title: 'Major water pipeline burst flooding school road junction',
    description: 'A massive municipal water pipe has burst near the primary school intersection, creating ankle-deep waterlogging and disrupting local traffic.',
    district: 'Chennai',
    landmark: 'Anna Salai, Chennai',
    category: 'Water & drainage',
    urgency: 'High',
    status: 'In progress',
    partner: 'Anna University Civil Dept',
    lat: 13.0418,
    lng: 80.2481,
    timeline: [
      { status: 'New', note: 'Report submitted by citizen.', date: '2026-10-18 09:30' },
      { status: 'Under review', note: 'AI classified as High Urgency Water & Drainage issue.', date: '2026-10-18 09:32' },
      { status: 'Assigned', note: 'Assigned to Anna University Civil Dept partner board.', date: '2026-10-18 11:00' },
      { status: 'In progress', note: 'Municipal crew and student engineers dispatched.', date: '2026-10-19 08:15' }
    ]
  },
  {
    id: 2,
    public_id: 'TNCR-102',
    title: 'Non-functional high mast streetlights near bus terminal',
    description: 'Four consecutive streetlights have been out for over a week, creating safety hazards for commuters walking home after dark.',
    district: 'Coimbatore',
    landmark: 'Ukkadam, Coimbatore',
    category: 'Street lighting',
    urgency: 'Medium',
    status: 'Assigned',
    partner: 'PSG College of Technology',
    lat: 10.9931,
    lng: 76.9612,
    timeline: [
      { status: 'New', note: 'Report submitted.', date: '2026-10-19 14:20' },
      { status: 'Under review', note: 'Verified by automated triage.', date: '2026-10-19 14:22' },
      { status: 'Assigned', note: 'Assigned to PSG Tech electrical R&D cell.', date: '2026-10-20 10:00' }
    ]
  }
];

// 1. GET ALL REPORTS
app.get('/api/reports', (req, res) => {
  res.json(reports);
});

// 2. GET SINGLE REPORT BY ID
app.get('/api/reports/:id', (req, res) => {
  const reportId = parseInt(req.params.id);
  const report = reports.find(r => r.id === reportId);
  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }
  res.json(report);
});

// 3. POST NEW REPORT (Fixes the submission failure)
app.post('/api/reports', (req, res) => {
  try {
    const { title, district, landmark, description, lat, lng, category, urgency, partner } = req.body;

    if (!title || !district || !description) {
      return res.status(400).json({ error: 'Title, district, and description are required fields.' });
    }

    const newReport = {
      id: Date.now(),
      public_id: `TNCR-${Math.floor(100 + Math.random() * 900)}`,
      title: title,
      district: district,
      landmark: landmark || 'General Area',
      description: description,
      category: category || 'Municipal Infrastructure',
      urgency: urgency || 'High',
      partner: partner || 'Chennai Municipal R&D Board',
      status: 'New',
      lat: lat ? parseFloat(lat) : 13.0827,
      lng: lng ? parseFloat(lng) : 80.2707,
      timeline: [
        { status: 'New', note: 'Report submitted by citizen via CIVICFORCE platform.', date: new Date().toLocaleString() }
      ]
    };

    reports.unshift(newReport);
    res.status(201).json(newReport);
  } catch (err) {
    console.error('Error creating report:', err);
    res.status(500).json({ error: 'Internal server error while saving report.' });
  }
});

// 4. ADMIN LOGIN ENDPOINT
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'admin@tn.gov.in' && password === 'Admin@1234') {
    res.json({ token: 'mock-jwt-admin-token-sih26043', role: 'admin' });
  } else {
    res.status(401).json({ error: 'Invalid admin credentials' });
  }
});

// 5. UPDATE REPORT STATUS (PATCH)
app.patch('/api/reports/:id/status', (req, res) => {
  const reportId = parseInt(req.params.id);
  const { status, note, timeline_note, message } = req.body;
  
  const report = reports.find(r => r.id === reportId);
  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }

  if (status) report.status = status;
  
  const updateNote = note || timeline_note || message || `Status updated to ${report.status}`;
  if (report.timeline) {
    report.timeline.unshift({
      status: report.status,
      note: updateNote,
      date: new Date().toLocaleString()
    });
  }

  res.json(report);
});

// 6. UPDATE FULL REPORT (PUT)
app.put('/api/reports/:id', (req, res) => {
  const reportId = parseInt(req.params.id);
  const reportIndex = reports.findIndex(r => r.id === reportId);
  
  if (reportIndex === -1) {
    return res.status(404).json({ error: 'Report not found' });
  }

  const { title, district, landmark, description, category, urgency, partner, status, note, timeline_note } = req.body;
  
  const existing = reports[reportIndex];
  reports[reportIndex] = {
    ...existing,
    title: title || existing.title,
    district: district || existing.district,
    landmark: landmark !== undefined ? landmark : existing.landmark,
    description: description || existing.description,
    category: category || existing.category,
    urgency: urgency || existing.urgency,
    partner: partner !== undefined ? partner : existing.partner,
    status: status || existing.status
  };

  if (status && status !== existing.status) {
    reports[reportIndex].timeline.unshift({
      status: status,
      note: note || timeline_note || `Status updated to ${status}`,
      date: new Date().toLocaleString()
    });
  }

  res.json(reports[reportIndex]);
});

// Start Server
app.listen(PORT, () => {
  console.log(`CIVICFORCE backend server running successfully at http://localhost:${PORT}`);
});