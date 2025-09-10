import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

export const useVideos = (userSession) => {
  const [videos, setVideos] = useState([]);
  const [allVideos, setAllVideos] = useState([]); // Mantém todos os vídeos para busca
  const [watchedVideos, setWatchedVideos] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const { userId } = useAuth(); // Obter userId do contexto de autenticação

  useEffect(() => {
    if (userId) {
      fetchVideos();
      fetchWatchedVideos();
    }
  }, [userId]);

  // Debug: verificar vídeos carregados
  useEffect(() => {
    if (allVideos.length > 0) {
      console.log("📊 Videos carregados:", allVideos.length);
      console.log(
        "🔍 Vídeos com keywords:",
        allVideos.filter((v) => v.keywords && v.keywords.length > 0).length
      );
      console.log("👤 User ID:", userId);
    }
  }, [allVideos, userId]);

  const fetchVideos = async () => {
    if (!userId) {
      console.log("Usuário não autenticado, não é possível buscar vídeos");
      setLoading(false);
      return;
    }

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
        .eq("user_id", userId) // Filtrar por user_id
        .order("published_at", { ascending: false });

      if (error) throw error;

      // Adicionar channel_name aos vídeos e garantir keywords como array
      const videosWithChannelName = data.map((video) => ({
        ...video,
        channel_name: video.channels?.name || "Canal desconhecido",
        keywords: Array.isArray(video.keywords) ? video.keywords : [],
      }));

      setAllVideos(videosWithChannelName || []);
      setVideos(videosWithChannelName || []);
    } catch (error) {
      console.error("Error fetching videos:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchWatchedVideos = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("watched_videos")
        .select("video_id")
        .eq("user_id", userId); // Filtrar por user_id

      if (error) throw error;

      const watchedIds = new Set(data.map((item) => item.video_id));
      setWatchedVideos(watchedIds);
    } catch (error) {
      console.error("Error fetching watched videos:", error.message);
    }
  };

  const markAsWatched = async (videoId) => {
    if (!userId) return;

    try {
      const { error } = await supabase.from("watched_videos").insert([
        {
          user_id: userId, // Adicionar user_id
          video_id: videoId,
        },
      ]);

      if (error) throw error;

      // Atualizar a lista de vídeos assistidos
      setWatchedVideos((prev) => new Set([...prev, videoId]));
    } catch (error) {
      console.error("Error marking video as watched:", error.message);
    }
  };

  const markAsUnwatched = async (videoId) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from("watched_videos")
        .delete()
        .eq("user_id", userId) // Filtrar por user_id
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

  // Função para atualizar keywords de um vídeo localmente
  const updateVideoKeywords = (videoId, newKeywords) => {
    setAllVideos((prevVideos) =>
      prevVideos.map((video) =>
        video.video_id === videoId ? { ...video, keywords: newKeywords } : video
      )
    );

    setVideos((prevVideos) =>
      prevVideos.map((video) =>
        video.video_id === videoId ? { ...video, keywords: newKeywords } : video
      )
    );
  };

  // Função de busca por keywords, título ou canal
  const searchVideos = async (term) => {
    setSearchTerm(term.toLowerCase());

    if (!term.trim()) {
      setVideos(allVideos);
      return;
    }

    setSearchLoading(true);

    // Pequeno delay para evitar busca em cada tecla digitada
    setTimeout(() => {
      const filtered = allVideos.filter((video) => {
        const searchTerm = term.toLowerCase();

        // Busca por keywords
        const hasKeyword =
          video.keywords &&
          video.keywords.some((keyword) =>
            keyword.toLowerCase().includes(searchTerm)
          );

        // Busca por título
        const hasTitle = video.title.toLowerCase().includes(searchTerm);

        // Busca por canal
        const hasChannel = video.channel_name
          .toLowerCase()
          .includes(searchTerm);

        return hasKeyword || hasTitle || hasChannel;
      });

      setVideos(filtered);
      setSearchLoading(false);
    }, 300);
  };

  // Busca avançada usando operadores do Supabase (opcional)
  const advancedSearch = async (term) => {
    if (!term.trim()) {
      setVideos(allVideos);
      return;
    }

    setSearchLoading(true);

    try {
      // Busca no Supabase usando operadores de array e texto
      const { data, error } = await supabase
        .from("videos")
        .select(
          `
          *,
          channels (name)
        `
        )
        .or(`title.ilike.%${term}%,channel_id.ilike.%${term}%`)
        .contains("keywords", [term.toLowerCase()])
        .eq("user_id", userId) // Filtrar por user_id
        .order("published_at", { ascending: false });

      if (error) throw error;

      const videosWithChannelName = data.map((video) => ({
        ...video,
        channel_name: video.channels?.name || "Canal desconhecido",
        keywords: Array.isArray(video.keywords) ? video.keywords : [],
      }));

      setVideos(videosWithChannelName);
    } catch (error) {
      console.error("Error in advanced search:", error);
      // Fallback para busca local em caso de erro
      searchVideos(term);
    } finally {
      setSearchLoading(false);
    }
  };

  // Função para buscar vídeos por keyword específica
  const searchVideosByKeyword = async (keyword) => {
    if (!keyword.trim()) return allVideos;

    setSearchLoading(true);

    try {
      const { data, error } = await supabase
        .from("videos")
        .select(
          `
          *,
          channels (name)
        `
        )
        .contains("keywords", [keyword.toLowerCase()])
        .eq("user_id", userId) // Filtrar por user_id
        .order("published_at", { ascending: false });

      if (error) throw error;

      const videosWithChannelName = data.map((video) => ({
        ...video,
        channel_name: video.channels?.name || "Canal desconhecido",
        keywords: Array.isArray(video.keywords) ? video.keywords : [],
      }));

      setVideos(videosWithChannelName);
      setSearchTerm(keyword);
    } catch (error) {
      console.error("Error searching by keyword:", error);
    } finally {
      setSearchLoading(false);
    }
  };

  // Função para obter todas as keywords únicas
  const getAllUniqueKeywords = () => {
    const allKeywords = allVideos.flatMap((video) => video.keywords || []);
    const uniqueKeywords = [...new Set(allKeywords)].sort();
    return uniqueKeywords;
  };

  // Função para obter estatísticas de keywords
  const getKeywordStats = () => {
    const keywordCount = {};

    allVideos.forEach((video) => {
      (video.keywords || []).forEach((keyword) => {
        keywordCount[keyword] = (keywordCount[keyword] || 0) + 1;
      });
    });

    return Object.entries(keywordCount)
      .sort(([, a], [, b]) => b - a)
      .map(([keyword, count]) => ({ keyword, count }));
  };

  // Função para limpar busca
  const clearSearch = () => {
    setSearchTerm("");
    setVideos(allVideos);
  };

  return {
    // Vídeos atuais (filtrados ou não)
    videos,
    // Todos os vídeos sem filtro
    allVideos,
    // Vídeos assistidos
    watchedVideos,
    // Estados de loading
    loading: loading || searchLoading,
    searchLoading,
    // Termo de busca atual
    searchTerm,
    // Funções principais
    toggleWatchedStatus,
    refreshVideos: fetchVideos,
    updateVideoKeywords,
    searchVideos,
    advancedSearch,
    searchVideosByKeyword,
    clearSearch,
    // Funções utilitárias
    getAllUniqueKeywords,
    getKeywordStats,
  };
};
