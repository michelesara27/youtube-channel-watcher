// src/components/VideoGrid.jsx
import { useState } from "react";
import { Search, X, CornerDownLeft } from "lucide-react";
import VideoCard from "./VideoCard";

const VideoGrid = ({
  videos,
  allVideos,
  watchedVideos,
  showWatched,
  toggleWatchedStatus,
  loading,
  searchTerm,
  onSearchChange,
  onClearSearch,
  onKeywordsUpdate,
}) => {
  const [localSearch, setLocalSearch] = useState(searchTerm || "");
  const [showEnterHint, setShowEnterHint] = useState(false);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearch(value);
    // Não busca automaticamente agora, só atualiza o campo
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSearchChange(localSearch);
      setShowEnterHint(false);
    }
  };

  const handleSearchClick = () => {
    onSearchChange(localSearch);
    setShowEnterHint(false);
  };

  const handleClearSearch = () => {
    setLocalSearch("");
    onSearchChange("");
    setShowEnterHint(false);
  };

  const handleFocus = () => {
    if (localSearch) {
      setShowEnterHint(true);
    }
  };

  const handleBlur = () => {
    setTimeout(() => setShowEnterHint(false), 200);
  };

  const filteredVideos = showWatched
    ? videos
    : videos.filter((video) => !watchedVideos.has(video.video_id));

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
          >
            <div className="h-48 bg-gray-200"></div>
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Barra de busca */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Buscar por palavras-chave, título ou canal..."
            value={localSearch}
            onChange={handleSearchChange}
            onKeyPress={handleKeyPress}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className="w-full pl-10 pr-20 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />

          {localSearch && (
            <>
              <button
                onClick={handleSearchClick}
                className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                title="Buscar"
              >
                <CornerDownLeft size={20} />
              </button>
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Limpar busca"
              >
                <X size={20} />
              </button>
            </>
          )}

          {showEnterHint && (
            <div className="absolute -bottom-8 left-0 bg-gray-800 text-white text-xs px-2 py-1 rounded-md">
              Pressione ENTER para buscar
            </div>
          )}
        </div>

        {searchTerm && (
          <p className="text-sm text-gray-600 mt-2">
            {filteredVideos.length} vídeo(s) encontrado(s) para "{searchTerm}"
          </p>
        )}

        {/* Dica de uso */}
        {!searchTerm && (
          <p className="text-xs text-gray-500 mt-2">
            💡 Digite palavras-chave, título ou canal e pressione ENTER para
            buscar
          </p>
        )}
      </div>

      {/* Grid de vídeos */}
      {filteredVideos.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? "Nenhum vídeo encontrado" : "Nenhum vídeo disponível"}
          </h3>
          <p className="text-gray-500">
            {searchTerm
              ? "Tente usar outras palavras-chave ou termos de busca."
              : "Adicione alguns canais para começar."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVideos.map((video) => (
            <VideoCard
              key={video.video_id}
              video={video}
              isWatched={watchedVideos.has(video.video_id)}
              onToggleWatched={() =>
                toggleWatchedStatus(
                  video.video_id,
                  watchedVideos.has(video.video_id)
                )
              }
              onKeywordsUpdate={onKeywordsUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoGrid;
