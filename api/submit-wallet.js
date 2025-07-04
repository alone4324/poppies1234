import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { wallet, rewardType } = req.body;
  if (!wallet || !rewardType) {
    return res.status(400).json({ error: 'Wallet and rewardType are required' });
  }

  const { error } = await supabase
    .from('wallet_submissions')
    .insert([{ wallet, reward_type: rewardType }]);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ success: true });
} 