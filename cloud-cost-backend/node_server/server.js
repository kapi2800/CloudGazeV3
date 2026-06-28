const express = require('express');
const cors    = require('cors');
const jwt     = require('jsonwebtoken');
const fs      = require('fs');
const path    = require('path');
require('dotenv').config(); // Reads node_server/.env

const app = express();
app.use(cors());
app.use(express.json());

const DEMO_USER = {
  email:    'admin@cloudgaze.com',
  password: 'cloudgaze123',
  name:     'Admin User',
};

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_super_secret_key_for_development';

const CREDS_FILE = path.join(__dirname, '..', 'credentials.json');

function readCreds() {
  try {
    if (fs.existsSync(CREDS_FILE)) {
      return JSON.parse(fs.readFileSync(CREDS_FILE, 'utf8'));
    }
  } catch (_) {}
  return { aws: null, gcp: null };
}

// Helper: write credentials file
function writeCreds(data) {
  fs.writeFileSync(CREDS_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// ── Auth Middleware ────────────────────────────────────────────────────────────
function requireJWT(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(header.split(' ')[1], JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ── POST /api/auth/login ───────────────────────────────────────────────────────
// Step 1: Check email+password. Step 2: Sign JWT. Step 3: Return token.
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (email === DEMO_USER.email && password === DEMO_USER.password) {
    const token = jwt.sign(
      { email: DEMO_USER.email, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    return res.json({ success: true, token, user: { name: DEMO_USER.name, email: DEMO_USER.email } });
  }
  return res.status(401).json({ success: false, message: 'Invalid email or password' });
});

// ── POST /api/auth/verify ──────────────────────────────────────────────────────
app.post('/api/auth/verify', (req, res) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ valid: false });
  try {
    const decoded = jwt.verify(header.split(' ')[1], JWT_SECRET);
    return res.json({ valid: true, user: decoded });
  } catch {
    return res.status(401).json({ valid: false, error: 'Token expired or invalid' });
  }
});

// ── POST /api/credentials ──────────────────────────────────────────────────────
// Saves AWS and/or GCP credentials server-side (to credentials.json).
// The frontend sends keys here. Python reads the file to make API calls.
// We NEVER send credentials back in GET responses — only masked versions.
app.post('/api/credentials', requireJWT, (req, res) => {
  const { awsKeyId, awsSecret, gcpJson } = req.body;
  const existing = readCreds();

  if (awsKeyId && awsSecret) {
    existing.aws = { keyId: awsKeyId, secret: awsSecret, savedAt: new Date().toISOString() };
  }
  if (gcpJson) {
    try {
      // Validate it's real JSON before saving
      JSON.parse(gcpJson);
      existing.gcp = { json: gcpJson, savedAt: new Date().toISOString() };
    } catch {
      return res.status(400).json({ success: false, message: 'GCP JSON is invalid' });
    }
  }

  writeCreds(existing);
  return res.json({ success: true, message: 'Credentials saved successfully' });
});

// ── GET /api/credentials/status ───────────────────────────────────────────────
// Returns ONLY whether credentials exist — never the actual keys.
app.get('/api/credentials/status', requireJWT, (req, res) => {
  const creds = readCreds();
  return res.json({
    aws: {
      configured: !!creds.aws,
      keyIdPreview: creds.aws ? `${creds.aws.keyId.slice(0, 4)}...${creds.aws.keyId.slice(-4)}` : null,
      savedAt: creds.aws?.savedAt || null,
    },
    gcp: {
      configured: !!creds.gcp,
      savedAt: creds.gcp?.savedAt || null,
    },
  });
});

// ── DELETE /api/credentials/:provider ─────────────────────────────────────────
app.delete('/api/credentials/:provider', requireJWT, (req, res) => {
  const { provider } = req.params;
  const existing = readCreds();
  if (provider === 'aws') existing.aws = null;
  if (provider === 'gcp') existing.gcp = null;
  writeCreds(existing);
  return res.json({ success: true });
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`✅ Node.js Auth Service running on http://localhost:${PORT}`);
  console.log(`JWT Secret Loaded: ${process.env.JWT_SECRET ? 'Yes' : 'No (Using fallback)'}`);
});
