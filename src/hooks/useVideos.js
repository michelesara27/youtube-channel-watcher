// src/hooks/useVideos.js
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export const useVideos = (userSession) => {
  const [videos, setVideos] = useState([]);
  const [watchedVideos, setWatchedVideos] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userSession) {
      fetchVideos();
      fetchWatchedVideos();
    }
  }, [userSession]);

  // Debug: verificar vídeos carregados
  useEffect(() => {
    if (videos.length > 0) {
      console.log("📊 Videos carregados:", videos.length);
      videos.forEach((video) => {
        console.log(`🎬 ${video.title}`);
        console.log(`   ID: ${video.video_id}`);
        console.log(
          `   URL: https://www.youtube.com/watch?v=${video.video_id}`
        );
      });
    }
  }, [videos]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("videos")
        .select(
          `
          *,
          channels (name)
        `
        )
        .order("published_at", { ascending: false });

      if (error) throw error;

      // Adicionar channel_name aos vídeos
      const videosWithChannelName = data.map((video) => ({
        ...video,
        channel_name: video.channels?.name || "Canal desconhecido",
      }));

      setVideos(videosWithChannelName || []);
    } catch (error) {
      console.error("Error fetching videos:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchWatchedVideos = async () => {
    if (!userSession) return;

    try {
      const { data, error } = await supabase
        .from("watched_videos")
        .select("video_id")
        .eq("user_session", userSession);

      if (error) throw error;

      const watchedIds = new Set(data.map((item) => item.video_id));
      setWatchedVideos(watchedIds);
    } catch (error) {
      console.error("Error fetching watched videos:", error.message);
    }
  };

  const markAsWatched = async (videoId) => {
    if (!userSession) return;

    try {
      const { error } = await supabase
        .from("watched_videos")
        .insert([{ user_session: userSession, video_id: videoId }]);

      if (error) throw error;

      // Atualizar a lista de vídeos assistidos
      setWatchedVideos((prev) => new Set([...prev, videoId]));
    } catch (error) {
      console.error("Error marking video as watched:", error.message);
    }
  };

  const markAsUnwatched = async (videoId) => {
    if (!userSession) return;

    try {
      const { error } = await supabase
        .from("watched_videos")
        .delete()
        .eq("user_session", userSession)
        .eq("video_id", videoId);

      if (error) throw error;

      // Atualizar a lista de vídeos assistidos
      setWatchedVideos((prev) => {
        const newSet = new Set(prev);
        newSet.delete(videoId);
        return newSet;
      });
    } catch (error) {
      console.error("Error marking video as unwatched:", error.message);
    }
  };

  const toggleWatchedStatus = (videoId, isCurrentlyWatched) => {
    if (isCurrentlyWatched) {
      markAsUnwatched(videoId);
    } else {
      markAsWatched(videoId);
    }
  };

  return {
    videos,
    watchedVideos,
    loading,
    toggleWatchedStatus,
    refreshVideos: fetchVideos,
  };
};
