// src/components/Sidebar.jsx
import { useState, useEffect } from "react";
import {
  X,
  Plus,
  Trash2,
  AlertTriangle,
  LogOut,
  User,
  CheckCircle,
  AlertCircle,
  Settings,
  Radar,
  Filter,
} from "lucide-react";
import {
  isValidYouTubeChannelUrl,
  extractChannelIdFromUrl,
  validateAndExtractYouTubeInfo,
  normalizeYouTubeUrl,
} from "../utils/validation";
import { useAuth } from "../contexts/AuthContext";
import DashboardConfig from "./DashboardConfig";
import ScanProgress from "./ScanProgress";

const Sidebar = ({
  isOpen,
  closeSidebar,
  channels,
  addChannel,
  removeChannel,
  loading,
  onChannelsFilter,
  refreshVideos,
  scanChannelsForNewVideos,
}) => {
  const [channelUrl, setChannelUrl] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [channelToDelete, setChannelToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [selectedChannels, setSelectedChannels] = useState(new Set());
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState(null);
  const { user, signOut } = useAuth();

  // Atualizar seleção quando os canais mudarem
  useEffect(() => {
    // Manter apenas os canais selecionados que ainda existem
    setSelectedChannels((prev) => {
      const existingChannelIds = new Set(channels.map((c) => c.channel_id));
      const newSelection = new Set();

      prev.forEach((channelId) => {
        if (existingChannelIds.has(channelId)) {
          newSelection.add(channelId);
        }
      });

      return newSelection;
    });
  }, [channels]);

  const handleAddChannel = async (e) => {
    e.preventDefault();

    if (!channelUrl.trim()) {
      setError("Por favor, insira uma URL válida");
      setSuccess("");
      return;
    }

    const validationResult = validateAndExtractYouTubeInfo(channelUrl);

    if (!validationResult.isValid) {
      setError(validationResult.error);
      setSuccess("");
      return;
    }

    setIsAdding(true);
    setError("");
    setSuccess("");

    try {
      const { channelId } = validationResult;
      const result = await addChannel({ channel_id: channelId });

      if (result.success) {
        setChannelUrl("");
        if (result.videosAdded > 0) {
          setSuccess(
            `✅ Canal adicionado com ${result.videosAdded} vídeo(s) novo(s)!`
          );
        } else if (result.totalVideosFound > 0) {
          setSuccess(
            "✅ Canal adicionado! Todos os vídeos já estavam na lista."
          );
        } else {
          setSuccess("✅ Canal adicionado! Nenhum vídeo novo encontrado.");
        }

        // Limpar mensagem de sucesso após 5 segundos
        setTimeout(() => setSuccess(""), 5000);
      } else {
        if (result.code === "CHANNEL_ALREADY_EXISTS") {
          setError("⚠️ " + result.error);
        } else {
          setError(result.error || "Erro ao adicionar canal");
        }
        setSuccess("");
      }
    } catch (err) {
      setError("Erro ao processar o canal");
      setSuccess("");
    } finally {
      setIsAdding(false);
    }
  };

  const confirmDeleteChannel = (channel) => {
    setChannelToDelete(channel);
    setError("");
    setSuccess("");
  };

  const cancelDelete = () => {
    setChannelToDelete(null);
  };

  const executeDelete = async () => {
    if (!channelToDelete) return;

    setIsDeleting(true);
    setError("");
    setSuccess("");

    try {
      const result = await removeChannel(channelToDelete.channel_id);
      if (result.success) {
        setSuccess("✅ Canal removido com sucesso!");
        setTimeout(() => setSuccess(""), 3000);

        // Remover da seleção se estava selecionado
        setSelectedChannels((prev) => {
          const newSelection = new Set(prev);
          newSelection.delete(channelToDelete.channel_id);
          return newSelection;
        });
      } else {
        setError("❌ " + (result.error || "Erro ao excluir canal"));
      }
    } catch (error) {
      console.error("❌ Erro inesperado:", error);
      setError("❌ Erro inesperado ao excluir canal");
    } finally {
      setIsDeleting(false);
      setChannelToDelete(null);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setSuccess("✅ Logout realizado com sucesso!");
      setTimeout(() => setSuccess(""), 2000);
    } catch (error) {
      console.error("❌ Erro ao fazer logout:", error.message);
      setError("❌ Erro ao fazer logout");
    }
  };

  const toggleChannelSelection = (channelId, isSelected) => {
    setSelectedChannels((prev) => {
      const newSelection = new Set(prev);
      if (isSelected) {
        newSelection.add(channelId);
      } else {
        newSelection.delete(channelId);
      }
      return newSelection;
    });
  };

  const toggleAllChannels = (selectAll) => {
    if (selectAll) {
      setSelectedChannels(
        new Set(channels.map((channel) => channel.channel_id))
      );
    } else {
      setSelectedChannels(new Set());
    }
  };

  const applyFilter = () => {
    if (typeof onChannelsFilter === "function") {
      onChannelsFilter(Array.from(selectedChannels));
    }
    closeSidebar();
  };

  const handleYTScan = async () => {
    if (!channels.length) {
      setError("Nenhum canal para escanear. Adicione canais primeiro.");
      return;
    }

    setIsScanning(true);
    setError("");
    setSuccess("");
    setScanResults(null);

    try {
      // Chamar a função de escaneamento do hook useChannels
      const results = await scanChannelsForNewVideos(refreshVideos);

      setScanResults(results);

      if (results.success) {
        if (results.totalNewVideos > 0) {
          setSuccess(
            `✅ Scan completo! ${results.totalNewVideos} novo(s) vídeo(s) encontrado(s).`
          );
        } else {
          setSuccess("✅ Scan completo! Nenhum novo vídeo encontrado.");
        }
      } else {
        setError(results.error || "Erro ao escanear canais.");
      }
    } catch (error) {
      console.error("Erro no YTScan:", error);
      setError("Erro ao escanear canais. Tente novamente.");
    } finally {
      setIsScanning(false);
    }
  };

  const getChannelStats = (channelId) => {
    // Esta função pode ser expandida para mostrar estatísticas reais
    return {
      totalVideos: 0,
      unwatched: 0,
    };
  };

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Modal de Confirmação de Exclusão */}
      {channelToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>

            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              Confirmar Exclusão
            </h3>

            <p className="text-gray-600 text-center mb-6">
              Tem certeza que deseja excluir o canal{" "}
              <span className="font-medium text-red-600">
                {channelToDelete.name}
              </span>
              ? Todos os vídeos associados também serão removidos.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={cancelDelete}
                disabled={isDeleting}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 disabled:opacity-50 transition-colors"
              >
                Cancelar
              </button>

              <button
                onClick={executeDelete}
                disabled={isDeleting}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Excluindo...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} className="mr-2" />
                    Excluir
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform lg:relative lg:translate-x-0 lg:shadow-none ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-semibold">Gerenciar Canais</h2>
            <div className="flex space-x-1">
              <button
                onClick={handleYTScan}
                disabled={isScanning || channels.length === 0}
                className="p-1 text-blue-400 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Escanear canais por novos vídeos"
              >
                <Radar size={18} />
              </button>
              <button
                onClick={() => setShowDashboard(true)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="Abrir Dashboard e Estatísticas"
              >
                <Settings size={18} />
              </button>
            </div>
          </div>
          <button
            onClick={closeSidebar}
            className="p-1 rounded-md hover:bg-gray-100 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Header do Usuário */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              {user?.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt={user.email}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <User size={20} className="text-red-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.user_metadata?.full_name || user?.email}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              title="Sair"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        <div className="p-4 border-b border-gray-200">
          <form onSubmit={handleAddChannel} className="space-y-3">
            <div>
              <label
                htmlFor="channel-url"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Adicionar Canal
              </label>
              <input
                id="channel-url"
                type="url"
                placeholder="https://www.youtube.com/@nomedocanal"
                value={channelUrl}
                onChange={(e) => {
                  setChannelUrl(e.target.value);
                  setError("");
                  setSuccess("");
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                disabled={isAdding}
              />
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-sm text-yellow-800 bg-yellow-50 p-3 rounded-md border border-yellow-200">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center space-x-2 text-sm text-green-800 bg-green-50 p-3 rounded-md border border-green-200">
                <CheckCircle size={16} />
                <span>{success}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isAdding}
              className="w-full flex items-center justify-center space-x-2 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {isAdding ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Plus size={16} />
              )}
              <span>{isAdding ? "Verificando..." : "Adicionar Canal"}</span>
            </button>
          </form>

          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <p className="text-xs text-blue-700">
              💡 <strong>Dica:</strong> O sistema verifica automaticamente se o
              canal já existe e evita duplicatas.
            </p>
          </div>

          {scanResults && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Resultados do Scan:
              </h4>
              <div className="space-y-2 text-xs">
                <p>
                  Canais escaneados:{" "}
                  <strong>{scanResults.scannedChannels}</strong>
                </p>
                <p>
                  Novos vídeos encontrados:{" "}
                  <strong className="text-green-600">
                    {scanResults.totalNewVideos}
                  </strong>
                </p>
                <p>
                  Canais com novos vídeos:{" "}
                  <strong>{scanResults.channelsWithNewVideos}</strong>
                </p>

                {scanResults.channelDetails &&
                  scanResults.channelDetails.length > 0 && (
                    <div className="mt-2">
                      <p className="font-medium">Detalhes por canal:</p>
                      {scanResults.channelDetails.map((detail, index) => (
                        <div key={index} className="flex justify-between mt-1">
                          <span className="truncate max-w-xs">
                            {detail.channelName}
                          </span>
                          <span
                            className={
                              detail.newVideos > 0
                                ? "text-green-600 font-medium"
                                : "text-gray-500"
                            }
                          >
                            {detail.newVideos} novo(s)
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">
              Meus Canais ({channels.length})
            </h3>

            {channels.length > 0 && (
              <div className="flex space-x-2">
                <button
                  onClick={() => toggleAllChannels(true)}
                  className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 border border-blue-200 rounded transition-colors"
                  title="Selecionar todos"
                >
                  Todos
                </button>
                <button
                  onClick={() => toggleAllChannels(false)}
                  className="text-xs text-gray-600 hover:text-gray-800 px-2 py-1 border border-gray-200 rounded transition-colors"
                  title="Limpar seleção"
                >
                  Limpar
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center space-x-3 animate-pulse"
                >
                  <div className="w-5 h-5 bg-gray-200 rounded"></div>
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : channels.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus size={24} className="text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm mb-2">
                Nenhum canal adicionado ainda.
              </p>
              <p className="text-gray-400 text-xs">
                Adicione seu primeiro canal acima.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {channels.map((channel) => {
                const stats = getChannelStats(channel.channel_id);
                const isSelected = selectedChannels.has(channel.channel_id);

                return (
                  <div
                    key={channel.channel_id}
                    className={`flex items-center justify-between group p-2 rounded-md border transition-colors ${
                      isSelected
                        ? "bg-blue-50 border-blue-200"
                        : "bg-white border-gray-100 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) =>
                          toggleChannelSelection(
                            channel.channel_id,
                            e.target.checked
                          )
                        }
                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                      />

                      <img
                        src={channel.thumbnail_url}
                        alt={channel.name}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/32/FF0000/FFFFFF?text=YT";
                        }}
                      />

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {channel.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {stats.unwatched} não assistidos • {stats.totalVideos}{" "}
                          vídeos
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => confirmDeleteChannel(channel)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors flex-shrink-0 ml-2"
                      title="Excluir canal"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer com informações */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-500 space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Canais: {channels.length}</span>
              <span
                className={
                  selectedChannels.size > 0 ? "text-blue-600 font-medium" : ""
                }
              >
                Selecionados: {selectedChannels.size}
              </span>
            </div>

            {selectedChannels.size > 0 && (
              <button
                onClick={applyFilter}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 px-3 rounded-md text-xs hover:bg-blue-700 transition-colors"
              >
                <Filter size={14} />
                <span>Filtrar {selectedChannels.size} canal(ais)</span>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Dashboard de Configurações */}
      {showDashboard && (
        <DashboardConfig
          isOpen={showDashboard}
          onClose={() => setShowDashboard(false)}
        />
      )}

      {/* Modal de Progresso do Escaneamento */}
      {(isScanning || scanResults) && (
        <ScanProgress
          isScanning={isScanning}
          scanResults={scanResults}
          channels={channels}
          onClose={() => {
            setIsScanning(false);
            setScanResults(null);
          }}
        />
      )}
    </>
  );
};

export default Sidebar;
