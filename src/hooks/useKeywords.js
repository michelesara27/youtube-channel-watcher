// src/contexts/useKeywords.js
import { useState } from "react";
import { supabase } from "../lib/supabase";

export const useKeywords = () => {
  const [loading, setLoading] = useState(false);

  const addKeyword = async (videoId, keyword) => {
    if (!keyword.trim())
      return { success: false, error: "Palavra-chave não pode estar vazia" };

    setLoading(true);
    try {
      // Buscar keywords atuais
      const { data: currentVideo, error: fetchError } = await supabase
        .from("videos")
        .select("keywords")
        .eq("video_id", videoId)
        .single();

      if (fetchError) throw fetchError;

      const currentKeywords = currentVideo?.keywords || [];
      const keywordLower = keyword.trim().toLowerCase();

      // Verificar se keyword já existe
      if (currentKeywords.includes(keywordLower)) {
        return { success: false, error: "Palavra-chave já existe" };
      }

      // Adicionar nova keyword
      const newKeywords = [...currentKeywords, keywordLower];

      const { error: updateError } = await supabase
        .from("videos")
        .update({ keywords: newKeywords })
        .eq("video_id", videoId);

      if (updateError) throw updateError;

      return { success: true, keywords: newKeywords };
    } catch (error) {
      console.error("Error adding keyword:", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const removeKeyword = async (videoId, keyword) => {
    setLoading(true);
    try {
      const { data: currentVideo, error: fetchError } = await supabase
        .from("videos")
        .select("keywords")
        .eq("video_id", videoId)
        .single();

      if (fetchError) throw fetchError;

      const currentKeywords = currentVideo?.keywords || [];
      const newKeywords = currentKeywords.filter((k) => k !== keyword);

      const { error: updateError } = await supabase
        .from("videos")
        .update({ keywords: newKeywords })
        .eq("video_id", videoId);

      if (updateError) throw updateError;

      return { success: true, keywords: newKeywords };
    } catch (error) {
      console.error("Error removing keyword:", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const searchVideosByKeyword = async (keyword) => {
    if (!keyword.trim()) return [];

    try {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .contains("keywords", [keyword.toLowerCase()]);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error searching videos:", error);
      return [];
    }
  };

  return {
    loading,
    addKeyword,
    removeKeyword,
    searchVideosByKeyword,
  };
};
