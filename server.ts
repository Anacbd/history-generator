import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import "dotenv/config";
import { generateStorySpeech } from "./server/speechService";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini API client
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "children-story-generator" });
  });

  // Story generation endpoint
  app.post("/api/generate-story", async (req, res) => {
    try {
      const { theme, characterName, moralLesson, visualStyle = "Aquarela mágica de livro infantil (Whimsical Storybook Watercolor)" } = req.body;

      if (!theme || !characterName || !moralLesson) {
        return res.status(400).json({
          error: "Campos obrigatórios ausentes: tema, nome da personagem e lição moral são necessários.",
        });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
          error: "Chave GEMINI_API_KEY não configurada no servidor.",
        });
      }

      const systemInstruction = `Você é um autor de renome de literatura infantil e diretor de arte sênior especializado em storyboard e prompts para inteligência artificial generativa de imagens (Midjourney, DALL-E 3).

Sua tarefa é criar uma história infantil mágica, sensível e inesquecível a partir dos parâmetros fornecidos pela usuária.
A história deve ser dividida em exatamente 3 capítulos curtos e cativantes:
- Capítulo 1: O Início da Jornada (Apresentação da personagem e o início do desafio ou desejo)
- Capítulo 2: O Desafio ou Conflito (O momento crucial de aprendizado, superação ou dúvida)
- Capítulo 3: A Resolução e a Lição (O desfecho caloroso que celebra a lição moral)

Para CADA um dos 3 capítulos, você deve gerar:
1. 'story_text': O texto da narrativa em português (língua portuguesa do Brasil), escrito com ternura, poesia e linguagem acessível e encantadora para crianças.
2. 'image_prompt': Um prompt altamente detalhado EM INGLÊS, estritamente otimizado para geradores de imagem como Midjourney v6 ou DALL-E 3. O prompt deve descrever a cena precisa do capítulo com foco em:
   - Sujeito e ações claras da personagem principal mantendo estrita consistência visual (roupas, traços marcantes, cores).
   - Estilo artístico de livro ilustrado infantil (${visualStyle}), iluminação cinematográfica suave e acolhedora (soft warm golden hour lighting / whimsical dreamlike glow).
   - Composição, paleta de cores harmônica, textura artesanal e enquadramento (wide shot, eye-level, detailed storybook illustration).
   - NÃO inclua texto ou palavras dentro da ilustração (specify 'no text, no watermark, storybook illustration, highly detailed, expressive character').

Retorne a resposta estritamente no formato JSON estruturado de acordo com o esquema solicitado.`;

      const prompt = `Por favor, crie a história infantil e os 3 prompts de storyboard com os seguintes dados:
- Tema da história: "${theme}"
- Nome da personagem principal: "${characterName}"
- Lição moral a transmitir: "${moralLesson}"
- Estilo visual sugerido para as ilustrações: "${visualStyle}"`;

      // Modelos distintos: gemini-3.1-flash-lite possui cota própria e alta disponibilidade, sendo ideal como primário ou fallback instantâneo
      const candidateModels = ["gemini-3.1-flash-lite", "gemini-3.8-flash"];
      let parsedData: any = null;
      let lastError: any = null;

      for (const modelName of candidateModels) {
        try {
          console.log(`[Gemini] Solicitando ao modelo ${modelName}...`);
          const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              systemInstruction,
              temperature: 0.8,
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  title: {
                    type: Type.STRING,
                    description: "Título mágico e cativante da história infantil",
                  },
                  synopsis: {
                    type: Type.STRING,
                    description: "Breve sinopse carinhosa da historinha",
                  },
                  character_visual_guide: {
                    type: Type.STRING,
                    description: "Descrição concisa dos traços físicos e roupas da personagem para consistência nos prompts",
                  },
                  moral_lesson_summary: {
                    type: Type.STRING,
                    description: "A lição moral expressa de forma gentil para crianças",
                  },
                  chapters: {
                    type: Type.ARRAY,
                    description: "Os 3 capítulos da narrativa com seus respectivos prompts de imagem",
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        chapter_number: {
                          type: Type.INTEGER,
                          description: "Número do capítulo (1, 2 ou 3)",
                        },
                        chapter_title: {
                          type: Type.STRING,
                          description: "Título do capítulo",
                        },
                        story_text: {
                          type: Type.STRING,
                          description: "Texto do capítulo em português, doce, envolvente e infantil",
                        },
                        scene_description: {
                          type: Type.STRING,
                          description: "Breve resumo em português da cena a ser ilustrada",
                        },
                        image_prompt: {
                          type: Type.STRING,
                          description: "Prompt detalhado e completo em inglês para Midjourney v6 ou DALL-E 3",
                        },
                      },
                      required: ["chapter_number", "chapter_title", "story_text", "scene_description", "image_prompt"],
                    },
                  },
                },
                required: ["title", "synopsis", "character_visual_guide", "moral_lesson_summary", "chapters"],
              },
            },
          });

          const responseText = response.text;
          if (!responseText) {
            throw new Error("A IA retornou resposta vazia.");
          }

          let cleaned = responseText.trim();
          if (cleaned.startsWith("```json")) {
            cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
          } else if (cleaned.startsWith("```")) {
            cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
          }

          parsedData = JSON.parse(cleaned);
          console.log(`[Gemini] Sucesso com o modelo ${modelName}!`);
          break;
        } catch (err: any) {
          lastError = err;
          const errMsg = err?.message || String(err);
          console.warn(`[Gemini] Falha no modelo ${modelName}: ${errMsg}`);
          // Continua imediatamente para o próximo modelo candidato sem esperar
        }
      }

      if (!parsedData) {
        throw lastError || new Error("Não foi possível gerar a história no momento devido à alta demanda nos servidores do Gemini.");
      }

      return res.json(parsedData);
    } catch (err: any) {
      console.error("Erro ao gerar história com Gemini:", err);
      const isDemandError =
        err?.message?.includes("503") ||
        err?.message?.includes("high demand") ||
        err?.message?.includes("UNAVAILABLE");

      return res.status(isDemandError ? 503 : 500).json({
        error: isDemandError
          ? "Os servidores da IA do Gemini estão momentaneamente com alta demanda. Por favor, clique em 'Tentar Novamente' em alguns instantes."
          : (err?.message || "Ocorreu um erro ao gerar a história infantil."),
      });
    }
  });

  // Image generation endpoint
  app.post("/api/generate-image", async (req, res) => {
    try {
      const { prompt, visualStyle = "Aquarela infantil", seed = Math.floor(Math.random() * 899999) + 100000 } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: "Prompt é obrigatório." });
      }

      // Ilustrações infantis de alta qualidade com motor de difusão Flux
      const cleanPrompt = `${prompt}, children book illustration, cute storybook art style, ${visualStyle}, soft pleasant colors, vibrant lighting, highly detailed, whimsical aesthetic, no text, no watermark`;
      const encoded = encodeURIComponent(cleanPrompt);
      const pollinationsUrl = `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=768&seed=${seed}&model=flux&nologo=true`;

      return res.json({
        imageUrl: pollinationsUrl,
        provider: "flux-storybook",
      });
    } catch (err: any) {
      return res.status(500).json({
        error: err?.message || "Falha ao gerar imagem.",
      });
    }
  });

  // Natural AI Speech narration endpoint (Gemini TTS + Humanized Neural Fallback)
  app.post("/api/generate-speech", async (req, res) => {
    try {
      const { text, gender = "female", pace = "storyteller" } = req.body;

      if (!text || typeof text !== "string" || !text.trim()) {
        return res.status(400).json({ error: "Texto para narração é obrigatório." });
      }

      const result = await generateStorySpeech(ai, {
        text,
        gender: gender === "male" ? "male" : "female",
        pace,
      });

      return res.json(result);
    } catch (err: any) {
      console.error("Erro na geração de fala:", err);
      return res.status(500).json({
        error: err?.message || "Não foi possível gerar a narração de voz com IA.",
      });
    }
  });

  // Vite middleware in dev / static in prod
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}

startServer();
