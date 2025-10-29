// src/contexts/useAchievements.js
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

export const useAchievements = (
  userSession,
  channels,
  watchedVideos,
  allVideos
) => {
  const [achievements, setAchievements] = useState({});
  const [showCelebration, setShowCelebration] = useState(false);
  const [newAchievement, setNewAchievement] = useState(null);
  const { userId } = useAuth(); // Obter userId do contexto de autenticação

  // Verificar conquistas sempre que os dados mudarem
  useEffect(() => {
    if (!userId || channels.length === 0) return;

    checkAchievements();
  }, [userId, channels, watchedVideos, allVideos]);

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

    // Conquista: Maratonista (50 vídeos assistidos)
    if (watchedVideos.size >= 50 && !newAchievements.marathon_watcher) {
      newAchievements.marathon_watcher = true;
      unlockedNew = true;
      latestAchievement = "marathon_watcher";
    }

    // Conquista: Explorador (10 canais diferentes)
    if (channels.length >= 10 && !newAchievements.explorer) {
      newAchievements.explorer = true;
      unlockedNew = true;
      latestAchievement = "explorer";
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
    if (!userId) {
      console.error(
        "Usuário não autenticado, não é possível salvar conquistas"
      );
      return;
    }

    try {
      const { error } = await supabase.from("user_achievements").upsert(
        {
          user_id: userId, // Usar user_id em vez de user_session
          achievements: achievementsData,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id", // Alterar para user_id
        }
      );

      if (error) throw error;
      console.log("✅ Conquistas salvas para o usuário:", userId);
    } catch (error) {
      console.error("Erro ao salvar conquistas:", error);
    }
  };

  const loadAchievements = async () => {
    if (!userId) {
      console.log(
        "Usuário não autenticado, não é possível carregar conquistas"
      );
      return;
    }

    try {
      const { data, error } = await supabase
        .from("user_achievements")
        .select("achievements")
        .eq("user_id", userId) // Filtrar por user_id
        .single();

      if (error && error.code !== "PGRST116") throw error; // PGRST116 é "nenhum resultado"

      if (data && data.achievements) {
        setAchievements(data.achievements);
        console.log("✅ Conquistas carregadas para o usuário:", userId);
      } else {
        console.log("ℹ️ Nenhuma conquista encontrada para o usuário:", userId);
        // Inicializar conquistas vazias para novo usuário
        setAchievements({});
      }
    } catch (error) {
      console.error("Erro ao carregar conquistas:", error);
      // Inicializar conquistas vazias em caso de erro
      setAchievements({});
    }
  };

  // Carregar conquistas ao inicializar ou quando userId mudar
  useEffect(() => {
    if (userId) {
      loadAchievements();
    } else {
      // Resetar conquistas se não há usuário
      setAchievements({});
    }
  }, [userId]);

  // Função para resetar conquistas (apenas para desenvolvimento)
  const resetAchievements = async () => {
    if (
      !userId ||
      !window.confirm("Tem certeza que deseja resetar todas as conquistas?")
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("user_achievements")
        .delete()
        .eq("user_id", userId);

      if (error) throw error;

      setAchievements({});
      console.log("✅ Conquistas resetadas para o usuário:", userId);
      alert("Conquistas resetadas com sucesso!");
    } catch (error) {
      console.error("Erro ao resetar conquistas:", error);
      alert("Erro ao resetar conquistas.");
    }
  };

  // Calcular estatísticas para exibição
  const getAchievementStats = () => {
    const totalAchievements = Object.keys(achievements).length;
    const unlockedAchievements = Object.values(achievements).filter(
      (a) => a
    ).length;
    const completionPercentage =
      totalAchievements > 0
        ? Math.round((unlockedAchievements / totalAchievements) * 100)
        : 0;

    return {
      total: totalAchievements,
      unlocked: unlockedAchievements,
      percentage: completionPercentage,
      channelsCount: channels.length,
      watchedCount: watchedVideos.size,
      videosCount: allVideos.length,
    };
  };

  // Verificar progresso para conquistas progressivas
  const getAchievementProgress = (achievementKey) => {
    switch (achievementKey) {
      case "five_channels":
        return { current: channels.length, target: 5 };
      case "ten_videos_watched":
        return { current: watchedVideos.size, target: 10 };
      case "marathon_watcher":
        return { current: watchedVideos.size, target: 50 };
      case "explorer":
        return { current: channels.length, target: 10 };
      default:
        return { current: 0, target: 1 };
    }
  };

  return {
    achievements,
    showCelebration,
    newAchievement,
    setShowCelebration,
    getAchievementStats,
    getAchievementProgress,
    resetAchievements,
  };
};
