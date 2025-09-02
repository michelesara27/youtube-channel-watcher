// src/components/VideoGrid.jsx
import VideoCard from "./VideoCard";

const VideoGrid = ({
  videos,
  watchedVideos,
  showWatched,
  toggleWatchedStatus,
  loading,
}) => {
  // Filtrar vídeos baseado na preferência de visualização
  const filteredVideos = showWatched
    ? videos
    : videos.filter((video) => !watchedVideos.has(video.video_id));

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
          >
            <div className="h-48 bg-gray-200"></div>
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (filteredVideos.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {showWatched
              ? "Nenhum vídeo assistido"
              : "Todos os vídes assistidos!"}
          </h3>
          <p className="text-gray-500">
            {showWatched
              ? "Você ainda não marcou nenhum vídeo como assistido."
              : "Parabéns! Você assistiu todos os vídeos disponíveis."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
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
        />
      ))}
    </div>
  );
};

export default VideoGrid;
