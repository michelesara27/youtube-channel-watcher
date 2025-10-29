// scripts/populateDb.js - Versão ES Module
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env" });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Erro: Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não encontradas."
  );
  console.log("Certifique-se de ter um arquivo .env na raiz do projeto com:");
  console.log("VITE_SUPABASE_URL=sua_url_do_supabase");
  console.log("VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Dados mockados para popular o banco
const mockChannels = [
  {
    channel_id: "UC_x5XG1OV2P6uZZ5FSM9Ttw",
    name: "Google Developers",
    thumbnail_url:
      "https://yt3.googleusercontent.com/ytc/APkrFKb-eg0C8_jxXqVItB3Df-vf6t7n4U9w1Q0XZJ7O=s176-c-k-c0x00ffffff-no-rj",
  },
  {
    channel_id: "UCsBjURrPoezykLs9EqgamOA",
    name: "Fireship",
    thumbnail_url:
      "https://yt3.googleusercontent.com/ytc/APkrFKb--UAKCv3dktcyV2vLGy8En21n3J5k2k7jv8VU=s176-c-k-c0x00ffffff-no-rj",
  },
  {
    channel_id: "UC8butISFwT-Wl7EV0hUK0BQ",
    name: "freeCodeCamp.org",
    thumbnail_url:
      "https://yt3.googleusercontent.com/ytc/APkrFKZ2gE6qQ5f6xL1fc6QOFcM2kI4nA4iaK2J9WMah=s176-c-k-c0x00ffffff-no-rj",
  },
];

const mockVideos = [
  {
    video_id: "dQw4w9WgXcQ",
    channel_id: "UC_x5XG1OV2P6uZZ5FSM9Ttw",
    title: "Official Google Channel Introduction",
    thumbnail_url: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    published_at: "2023-10-15T10:00:00Z",
  },
  {
    video_id: "Tn6-PIqc4UM",
    channel_id: "UCsBjURrPoezykLs9EqgamOA",
    title: "React in 100 Seconds",
    thumbnail_url: "https://i.ytimg.com/vi/Tn6-PIqc4UM/hqdefault.jpg",
    published_at: "2023-10-20T15:30:00Z",
  },
  {
    video_id: "zQnBQ4tB3ZA",
    channel_id: "UCsBjURrPoezykLs9EqgamOA",
    title: "TypeScript in 100 Seconds",
    thumbnail_url: "https://i.ytimg.com/vi/zQnBQ4tB3ZA/hqdefault.jpg",
    published_at: "2023-10-18T12:15:00Z",
  },
  {
    video_id: "1e1eqGXKaK4",
    channel_id: "UCsBjURrPoezykLs9EqgamOA",
    title: "Node.js in 100 Seconds",
    thumbnail_url: "https://i.ytimg.com/vi/1e1eqGXKaK4/hqdefault.jpg",
    published_at: "2023-10-16T09:45:00Z",
  },
  {
    video_id: "PkZNo7MFNFg",
    channel_id: "UC8butISFwT-Wl7EV0hUK0BQ",
    title: "Learn JavaScript - Full Course for Beginners",
    thumbnail_url: "https://i.ytimg.com/vi/PkZNo7MFNFg/hqdefault.jpg",
    published_at: "2023-10-22T14:20:00Z",
  },
  {
    video_id: "_uQrJ0TkZlc",
    channel_id: "UC8butISFwT-Wl7EV0hUK0BQ",
    title: "Python for Beginners - Full Course",
    thumbnail_url: "https://i.ytimg.com/vi/_uQrJ0TkZlc/hqdefault.jpg",
    published_at: "2023-10-21T11:10:00Z",
  },
  {
    video_id: "HXV3zeQKqGY",
    channel_id: "UC8butISFwT-Wl7EV0hUK0BQ",
    title: "SQL Tutorial - Full Database Course for Beginners",
    thumbnail_url: "https://i.ytimg.com/vi/HXV3zeQKqGY/hqdefault.jpg",
    published_at: "2023-10-19T16:30:00Z",
  },
  {
    video_id: "fis26HvvDII",
    channel_id: "UC_x5XG1OV2P6uZZ5FSM9Ttw",
    title: "Android Development for Beginners",
    thumbnail_url: "https://i.ytimg.com/vi/fis26HvvDII/hqdefault.jpg",
    published_at: "2023-10-17T13:25:00Z",
  },
  {
    video_id: "ISUm6aXp5rY",
    channel_id: "UC_x5XG1OV2P6uZZ5FSM9Ttw",
    title: "Google Cloud Platform Tutorial",
    thumbnail_url: "https://i.ytimg.com/vi/ISUm6aXp5rY/hqdefault.jpg",
    published_at: "2023-10-14T08:50:00Z",
  },
];

const populateDatabase = async () => {
  console.log("🚀 Iniciando população do banco de dados Supabase...\n");

  try {
    // Verificar se já existem dados para evitar duplicação
    const { data: existingChannels, error: checkError } = await supabase
      .from("channels")
      .select("*")
      .limit(1);

    if (checkError) {
      console.error(
        "❌ Erro ao verificar dados existentes:",
        checkError.message
      );
      return;
    }

    if (existingChannels && existingChannels.length > 0) {
      console.log("ℹ️  O banco já contém dados. Pulando a população.");
      return;
    }

    // Inserir canais
    console.log("📺 Inserindo canais...");
    const { error: channelsError } = await supabase
      .from("channels")
      .insert(mockChannels);

    if (channelsError) {
      console.error("❌ Erro ao inserir canais:", channelsError.message);

      // Se for erro de duplicação, continuar com os vídeos
      if (!channelsError.message.includes("duplicate key")) {
        return;
      }
    }

    console.log("✅ Canais inseridos com sucesso!");

    // Inserir vídeos
    console.log("\n🎥 Inserindo vídeos...");
    const { error: videosError } = await supabase
      .from("videos")
      .insert(mockVideos);

    if (videosError) {
      console.error("❌ Erro ao inserir vídeos:", videosError.message);

      // Se for erro de duplicação, considerar sucesso parcial
      if (!videosError.message.includes("duplicate key")) {
        return;
      }
    }

    console.log("✅ Vídeos inseridos com sucesso!");

    console.log("\n🎉 Banco de dados populado com dados iniciais!");
    console.log("\n📊 Estatísticas:");
    console.log(`   • ${mockChannels.length} canais adicionados`);
    console.log(`   • ${mockVideos.length} vídeos adicionados`);
    console.log('\n🚀 Execute "npm run dev" para iniciar o aplicativo!');
  } catch (error) {
    console.error("❌ Erro inesperado:", error.message);
  }
};

// Executar a população
populateDatabase();
