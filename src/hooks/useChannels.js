import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

// Verificar se a API Key está configurada mas é inválida
if (YOUTUBE_API_KEY && YOUTUBE_API_KEY.length < 20) {
  console.warn("⚠️ API Key do YouTube parece ser inválida (muito curta)");
  console.log("💡 A API Key deve ter cerca de 40 caracteres");
}

if (YOUTUBE_API_KEY && YOUTUBE_API_KEY.includes(" ")) {
  console.warn("⚠️ API Key do YouTube pode conter espaços indesejados");
}

// Verificação mais robusta da API Key
if (!YOUTUBE_API_KEY) {
  console.error("❌ ERRO CRÍTICO: VITE_YOUTUBE_API_KEY não está configurada");
  console.log("💡 Adicione no arquivo .env:");
  console.log("VITE_YOUTUBE_API_KEY=sua_chave_aqui");
} else if (YOUTUBE_API_KEY.length < 39) {
  console.warn(
    "⚠️ API Key parece muito curta:",
    YOUTUBE_API_KEY.length,
    "caracteres"
  );
} else {
  console.log(
    "✅ API Key configurada:",
    YOUTUBE_API_KEY.substring(0, 10) + "..."
  );
}

export const useChannels = () => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userId, user } = useAuth(); // Obter userId do contexto de autenticação

  useEffect(() => {
    if (userId) {
      fetchChannels();
    } else {
      setLoading(false);
      setChannels([]);
    }
  }, [userId]);

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
      console.error("Erro detalhado ao buscar informações do canal:", error);
      throw new Error(`Erro ao buscar informações do canal: ${error.message}`);
    }
  };

  // Função para buscar os últimos vídeos de um canal
  const fetchChannelVideos = async (channelId) => {
    if (!YOUTUBE_API_KEY) {
      throw new Error("API Key do YouTube não configurada");
    }

    try {
      let actualChannelId = channelId;

      // Se for um @handle, primeiro precisamos obter o channelId real
      if (channelId.startsWith("@")) {
        console.log("🔍 Convertendo @handle para channelId real:", channelId);

        // Buscar o channelId real usando o handle
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(
          channelId
        )}&key=${YOUTUBE_API_KEY}`;

        const searchResponse = await fetch(searchUrl);
        const searchData = await searchResponse.json();

        if (searchData.error) {
          throw new Error(
            `Erro na API do YouTube: ${searchData.error.message}`
          );
        }

        if (!searchData.items || searchData.items.length === 0) {
          throw new Error("Canal não encontrado na API do YouTube");
        }

        // Obter o channelId real do resultado da busca
        actualChannelId = searchData.items[0].id.channelId;
        console.log("✅ ChannelId real encontrado:", actualChannelId);
      }

      // Agora buscar vídeos usando o channelId real
      const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${actualChannelId}&maxResults=10&order=date&type=video&key=${YOUTUBE_API_KEY}`;

      console.log("📡 Buscando vídeos com URL:", apiUrl);

      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.error && data.error.code === 400) {
        throw new Error("API Key do YouTube inválida");
      }

      if (data.error) {
        throw new Error(`Erro na API do YouTube: ${data.error.message}`);
      }

      if (!data.items || data.items.length === 0) {
        console.warn(
          "ℹ️ Nenhum vídeo encontrado para o channelId:",
          actualChannelId
        );
        return [];
      }

      console.log("✅ Vídeos encontrados:", data.items.length);
      return data.items;
    } catch (error) {
      console.error("❌ Erro detalhado ao buscar vídeos:", error.message);
      return [];
    }
  };

  const fetchChannels = async () => {
    if (!userId) {
      console.log("Usuário não autenticado, não é possível buscar canais");
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("channels")
        .select("*")
        .eq("user_id", userId) // Filtrar por user_id
        .order("created_at", { ascending: false });

      if (error) throw error;
      setChannels(data || []);
    } catch (error) {
      console.error("Error fetching channels:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Função para verificar se canal já existe para este usuário
  const checkChannelExists = async (channelId) => {
    if (!channelId || !userId) return false;

    try {
      const { data, error } = await supabase
        .from("channels")
        .select("channel_id")
        .eq("channel_id", channelId)
        .eq("user_id", userId) // Verificar por usuário específico
        .limit(1);

      if (error) throw error;
      return data && data.length > 0;
    } catch (error) {
      console.error("Erro ao verificar canal:", error);
      return false;
    }
  };

  // Função para adicionar vídeos com verificação de duplicidade
  const addVideosWithDuplicationCheck = async (videos, channelId) => {
    if (!userId) {
      console.error("Usuário não autenticado, não é possível adicionar vídeos");
      return 0;
    }

    try {
      const videoRecords = [];
      const videoIdsToCheck = [];

      // Preparar dados dos vídeos
      for (const video of videos) {
        const videoId = video.id.videoId || video.id;
        videoIdsToCheck.push(videoId);

        videoRecords.push({
          video_id: videoId,
          channel_id: channelId,
          title: video.snippet.title,
          description: video.snippet.description,
          thumbnail_url:
            video.snippet.thumbnails?.high?.url ||
            video.snippet.thumbnails?.default?.url,
          published_at: video.snippet.publishedAt,
          user_id: userId, // Adicionar user_id
        });
      }

      // Verificar vídeos duplicados para este usuário
      const { data: existingVideos, error: checkError } = await supabase
        .from("videos")
        .select("video_id")
        .in("video_id", videoIdsToCheck)
        .eq("user_id", userId); // Verificar apenas vídeos do usuário

      if (checkError) {
        console.error("Erro ao verificar vídeos duplicados:", checkError);
        return 0;
      }

      const existingVideoIds = new Set(
        existingVideos?.map((v) => v.video_id) || []
      );
      const uniqueVideos = videoRecords.filter(
        (video) => !existingVideoIds.has(video.video_id)
      );

      if (uniqueVideos.length === 0) {
        console.log("⏭️ Todos os vídeos já existem para o usuário");
        return 0;
      }

      console.log(
        `📹 Inserindo ${uniqueVideos.length} vídeos novos de ${videoRecords.length} encontrados`
      );

      // Inserir apenas vídeos não duplicados
      const { error: videosError } = await supabase
        .from("videos")
        .insert(uniqueVideos);

      if (videosError) {
        console.error("Error inserting videos:", videosError);
        return 0;
      } else {
        console.log(`✅ ${uniqueVideos.length} vídeos inseridos com sucesso`);
        return uniqueVideos.length;
      }
    } catch (error) {
      console.error("Erro no processo de adição de vídeos:", error);
      return 0;
    }
  };

  const addChannel = async (channelData) => {
    try {
      if (!userId) {
        throw new Error(
          "Usuário não autenticado. Faça login para adicionar canais."
        );
      }

      // VERIFICAÇÃO DE DUPLICIDADE - Canal
      const channelExists = await checkChannelExists(channelData.channel_id);
      if (channelExists) {
        console.log(
          "⏭️ Canal já existe para este usuário:",
          channelData.channel_id
        );
        return {
          success: false,
          error: "Este canal já está na sua lista",
          code: "CHANNEL_ALREADY_EXISTS",
        };
      }

      // Buscar informações reais do canal
      const channelInfo = await fetchChannelInfo(channelData.channel_id);

      // VALIDAÇÃO CRÍTICA: Verificar se channelInfo é válido
      if (!channelInfo || !channelInfo.name) {
        throw new Error("Não foi possível obter informações do canal");
      }

      // Buscar os últimos vídeos do canal (continua mesmo se falhar)
      let videos = [];
      try {
        videos = await fetchChannelVideos(channelData.channel_id);
      } catch (videoError) {
        console.warn(
          "Erro ao buscar vídeos, continuando sem vídeos:",
          videoError.message
        );
      }

      // Inserir canal no Supabase com user_id
      const { data: channelResult, error: channelError } = await supabase
        .from("channels")
        .insert([
          {
            channel_id: channelData.channel_id,
            name: channelInfo.name,
            thumbnail_url: channelInfo.thumbnail_url,
            user_id: userId, // Usar o userId do contexto
            user_email: user?.email || "unknown@email.com",
          },
        ])
        .select();

      if (channelError) {
        if (channelError.code === "23505") {
          console.log(
            "⏭️ Canal já existe no banco (duplicata):",
            channelData.channel_id
          );
          return {
            success: false,
            error: "Este canal já está na sua lista",
            code: "CHANNEL_ALREADY_EXISTS",
          };
        }
        throw channelError;
      }

      // Inserir vídeos no Supabase (se houver vídeos)
      let videosAdded = 0;
      if (videos.length > 0) {
        videosAdded = await addVideosWithDuplicationCheck(
          videos,
          channelData.channel_id
        );
      }

      await fetchChannels();
      return {
        success: true,
        data: channelResult[0],
        videosAdded: videosAdded,
        totalVideosFound: videos.length,
      };
    } catch (error) {
      console.error("Error adding channel:", error.message);
      return {
        success: false,
        error: error.message,
        suggestion:
          "Verifique se a URL do canal está correta e se a API Key do YouTube é válida",
      };
    }
  };

  const removeChannel = async (channelId) => {
    try {
      if (!userId) {
        throw new Error(
          "Usuário não autenticado. Faça login para remover canais."
        );
      }

      // Primeiro, remover os vídeos associados ao canal deste usuário
      const { error: videosError } = await supabase
        .from("videos")
        .delete()
        .eq("channel_id", channelId)
        .eq("user_id", userId);

      if (videosError) {
        console.error("Error removing videos:", videosError.message);
        // Continuar mesmo se houver erro na remoção de vídeos
      }

      // Depois, remover o canal
      const { error } = await supabase
        .from("channels")
        .delete()
        .eq("channel_id", channelId)
        .eq("user_id", userId);

      if (error) throw error;

      await fetchChannels();
      return { success: true };
    } catch (error) {
      console.error("Error removing channel:", error.message);
      return { success: false, error: error.message };
    }
  };

  // Função de debug para testar a busca de canais (opcional)
  const testChannelSearch = async (channelUrl) => {
    const { validateAndExtractYouTubeInfo } = await import(
      "../utils/validation"
    );

    const validationResult = validateAndExtractYouTubeInfo(channelUrl);
    if (!validationResult.isValid) {
      console.error("❌ URL inválida:", validationResult.error);
      return;
    }

    console.log("🔍 Testando canal:", validationResult.channelId);

    try {
      const videos = await fetchChannelVideos(validationResult.channelId);
      console.log("📊 Resultado do teste:", {
        channelId: validationResult.channelId,
        videosFound: videos.length,
        videos: videos.map((v) => ({
          id: v.id.videoId,
          title: v.snippet.title,
          publishedAt: v.snippet.publishedAt,
        })),
      });
    } catch (error) {
      console.error("❌ Erro no teste:", error.message);
    }
  };

  return {
    channels,
    loading,
    addChannel,
    removeChannel,
    refreshChannels: fetchChannels,
    testChannelSearch,
    checkChannelExists,
    isAuthenticated: !!userId,
  };
};

// Exportar função de teste para uso no console do navegador
export const debugChannelSearch = async (channelUrl) => {
  const { validateAndExtractYouTubeInfo } = await import("../utils/validation");

  const validationResult = validateAndExtractYouTubeInfo(channelUrl);
  if (!validationResult.isValid) {
    console.error("❌ URL inválida:", validationResult.error);
    return;
  }

  console.log("🔍 Testando canal:", validationResult.channelId);

  try {
    const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
    let actualChannelId = validationResult.channelId;

    if (validationResult.channelId.startsWith("@")) {
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(
        validationResult.channelId
      )}&key=${YOUTUBE_API_KEY}`;

      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();
      actualChannelId = searchData.items[0].id.channelId;
    }

    const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${actualChannelId}&maxResults=5&order=date&type=video&key=${YOUTUBE_API_KEY}`;

    console.log("📡 URL final da API:", apiUrl);

    const response = await fetch(apiUrl);
    const data = await response.json();

    console.log("📊 Resposta completa da API:", data);
    console.log("✅ Vídeos encontrados:", data.items?.length || 0);
  } catch (error) {
    console.error("❌ Erro no teste:", error.message);
  }
};
