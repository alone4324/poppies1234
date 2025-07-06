import { promises as fs } from 'fs';
import path from 'path';

const CODES_FILE = path.join(process.cwd(), 'codes.txt');
const USED_CODES_FILE = path.join(process.cwd(), 'codes_used.txt');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }
  try {
    const { code } = req.body;
    if (!code || typeof code !== 'string') {
      res.status(400).json({ success: false, error: 'Code is required' });
      return;
    }
    const [codesRaw, usedRaw] = await Promise.all([
      fs.readFile(CODES_FILE, 'utf8'),
      fs.readFile(USED_CODES_FILE, 'utf8').catch(() => ''),
    ]);
    const codes = codesRaw.split('\n').map(c => c.trim()).filter(Boolean);
    const usedCodes = usedRaw.split('\n').map(c => c.trim()).filter(Boolean);
    if (!codes.includes(code)) {
      res.status(401).json({ success: false, error: 'Invalid code' });
      return;
    }
    if (usedCodes.includes(code)) {
      res.status(403).json({ success: false, error: 'Code already used' });
      return;
    }
    // Mark code as used (append to used codes file)
    await fs.appendFile(USED_CODES_FILE, code + '\n');
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
} 