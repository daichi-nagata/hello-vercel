import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Supabase接続
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// YouTube API情報
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/search';

// 「怪談」に関する人気動画を取得して保存
async function fetchPopularVideos() {
  try {
    console.log("YouTube APIから人気怪談動画を取得中...");

    const response = await fetch(
      `${YOUTUBE_API_URL}?part=snippet&q=怪談&maxResults=50&type=video&order=viewCount&key=${YOUTUBE_API_KEY}`
    );
    const data = await response.json();

    if (!data.items) {
      console.error("YouTube APIからデータを取得できませんでした:", data);
      return;
    }

    for (const item of data.items) {
      const videoId = item.id.videoId;
      const title = item.snippet.title;
      const description = item.snippet.description;
      const url = `https://www.youtube.com/watch?v=${videoId}`;
      const thumbnail_url = item.snippet.thumbnails?.high?.url || null;

      // SupabaseにINSERT（既に存在する場合はスキップ）
      const { data: existing, error: selectError } = await supabase
        .from('youtube_videos')
        .select('id')
        .eq('video_id', videoId)
        .maybeSingle();

      if (selectError) {
        console.error("SELECTエラー:", selectError);
        continue;
      }

      if (existing) {
        console.log(`既存: ${title}`);
        continue;
      }

      const { error: insertError } = await supabase
        .from('youtube_videos')
        .insert({
          video_id: videoId,
          title,
          description,
          url,
          thumbnail_url,
        });

      if (insertError) {
        console.error("INSERTエラー:", insertError);
      } else {
        console.log(`登録成功: ${title}`);
      }
    }

    console.log("処理完了 🎉");

  } catch (err) {
    console.error("実行エラー:", err);
  }
}

fetchPopularVideos();
