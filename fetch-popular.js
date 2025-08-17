import { createClient } from '@supabase/supabase-js';

const API_KEY = 'AIzaSyCyLCMOiJtZKYWh96Z1pxYZAPbCwcR4S80';
const SUPABASE_URL = 'https://ihctbvvcstrtwbvzqzzk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloY3RidnZjc3RydHdidnpxenprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzOTc1NTIsImV4cCI6MjA3MDk3MzU1Mn0.uZQgFKG6P1M18pfCFrCV59ASXlZb7ymC5tELkJke3kk';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&q=怪談&type=video&part=snippet&order=viewCount&maxResults=3`
  );

  if (!res.ok) {
    console.error('YouTube API 取得エラー:', res.status, res.statusText);
    return;
  }

  const data = await res.json();

  for (const item of data.items) {
    const videoId = item.id.videoId;
    const title = item.snippet.title;
    const description = item.snippet.description;
    const thumbnail = item.snippet.thumbnails.default.url;

    console.log('登録予定:', title, videoId);

    // story_tellers 登録
    const { data: storyData, error: storyError } = await supabase
      .from('story_tellers')
      .upsert([{ name: '未設定怪談師', title }])
      .select()
      .single();

    if (storyError) {
      console.error('story_tellers登録エラー:', storyError);
      continue;
    }

    // youtube_videos 登録
    const { error: videoError } = await supabase
      .from('youtube_videos')
      .insert([{
        story_id: storyData.id,
        video_id: videoId,
        title,
        description,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        thumbnail_url: thumbnail
      }]);

    if (videoError) {
      console.error('youtube_videos登録エラー:', videoError);
    } else {
      console.log('✅ 登録成功:', title);
    }
  }
}

main();