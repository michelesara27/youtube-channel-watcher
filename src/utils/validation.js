// src/utils/validation.js

export const isValidYouTubeChannelUrl = (url) => {
  const patterns = [
    // Padrões com @ (handle de usuário)
    /^https?:\/\/(www\.)?youtube\.com\/@[a-zA-Z0-9_-]+(\/.*)?$/,

    // Padrões com /channel/ (ID do canal)
    /^https?:\/\/(www\.)?youtube\.com\/channel\/[a-zA-Z0-9_-]+(\/.*)?$/,

    // Padrões com /user/ (usuário antigo)
    /^https?:\/\/(www\.)?youtube\.com\/user\/[a-zA-Z0-9_-]+(\/.*)?$/,

    // Padrões com /c/ (canal personalizado)
    /^https?:\/\/(www\.)?youtube\.com\/c\/[a-zA-Z0-9_-]+(\/.*)?$/,

    // Padrão youtu.be (links curtos)
    /^https?:\/\/youtu\.be\/[a-zA-Z0-9_-]+(\/.*)?$/,

    // Padrões com parâmetros de busca
    /^https?:\/\/(www\.)?youtube\.com\/results\?search_query=.+$/,

    // Padrões com watch (vídeos específicos)
    /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[a-zA-Z0-9_-]+(&.*)?$/,
  ];

  return patterns.some((pattern) => pattern.test(url));
};

export const extractChannelIdFromUrl = (url) => {
  try {
    // Remover sufixos comuns primeiro
    const cleanUrl = url
      .replace(/\/videos$/i, "")
      .replace(/\/featured$/i, "")
      .replace(/\/streams$/i, "")
      .replace(/\/playlists$/i, "")
      .replace(/\/community$/i, "")
      .replace(/\/about$/i, "");

    // Para URLs com @ (handle de usuário)
    if (cleanUrl.includes("/@")) {
      const urlObj = new URL(cleanUrl);
      const pathParts = urlObj.pathname.split("/").filter((part) => part);

      // Encontrar a parte que começa com @
      const handlePart = pathParts.find((part) => part.startsWith("@"));
      if (handlePart) {
        return handlePart;
      }
    }

    // Para URLs com /channel/
    else if (cleanUrl.includes("/channel/")) {
      const match = cleanUrl.match(/youtube\.com\/channel\/([a-zA-Z0-9_-]+)/i);
      return match ? match[1] : null;
    }

    // Para URLs com /user/
    else if (cleanUrl.includes("/user/")) {
      const match = cleanUrl.match(/youtube\.com\/user\/([a-zA-Z0-9_-]+)/i);
      return match ? match[1] : null;
    }

    // Para URLs com /c/
    else if (cleanUrl.includes("/c/")) {
      const match = cleanUrl.match(/youtube\.com\/c\/([a-zA-Z0-9_-]+)/i);
      return match ? match[1] : null;
    }

    // Para URLs youtu.be
    else if (cleanUrl.includes("youtu.be/")) {
      const match = cleanUrl.match(/youtu\.be\/([a-zA-Z0-9_-]+)/i);
      return match ? match[1] : null;
    }

    // Para URLs de vídeo (watch)
    else if (cleanUrl.includes("watch?v=")) {
      const match = cleanUrl.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/i);
      return match ? `video_${match[1]}` : null;
    }

    return null;
  } catch (error) {
    console.error("Error extracting channel ID from URL:", error);
    return null;
  }
};

// Função auxiliar para normalizar URLs
export const normalizeYouTubeUrl = (url) => {
  try {
    // Remover parâmetros desnecessários e sufixos
    let normalizedUrl = url.trim();

    // Remover sufixos comuns
    normalizedUrl = normalizedUrl
      .replace(/\/videos$/i, "")
      .replace(/\/featured$/i, "")
      .replace(/\/streams$/i, "")
      .replace(/\/playlists$/i, "")
      .replace(/\/community$/i, "")
      .replace(/\/about$/i, "");

    // Remover parâmetros de busca
    normalizedUrl = normalizedUrl.replace(/\/results\?search_query=.*$/i, "");

    // Remover parâmetros de vídeo específico (mantém apenas o básico)
    if (normalizedUrl.includes("watch?v=")) {
      normalizedUrl = normalizedUrl.split("&")[0]; // Remove parâmetros extras
    }

    return normalizedUrl;
  } catch (error) {
    console.error("Error normalizing URL:", error);
    return url;
  }
};

// Função para validar e extrair informações da URL
export const validateAndExtractYouTubeInfo = (url) => {
  const normalizedUrl = normalizeYouTubeUrl(url);

  if (!isValidYouTubeChannelUrl(normalizedUrl)) {
    return { isValid: false, error: "URL do YouTube inválida" };
  }

  const channelId = extractChannelIdFromUrl(normalizedUrl);

  if (!channelId) {
    return { isValid: false, error: "Não foi possível extrair o ID do canal" };
  }

  return {
    isValid: true,
    normalizedUrl,
    channelId,
    type: channelId.startsWith("@")
      ? "handle"
      : channelId.startsWith("video_")
      ? "video"
      : "channelId",
  };
};
