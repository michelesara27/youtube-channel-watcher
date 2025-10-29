// src/components/VideoCard.jsx
import { Check, Play, Clock, Tag } from "lucide-react";
import { useState } from "react";
import KeywordManager from "./KeywordManager";

const VideoCard = ({ video, isWatched, onToggleWatched, onKeywordsUpdate }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [showKeywords, setShowKeywords] = useState(false);

  const handleToggleWatched = (e) => {
    e.stopPropagation();
    if (!isWatched) {
      setIsExiting(true);
      setTimeout(() => {
        onToggleWatched();
        setIsExiting(false);
      }, 300);
    } else {
      onToggleWatched();
    }
  };

  const handleOpenVideo = () => {
    const youtubeUrl = `https://www.youtube.com/watch?v=${video.video_id}`;
    window.open(youtubeUrl, "_blank");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hoje";
    if (diffDays === 1) return "Ontem";
    if (diffDays < 7) return `Há ${diffDays} dias`;
    if (diffDays < 30) return `Há ${Math.floor(diffDays / 7)} semanas`;
    return `Há ${Math.floor(diffDays / 30)} meses`;
  };

  const handleKeywordsUpdate = (newKeywords) => {
    onKeywordsUpdate?.(video.video_id, newKeywords);
  };

  return (
    <div
      className={`
        bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg
        ${isExiting ? "opacity-0 scale-95" : "opacity-100 scale-100"}
        ${isWatched ? "opacity-70" : ""}
      `}
    >
      <div className="relative group">
        {/* Thumbnail do vídeo */}
        <div className="h-48 bg-gray-200 relative overflow-hidden">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
          )}
          <img
            src={video.thumbnail_url}
            alt={video.title}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
          />

          {/* Overlay com botão de play */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
            <button
              onClick={handleOpenVideo}
              className="opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all duration-300 bg-red-600 bg-opacity-90 p-4 rounded-full"
            >
              <Play size={24} className="text-white fill-white" />
            </button>
          </div>

          {/* Badge de assistido */}
          <button
            onClick={handleToggleWatched}
            className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-300 ${
              isWatched
                ? "bg-green-500 text-white"
                : "bg-white bg-opacity-90 text-gray-400 hover:bg-green-500 hover:text-white"
            }`}
          >
            <Check size={16} />
          </button>
        </div>

        {/* Informações do vídeo */}
        <div className="p-4">
          <h3
            className="font-medium text-gray-900 mb-2 line-clamp-2"
            title={video.title}
          >
            {video.title}
          </h3>

          <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
            <span>{video.channel_name}</span>
            <div className="flex items-center space-x-1">
              <Clock size={14} />
              <span>{formatDate(video.published_at)}</span>
            </div>
          </div>

          {/* Botão para gerenciar keywords */}
          <button
            onClick={() => setShowKeywords(!showKeywords)}
            className="w-full flex items-center justify-center space-x-1 text-xs text-blue-600 hover:text-blue-800 p-2 bg-blue-50 rounded-md transition-colors"
          >
            <Tag size={12} />
            <span>
              {showKeywords
                ? "Ocultar tags"
                : `Gerenciar tags (${video.keywords?.length || 0})`}
            </span>
          </button>

          {/* Gerenciador de Keywords */}
          {showKeywords && (
            <KeywordManager
              videoId={video.video_id}
              initialKeywords={video.keywords || []}
              onKeywordsChange={handleKeywordsUpdate}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
