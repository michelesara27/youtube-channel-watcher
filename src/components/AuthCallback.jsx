// src/components/AuthCallback.jsx
import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

const AuthCallback = () => {
  const { setUser } = useAuth();

  useEffect(() => {
    // Logs para debug
    console.log("Current URL:", window.location.href);
    console.log("Hash:", window.location.hash);
    console.log(
      "Redirect URI from env:",
      import.meta.env.VITE_GOOGLE_REDIRECT_URI
    );
    console.log(
      "Google Client ID from env:",
      import.meta.env.VITE_GOOGLE_CLIENT_ID ? "Present" : "Missing"
    );

    const handleAuthCallback = async () => {
      try {
        // Verificar se estamos no fluxo de callback do Google
        const hash = window.location.hash;
        console.log("Processing hash:", hash);

        if (hash && hash.includes("access_token")) {
          const params = new URLSearchParams(hash.substring(1));
          const accessToken = params.get("access_token");
          console.log("Access token found:", accessToken ? "Yes" : "No");

          if (accessToken) {
            // Buscar informações do usuário com o token
            console.log("Fetching user info from Google API...");
            const response = await fetch(
              "https://www.googleapis.com/oauth2/v3/userinfo",
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            );

            console.log("Google API response status:", response.status);

            if (response.ok) {
              const userData = await response.json();
              console.log("User data received:", userData);

              const userInfo = {
                id: userData.sub,
                email: userData.email,
                name: userData.name,
                picture: userData.picture,
                token: accessToken,
              };

              // Salvar no localStorage e atualizar estado
              localStorage.setItem("googleUser", JSON.stringify(userInfo));
              localStorage.setItem("googleToken", accessToken);
              setUser(userInfo);

              // Limpar a URL e redirecionar para a página principal
              window.history.replaceState(
                {},
                document.title,
                window.location.pathname
              );
              console.log("Login successful, redirecting to /");
              window.location.href = "/";
              return;
            } else {
              console.error("Google API error:", await response.text());
            }
          }
        } else {
          console.log("No access token found in URL hash");
        }

        // Se não veio do Google OAuth, verificar se já está logado
        const savedUser = localStorage.getItem("googleUser");
        console.log(
          "Saved user in localStorage:",
          savedUser ? "Exists" : "Not found"
        );

        if (savedUser) {
          console.log("User already logged in, redirecting to /");
          window.location.href = "/";
        } else {
          // Se não há usuário salvo, redirecionar para login
          console.log("No user found, redirecting to /login");
          window.location.href = "/login";
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        window.location.href = "/login";
      }
    };

    handleAuthCallback();
  }, [setUser]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Processando login...</p>
        <p className="text-gray-400 text-sm mt-2">
          Verifique o console para detalhes
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;
