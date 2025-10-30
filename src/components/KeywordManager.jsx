// src/components/KeywordManager.jsx
import { useState } from "react";
import { X, Plus, Tag, Search } from "lucide-react";
import { useKeywords } from "../hooks/useKeywords";

const KeywordManager = ({
  videoId,
  initialKeywords = [],
  onKeywordsChange,
}) => {
  const [newKeyword, setNewKeyword] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { loading, addKeyword, removeKeyword } = useKeywords();

  const handleAddKeyword = async (e) => {
    e.preventDefault();
    if (!newKeyword.trim() || loading) return;

    setIsAdding(true);
    setError("");
    setSuccess("");

    const result = await addKeyword(videoId, newKeyword.trim());

    if (result.success) {
      setNewKeyword("");
      setSuccess("Palavra-chave adicionada!");
      onKeywordsChange?.(result.keywords);
      setTimeout(() => setSuccess(""), 2000);
    } else {
      setError(result.error);
    }

    setIsAdding(false);
  };

  const handleRemoveKeyword = async (keyword) => {
    setError("");
    setSuccess("");

    const result = await removeKeyword(videoId, keyword);

    if (result.success) {
      setSuccess("Palavra-chave removida!");
      onKeywordsChange?.(result.keywords);
      setTimeout(() => setSuccess(""), 2000);
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="border-t border-gray-200 pt-4 mt-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-700 flex items-center">
          <Tag size={16} className="mr-2" />
          Palavras-chave
        </h4>
        <span className="text-xs text-gray-500">
          {initialKeywords.length} tags
        </span>
      </div>

      {/* Lista de keywords existentes */}
      {initialKeywords.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {initialKeywords.map((keyword, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
            >
              {keyword}
              <button
                onClick={() => handleRemoveKeyword(keyword)}
                className="ml-1 text-blue-600 hover:text-blue-800"
                title="Remover palavra-chave"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Formulário para adicionar nova keyword */}
      <form onSubmit={handleAddKeyword} className="space-y-2">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            placeholder="Adicionar palavra-chave..."
            className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !newKeyword.trim()}
            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <Plus size={14} />
          </button>
        </div>
      </form>

      {/* Mensagens de feedback */}
      {error && (
        <div className="text-xs text-red-600 bg-red-50 p-2 rounded-md mt-2">
          {error}
        </div>
      )}

      {success && (
        <div className="text-xs text-green-600 bg-green-50 p-2 rounded-md mt-2">
          {success}
        </div>
      )}

      <p className="text-xs text-gray-500 mt-2">
        💡 Use palavras-chave para encontrar vídeos facilmente na busca.
      </p>
    </div>
  );
};

export default KeywordManager;
