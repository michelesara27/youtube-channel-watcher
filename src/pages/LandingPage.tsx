"use client";

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Fullscreen,
  Loader,
  ExternalLink,
  Trophy,
  Star,
  Users,
  CheckCircle,
  Zap,
  Target,
  ArrowRight,
  Shield,
  Clock,
  Video,
  Filter,
  Search,
  BarChart3,
  Crown,
  Sparkles,
} from "lucide-react";

// Componente de Player de Vídeo CORRIGIDO
const VideoPlayer = () => {
  const [videoState, setVideoState] = useState({
    isPlaying: false,
    isLoading: false,
    isMuted: true,
    hasError: false,
    isFullscreen: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    showYouTubeFallback: false,
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);

  // URL CORRETA do vídeo do YouTube que você quer mostrar
  const youtubeVideoId = "ryrgxcJPaYc";
  const youtubeUrl = `https://www.youtube.com/watch?v=${youtubeVideoId}`;

  // URL do vídeo embed do YouTube (para iframe fallback)
  const youtubeEmbedUrl = `https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&rel=0`;

  // URLs do vídeo direto - tentando obter o vídeo real
  const videoSources = [
    // Tentativa com vídeo direto do YouTube (pode não funcionar devido a restrições)
    {
      src: `https://www.youtube.com/embed/${youtubeVideoId}`,
      type: "video/mp4",
      label: "YouTube",
    },
    // Fallback com vídeo genérico se o YouTube não funcionar
    {
      src: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      type: "video/mp4",
      label: "Fallback",
    },
  ];

  // Inicializar vídeo
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedData = () => {
      setVideoState((prev) => ({ ...prev, isLoading: false }));
      console.log("✅ Vídeo carregado com sucesso");
    };

    const handleError = (e: Event) => {
      console.error("❌ Erro no vídeo:", e);
      setVideoState((prev) => ({
        ...prev,
        hasError: true,
        isLoading: false,
        showYouTubeFallback: true,
      }));
    };

    const handleTimeUpdate = () => {
      setVideoState((prev) => ({
        ...prev,
        currentTime: video.currentTime,
        duration: video.duration || 0,
      }));
    };

    const handleEnded = () => {
      setVideoState((prev) => ({ ...prev, isPlaying: false }));
    };

    const handleFullscreenChange = () => {
      setVideoState((prev) => ({
        ...prev,
        isFullscreen: !!document.fullscreenElement,
      }));
    };

    // Event listeners
    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("error", handleError);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    // Tentar carregar o vídeo
    video.load();

    return () => {
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("error", handleError);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const handlePlayPause = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (videoState.isPlaying) {
        video.pause();
        setVideoState((prev) => ({ ...prev, isPlaying: false }));
      } else {
        setVideoState((prev) => ({ ...prev, isLoading: true }));

        await video.play();
        setVideoState((prev) => ({
          ...prev,
          isPlaying: true,
          isLoading: false,
        }));
      }
    } catch (error) {
      console.error("Erro na reprodução:", error);
      setVideoState((prev) => ({
        ...prev,
        hasError: true,
        isLoading: false,
        showYouTubeFallback: true,
      }));
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setVideoState((prev) => ({
      ...prev,
      isMuted: video.muted,
      volume: video.muted ? 0 : prev.volume,
    }));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(e.target.value);
    const video = videoRef.current;

    if (video) {
      video.volume = volume;
      video.muted = volume === 0;
      setVideoState((prev) => ({
        ...prev,
        volume,
        isMuted: volume === 0,
      }));
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    const video = videoRef.current;

    if (video) {
      video.currentTime = time;
      setVideoState((prev) => ({ ...prev, currentTime: time }));
    }
  };

  const toggleFullscreen = async () => {
    const player = playerRef.current;
    if (!player) return;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await player.requestFullscreen();
      }
    } catch (error) {
      console.error("Erro no fullscreen:", error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const openYouTube = () => {
    window.open(youtubeUrl, "_blank", "noopener,noreferrer");
  };

  // Fallback para YouTube Embed - MOSTRA O VÍDEO CORRETO
  if (videoState.showYouTubeFallback) {
    return (
      <div className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
        <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900">
          <iframe
            src={youtubeEmbedUrl}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Demonstração do Sistema - YouTube"
          />
        </div>

        {/* Badge de preview */}
        <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
          <Play className="w-4 h-4 mr-1" />
          Demo Real
        </div>

        {/* Overlay informativo */}
        <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg text-sm">
          🔍 Assistindo: <strong>Vídeo de Demonstração Real</strong>
        </div>
      </div>
    );
  }

  // Fallback component se o vídeo não carregar
  if (videoState.hasError) {
    return (
      <div className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
        <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center flex-col p-8">
          <div className="text-center">
            <div
              className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4 cursor-pointer hover:bg-red-700 transition-colors"
              onClick={openYouTube}
            >
              <ExternalLink className="w-8 h-8 text-white" />
            </div>
            <p className="text-white text-lg font-semibold mb-2">
              Vídeo de demonstração
            </p>
            <p className="text-gray-400 mb-4">Clique para abrir no YouTube</p>
            <div className="space-y-3">
              <button
                onClick={openYouTube}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center mx-auto"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Assistir no YouTube
              </button>
              <button
                onClick={() =>
                  setVideoState((prev) => ({
                    ...prev,
                    showYouTubeFallback: true,
                    hasError: false,
                  }))
                }
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto"
              >
                <Play className="w-4 h-4 mr-2" />
                Ver Embed no Site
              </button>
            </div>
          </div>
        </div>

        <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
          <Play className="w-4 h-4 mr-1" />
          Demo
        </div>
      </div>
    );
  }

  return (
    <div
      ref={playerRef}
      className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-2xl group"
    >
      {/* Player de vídeo real */}
      <video
        ref={videoRef}
        className="w-full aspect-video bg-black"
        preload="metadata"
        playsInline
        muted={videoState.isMuted}
        poster="/api/placeholder/800/450"
        onError={() =>
          setVideoState((prev) => ({ ...prev, showYouTubeFallback: true }))
        }
      >
        <source
          src={`https://www.youtube.com/watch?v=${youtubeVideoId}`}
          type="video/mp4"
        />
        Seu navegador não suporta o elemento de vídeo.
      </video>

      {/* Overlay informativo sobre o vídeo */}
      <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg text-sm">
        🎬 <strong>Vídeo de Demonstração:</strong> {youtubeVideoId}
      </div>

      {/* Overlay de controles */}
      <div
        className={`absolute inset-0 transition-all duration-300 ${
          videoState.isPlaying
            ? "bg-black/0 group-hover:bg-black/20"
            : "bg-black/40"
        }`}
      >
        {/* Botão Play/Pause centralizado */}
        {!videoState.isPlaying && (
          <button
            onClick={handlePlayPause}
            disabled={videoState.isLoading}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-all transform hover:scale-110">
              {videoState.isLoading ? (
                <Loader className="w-8 h-8 text-white animate-spin" />
              ) : (
                <Play className="w-8 h-8 text-white ml-1" />
              )}
            </div>
          </button>
        )}

        {/* Botão alternativo para YouTube */}
        <div className="absolute top-4 right-16">
          <button
            onClick={() =>
              setVideoState((prev) => ({ ...prev, showYouTubeFallback: true }))
            }
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm flex items-center transition-colors"
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Ver no YouTube
          </button>
        </div>

        {/* Controles inferiores */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {/* Barra de progresso */}
          <div className="mb-3">
            <input
              type="range"
              min="0"
              max={videoState.duration || 100}
              value={videoState.currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-red-600"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Controle Play/Pause */}
              <button
                onClick={handlePlayPause}
                className="text-white hover:text-gray-300 transition-colors"
                disabled={videoState.isLoading}
              >
                {videoState.isLoading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : videoState.isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
              </button>

              {/* Controle de volume */}
              <button
                onClick={toggleMute}
                className="text-white hover:text-gray-300 transition-colors"
              >
                {videoState.isMuted || videoState.volume === 0 ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={videoState.volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
              />

              {/* Tempo */}
              <span className="text-white text-sm font-mono">
                {formatTime(videoState.currentTime)} /{" "}
                {formatTime(videoState.duration)}
              </span>
            </div>

            {/* Controle de tela cheia */}
            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <Fullscreen className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {videoState.isLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-center">
            <Loader className="w-8 h-8 text-white animate-spin mx-auto mb-2" />
            <p className="text-white text-sm">Carregando demonstração...</p>
          </div>
        </div>
      )}

      {/* Badge de preview */}
      <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
        <Play className="w-4 h-4 mr-1" />
        Demo Real
      </div>
    </div>
  );
};

// Resto do código da LandingPage permanece igual...
const LandingPage = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [userCount, setUserCount] = useState(1247);
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationError, setNavigationError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setUserCount((prev) => prev + Math.floor(Math.random() * 10));
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const handleGetStarted = async () => {
    setIsNavigating(true);
    setNavigationError("");

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      navigate("/login", {
        replace: false,
        state: { from: "landing" },
      });
    } catch (error) {
      console.error("Erro na navegação:", error);
      setNavigationError("Erro ao redirecionar. Tente novamente.");
    } finally {
      setTimeout(() => {
        setIsNavigating(false);
      }, 2000);
    }
  };

  const features = [
    {
      icon: Video,
      title: "Gestão de Canais",
      description: "Adicione e organize seus canais favoritos do YouTube",
      color: "from-red-500 to-orange-500",
    },
    {
      icon: Search,
      title: "Busca Inteligente",
      description: "Encontre vídeos por palavras-chave, título ou canal",
      color: "from-blue-500 to-purple-500",
    },
    {
      icon: Filter,
      title: "Filtros Avançados",
      description: "Filtre por canais específicos e status de visualização",
      color: "from-green-500 to-teal-500",
    },
    {
      icon: Trophy,
      title: "Sistema de Conquistas",
      description: "Desbloqueie badges e conquistas ao usar o sistema",
      color: "from-yellow-500 to-orange-500",
    },
    {
      icon: BarChart3,
      title: "Dashboard Completo",
      description: "Acompanhe suas estatísticas e progresso",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Shield,
      title: "Dados Seguros",
      description: "Seus dados protegidos com criptografia",
      color: "from-gray-500 to-blue-500",
    },
  ];

  const achievements = [
    {
      type: "first_channel",
      title: "Primeiro Canal",
      description: "Adicione seu primeiro canal",
      progress: 100,
    },
    {
      type: "five_channels",
      title: "Colecionador",
      description: "Adicione 5 canais",
      progress: 60,
    },
    {
      type: "ten_videos_watched",
      title: "Spectador",
      description: "Assista 10 vídeos",
      progress: 30,
    },
    {
      type: "focused",
      title: "Focado",
      description: "Complete um canal inteiro",
      progress: 20,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-blue-600/10"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
          {/* Badge de destaque */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-red-100 text-red-800 text-sm font-medium mb-8 animate-pulse">
            <Sparkles className="w-4 h-4 mr-2" />
            Plataforma Gamificada de Gestão de Conteúdo
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Transforme sua experiência no
            <span className="bg-gradient-to-r from-red-600 to-blue-600 bg-clip-text text-transparent">
              {" "}
              YouTube
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Gerencie seus canais favoritos, descubra novos conteúdos e conquiste
            achievements enquanto organiza sua jornada de aprendizado.
          </p>

          {/* Contadores gamificados */}
          <div className="flex justify-center items-center space-x-8 mb-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {userCount}+
              </div>
              <div className="text-sm text-gray-600">Usuários Ativos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">15K+</div>
              <div className="text-sm text-gray-600">Vídeos Gerenciados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">98%</div>
              <div className="text-sm text-gray-600">Satisfação</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              disabled={isNavigating}
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-red-600 to-red-700 rounded-xl hover:from-red-700 hover:to-red-800 transition-all transform hover:scale-105 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isNavigating ? (
                <>
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  Redirecionando...
                </>
              ) : (
                <>
                  Começar Agora
                  <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </button>

            <button
              className="inline-flex items-center px-8 py-4 text-lg font-semibold text-gray-700 bg-white rounded-xl hover:bg-gray-50 transition-all border-2 border-gray-200"
              disabled={isNavigating}
            >
              <Play className="mr-2 w-5 h-5" />
              Ver Demonstração
            </button>
          </div>

          {navigationError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg max-w-md mx-auto">
              <p className="text-red-700 text-sm">{navigationError}</p>
            </div>
          )}
        </div>
      </div>

      {/* Seção de Vídeo Demonstrativo */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Veja como funciona
          </h2>
          <p className="text-lg text-gray-600">
            Assista à demonstração real do sistema em ação
          </p>
        </div>

        {/* Player de vídeo funcional COM VÍDEO CORRETO */}
        <VideoPlayer />
      </div>

      {/* Resto das seções... */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Funcionalidades Incríveis
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Descubra todas as ferramentas que vão revolucionar como você consome
            conteúdo no YouTube
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200"
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Sistema de Gamificação</h2>
            <p className="text-purple-100 text-lg">
              Conquiste achievements e badges enquanto organiza seu conteúdo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center"
              >
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-8 h-8" />
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  {achievement.title}
                </h3>
                <p className="text-purple-100 text-sm mb-4">
                  {achievement.description}
                </p>

                <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${achievement.progress}%` }}
                  ></div>
                </div>
                <div className="text-xs text-purple-200">
                  {achievement.progress}% completo
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Escolha seu Plano
          </h2>
          <p className="text-lg text-gray-600">
            Acesso completo a todas as funcionalidades premium
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-red-500 transform hover:scale-105 transition-transform duration-300">
            <div className="bg-red-500 text-white text-center py-3 rounded-t-2xl">
              <div className="flex items-center justify-center">
                <Crown className="w-5 h-5 mr-2" />
                <span className="font-semibold">PLANO RECOMENDADO</span>
              </div>
            </div>

            <div className="p-8">
              <div className="text-center mb-6">
                <div className="flex items-baseline justify-center mb-2">
                  <span className="text-4xl font-bold text-gray-900">
                    R$ 8,99
                  </span>
                  <span className="text-gray-600 ml-2">/trimestre</span>
                </div>
                <p className="text-gray-600">
                  Cobrança trimestral • Economize 40%
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Acesso a todos os recursos premium</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Suporte prioritário 24/7</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Backup automático dos dados</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Atualizações exclusivas</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Relatórios avançados</span>
                </div>
              </div>

              <button
                onClick={handleGetStarted}
                disabled={isNavigating}
                className="w-full flex items-center justify-center bg-gradient-to-r from-red-600 to-red-700 text-white py-4 rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isNavigating ? (
                  <>
                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                    Redirecionando...
                  </>
                ) : (
                  "Começar Agora - R$ 8,99/trimestre"
                )}
              </button>

              <p className="text-center text-sm text-gray-500 mt-4">
                ✅ 7 dias de garantia ou seu dinheiro de volta
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2024 YouTube Channel Watcher. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
