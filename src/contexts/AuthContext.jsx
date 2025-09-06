import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext({});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar token no URL (após redirecionamento do Google)
    const handleGoogleRedirect = () => {
      const hash = window.location.hash;
      if (hash && hash.includes("access_token")) {
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get("access_token");

        if (accessToken) {
          // Buscar informações do usuário com o token
          fetchUserInfo(accessToken);
        }
      }
    };

    const fetchUserInfo = async (accessToken) => {
      try {
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
            id: userData.sub,
            email: userData.email,
            name: userData.name,
            picture: userData.picture,
            token: accessToken,
          };

          setUser(userInfo);
          localStorage.setItem("googleUser", JSON.stringify(userInfo));
          localStorage.setItem("googleToken", accessToken);

          // Limpar a URL
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        }
      } catch (error) {
        console.error("Erro ao buscar informações do usuário:", error);
      }
    };

    // Verificar se já está logado
    const savedUser = localStorage.getItem("googleUser");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      // Verificar se veio redirecionado do Google
      handleGoogleRedirect();
    }

    setLoading(false);
  }, []);

  const signInWithGoogle = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = encodeURIComponent(window.location.origin);
    const scope = encodeURIComponent("email profile");

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}&prompt=consent`;

    window.location.href = authUrl;
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem("googleUser");
    localStorage.removeItem("googleToken");
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signOut,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
