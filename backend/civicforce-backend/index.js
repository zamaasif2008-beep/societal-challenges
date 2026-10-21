const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'civicforce_secret_key_2026';

app.use(cors());
app.use(bodyParser.json());

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

app.get('/api/reports', (req, res) => {
  res.json(reports);
});

app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'admin@tn.gov.in' && password === 'Admin@1234') {
    const token = jwt.sign({ email, role: 'admin' }, JWT_SECRET, { expiresIn: '2h' });
    return res.json({ token, message: 'Admin authenticated successfully' });
  }
  return res.status(401).json({ error: 'Invalid administrator credentials' });
});

app.listen(PORT, () => {
  console.log(`🚀 CIVICFORCE Backend running live on http://localhost:${PORT}`);
});
