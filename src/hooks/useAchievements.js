// src/hooks/useAchievements.js
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export const useAchievements = (
  userSession,
  channels,
  watchedVideos,
  allVideos
) => {
  const [achievements, setAchievements] = useState({});
  const [showCelebration, setShowCelebration] = useState(false);
  const [newAchievement, setNewAchievement] = useState(null);

  // Verificar conquistas sempre que os dados mudarem
  useEffect(() => {
    if (!userSession || channels.length === 0) return;

    checkAchievements();
  }, [userSession, channels, watchedVideos, allVideos]);

  const checkAchievements = async () => {
    const newAchievements = { ...achievements };
    let unlockedNew = false;
    let latestAchievement = null;

    // Conquista: Primeiro Canal
    if (channels.length >= 1 && !newAchievements.first_channel) {
      newAchievements.first_channel = true;
      unlockedNew = true;
      latestAchievement = "first_channel";
    }

    // Conquista: Colecionador (5 canais)
    if (channels.length >= 5 && !newAchievements.five_channels) {
      newAchievements.five_channels = true;
      unlockedNew = true;
      latestAchievement = "five_channels";
    }

    // Conquista: Spectador (10 vídeos assistidos)
    if (watchedVideos.size >= 10 && !newAchievements.ten_videos_watched) {
      newAchievements.ten_videos_watched = true;
      unlockedNew = true;
      latestAchievement = "ten_videos_watched";
    }

    // Conquista: Focado (todos os vídeos de um canal assistidos)
    const channelsWithAllVideosWatched = channels.filter((channel) => {
      const channelVideos = allVideos.filter(
        (v) => v.channel_id === channel.channel_id
      );
      const unwatchedVideos = channelVideos.filter(
        (v) => !watchedVideos.has(v.video_id)
      );
      return channelVideos.length > 0 && unwatchedVideos.length === 0;
    });

    if (channelsWithAllVideosWatched.length > 0 && !newAchievements.focused) {
      newAchievements.focused = true;
      unlockedNew = true;
      latestAchievement = "focused";
    }

    if (unlockedNew) {
      setAchievements(newAchievements);
      setNewAchievement(latestAchievement);
      setShowCelebration(true);

      // Salvar no Supabase
      await saveAchievements(newAchievements);

      // Esconder a celebração após 3 segundos
      setTimeout(() => {
        setShowCelebration(false);
      }, 3000);
    }
  };

  const saveAchievements = async (achievementsData) => {
    try {
      const { error } = await supabase.from("user_achievements").upsert(
        {
          user_session: userSession,
          achievements: achievementsData,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_session",
        }
      );

      if (error) throw error;
    } catch (error) {
      console.error("Erro ao salvar conquistas:", error);
    }
  };

  const loadAchievements = async () => {
    if (!userSession) return;

    try {
      const { data, error } = await supabase
        .from("user_achievements")
        .select("achievements")
        .eq("user_session", userSession)
        .single();

      if (error && error.code !== "PGRST116") throw error; // PGRST116 é "nenhum resultado"

      if (data && data.achievements) {
        setAchievements(data.achievements);
      }
    } catch (error) {
      console.error("Erro ao carregar conquistas:", error);
    }
  };

  // Carregar conquistas ao inicializar
  useEffect(() => {
    loadAchievements();
  }, [userSession]);

  return {
    achievements,
    showCelebration,
    newAchievement,
    setShowCelebration,
  };
};
