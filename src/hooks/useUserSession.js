// src/hooks/useUserSession.js
import { useState, useEffect } from "react";

export const useUserSession = () => {
  const [userSession, setUserSession] = useState(null);

  useEffect(() => {
    // Verificar se já existe uma sessão no localStorage
    const storedSession = localStorage.getItem("userSession");
    if (storedSession) {
      setUserSession(storedSession);
    } else {
      // Criar nova sessão se não existir
      const newSession = "user_" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("userSession", newSession);
      setUserSession(newSession);
    }
  }, []);

  return userSession;
};
