import { Redis } from '@upstash/redis';
import fs from 'fs';
import path from 'path';

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});
const CODES_FILE = path.join(process.cwd(), 'codes.txt');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }
  const { code } = req.body;
  if (!code || typeof code !== 'string') {
    res.status(400).json({ success: false, error: 'Code is required' });
    return;
  }

  // Check if code is already used in Redis
  const used = await redis.get(`code:${code}`);
  if (used) {
    res.status(403).json({ success: false, error: 'Code already used' });
    return;
  }

  // Check if code exists in codes.txt
  const codesRaw = fs.readFileSync(CODES_FILE, 'utf8');
  const codes = codesRaw.split('\n').map(c => c.trim()).filter(Boolean);
  if (!codes.includes(code)) {
    res.status(401).json({ success: false, error: 'Invalid code' });
    return;
  }

  // Mark code as used in Redis
  await redis.set(`code:${code}`, 'used');

  res.status(200).json({ success: true });
} 