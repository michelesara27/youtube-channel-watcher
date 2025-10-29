// src/components/Celebration.jsx
import { X, Trophy } from "lucide-react";
import Badge from "./Badge";

const Celebration = ({ achievement, onClose }) => {
  if (!achievement) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl transform scale-100 animate-pop-in">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy size={32} className="text-white" />
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Conquista Desbloqueada!
          </h3>

          <div className="my-4">
            <Badge type={achievement} achieved={true} />
          </div>

          <button
            onClick={onClose}
            className="mt-6 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Continuar
          </button>
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>
      </div>
    </div>
  );
};

export default Celebration;
