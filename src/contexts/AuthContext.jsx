// src/contexts/AuthContext.jsx - Atualizado
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext({});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null); // Novo estado para user ID
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se já está logado
    const savedUser = localStorage.getItem("googleUser");
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setUserId(userData.id); // Usar o ID do Google como user_id
      } catch (error) {
        console.error("Error parsing saved user:", error);
      }
    }
    setLoading(false);

    // Verificar se veio redirecionado do Google
    const hash = window.location.hash;
    if (hash && hash.includes("access_token")) {
      handleGoogleRedirect();
    }
  }, []);

  const handleGoogleRedirect = async () => {
    try {
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get("access_token");

      if (accessToken) {
        const response = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (response.ok) {
          const userData = await response.json();
          const userInfo = {
            id: userData.sub, // ID único do Google
            email: userData.email,
            name: userData.name,
            picture: userData.picture,
            token: accessToken,
          };

          setUser(userInfo);
          setUserId(userData.sub); // Definir o user_id
          localStorage.setItem("googleUser", JSON.stringify(userInfo));
          localStorage.setItem("googleToken", accessToken);

          // Limpar a URL
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        }
      }
    } catch (error) {
      console.error("Erro ao buscar informações do usuário:", error);
    }
  };

  const signInWithGoogle = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = encodeURIComponent(
      import.meta.env.VITE_GOOGLE_REDIRECT_URI || window.location.origin
    );
    const scope = encodeURIComponent("email profile");

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}&prompt=consent`;

    window.location.href = authUrl;
  };

  const signOut = () => {
    setUser(null);
    setUserId(null);
    localStorage.removeItem("googleUser");
    localStorage.removeItem("googleToken");
  };

  const value = {
    user,
    userId, // Disponibilizar o user_id
    loading,
    signInWithGoogle,
    signOut,
    isAuthenticated: !!user,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
