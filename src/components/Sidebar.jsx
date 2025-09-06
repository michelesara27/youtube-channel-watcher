import { useState } from "react";
import { X, Plus, Trash2, AlertTriangle, LogOut, User } from "lucide-react";
import {
  isValidYouTubeChannelUrl,
  extractChannelIdFromUrl,
  validateAndExtractYouTubeInfo,
  normalizeYouTubeUrl,
} from "../utils/validation";
import { useAuth } from "../contexts/AuthContext";

const Sidebar = ({
  isOpen,
  closeSidebar,
  channels,
  addChannel,
  removeChannel,
  loading,
}) => {
  const [channelUrl, setChannelUrl] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");
  const [channelToDelete, setChannelToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user, signOut } = useAuth();

  const handleAddChannel = async (e) => {
    e.preventDefault();

    if (!channelUrl.trim()) {
      setError("Por favor, insira uma URL válida");
      return;
    }

    const validationResult = validateAndExtractYouTubeInfo(channelUrl);

    if (!validationResult.isValid) {
      setError(validationResult.error);
      return;
    }

    setIsAdding(true);
    setError("");

    try {
      const { channelId } = validationResult;
      const result = await addChannel({ channel_id: channelId });

      if (result.success) {
        setChannelUrl("");
      } else {
        setError(result.error || "Erro ao adicionar canal");
      }
    } catch (err) {
      setError("Erro ao processar o canal");
    } finally {
      setIsAdding(false);
    }
  };

  const confirmDeleteChannel = (channel) => {
    setChannelToDelete(channel);
  };

  const cancelDelete = () => {
    setChannelToDelete(null);
  };

  const executeDelete = async () => {
    if (!channelToDelete) return;

    setIsDeleting(true);
    try {
      const result = await removeChannel(channelToDelete.channel_id);
      if (result.success) {
        console.log("✅ Canal excluído com sucesso");
      } else {
        console.error("❌ Erro ao excluir canal:", result.error);
        // Poderia mostrar um toast/alert aqui
        setError(result.error || "Erro ao excluir canal");
      }
    } catch (error) {
      console.error("❌ Erro inesperado:", error);
      setError("Erro inesperado ao excluir canal");
    } finally {
      setIsDeleting(false);
      setChannelToDelete(null);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      console.log("✅ Logout realizado com sucesso");
    } catch (error) {
      console.error("❌ Erro ao fazer logout:", error.message);
      setError("Erro ao fazer logout");
    }
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
        className={`
        fixed top-0 left-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform
        lg:relative lg:translate-x-0 lg:shadow-none
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Gerenciar Canais</h2>
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
                onChange={(e) => setChannelUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded-md">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isAdding}
              className="w-full flex items-center justify-center space-x-2 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              <Plus size={16} />
              <span>{isAdding ? "Adicionando..." : "Adicionar Canal"}</span>
            </button>
          </form>
        </div>

        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Meus Canais ({channels.length})
          </h3>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center space-x-3 animate-pulse"
                >
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
            <div className="space-y-3">
              {channels.map((channel) => (
                <div
                  key={channel.channel_id}
                  className="flex items-center justify-between group p-2 rounded-md hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <img
                      src={channel.thumbnail_url}
                      alt={channel.name}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/40/FF0000/FFFFFF?text=YT";
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {channel.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {channel.channel_id}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => confirmDeleteChannel(channel)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors ml-2 flex-shrink-0"
                    title="Excluir canal"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer com informações da conta */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-500">
            <p className="font-medium">Conta conectada com Google</p>
            <p>ID: {user?.id?.substring(0, 8)}...</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
