// src/contexts/useGoogleAuth.js
import { useState, useEffect } from "react";

export const useGoogleAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se já está logado
    const savedUser = localStorage.getItem("googleUser");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);

    // Carregar script do Google
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const signIn = () => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
      });

      window.google.accounts.id.prompt();
      window.google.accounts.id.renderButton(
        document.getElementById("googleSignInButton"),
        { theme: "outline", size: "large" }
      );
    }
  };

  const handleCredentialResponse = (response) => {
    if (response.credential) {
      // Decodificar o JWT para obter informações do usuário
      const payload = JSON.parse(atob(response.credential.split(".")[1]));

      const userData = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        token: response.credential,
      };

      setUser(userData);
      localStorage.setItem("googleUser", JSON.stringify(userData));
      localStorage.setItem("googleToken", response.credential);
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem("googleUser");
    localStorage.removeItem("googleToken");

    if (window.google) {
      window.google.accounts.id.disableAutoSelect();
    }
  };

  return {
    user,
    loading,
    signIn,
    signOut,
    isAuthenticated: !!user,
  };
};
