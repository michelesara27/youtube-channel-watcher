// src/components/DashboardConfig.jsx
import { useState, useEffect } from "react";
import {
  BarChart3,
  History,
  Users,
  Eye,
  Clock,
  TrendingUp,
  Calendar,
  X,
  Download,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

const DashboardConfig = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("stats");
  const [channelHistory, setChannelHistory] = useState([]);
  const [videoHistory, setVideoHistory] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const { userId } = useAuth();

  useEffect(() => {
    if (isOpen && userId) {
      loadDashboardData();
    }
  }, [isOpen, userId]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Carregar histórico de canais
      const { data: channelsData, error: channelsError } = await supabase
        .from("channels")
        .select("channel_id, name, thumbnail_url, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (channelsError) throw channelsError;

      // Carregar histórico de vídeos
      const { data: videosData, error: videosError } = await supabase
        .from("videos")
        .select(
          "video_id, title, channel_id, published_at, created_at, channels(name)"
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (videosError) throw videosError;

      // Carregar estatísticas
      const { data: watchedData, error: watchedError } = await supabase
        .from("watched_videos")
        .select("video_id, watched_at")
        .eq("user_id", userId);

      if (watchedError) throw watchedError;

      // Calcular estatísticas
      const totalVideos = videosData?.length || 0;
      const totalWatched = watchedData?.length || 0;
      const watchPercentage =
        totalVideos > 0 ? Math.round((totalWatched / totalVideos) * 100) : 0;

      // Encontrar canal mais assistido
      const channelWatchCount = {};
      watchedData?.forEach((watch) => {
        const video = videosData?.find((v) => v.video_id === watch.video_id);
        if (video && video.channel_id) {
          channelWatchCount[video.channel_id] =
            (channelWatchCount[video.channel_id] || 0) + 1;
        }
      });

      const mostWatchedChannel = Object.entries(channelWatchCount).sort(
        ([, a], [, b]) => b - a
      )[0];

      setChannelHistory(channelsData || []);
      setVideoHistory(videosData || []);

      setStats({
        totalChannels: channelsData?.length || 0,
        totalVideos,
        totalWatched,
        watchPercentage,
        mostWatchedChannel: mostWatchedChannel
          ? {
              channel_id: mostWatchedChannel[0],
              count: mostWatchedChannel[1],
            }
          : null,
        averageWatchTime: calculateAverageWatchTime(watchedData || []),
      });
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAverageWatchTime = (watchedData) => {
    if (!watchedData.length) return "0 min";

    const now = new Date();
    const totalDays = watchedData.reduce((acc, watch) => {
      const watchDate = new Date(watch.watched_at);
      const daysDiff = Math.floor((now - watchDate) / (1000 * 60 * 60 * 24));
      return acc + daysDiff;
    }, 0);

    const averageDays = Math.round(totalDays / watchedData.length);
    return averageDays === 0 ? "Hoje" : `Há ${averageDays} dias`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const exportData = async () => {
    try {
      const exportData = {
        exportedAt: new Date().toISOString(),
        channels: channelHistory,
        videos: videoHistory,
        stats: stats,
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(dataBlob);
      link.download = `youtube-watcher-export-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Erro ao exportar dados:", error);
      alert("Erro ao exportar dados. Tente novamente.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <BarChart3 className="h-6 w-6 text-red-600" />
            <h2 className="text-xl font-bold text-gray-900">
              Dashboard e Configurações
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: "stats", label: "Estatísticas", icon: TrendingUp },
              { id: "channels", label: "Histórico de Canais", icon: Users },
              { id: "videos", label: "Histórico de Vídeos", icon: History },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? "border-red-600 text-red-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
          ) : (
            <>
              {/* Estatísticas */}
              {activeTab === "stats" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Users className="h-6 w-6 text-blue-600" />
                        <div>
                          <p className="text-sm text-blue-600">Canais</p>
                          <p className="text-2xl font-bold">
                            {stats.totalChannels}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Eye className="h-6 w-6 text-green-600" />
                        <div>
                          <p className="text-sm text-green-600">Vídeos</p>
                          <p className="text-2xl font-bold">
                            {stats.totalVideos}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Clock className="h-6 w-6 text-purple-600" />
                        <div>
                          <p className="text-sm text-purple-600">Assistidos</p>
                          <p className="text-2xl font-bold">
                            {stats.totalWatched}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <TrendingUp className="h-6 w-6 text-orange-600" />
                        <div>
                          <p className="text-sm text-orange-600">Conclusão</p>
                          <p className="text-2xl font-bold">
                            {stats.watchPercentage}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-3">
                        Canal Mais Assistido
                      </h3>
                      {stats.mostWatchedChannel ? (
                        <div className="flex items-center space-x-3">
                          <Eye className="h-5 w-5 text-red-600" />
                          <span className="text-sm">
                            {
                              channelHistory.find(
                                (c) =>
                                  c.channel_id ===
                                  stats.mostWatchedChannel.channel_id
                              )?.name
                            }
                          </span>
                          <span className="text-xs text-gray-500 ml-auto">
                            {stats.mostWatchedChannel.count} vídeos
                          </span>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">
                          Nenhum dado disponível
                        </p>
                      )}
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-3">
                        Tempo Médio de Visualização
                      </h3>
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-red-600" />
                        <span className="text-sm">
                          {stats.averageWatchTime}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-3">
                      Exportar Dados
                    </h3>
                    <button
                      onClick={exportData}
                      className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      <span>Exportar para JSON</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Histórico de Canais */}
              {activeTab === "channels" && (
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">
                    Seus Canais Adicionados
                  </h3>
                  {channelHistory.length > 0 ? (
                    <div className="overflow-hidden border border-gray-200 rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Canal
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Adicionado em
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              ID
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {channelHistory.map((channel) => (
                            <tr
                              key={channel.channel_id}
                              className="hover:bg-gray-50"
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center space-x-3">
                                  <img
                                    src={channel.thumbnail_url}
                                    alt={channel.name}
                                    className="h-8 w-8 rounded-full"
                                  />
                                  <span className="text-sm font-medium">
                                    {channel.name}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500">
                                {formatDate(channel.created_at)}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500 font-mono">
                                {channel.channel_id}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500">
                      Nenhum canal adicionado ainda.
                    </p>
                  )}
                </div>
              )}

              {/* Histórico de Vídeos */}
              {activeTab === "videos" && (
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Vídeos Recentes</h3>
                  {videoHistory.length > 0 ? (
                    <div className="overflow-hidden border border-gray-200 rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Vídeo
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Canal
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Adicionado em
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {videoHistory.map((video) => (
                            <tr
                              key={video.video_id}
                              className="hover:bg-gray-50"
                            >
                              <td className="px-4 py-3">
                                <div className="max-w-xs">
                                  <p
                                    className="text-sm font-medium truncate"
                                    title={video.title}
                                  >
                                    {video.title}
                                  </p>
                                  <p className="text-xs text-gray-500 font-mono">
                                    {video.video_id}
                                  </p>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500">
                                {video.channels?.name || "N/A"}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500">
                                {formatDate(video.created_at)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500">
                      Nenhum vídeo adicionado ainda.
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardConfig;
