import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// File to store wallet submissions
const WALLET_FILE = 'wallet_submissions.json';

// File to store used codes
const USED_CODES_FILE = 'codes_used.txt';
const CODES_FILE = 'codes.txt';

// Initialize wallet file if it doesn't exist
if (!fs.existsSync(WALLET_FILE)) {
  fs.writeFileSync(WALLET_FILE, JSON.stringify([], null, 2));
}

// Initialize used codes file if it doesn't exist
if (!fs.existsSync(USED_CODES_FILE)) {
  fs.writeFileSync(USED_CODES_FILE, '');
}

// API endpoint to submit wallet
app.post('/api/submit-wallet', (req, res) => {
  try {
    const { wallet, rewardType } = req.body;
    
    if (!wallet || !rewardType) {
      return res.status(400).json({ error: 'Wallet address and reward type are required' });
    }

    // Read existing submissions
    const submissions = JSON.parse(fs.readFileSync(WALLET_FILE, 'utf8'));
    
    // Add new submission with timestamp
    const newSubmission = {
      wallet,
      rewardType,
      timestamp: new Date().toISOString(),
      id: Date.now().toString()
    };
    
    submissions.push(newSubmission);
    
    // Save back to file
    fs.writeFileSync(WALLET_FILE, JSON.stringify(submissions, null, 2));
    
    console.log(`✅ Wallet submitted: ${wallet} for ${rewardType}`);
    
    res.json({ success: true, message: 'Wallet submitted successfully' });
  } catch (error) {
    console.error('❌ Error submitting wallet:', error);
    res.status(500).json({ error: 'Failed to submit wallet' });
  }
});

// API endpoint to view all submissions (for you to check)
app.get('/api/submissions', (req, res) => {
  try {
    const submissions = JSON.parse(fs.readFileSync(WALLET_FILE, 'utf8'));
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read submissions' });
  }
});

// API endpoint to validate code
app.post('/api/validate-code', (req, res) => {
  const { code } = req.body;
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ success: false, error: 'Code is required' });
  }

  // Read codes and used codes
  const codes = fs.readFileSync(CODES_FILE, 'utf8').split('\n').map(c => c.trim()).filter(Boolean);
  const usedCodes = fs.readFileSync(USED_CODES_FILE, 'utf8').split('\n').map(c => c.trim()).filter(Boolean);

  // Check if code is valid and unused
  if (!codes.includes(code)) {
    return res.status(401).json({ success: false, error: 'Invalid code' });
  }
  if (usedCodes.includes(code)) {
    return res.status(403).json({ success: false, error: 'Code already used' });
  }

  // Mark code as used (append to used codes file)
  fs.appendFileSync(USED_CODES_FILE, code + '\n');

  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`🚀 Wallet submission server running on http://localhost:${PORT}`);
  console.log(`📁 Submissions saved to: ${WALLET_FILE}`);
  console.log(`👀 View submissions at: http://localhost:${PORT}/api/submissions`);
}); 