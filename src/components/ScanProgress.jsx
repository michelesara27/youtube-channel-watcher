// src/components/ScanProgress.jsx
import { useEffect, useState } from "react";
import { Radar, CheckCircle, XCircle, Loader } from "lucide-react";

const ScanProgress = ({ isScanning, scanResults, channels, onClose }) => {
  const [progress, setProgress] = useState(0);
  const [currentChannel, setCurrentChannel] = useState("");

  useEffect(() => {
    let interval;
    if (isScanning) {
      // Simular progresso (será substituído pelo progresso real)
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 5;
        });
      }, 500);
    } else {
      setProgress(0);
    }

    return () => clearInterval(interval);
  }, [isScanning]);

  if (!isScanning && !scanResults) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
        {isScanning ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Radar className="h-8 w-8 text-blue-600 animate-spin" />
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Escaneando Canais
            </h3>

            <p className="text-gray-600 mb-4">
              Verificando novos vídeos em seus canais...
            </p>

            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            <p className="text-sm text-gray-500">
              {currentChannel || "Iniciando verificação..."}
            </p>
          </div>
        ) : (
          <div className="text-center">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                scanResults.success
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {scanResults.success ? (
                <CheckCircle size={32} />
              ) : (
                <XCircle size={32} />
              )}
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {scanResults.success
                ? "Escaneamento Concluído"
                : "Erro no Escaneamento"}
            </h3>

            <p className="text-gray-600 mb-4">
              {scanResults.success
                ? `Foram encontrados ${scanResults.totalNewVideos} novo(s) vídeo(s) em ${scanResults.channelsWithNewVideos} canal(is).`
                : scanResults.error}
            </p>

            {scanResults.channelDetails && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md max-h-40 overflow-y-auto">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Detalhes por canal:
                </h4>
                {scanResults.channelDetails.map((detail, index) => (
                  <div
                    key={index}
                    className="flex justify-between text-xs py-1 border-b border-gray-100 last:border-b-0"
                  >
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

            <button
              onClick={onClose}
              className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanProgress;
