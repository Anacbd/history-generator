import { GoogleGenAI } from "@google/genai";

interface SpeechOptions {
  text: string;
  gender?: "female" | "male";
  pace?: "bedtime" | "storyteller" | "normal";
}

interface SpeechResult {
  audioData: string; // Data URI (data:audio/wav;base64,... or data:audio/mpeg;base64,...)
  mimeType: string;
  provider: "gemini-tts" | "neural-pt";
  voiceName: string;
}

// Cache em memória para evitar chamadas duplicadas e preservar cota
const speechCache = new Map<string, SpeechResult>();
const MAX_CACHE_ITEMS = 60;

// Rastreamento de cooldown para cota do Gemini TTS (limite diário de 10 requisições no plano Free Tier)
let geminiTtsCooldownUntil = 0;

/**
 * Cria o cabeçalho padrão WAV (RIFF) de 44 bytes para áudio PCM linear 16-bit
 */
function createWavHeader(pcmLength: number, sampleRate = 24000, numChannels = 1): Buffer {
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcmLength, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16); // Tamanho do chunk fmt (16 bytes para PCM)
  header.writeUInt16LE(1, 20); // Formato de áudio 1 = PCM linear
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * numChannels * 2, 28); // ByteRate
  header.writeUInt16LE(numChannels * 2, 32); // BlockAlign
  header.writeUInt16LE(16, 34); // BitsPerSample
  header.write("data", 36);
  header.writeUInt32LE(pcmLength, 40);
  return header;
}

/**
 * Divide o texto em fragmentos naturais de pontuação para o fallback neural
 */
function splitTextIntoSentences(text: string, maxChunkLength = 140): string[] {
  // Quebra por pontuações comuns (ponto, exclamação, interrogação, vírgula ou reticências)
  const rawSegments = text.match(/[^.!?,;:]+[.!?,;:]+|[^.!?,;:]+$/g) || [text];
  const chunks: string[] = [];
  let currentChunk = "";

  for (const seg of rawSegments) {
    const trimmed = seg.trim();
    if (!trimmed) continue;

    if ((currentChunk + " " + trimmed).trim().length > maxChunkLength) {
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = trimmed;
    } else {
      currentChunk = currentChunk ? `${currentChunk} ${trimmed}` : trimmed;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks.length > 0 ? chunks : [text.slice(0, maxChunkLength)];
}

/**
 * Gera áudio através do motor neural em português (sem limite de cota 3-RPM)
 */
async function generateNeuralStream(cleanText: string): Promise<Buffer> {
  const chunks = splitTextIntoSentences(cleanText, 130);
  const audioBuffers: Buffer[] = [];

  for (const chunk of chunks) {
    const encoded = encodeURIComponent(chunk);
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=pt-BR&client=tw-ob&q=${encoded}`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`Falha no áudio neural: status ${response.status}`);
    }

    const arrayBuf = await response.arrayBuffer();
    audioBuffers.push(Buffer.from(arrayBuf));
  }

  return Buffer.concat(audioBuffers);
}

/**
 * Gera narração de voz com IA, priorizando voz humana calma, serena e acolhedora
 */
export async function generateStorySpeech(
  ai: GoogleGenAI,
  options: SpeechOptions
): Promise<SpeechResult> {
  const { text, gender = "female", pace = "storyteller" } = options;

  // Limpeza de marcações markdown para narração límpida e natural
  const cleanText = text
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/#{1,6}\s?/g, "")
    .replace(/[""«»]/g, '"')
    .replace(/\s+/g, " ")
    .trim();

  if (!cleanText) {
    throw new Error("Texto para narração está vazio.");
  }

  const cacheKey = `${gender}:${pace}:${cleanText}`;
  const cached = speechCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // 1. Tentar gerar com Gemini TTS caso a cota esteja disponível e fora do período de cooldown
  const canAttemptGeminiTTS = Boolean(
    process.env.GEMINI_API_KEY && Date.now() > geminiTtsCooldownUntil
  );

  if (canAttemptGeminiTTS) {
    try {
      const voiceName = gender === "female" ? "Kore" : "Puck";
      const promptStyle =
        pace === "bedtime"
          ? `[Voz humana serena, doce, calma e acolhedora, falando em português do Brasil com ternura maternal para a hora de dormir]: ${cleanText}`
          : `[Voz humana acolhedora, expressiva, doce e calma, narrando um conto infantil em português do Brasil]: ${cleanText}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: promptStyle,
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName,
              },
            },
          },
        },
      });

      const audioPart = response.candidates?.[0]?.content?.parts?.[0];
      if (audioPart?.inlineData?.data) {
        const rawPcm = Buffer.from(audioPart.inlineData.data, "base64");
        const wavHeader = createWavHeader(rawPcm.length, 24000, 1);
        const fullWav = Buffer.concat([wavHeader, rawPcm]);
        const wavBase64 = fullWav.toString("base64");

        const result: SpeechResult = {
          audioData: `data:audio/wav;base64,${wavBase64}`,
          mimeType: "audio/wav",
          provider: "gemini-tts",
          voiceName: gender === "female" ? "Kore (Voz Doce IA)" : "Puck (Voz Calma IA)",
        };

        if (speechCache.size >= MAX_CACHE_ITEMS) {
          const firstKey = speechCache.keys().next().value;
          if (firstKey) speechCache.delete(firstKey);
        }
        speechCache.set(cacheKey, result);

        return result;
      }
    } catch (geminiErr: any) {
      const isQuotaError =
        geminiErr?.status === 429 ||
        String(geminiErr?.message).includes("429") ||
        String(geminiErr?.message).includes("RESOURCE_EXHAUSTED") ||
        String(geminiErr?.message).includes("Quota exceeded");

      if (isQuotaError) {
        // Pausa tentativas no Gemini TTS por 30 minutos para evitar chamadas lentas e mensagens repetidas
        geminiTtsCooldownUntil = Date.now() + 30 * 60 * 1000;
      }
    }
  }

  // 2. Fallback neural de alta qualidade em português (sempre natural, sem robótica e sem limites de cota)
  const mp3Buffer = await generateNeuralStream(cleanText);
  const mp3Base64 = mp3Buffer.toString("base64");

  const result: SpeechResult = {
    audioData: `data:audio/mpeg;base64,${mp3Base64}`,
    mimeType: "audio/mpeg",
    provider: "neural-pt",
    voiceName: gender === "female" ? "Voz Humana Serena (BR)" : "Voz Humana Calma (BR)",
  };

  if (speechCache.size >= MAX_CACHE_ITEMS) {
    const firstKey = speechCache.keys().next().value;
    if (firstKey) speechCache.delete(firstKey);
  }
  speechCache.set(cacheKey, result);

  return result;
}
