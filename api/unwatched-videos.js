import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const userId = req.query.user_id; // フロントからユーザーIDを渡す

    const { data, error } = await supabase
      .from('youtube_videos')
      .select(`
        id,
        video_id,
        title,
        description,
        url,
        thumbnail_url,
        story_tellers (
          name,
          title
        )
      `)
      .not('id', 'in', supabase
        .from('watched_videos')
        .select('video_id')
        .eq('user_id', userId)
      )
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json({ videos: data });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
