// src/components/ScanButton.jsx
import { useState } from "react";
import { useChannels } from "../hooks/useChannels";

export default function ScanButton() {
  const { scanChannelsForNewVideos, scanning } = useChannels();
  const [result, setResult] = useState(null);

  const handleScan = async () => {
    setResult(null); // limpar resultado anterior
    const res = await scanChannelsForNewVideos();
    setResult(res);
  };

  return (
    <div className="text-center my-6">
      <button
        onClick={handleScan}
        disabled={scanning}
        className={`px-5 py-2 rounded-md font-semibold shadow-md transition ${
          scanning
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
      >
        {scanning ? "🔄 Escaneando canais..." : "📡 Escanear canais"}
      </button>

      {scanning && (
        <p className="mt-2 animate-pulse text-gray-500">
          Buscando novos vídeos em todos os canais...
        </p>
      )}

      {result && !scanning && (
        <div className="mt-4 text-left bg-gray-100 p-4 rounded-lg shadow">
          <p className="font-medium">
            ✅ {result.totalNewVideos} novos vídeos encontrados
          </p>
          <ul className="list-disc ml-6 mt-2">
            {result.channelDetails.map((c) => (
              <li key={c.channelId}>
                <span className="font-semibold">{c.channelName}</span>:{" "}
                {c.newVideos} novos vídeos
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
