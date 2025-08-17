import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { user_id, video_id } = req.body;

    const { data, error } = await supabase
      .from('watched_videos')
      .insert([{ user_id, video_id }]);

    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json({ success: true, data });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
