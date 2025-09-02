// src/components/Header.jsx
import { Menu, Eye, EyeOff } from "lucide-react";

const Header = ({
  toggleSidebar,
  showWatched,
  setShowWatched,
  unreadCount,
}) => {
  return (
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
        <div className="hidden md:flex items-center space-x-2 bg-red-100 text-red-800 px-3 py-1 rounded-full">
          <span className="text-sm font-medium">
            {unreadCount} não assistidos
          </span>
        </div>

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
  );
};

export default Header;
