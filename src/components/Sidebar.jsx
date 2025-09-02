// src/components/Sidebar.jsx
import { useState } from "react"; // Adicione esta linha
import { X, Plus } from "lucide-react";
import {
  isValidYouTubeChannelUrl,
  extractChannelIdFromUrl,
  validateAndExtractYouTubeInfo,
  normalizeYouTubeUrl,
} from "../utils/validation";

const Sidebar = ({
  isOpen,
  closeSidebar,
  channels,
  addChannel,
  removeChannel,
  loading,
  isAuthenticated,
  onLogout,
}) => {
  const [channelUrl, setChannelUrl] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");

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

      // Agora só passamos o channelId, as informações serão buscadas da API
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

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
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
          <div className="flex items-center space-x-2">
            {isAuthenticated && (
              <button
                onClick={onLogout}
                className="p-1 text-red-600 hover:text-red-800 text-sm"
                title="Sair do sistema"
              >
                Sair
              </button>
            )}
            <button
              onClick={closeSidebar}
              className="p-1 rounded-md hover:bg-gray-100 lg:hidden"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {!isAuthenticated ? (
          <div className="p-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <h3 className="text-yellow-800 font-medium mb-2">
                Acesso Restrito
              </h3>
              <p className="text-yellow-700 text-sm">
                Use <code>?password=senha</code> na URL para acessar o sistema.
              </p>
            </div>
          </div>
        ) : (
          <>
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
                Canais ({channels.length})
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
                <p className="text-gray-500 text-sm">
                  Nenhum canal adicionado ainda.
                </p>
              ) : (
                <div className="space-y-3">
                  {channels.map((channel) => (
                    <div
                      key={channel.channel_id}
                      className="flex items-center justify-between group"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={channel.thumbnail_url}
                          alt={channel.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {channel.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            0 vídeos não assistidos
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => removeChannel(channel.channel_id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-opacity"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
