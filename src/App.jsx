import { useState, useEffect } from "react";
import { useUserSession } from "./hooks/useUserSession";
import { useChannels } from "./hooks/useChannels";
import { useVideos } from "./hooks/useVideos";
import { useAuth } from "./contexts/AuthContext";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import VideoGrid from "./components/VideoGrid";
import Login from "./components/Login";
import "./index.css";

function AppContent() {
  const userSession = useUserSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showWatched, setShowWatched] = useState(false);
  const { user, loading: authLoading, isAuthenticated } = useAuth();

  const {
    channels,
    loading: channelsLoading,
    addChannel,
    removeChannel,
  } = useChannels();

  const {
    videos,
    watchedVideos,
    loading: videosLoading,
    toggleWatchedStatus,
  } = useVideos(userSession);

  const unreadCount = videos.filter(
    (video) => !watchedVideos.has(video.video_id)
  ).length;

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  // Debug: verificar estado de autenticação
  useEffect(() => {
    console.log("🔐 Estado de autenticação:", {
      isAuthenticated,
      user,
      authLoading,
    });
  }, [isAuthenticated, user, authLoading]);

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

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar
        isOpen={sidebarOpen}
        closeSidebar={closeSidebar}
        channels={channels}
        addChannel={addChannel}
        removeChannel={removeChannel}
        loading={channelsLoading}
      />

      <div className="flex-1 flex flex-col lg:ml-0">
        <Header
          toggleSidebar={toggleSidebar}
          showWatched={showWatched}
          setShowWatched={setShowWatched}
          unreadCount={unreadCount}
        />

        <main className="flex-1 overflow-auto">
          <VideoGrid
            videos={videos}
            watchedVideos={watchedVideos}
            showWatched={showWatched}
            toggleWatchedStatus={toggleWatchedStatus}
            loading={videosLoading}
          />
        </main>
      </div>
    </div>
  );
}

function App() {
  return <AppContent />;
}

export default App;
