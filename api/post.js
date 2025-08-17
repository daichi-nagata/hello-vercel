import { createClient } from '@supabase/supabase-js';

// Vercel 環境変数から Supabase に接続
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { title, content } = req.body;

    // Supabase に挿入
    const { data, error } = await supabase
      .from('stories')
      .insert([{ title, content }]);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({ success: true, story: data });
  } else {
    // POST 以外のリクエストは拒否
    res.status(405).json({ error: 'Method not allowed' });
  }
}
