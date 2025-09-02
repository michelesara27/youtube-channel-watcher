// src/hooks/useChannels.js
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const SYSTEM_PASSWORD = import.meta.env.VITE_SYSTEM_PASSWORD || "youtube123";
// Verificar se a API Key está configurada mas é inválida
if (YOUTUBE_API_KEY && YOUTUBE_API_KEY.length < 20) {
  console.warn("⚠️ API Key do YouTube parece ser inválida (muito curta)");
  console.log("💡 A API Key deve ter cerca de 40 caracteres");
}

if (YOUTUBE_API_KEY && YOUTUBE_API_KEY.includes(" ")) {
  console.warn("⚠️ API Key do YouTube pode conter espaços indesejados");
}

export const useChannels = () => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Verificar autenticação via URL parameters
    const checkUrlAuthentication = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const password = urlParams.get("password");

      if (password === SYSTEM_PASSWORD) {
        setIsAuthenticated(true);
        localStorage.setItem("yt_authenticated", "true");
        console.log("✅ Acesso autorizado via URL");
        return true;
      }

      // Verificar se já está autenticado no localStorage
      const storedAuth = localStorage.getItem("yt_authenticated");
      if (storedAuth === "true") {
        setIsAuthenticated(true);
        return true;
      }

      return false;
    };

    if (checkUrlAuthentication()) {
      fetchChannels();
    } else {
      console.log("🔒 Acesso não autorizado. Use ?password=senha na URL");
      setLoading(false);
    }
  }, []);

  // Função para buscar informações do canal
  const fetchChannelInfo = async (channelId) => {
    if (!YOUTUBE_API_KEY) {
      throw new Error("API Key do YouTube não configurada");
    }

    try {
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

      if (data.error && data.error.code === 400) {
        throw new Error("API Key do YouTube inválida");
      }

      if (data.error || !data.items || data.items.length === 0) {
        throw new Error("Canal não encontrado na API do YouTube");
      }

      const channelInfo = data.items[0].snippet;

      return {
        name: channelInfo.title,
        thumbnail_url:
          channelInfo.thumbnails?.default?.url ||
          "https://via.placeholder.com/150/FF0000/FFFFFF?text=YT",
      };
    } catch (error) {
      throw new Error(`Erro ao buscar informações do canal: ${error.message}`);
    }
  };

  // Função para buscar os últimos vídeos de um canal
  const fetchChannelVideos = async (channelId) => {
    if (!YOUTUBE_API_KEY) {
      throw new Error("API Key do YouTube não configurada");
    }

    try {
      let apiUrl = "";

      if (channelId.startsWith("@")) {
        const handle = channelId.replace("@", "");
        apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=3&order=date&q=${encodeURIComponent(
          handle
        )}&key=${YOUTUBE_API_KEY}`;
      } else {
        apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=3&order=date&type=video&key=${YOUTUBE_API_KEY}`;
      }

      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.error && data.error.code === 400) {
        throw new Error("API Key do YouTube inválida");
      }

      if (data.error) {
        throw new Error(`Erro na API do YouTube: ${data.error.message}`);
      }

      if (!data.items || data.items.length === 0) {
        throw new Error("Nenhum vídeo encontrado para este canal");
      }

      return data.items;
    } catch (error) {
      throw new Error(`Erro ao buscar vídeos: ${error.message}`);
    }
  };

  const fetchChannels = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("channels")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setChannels(data || []);
    } catch (error) {
      console.error("Error fetching channels:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const addChannel = async (channelData) => {
    try {
      if (!isAuthenticated) {
        throw new Error("Acesso não autorizado");
      }

      // Buscar informações reais do canal
      const channelInfo = await fetchChannelInfo(channelData.channel_id);

      // Buscar os últimos vídeos do canal
      const videos = await fetchChannelVideos(channelData.channel_id);

      // Inserir canal no Supabase
      const { data: channelResult, error: channelError } = await supabase
        .from("channels")
        .insert([
          {
            channel_id: channelData.channel_id,
            name: channelInfo.name,
            thumbnail_url: channelInfo.thumbnail_url,
          },
        ])
        .select();

      if (channelError) throw channelError;

      // Inserir vídeos no Supabase
      if (videos.length > 0) {
        const videoRecords = videos.map((video) => {
          const videoId = video.id.videoId || video.id;

          return {
            video_id: videoId,
            channel_id: channelData.channel_id,
            title: video.snippet.title,
            description: video.snippet.description,
            thumbnail_url:
              video.snippet.thumbnails?.high?.url ||
              video.snippet.thumbnails?.default?.url,
            published_at: video.snippet.publishedAt,
          };
        });

        const { error: videosError } = await supabase
          .from("videos")
          .insert(videoRecords);

        if (videosError) console.error("Error inserting videos:", videosError);
      }

      await fetchChannels();
      return { success: true, data: channelResult[0] };
    } catch (error) {
      console.error("Error adding channel:", error.message);
      return { success: false, error: error.message };
    }
  };

  const removeChannel = async (channelId) => {
    try {
      if (!isAuthenticated) {
        throw new Error("Acesso não autorizado");
      }

      const { error } = await supabase
        .from("channels")
        .delete()
        .eq("channel_id", channelId);

      if (error) throw error;

      await fetchChannels();
      return { success: true };
    } catch (error) {
      console.error("Error removing channel:", error.message);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem("yt_authenticated");
    setIsAuthenticated(false);
    window.location.href = window.location.origin; // Redirecionar para URL limpa
  };

  return {
    channels,
    loading,
    isAuthenticated,
    addChannel,
    removeChannel,
    logout,
    refreshChannels: fetchChannels,
  };
};
