// src/components/Badge.jsx
import { Trophy, Star, Zap, Target, CheckCircle } from "lucide-react";

const badgeConfig = {
  first_channel: {
    icon: Star,
    color: "text-yellow-500",
    bgColor: "bg-yellow-100",
    title: "Primeiro Canal",
    description: "Adicionou o primeiro canal",
  },
  five_channels: {
    icon: Trophy,
    color: "text-purple-500",
    bgColor: "bg-purple-100",
    title: "Colecionador",
    description: "Adicionou 5 canais",
  },
  ten_videos_watched: {
    icon: CheckCircle,
    color: "text-green-500",
    bgColor: "bg-green-100",
    title: "Spectador",
    description: "Assistiu 10 vídeos",
  },
  speed_watcher: {
    icon: Zap,
    color: "text-blue-500",
    bgColor: "bg-blue-100",
    title: "Observador Rápido",
    description: "Marcou 5 vídeos como assistidos em um dia",
  },
  focused: {
    icon: Target,
    color: "text-red-500",
    bgColor: "bg-red-100",
    title: "Focado",
    description: "Assistiu todos os vídeos de um canal",
  },
};

const Badge = ({ type, achieved, onClick }) => {
  if (!badgeConfig[type]) return null;

  const { icon: Icon, color, bgColor, title, description } = badgeConfig[type];

  return (
    <div
      className={`relative inline-flex flex-col items-center p-2 rounded-lg transition-all duration-300 ${
        achieved ? `${bgColor} opacity-100` : "bg-gray-100 opacity-50"
      } ${onClick ? "cursor-pointer hover:scale-105" : ""}`}
      onClick={onClick}
      title={
        achieved ? description : `Conquista não desbloqueada: ${description}`
      }
    >
      <Icon size={20} className={achieved ? color : "text-gray-400"} />
      <span className="text-xs mt-1 font-medium">{title}</span>
    </div>
  );
};

export default Badge;
