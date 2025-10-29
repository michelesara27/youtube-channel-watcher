// src/components/Header.jsx
import { Menu, Eye, EyeOff, Trophy, X, Filter } from "lucide-react";
import { useState } from "react";
import Badge from "./Badge";

const Header = ({
  toggleSidebar,
  showWatched,
  setShowWatched,
  unreadCount,
  searchTerm,
  onClearSearch,
  achievements,
  activeFilter,
  onClearFilter,
}) => {
  const [showAchievements, setShowAchievements] = useState(false);

  const filteredChannelsCount = activeFilter ? activeFilter.length : 0;

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-gray-100 lg:hidden"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-bold text-gray-900">
            YouTube Channel Watcher
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Contador de não assistidos */}
          <div className="hidden md:flex items-center space-x-2 bg-red-100 text-red-800 px-3 py-1 rounded-full">
            <span className="text-sm font-medium">
              {unreadCount} não assistidos
            </span>
          </div>

          {/* Indicador de filtro ativo */}
          {filteredChannelsCount > 0 && (
            <div className="hidden md:flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
              <Filter size={14} />
              <span className="text-sm font-medium">
                {filteredChannelsCount} canal(ais)
              </span>
              <button
                onClick={onClearFilter}
                className="text-blue-600 hover:text-blue-800 transition-colors"
                title="Remover filtro"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Botão de conquistas */}
          <button
            onClick={() => setShowAchievements(true)}
            className="flex items-center space-x-2 bg-yellow-100 text-yellow-800 px-3 py-2 rounded-md hover:bg-yellow-200 transition-colors relative"
            title="Ver conquistas"
          >
            <Trophy size={20} />
            <span className="hidden sm:inline">Conquistas</span>
            {Object.values(achievements || {}).filter((a) => a).length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {Object.values(achievements || {}).filter((a) => a).length}
              </span>
            )}
          </button>

          {/* Botão mostrar/ocultar assistidos */}
          <button
            onClick={() => setShowWatched(!showWatched)}
            className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-md transition-colors"
          >
            {showWatched ? <EyeOff size={20} /> : <Eye size={20} />}
            <span className="hidden sm:inline">
              {showWatched ? "Ocultar assistidos" : "Mostrar assistidos"}
            </span>
          </button>
        </div>
      </header>

      {/* Modal de Conquistas */}
      {showAchievements && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Suas Conquistas
                </h2>
                <button
                  onClick={() => setShowAchievements(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                <Badge
                  type="first_channel"
                  achieved={achievements?.first_channel}
                />
                <Badge
                  type="five_channels"
                  achieved={achievements?.five_channels}
                />
                <Badge
                  type="ten_videos_watched"
                  achieved={achievements?.ten_videos_watched}
                />
                <Badge
                  type="speed_watcher"
                  achieved={achievements?.speed_watcher}
                />
                <Badge type="focused" achieved={achievements?.focused} />
                <Badge
                  type="marathon_watcher"
                  achieved={achievements?.marathon_watcher}
                />
                <Badge type="explorer" achieved={achievements?.explorer} />
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Estatísticas
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">
                      Conquistas desbloqueadas
                    </p>
                    <p className="text-2xl font-bold">
                      {
                        Object.values(achievements || {}).filter((a) => a)
                          .length
                      }
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Total de conquistas</p>
                    <p className="text-2xl font-bold">
                      {Object.keys(achievements || {}).length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-800 mb-2">
                  Como ganhar conquistas:
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>
                    • <strong>Primeiro Canal</strong>: Adicione seu primeiro
                    canal
                  </li>
                  <li>
                    • <strong>Colecionador</strong>: Adicione 5 canais
                  </li>
                  <li>
                    • <strong>Spectador</strong>: Assista 10 vídeos
                  </li>
                  <li>
                    • <strong>Focado</strong>: Assista todos os vídeos de um
                    canal
                  </li>
                  <li>
                    • <strong>Maratonista</strong>: Assista 50 vídeos
                  </li>
                  <li>
                    • <strong>Explorador</strong>: Adicione 10 canais
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
