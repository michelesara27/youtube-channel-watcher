import { useState, useEffect } from "react";
import { useUserSession } from "./hooks/useUserSession";
import { useChannels } from "./hooks/useChannels";
import { useVideos } from "./hooks/useVideos";
import { useAuth } from "./contexts/AuthContext";
import { useAchievements } from "./hooks/useAchievements";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import VideoPercebi que o arquivo foi cortado. Vou completar a implementação do App.jsx atualizado:

<dyad-write path="src/App.jsx" description="Atualizando App.jsx para incluir roteamento entre landing page e app principal">
import { useState, useEffect } from "react";
import { useUserSession } from "./hooks/useUserSession";
import { useChannels } from "./hooks/useChannels";
import { useVideos } from "./hooks/useVideos";
import { useAuth } from "./contexts/AuthContext";
import { useAchievements } from "./hooks/useAchievements";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import VideoGrid from "./components/VideoGrid";
import Login from "./components/Login";
import LandingPage from "./pages/LandingPage";
import Celebration from "./components/Celebration";
import "./index.css";

function AppContent() {
  const userSession = useUserSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showWatched, setShowWatched] = useState(false);
  const [filteredChannels, setFilteredChannels] = useState(null);
  const [showLandingPage, setShowLandingPage] = useState(true);
  const { user, loading: authLoading, isAuthenticated } = useAuth();

  const {
    channels,
    loading: channelsLoading,
    addChannel,
    removeChannel,
    scanChannelsForNewVideos,
    refreshChannels,
  } = useChannels();

  const {
    videos,
    allVideos,
    watchedVideos,
    loading: videosLoading,
    searchLoading,
    searchTerm,
    toggleWatchedStatus,
    refreshVideos,
    updateVideoKeywords,
    searchVideos,
    clearSearch,
    applyChannelFilter,
  } = useVideos(userSession);

  // Sistema de conquistas
  const { achievements, showCelebration, newAchievement, setShowCelebration } =
    useAchievements(userSession, channels, watchedVideos, allVideos);

  // Calcular número de vídeos não assistidos
  const unreadCount = allVideos.filter(
    (video) => !watchedVideos.has(video.video_id)
  ).length;

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  // Função para lidar com o filtro de canais
  const handleChannelsFilter = async (channelIds) => {
    setFilteredChannels(channelIds.length > 0 ? channelIds : null);

    if (channelIds.length > 0) {
      await applyChannelFilter(channelIds);
    } else {
      await refreshVideos();
    }
  };

  // Função para limpar o filtro
  const clearFilter = async () => {
    setFilteredChannels(null);
    await refreshVideos();
  };

  // Efeito para recarregar vídeos quando canais forem atualizados
  useEffect(() => {
    if (isAuthenticated) {
      if (filteredChannels) {
        // Se há filtro ativo, reaplicar o filtro
        applyChannelFilter(filteredChannels);
      } else {
        // Caso contrário, recarregar todos os vídeos
        refreshVideos();
      }
    }
  }, [isAuthenticated, channels.length]);

  // Mostrar landing page apenas para usuários não autenticados na primeira visita
  useEffect(() => {
    if (isAuthenticated) {
      setShowLandingPage(false);
    }
  }, [isAuthenticated]);

  // Função para navegar para o login a partir da landing page
  const handleNavigateToLogin = () => {
    setShowLandingPage(false);
  };

  // Debug: monitorar estados
  useEffect(() => {
    console.log("🔍 App State:", {
      authenticated: isAuthenticated,
      user: user?.email,
      channels: channels.length,
      videos: videos.length,
      allVideos: allVideos.length,
      searchTerm,
      filteredChannels: filteredChannels ? filteredChannels.length : 0,
      loading: videosLoading || searchLoading,
      achievements: Object.keys(achievements || {}).filter(
        (key) => achievements[key]
      ).length,
      showLandingPage,
    });
  }, [
    isAuthenticated,
    user,
    channels.length,
    videos.length,
    allVideos.length,
    searchTerm,
    videosLoading,
    searchLoading,
    achievements,
    filteredChannels,
    showLandingPage,
  ]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se não está autenticado e deve mostrar landing page
  if (!isAuthenticated && showLandingPage) {
    return <LandingPage />;
  }

  // Se não está autenticado mas não deve mostrar landing page (veio do botão "Começar agora")
  if (!isAuthenticated && !showLandingPage) {
    return <Login />;
  }

  // Usuário autenticado - mostrar aplicação principal
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar
        isOpen={sidebarOpen}
        closeSidebar={closeSidebar}
        channels={channels}
        addChannel={addChannel}
        removeChannel={removeChannel}
        loading={channelsLoading}
        onChannelsFilter={handleChannelsFilter}
        refreshVideos={refreshVideos}
        scanChannelsForNewVideos={scanChannelsForNewVideos}
      />

      <div className="flex-1 flex flex-col lg:ml-0">
        <Header
          toggleSidebar={toggleSidebar}
          showWatched={showWatched}
          setShowWatched={setShowWatched}
          unreadCount={unreadCount}
          searchTerm={searchTerm}
          onClearSearch={clearSearch}
          achievements={achievements}
          activeFilter={filteredChannels}
          onClearFilter={clearFilter}
        />

        <main className="flex-1 overflow-auto">
          <VideoGrid
            videos={videos}
            allVideos={allVideos}
            watchedVideos={watchedVideos}
            showWatched={showWatched}
            toggleWatchedStatus={toggleWatchedStatus}
            loading={videosLoading || searchLoading}
            searchTerm={searchTerm}
            onSearchChange={searchVideos}
            onClearSearch={clearSearch}
            onKeywordsUpdate={updateVideoKeywords}
          />
        </main>

        {/* Footer com estatísticas */}
        <footer className="bg-white border-t border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex space-x-4">
              <span>📺 {channels.length} canais</span>
              <span>🎬 {allVideos.length} vídeos</span>
              <span>👀 {unreadCount} não assistidos</span>
              <span>
                🏆 {Object.values(achievements || {}).filter((a) => a).length}{" "}
                conquistas
              </span>
              {filteredChannels && (
                <span className="text-blue-600">
                  🔍 Filtro: {filteredChannels.length} canal(ais)
                </span>
              )}
              {searchTerm && (
                <span className="text-green-600">
                  📋 {videos.length} resultado(s) para "{searchTerm}"
                </span>
              )}
            </div>
            <div>
              {(videosLoading || searchLoading) && (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600 mr-2"></div>
                  Carregando...
                </span>
              )}
            </div>
          </div>
        </footer>
      </div>

      {/* Celebração de conquista */}
      {showCelebration && (
        <Celebration
          achievement={newAchievement}
          onClose={() => setShowCelebration(false)}
        />
      )}
    </div>
  );
}

function App() {
  return <AppContent />;
}

export default App;