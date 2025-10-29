"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Settings, 
  AlertTriangle,
  Loader,
  RefreshCw,
  Wifi,
  WifiOff,
  Download,
  Clock
} from "lucide-react";
import videoLogger from "../utils/videoLogger";

const VideoPlayer = ({ 
  videoUrl, 
  title = "Demonstração do Sistema",
  autoPlay = false,
  controls = true,
  onError,
  onReady,
  onPlay,
  onPause,
  onEnded
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [quality, setQuality] = useState("auto");
  const [networkStatus, setNetworkStatus] = useState("unknown");
  const [retryCount, setRetryCount] = useState(0);

  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const progressRef = useRef(null);

  // Inicializar logger
  useEffect(() => {
    videoLogger.log('PLAYER_INITIALIZED', {
      videoUrl,
      autoPlay,
      controls,
      playerType: 'youtube_embed'
    });
  }, [videoUrl, autoPlay, controls]);

  // Monitorar estado da rede
  useEffect(() => {
    const updateNetworkStatus = () => {
      const status = navigator.onLine ? 'online' : 'offline';
      setNetworkStatus(status);
      videoLogger.log('NETWORK_STATUS_CHANGE', { status });
    };

    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    updateNetworkStatus();

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
    };
  }, []);

  // Event handlers do vídeo
  const handleLoadStart = useCallback(() => {
    setIsLoading(true);
    videoLogger.log('VIDEO_LOAD_START', {
      videoUrl,
      currentTime: videoRef.current?.currentTime || 0
    });
  }, [videoUrl]);

  const handleLoadedData = useCallback(() => {
    setIsLoading(false);
    const video = videoRef.current;
    if (video) {
      setDuration(video.duration);
      videoLogger.log('VIDEO_LOADED_DATA', {
        duration: video.duration,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        readyState: video.readyState
      });
    }
    onReady?.();
  }, [onReady]);

  const handleCanPlay = useCallback(() => {
    setIsLoading(false);
    videoLogger.log('VIDEO_CAN_PLAY', {
      currentTime: videoRef.current?.currentTime || 0,
      networkState: videoRef.current?.networkState
    });
  }, []);

  const handleCanPlayThrough = useCallback(() => {
    videoLogger.log('VIDEO_CAN_PLAY_THROUGH', {
      currentTime: videoRef.current?.currentTime || 0,
      buffered: videoRef.current?.buffered.length || 0
    });
  }, []);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    videoLogger.log('VIDEO_PLAY', {
      currentTime: videoRef.current?.currentTime || 0,
      playbackRate: videoRef.current?.playbackRate || 1
    });
    onPlay?.();
  }, [onPlay]);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
    videoLogger.log('VIDEO_PAUSE', {
      currentTime: videoRef.current?.currentTime || 0
    });
    onPause?.();
  }, [onPause]);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    videoLogger.log('VIDEO_ENDED', {
      duration: videoRef.current?.duration || 0
    });
    onEnded?.();
  }, [onEnded]);

  const handleError = useCallback((error) => {
    setIsLoading(false);
    setHasError(true);
    
    const video = videoRef.current;
    const errorDetails = {
      errorCode: video?.error?.code,
      errorMessage: video?.error?.message,
      networkState: video?.networkState,
      readyState: video?.readyState,
      currentTime: video?.currentTime || 0,
      retryCount
    };

    videoLogger.logError('VIDEO_PLAYBACK_ERROR', error, errorDetails);
    onError?.(errorDetails);
  }, [onError, retryCount]);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      setCurrentTime(video.currentTime);
      setDuration(video.duration || 0);

      // Calcular buffered progress
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const bufferedPercent = (bufferedEnd / video.duration) * 100;
        setBuffered(bufferedPercent);
      }
    }
  }, []);

  const handleProgress = useCallback(() => {
    const video = videoRef.current;
    if (video && video.buffered.length > 0) {
      const bufferedEnd = video.buffered.end(video.buffered.length - 1);
      const bufferedPercent = (bufferedEnd / video.duration) * 100;
      setBuffered(bufferedPercent);
      
      videoLogger.logPerformance('BUFFER_PROGRESS', bufferedPercent, {
        currentTime: video.currentTime,
        bufferedRanges: video.buffered.length
      });
    }
  }, []);

  const handleWaiting = useCallback(() => {
    setIsLoading(true);
    videoLogger.log('VIDEO_WAITING', {
      currentTime: videoRef.current?.currentTime || 0,
      readyState: videoRef.current?.readyState
    });
  }, []);

  const handleSeeking = useCallback(() => {
    videoLogger.log('VIDEO_SEEKING', {
      currentTime: videoRef.current?.currentTime || 0,
      targetTime: videoRef.current?.currentTime || 0
    });
  }, []);

  const handleSeeked = useCallback(() => {
    videoLogger.log('VIDEO_SEEKED', {
      currentTime: videoRef.current?.currentTime || 0
    });
  }, []);

  // Controles do player
  const togglePlay = useCallback(async (event) => {
    const video = videoRef.current;
    if (!video) return;

    videoLogger.logClickEvent(videoUrl, event.target, {
      x: event.clientX,
      y: event.clientY
    });

    try {
      if (isPlaying) {
        video.pause();
      } else {
        // Tentar reproduzir com tratamento de autoplay policies
        const playPromise = video.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              videoLogger.log('PLAY_SUCCESS', {
                method: 'user_interaction',
                autoplayPolicy: 'allowed'
              });
            })
            .catch(error => {
              videoLogger.logError('PLAY_BLOCKED', error, {
                autoplayPolicy: 'blocked',
                userInteraction: true
              });
              
              // Fallback: mutar e tentar novamente
              if (error.name === 'NotAllowedError') {
                video.muted = true;
                setIsMuted(true);
                video.play().catch(fallbackError => {
                  videoLogger.logError('PLAY_FALLBACK_FAILED', fallbackError);
                });
              }
            });
        }
      }
    } catch (error) {
      videoLogger.logError('PLAY_TOGGLE_ERROR', error);
    }
  }, [isPlaying, videoUrl]);

  const handleVolumeChange = useCallback((newVolume) => {
    const video = videoRef.current;
    if (video) {
      video.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  }, []);

  const handleSeek = useCallback((newTime) => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = newTime;
    }
  }, []);

  const handleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    try {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        container.requestFullscreen();
      }
    } catch (error) {
      videoLogger.logError('FULLSCREEN_ERROR', error);
    }
  }, []);

  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
    setHasError(false);
    setIsLoading(true);
    
    videoLogger.log('PLAYER_RETRY', {
      retryCount: retryCount + 1,
      videoUrl
    });

    // Recarregar o vídeo
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [retryCount, videoUrl]);

  // Efeito para configurar event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const events = {
      loadstart: handleLoadStart,
      loadeddata: handleLoadedData,
      canplay: handleCanPlay,
      canplaythrough: handleCanPlayThrough,
      play: handlePlay,
      pause: handlePause,
      ended: handleEnded,
      error: handleError,
      timeupdate: handleTimeUpdate,
      progress: handleProgress,
      waiting: handleWaiting,
      seeking: handleSeeking,
      seeked: handleSeeked
    };

    // Adicionar event listeners
    Object.entries(events).forEach(([event, handler]) => {
      video.addEventListener(event, handler);
    });

    // Log inicial do elemento de vídeo
    videoLogger.log('VIDEO_ELEMENT_CREATED', {
      tagName: video.tagName,
      src: video.src,
      autoplay: video.autoplay,
      controls: video.controls,
      preload: video.preload
    });

    return () => {
      // Remover event listeners
      Object.entries(events).forEach(([event, handler]) => {
        video.removeEventListener(event, handler);
      });
    };
  }, [
    handleLoadStart, handleLoadedData, handleCanPlay, handleCanPlayThrough,
    handlePlay, handlePause, handleEnded, handleError, handleTimeUpdate,
    handleProgress, handleWaiting, handleSeeking, handleSeeked
  ]);

  // Formatação de tempo
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculo de progresso
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (hasError) {
    return (
      <div className="relative bg-gray-900 rounded-lg flex items-center justify-center min-h-[400px]">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-white text-xl font-semibold mb-2">
            Erro ao carregar vídeo
          </h3>
          <p className="text-gray-400 mb-4">
            Não foi possível carregar o vídeo. Verifique sua conexão e tente novamente.
          </p>
          <div className="flex space-x-3 justify-center">
            <button
              onClick={handleRetry}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </button>
            <button
              onClick={() => videoLogger.exportLogs()}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
            >
Percebi que o arquivo foi cortado. Vou completar a implementação do VideoPlayer e criar os componentes de teste:

<dyad-write path="src/components/VideoPlayer.jsx" description="Completando implementação do VideoPlayer com diagnóstico completo">
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Settings, 
  AlertTriangle,
  Loader,
  RefreshCw,
  Wifi,
  WifiOff,
  Download,
  Clock
} from "lucide-react";
import videoLogger from "../utils/videoLogger";

const VideoPlayer = ({ 
  videoUrl, 
  title = "Demonstração do Sistema",
  autoPlay = false,
  controls = true,
  onError,
  onReady,
  onPlay,
  onPause,
  onEnded
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [quality, setQuality] = useState("auto");
  const [networkStatus, setNetworkStatus] = useState("unknown");
  const [retryCount, setRetryCount] = useState(0);

  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const progressRef = useRef(null);

  // Inicializar logger
  useEffect(() => {
    videoLogger.log('PLAYER_INITIALIZED', {
      videoUrl,
      autoPlay,
      controls,
      playerType: 'youtube_embed'
    });
  }, [videoUrl, autoPlay, controls]);

  // Monitorar estado da rede
  useEffect(() => {
    const updateNetworkStatus = () => {
      const status = navigator.onLine ? 'online' : 'offline';
      setNetworkStatus(status);
      videoLogger.log('NETWORK_STATUS_CHANGE', { status });
    };

    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    updateNetworkStatus();

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
    };
  }, []);

  // Event handlers do vídeo
  const handleLoadStart = useCallback(() => {
    setIsLoading(true);
    videoLogger.log('VIDEO_LOAD_START', {
      videoUrl,
      currentTime: videoRef.current?.currentTime || 0
    });
  }, [videoUrl]);

  const handleLoadedData = useCallback(() => {
    setIsLoading(false);
    const video = videoRef.current;
    if (video) {
      setDuration(video.duration);
      videoLogger.log('VIDEO_LOADED_DATA', {
        duration: video.duration,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        readyState: video.readyState
      });
    }
    onReady?.();
  }, [onReady]);

  const handleCanPlay = useCallback(() => {
    setIsLoading(false);
    videoLogger.log('VIDEO_CAN_PLAY', {
      currentTime: videoRef.current?.currentTime || 0,
      networkState: videoRef.current?.networkState
    });
  }, []);

  const handleCanPlayThrough = useCallback(() => {
    videoLogger.log('VIDEO_CAN_PLAY_THROUGH', {
      currentTime: videoRef.current?.currentTime || 0,
      buffered: videoRef.current?.buffered.length || 0
    });
  }, []);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    videoLogger.log('VIDEO_PLAY', {
      currentTime: videoRef.current?.currentTime || 0,
      playbackRate: videoRef.current?.playbackRate || 1
    });
    onPlay?.();
  }, [onPlay]);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
    videoLogger.log('VIDEO_PAUSE', {
      currentTime: videoRef.current?.currentTime || 0
    });
    onPause?.();
  }, [onPause]);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    videoLogger.log('VIDEO_ENDED', {
      duration: videoRef.current?.duration || 0
    });
    onEnded?.();
  }, [onEnded]);

  const handleError = useCallback((error) => {
    setIsLoading(false);
    setHasError(true);
    
    const video = videoRef.current;
    const errorDetails = {
      errorCode: video?.error?.code,
      errorMessage: video?.error?.message,
      networkState: video?.networkState,
      readyState: video?.readyState,
      currentTime: video?.currentTime || 0,
      retryCount
    };

    videoLogger.logError('VIDEO_PLAYBACK_ERROR', error, errorDetails);
    onError?.(errorDetails);
  }, [onError, retryCount]);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      setCurrentTime(video.currentTime);
      setDuration(video.duration || 0);

      // Calcular buffered progress
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const bufferedPercent = (bufferedEnd / video.duration) * 100;
        setBuffered(bufferedPercent);
      }
    }
  }, []);

  const handleProgress = useCallback(() => {
    const video = videoRef.current;
    if (video && video.buffered.length > 0) {
      const bufferedEnd = video.buffered.end(video.buffered.length - 1);
      const bufferedPercent = (bufferedEnd / video.duration) * 100;
      setBuffered(bufferedPercent);
      
      videoLogger.logPerformance('BUFFER_PROGRESS', bufferedPercent, {
        currentTime: video.currentTime,
        bufferedRanges: video.buffered.length
      });
    }
  }, []);

  const handleWaiting = useCallback(() => {
    setIsLoading(true);
    videoLogger.log('VIDEO_WAITING', {
      currentTime: videoRef.current?.currentTime || 0,
      readyState: videoRef.current?.readyState
    });
  }, []);

  const handleSeeking = useCallback(() => {
    videoLogger.log('VIDEO_SEEKING', {
      currentTime: videoRef.current?.currentTime || 0,
      targetTime: videoRef.current?.currentTime || 0
    });
  }, []);

  const handleSeeked = useCallback(() => {
    videoLogger.log('VIDEO_SEEKED', {
      currentTime: videoRef.current?.currentTime || 0
    });
  }, []);

  // Controles do player
  const togglePlay = useCallback(async (event) => {
    const video = videoRef.current;
    if (!video) return;

    videoLogger.logClickEvent(videoUrl, event.target, {
      x: event.clientX,
      y: event.clientY
    });

    try {
      if (isPlaying) {
        video.pause();
      } else {
        // Tentar reproduzir com tratamento de autoplay policies
        const playPromise = video.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              videoLogger.log('PLAY_SUCCESS', {
                method: 'user_interaction',
                autoplayPolicy: 'allowed'
              });
            })
            .catch(error => {
              videoLogger.logError('PLAY_BLOCKED', error, {
                autoplayPolicy: 'blocked',
                userInteraction: true
              });
              
              // Fallback: mutar e tentar novamente
              if (error.name === 'NotAllowedError') {
                video.muted = true;
                setIsMuted(true);
                video.play().catch(fallbackError => {
                  videoLogger.logError('PLAY_FALLBACK_FAILED', fallbackError);
                });
              }
            });
        }
      }
    } catch (error) {
      videoLogger.logError('PLAY_TOGGLE_ERROR', error);
    }
  }, [isPlaying, videoUrl]);

  const handleVolumeChange = useCallback((newVolume) => {
    const video = videoRef.current;
    if (video) {
      video.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  }, []);

  const handleSeek = useCallback((newTime) => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = newTime;
    }
  }, []);

  const handleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    try {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        container.requestFullscreen();
      }
    } catch (error) {
      videoLogger.logError('FULLSCREEN_ERROR', error);
    }
  }, []);

  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
    setHasError(false);
    setIsLoading(true);
    
    videoLogger.log('PLAYER_RETRY', {
      retryCount: retryCount + 1,
      videoUrl
    });

    // Recarregar o vídeo
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [retryCount, videoUrl]);

  // Efeito para configurar event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const events = {
      loadstart: handleLoadStart,
      loadeddata: handleLoadedData,
      canplay: handleCanPlay,
      canplaythrough: handleCanPlayThrough,
      play: handlePlay,
      pause: handlePause,
      ended: handleEnded,
      error: handleError,
      timeupdate: handleTimeUpdate,
      progress: handleProgress,
      waiting: handleWaiting,
      seeking: handleSeeking,
      seeked: handleSeeked
    };

    // Adicionar event listeners
    Object.entries(events).forEach(([event, handler]) => {
      video.addEventListener(event, handler);
    });

    // Log inicial do elemento de vídeo
    videoLogger.log('VIDEO_ELEMENT_CREATED', {
      tagName: video.tagName,
      src: video.src,
      autoplay: video.autoplay,
      controls: video.controls,
      preload: video.preload
    });

    return () => {
      // Remover event listeners
      Object.entries(events).forEach(([event, handler]) => {
        video.removeEventListener(event, handler);
      });
    };
  }, [
    handleLoadStart, handleLoadedData, handleCanPlay, handleCanPlayThrough,
    handlePlay, handlePause, handleEnded, handleError, handleTimeUpdate,
    handleProgress, handleWaiting, handleSeeking, handleSeeked
  ]);

  // Formatação de tempo
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculo de progresso
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (hasError) {
    return (
      <div className="relative bg-gray-900 rounded-lg flex items-center justify-center min-h-[400px]">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-white text-xl font-semibold mb-2">
            Erro ao carregar vídeo
          </h3>
          <p className="text-gray-400 mb-4">
            Não foi possível carregar o vídeo. Verifique sua conexão e tente novamente.
          </p>
          <div className="flex space-x-3 justify-center">
            <button
              onClick={handleRetry}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </button>
            <button
              onClick={() => console.log('Logs:', videoLogger.exportLogs())}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar Logs
            </button>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            <p>Tentativas: {retryCount} | Rede: {networkStatus}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="relative bg-black rounded-lg overflow-hidden group"
    >
      {/* Indicador de loading */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-10">
          <div className="text-center">
            <Loader className="w-8 h-8 text-white animate-spin mx-auto mb-2" />
            <p className="text-white text-sm">Carregando vídeo...</p>
            <div className="mt-2 flex items-center justify-center space-x-2 text-xs text-gray-400">
              <Wifi className="w-3 h-3" />
              <span>{networkStatus === 'online' ? 'Conectado' : 'Offline'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Player de vídeo */}
      <div className="aspect-w-16 aspect-h-9">
        <iframe
          ref={videoRef}
          src={`${videoUrl}?rel=0&modestbranding=1&controls=${controls ? 1 : 0}&showinfo=1&autoplay=${autoPlay ? 1 : 0}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full min-h-[400px]"
          loading="lazy"
          frameBorder="0"
        />
      </div>

      {/* Overlay de controles customizados */}
      {controls && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Barra de progresso */}
          <div className="relative h-2 bg-gray-600 rounded-full mb-4 cursor-pointer">
            <div 
              className="absolute h-full bg-red-600 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
            <div 
              className="absolute h-full bg-gray-400 rounded-full opacity-50"
              style={{ width: `${buffered}%` }}
            />
          </div>

          {/* Controles inferiores */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="text-white hover:text-gray-300 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
              </button>

              {/* Volume */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleVolumeChange(isMuted ? 0.5 : 0)}
                  className="text-white hover:text-gray-300 transition-colors"
                >
                  {isMuted || volume === 0 ? (
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
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-20 accent-white"
                />
              </div>

              {/* Tempo */}
              <div className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Configurações */}
              <button className="text-white hover:text-gray-300 transition-colors">
                <Settings className="w-5 h-5" />
              </button>

              {/* Tela cheia */}
              <button
                onClick={handleFullscreen}
                className="text-white hover:text-gray-300 transition-colors"
              >
                <Maximize2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Indicador de status da rede */}
      <div className="absolute top-4 right-4">
        {networkStatus === 'offline' && (
          <div className="bg-yellow-500 text-white px-2 py-1 rounded text-xs flex items-center">
            <WifiOff className="w-3 h-3 mr-1" />
            Offline
          </div>
        )}
      </div>

      {/* Debug info (apenas em desenvolvimento) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white text-xs p-2 rounded">
          <div>Estado: {isPlaying ? 'Playing' : 'Paused'}</div>
          <div>Vou criar os componentes de teste e diagnóstico para completar a solução:

<dyad-write path="src/components/VideoDebugPanel.jsx" description="Painel de debug para diagnóstico de vídeo">
"use client";

import { useState, useEffect } from "react";
import { 
  Settings, 
  Download, 
  RefreshCw, 
  Play, 
  Pause,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle,
  X
} from "lucide-react";
import videoLogger from "../utils/videoLogger";

const VideoDebugPanel = ({ isOpen, onClose, videoUrl }) => {
  const [logs, setLogs] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [testResults, setTestResults] = useState({});

  useEffect(() => {
    if (isOpen) {
      updateLogs();
      
      if (autoRefresh) {
        const interval = setInterval(updateLogs, 2000);
        return () => clearInterval(interval);
      }
    }
  }, [isOpen, autoRefresh]);

  const updateLogs = () => {
    const exportedLogs = videoLogger.exportLogs();
    setLogs(exportedLogs.logs);
  };

  const runDiagnosticTests = async () => {
    const results = {
      network: await testNetwork(),
      videoElement: testVideoElement(),
      autoplay: await testAutoplay(),
      codecs: testCodecs(),
      performance: testPerformance()
    };
    
    setTestResults(results);
    videoLogger.log('DIAGNOSTIC_TESTS_COMPLETED', { results });
  };

  const testNetwork = async () => {
    try {
      const startTime = performance.now();
      const response = await fetch(videoUrl, { method: 'HEAD' });
      const endTime = performance.now();
      
      return {
        status: response.ok ? 'success' : 'failed',
        latency: Math.round(endTime - startTime),
        statusCode: response.status,
        headers: Object.fromEntries(response.headers)
      };
    } catch (error) {
      return {
        status: 'failed',
        error: error.message
      };
    }
  };

  const testVideoElement = () => {
    const video = document.querySelector('video') || document.querySelector('iframe');
    if (!video) {
      return { status: 'failed', error: 'No video element found' };
    }

    return {
      status: 'success',
      tagName: video.tagName,
      src: video.src,
      readyState: video.readyState,
      networkState: video.networkState,
      videoWidth: video.videoWidth,
      videoHeight: video.videoHeight
    };
  };

  const testAutoplay = async () => {
    const video = document.createElement('video');
    video.muted = true; // Muted videos can usually autoplay
    
    try {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        await playPromise;
        return { status: 'success', muted: true };
      }
      return { status: 'success', muted: true };
    } catch (error) {
      return { 
        status: 'failed', 
        error: error.message,
        muted: true
      };
    }
  };

  const testCodecs = () => {
    const video = document.createElement('video');
    const codecs = {
      h264: video.canPlayType('video/mp4; codecs="avc1.42E01E"'),
      webm: video.canPlayType('video/webm; codecs="vp8, vorbis"'),
      ogg: video.canPlayType('video/ogg; codecs="theora"'),
      h265: video.canPlayType('video/mp4; codecs="hvc1.1.6.L93.B0"')
    };

    return {
      status: 'success',
      supportedCodecs: codecs
    };
  };

  const testPerformance = () => {
    const navigation = performance.getEntriesByType('navigation')[0];
    const resources = performance.getEntriesByType('resource');
    const videoResources = resources.filter(r => r.name.includes('youtube') || r.name.includes('video'));

    return {
      status: 'success',
      pageLoadTime: navigation ? Math.round(navigation.loadEventEnd - navigation.loadEventStart) : 'N/A',
      videoResources: videoResources.map(r => ({
        name: r.name,
        duration: Math.round(r.duration),
        size: r.transferSize || 'unknown'
      }))
    };
  };

  const exportLogs = () => {
    const data = videoLogger.exportLogs();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `video-debug-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearLogs = () => {
    videoLogger.clearLogs();
    updateLogs();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Diagnóstico do Player de Vídeo</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[80vh]">
          {/* Testes de diagnóstico */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Testes de Diagnóstico</h3>
              <button
                onClick={runDiagnosticTests}
                className="bg-blue-600 text-white px-4 py-2 rounded flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Executar Testes</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(testResults).map(([test, result]) => (
                <div key={test} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium capitalize">{test}</span>
                    {result?.status === 'success' ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </div>

          {/* Controles de logs */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Logs de Depuração</h3>
            <div className="flex space-x-2">
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded"
                />
                <span>Auto-refresh</span>
              </label>
              <button
                onClick={exportLogs}
                className="bg-green-600 text-white px-3 py-1 rounded flex items-center space-x-1 text-sm"
              >
                <Download className="w-3 h-3" />
                <span>Exportar</span>
              </button>
              <button
                onClick={clearLogs}
                className="bg-red-600 text-white px-3 py-1 rounded flex items-center space-x-1 text-sm"
              >
                <X className="w-3 h-3" />
                <span>Limpar</span>
              </button>
            </div>
          </div>

          {/* Lista de logs */}
          <div className="bg-gray-100 rounded-lg p-4 max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500 text-center">Nenhum log registrado</p>
            ) : (
              <div className="space-y-2">
                {logs.map((log, index) => (
                  <div key={index} className="bg-white rounded p-3 border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{log.event}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600">
                      <pre>{JSON.stringify(log.data, null, 2)}</pre>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Informações do sistema */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-blue-50 p-3 rounded border">
              <h4 className="font-medium mb-2">Navegador</h4>
              <div className="space-y-1 text-xs">
                <div>User Agent: {navigator.userAgent.substring(0, 50)}...</div>
                <div>Online: {navigator.onLine ? 'Sim' : 'Não'}</div>
                <div>Plataforma: {navigator.platform}</div>
              </div>
            </div>

            <div className="bg-green-50 p-3 rounded border">
              <h4 className="font-medium mb-2">Rede</h4>
              <div className="space-y-1 text-xs">
                <div>Status: {networkStatus}</div>
                {navigator.connection && (
                  <>
                    <div>Tipo: {navigator.connection.effectiveType}</div>
                    <div>Downlink: {navigator.connection.downlink} Mbps</div>
                    <div>RTT: {navigator.connection.rtt} ms</div>
                  </>
                )}
              </div>
            </div>

            <div className="bg-purple-50 p-3 rounded border">
              <h4 className="font-medium mb-2">Performance</h4>
              <div className="space-y-1 text-xs">
                <div>Memória: {performance.memory ? `${Math.round(performance.memory.usedJSHeapSize / 1048576)}MB` : 'N/A'}</div>
                <div>Timing: {performance.timing ? `${Math.round(performance.timing.loadEventEnd - performance.timing.navigationStart)}ms` : 'N/A'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoDebugPanel;