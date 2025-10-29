"use client";

import { useState, useEffect } from "react";
import { 
  Play, 
  Trophy, 
  Star, 
  Users, 
  CheckCircle, 
  Zap, 
  Target, 
  ArrowRight,
  Shield,
  Clock,
  Video,
  Filter,
  Search,
  BarChart3,
  Crown,
  Sparkles
} from "lucide-react";

const LandingPage = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [userCount, setUserCount] = useState(1247);

  useEffect(() => {
    // Animação de contagem de usuários
    const timer = setTimeout(() => {
      setUserCount(prev => prev + Math.floor(Math.random() * 10));
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const features = [
    {
      icon: Video,
      title: "Gestão de Canais",
      description: "Adicione e organize seus canais favoritos do YouTube",
      color: "from-red-500 to-orange-500"
    },
    {
      icon: Search,
      title: "Busca Inteligente",
      description: "Encontre vídeos por palavras-chave, título ou canal",
      color: "from-blue-500 to-purple-500"
    },
    {
      icon: Filter,
      title: "Filtros Avançados",
      description: "Filtre por canais específicos e status de visualização",
      color: "from-green-500 to-teal-500"
    },
    {
      icon: Trophy,
      title: "Sistema de Conquistas",
      description: "Desbloqueie badges e conquistas ao usar o sistema",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: BarChart3,
      title: "Dashboard Completo",
      description: "Acompanhe suas estatísticas e progresso",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Shield,
      title: "Dados Seguros",
      description: "Seus dados protegidos com criptografia",
      color: "from-gray-500 to-blue-500"
    }
  ];

  const achievements = [
    { type: "first_channel", title: "Primeiro Canal", description: "Adicione seu primeiro canal", progress: 100 },
    { type: "five_channels", title: "Colecionador", description: "Adicione 5 canais", progress: 60 },
    { type: "ten_videos_watched", title: "Spectador", description: "Assista 10 vídeos", progress: 30 },
    { type: "focused", title: "Focado", description: "Complete um canal inteiro", progress: 20 }
  ];

  const handleGetStarted = () => {
    // Redirecionar para a página de login
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-blue-600/10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
          {/* Badge de destaque */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-red-100 text-red-800 text-sm font-medium mb-8 animate-pulse">
            <Sparkles className="w-4 h-4 mr-2" />
            Plataforma Gamificada de Gestão de Conteúdo
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Transforme sua experiência no
            <span className="bg-gradient-to-r from-red-600 to-blue-600 bg-clip-text text-transparent">
              {" "}YouTube
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Gerencie seus canais favoritos, descubra novos conteúdos e conquiste achievements 
            enquanto organiza sua jornada de aprendizado.
          </p>

          {/* Contadores gamificados */}
          <div className="flex justify-center items-center space-x-8 mb-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{userCount}+</div>
              <div className="text-sm text-gray-600">Usuários Ativos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">15K+</div>
              <div className="text-sm text-gray-600">Vídeos Gerenciados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">98%</div>
              <div className="text-sm text-gray-600">Satisfação</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-red-600 to-red-700 rounded-xl hover:from-red-700 hover:to-red-800 transition-all transform hover:scale-105 shadow-lg"
            >
              Começar Agora
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
            
            <button className="inline-flex items-center px-8 py-4 text-lg font-semibold text-gray-700 bg-white rounded-xl hover:bg-gray-50 transition-all border-2 border-gray-200">
              <Play className="mr-2 w-5 h-5" />
              Ver Demonstração
            </button>
          </div>
        </div>
      </div>

      {/* Seção de Vídeo Demonstrativo */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Veja como funciona
          </h2>
          <p className="text-lg text-gray-600">
            Assista à demonstração e descubra como transformar sua experiência no YouTube
          </p>
        </div>

        {/* Player de vídeo placeholder */}
        <div className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
          <div className="aspect-w-16 aspect-h-9 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4 cursor-pointer hover:bg-red-700 transition-colors">
                <Play className="w-8 h-8 text-white ml-1" />
              </div>
              <p className="text-white text-lg font-semibold">Demonstração do Sistema</p>
              <p className="text-gray-400 mt-2">Clique para assistir</p>
            </div>
          </div>
          
          {/* Badge de preview */}
          <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
            <Star className="w-4 h-4 mr-1" />
            Preview
          </div>
        </div>
      </div>

      {/* Seção de Funcionalidades */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Funcionalidades Incríveis
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Descubra todas as ferramentas que vão revolucionar como você consome conteúdo no YouTube
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200"
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Seção de Gamificação */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Sistema de Gamificação
            </h2>
            <p className="text-purple-100 text-lg">
              Conquiste achievements e badges enquanto organiza seu conteúdo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {achievements.map((achievement, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-8 h-8" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{achievement.title}</h3>
                <p className="text-purple-100 text-sm mb-4">{achievement.description}</p>
                
                {/* Barra de progresso */}
                <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${achievement.progress}%` }}
                  ></div>
                </div>
                <div className="text-xs text-purple-200">
                  {achievement.progress}% completo
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Seção de Planos */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Escolha seu Plano
          </h2>
          <p className="text-lg text-gray-600">
            Acesso completo a todas as funcionalidades premium
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-red-500 transform hover:scale-105 transition-transform duration-300">
            {/* Badge de destaque */}
            <div className="bg-red-500 text-white text-center py-3 rounded-t-2xl">
              <div className="flex items-center justify-center">
                <Crown className="w-5 h-5 mr-2" />
                <span className="font-semibold">PLANO RECOMENDADO</span>
              </div>
            </div>

            <div className="p-8">
              <div className="text-center mb-6">
                <div className="flex items-baseline justify-center mb-2">
                  <span className="text-4xl font-bold text-gray-900">R$ 8,99</span>
                  <span className="text-gray-600 ml-2">/trimestre</span>
                </div>
                <p className="text-gray-600">Cobrança trimestral • Economize 40%</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Acesso a todos os recursos premium</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Suporte prioritário 24/7</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Backup automático dos dados</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Atualizações exclusivas</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Relatórios avançados</span>
                </div>
              </div>

              <button
                onClick={handleGetStarted}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all shadow-lg"
              >
                Começar Agora - R$ 8,99/trimestre
              </button>

              <p className="text-center text-sm text-gray-500 mt-4">
                ✅ 7 dias de garantia ou seu dinheiro de volta
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2024 YouTube Channel Watcher. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;