// src/hooks/useChannels.js
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

// Verificações básicas da API Key
if (!YOUTUBE_API_KEY) {
  console.error("❌ ERRO CRÍTICO: VITE_YOUTUBE_API_KEY não está configurada");
} else if (YOUTUBE_API_KEY.length < 39) {
  console.warn("⚠️ API Key parece muito curta:", YOUTUBE_API_KEY.length);
} else {
  console.log(
    "✅ API Key configurada:",
    YOUTUBE_API_KEY.substring(0, 10) + "..."
  );
}

export const useChannels = () => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userId, user } = useAuth();

  useEffect(() => {
    if (userId) {
      fetchChannels();
    } else {
      setLoading(false);
      setChannels([]);
    }
  }, [userId]);

  // Buscar lista de canais do usuário
  const fetchChannels = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("channels")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setChannels(data || []);
    } catch (err) {
      console.error("Erro ao buscar canais:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // Buscar informações de um canal
  const fetchChannelInfo = async (channelId) => {
    let apiUrl = "";

    if (channelId.startsWith("@")) {
      const handle = channelId.replace("@", "");
      apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(
        handle
      )}&key=${YOUTUBE_API_KEY}`;
    } else {
      apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${YOUTUBE_API_KEY}`;
    }

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      throw new Error("Canal não encontrado na API do YouTube");
    }

    const channelInfo = data.items[0].snippet;
    return {
      name: channelInfo.title,
      thumbnail_url:
        channelInfo.thumbnails?.default?.url ||
        "https://via.placeholder.com/150/FF0000/FFFFFF?text=YT",
    };
  };

  // Buscar últimos vídeos do canal via YouTube Search API
  const fetchChannelVideos = async (channelId) => {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=10&order=date&type=video&key=${YOUTUBE_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.error("Erro na API de vídeos:", data.error);
      return [];
    }

    return data.items || [];
  };

  // Adicionar vídeos sem duplicar
  const addVideosWithDuplicationCheck = async (videos, channelId) => {
    if (!userId) return 0;

    const videoRecords = videos.map((v) => ({
      video_id: v.id.videoId,
      channel_id: channelId,
      title: v.snippet.title,
      description: v.snippet.description,
      thumbnail_url: v.snippet.thumbnails?.high?.url || "",
      published_at: v.snippet.publishedAt,
      user_id: userId,
    }));

    const videoIds = videoRecords.map((v) => v.video_id);

    // Verificar duplicados
    const { data: existing, error: checkError } = await supabase
      .from("videos")
      .select("video_id")
      .in("video_id", videoIds)
      .eq("user_id", userId);

    if (checkError) {
      console.error("Erro verificando vídeos duplicados:", checkError);
      return 0;
    }

    const existingIds = new Set(existing.map((v) => v.video_id));
    const uniqueVideos = videoRecords.filter(
      (v) => !existingIds.has(v.video_id)
    );

    if (uniqueVideos.length === 0) return 0;

    const { error: insertError } = await supabase
      .from("videos")
      .insert(uniqueVideos);

    if (insertError) {
      console.error("Erro ao inserir vídeos:", insertError);
      return 0;
    }

    return uniqueVideos.length;
  };

  // Adicionar canal + vídeos reais via API
  const addChannel = async ({ channel_id }) => {
    try {
      if (!userId) throw new Error("Usuário não autenticado");

      // Buscar informações do canal
      const channelInfo = await fetchChannelInfo(channel_id);

      // Inserir canal no banco
      const { data: inserted, error: channelError } = await supabase
        .from("channels")
        .insert([
          {
            channel_id,
            name: channelInfo.name,
            thumbnail_url: channelInfo.thumbnail_url,
            user_id: userId,
            user_email: user?.email || "unknown@email.com",
          },
        ])
        .select();

      if (channelError) throw channelError;

      // Buscar vídeos reais do canal
      const videos = await fetchChannelVideos(channel_id);
      const videosAdded = await addVideosWithDuplicationCheck(
        videos,
        channel_id
      );

      await fetchChannels();

      return {
        success: true,
        data: inserted[0],
        videosAdded,
        totalVideosFound: videos.length,
      };
    } catch (err) {
      console.error("Erro ao adicionar canal:", err.message);
      return { success: false, error: err.message };
    }
  };

  const removeChannel = async (channelId) => {
    if (!userId) return { success: false, error: "Usuário não autenticado" };

    try {
      await supabase
        .from("videos")
        .delete()
        .eq("channel_id", channelId)
        .eq("user_id", userId);
      await supabase
        .from("channels")
        .delete()
        .eq("channel_id", channelId)
        .eq("user_id", userId);

      await fetchChannels();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return {
    channels,
    loading,
    addChannel,
    removeChannel,
    refreshChannels: fetchChannels,
  };
};
