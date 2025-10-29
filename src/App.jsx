import { useState, useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
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
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const location = useLocation();

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
      currentPath: location.pathname,
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
    location.pathname,
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

  // Componente da aplicação principal (dashboard)
  const Dashboard = () => (
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

  return (
    <Routes>
      {/* Rota para landing page (pública) */}
      <Route 
        path="/" 
        element={!isAuthenticated ? <LandingPage /> : <Navigate to="/dashboard" replace />} 
      />
      
      {/* Rota para login (pública) */}
      <Route 
        path="/login" 
        element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />} 
      />
      
      {/* Rota para dashboard (protegida) */}
      <Route 
        path="/dashboard" 
        element={isAuthenticated ? <Dashboard /> : <Navigate to="/" replace />} 
      />
      
      {/* Rota padrão - redireciona baseado na autenticação */}
      <Route 
        path="*" 
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/"} replace />} 
      />
    </Routes>
  );
}

function App() {
  return <AppContent />;
}

export default App;