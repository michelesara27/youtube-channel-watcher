// src/App.jsx
import { useState } from "react";
import { useUserSession } from "./hooks/useUserSession";
import { useChannels } from "./hooks/useChannels";
import { useVideos } from "./hooks/useVideos";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import VideoGrid from "./components/VideoGrid";
//CSS
import "./index.css";

function App() {
  const userSession = useUserSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showWatched, setShowWatched] = useState(false);

  const {
    channels,
    loading: channelsLoading,
    addChannel,
    removeChannel,
    isAuthenticated,
    logout,
  } = useChannels();

  const {
    videos,
    watchedVideos,
    loading: videosLoading,
    toggleWatchedStatus,
  } = useVideos(userSession);

  // Calcular número de vídeos não assistidos
  const unreadCount = videos.filter(
    (video) => !watchedVideos.has(video.video_id)
  ).length;

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        closeSidebar={closeSidebar}
        channels={channels}
        addChannel={addChannel}
        removeChannel={removeChannel}
        loading={channelsLoading}
        isAuthenticated={isAuthenticated}
        onLogout={logout}
      />

      {/* Conteúdo principal */}
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

export default App;
