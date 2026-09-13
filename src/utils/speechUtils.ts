import { VoiceGender, VoiceSettings, StoryPace } from "../types";

export interface AISpeechResponse {
  audioData: string; // data URI
  mimeType: string;
  provider: "gemini-tts" | "neural-pt";
  voiceName: string;
}

// Cache local no navegador para evitar requisições redundantes
const clientAudioCache = new Map<string, AISpeechResponse>();

/**
 * Busca áudio de voz natural gerado por IA no backend
 */
export async function fetchAISpeech(
  text: string,
  gender: VoiceGender = "female",
  pace: StoryPace = "storyteller"
): Promise<AISpeechResponse> {
  const cleanKey = `${gender}:${pace}:${text.trim()}`;
  const cached = clientAudioCache.get(cleanKey);
  if (cached) {
    return cached;
  }

  const response = await fetch("/api/generate-speech", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      gender,
      pace,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Falha na requisição de áudio: status ${response.status}`);
  }

  const data: AISpeechResponse = await response.json();
  clientAudioCache.set(cleanKey, data);
  return data;
}

/**
 * Velocidade de reprodução otimizada para o clima do conto
 */
export function getPlaybackRateForPace(pace: StoryPace): number {
  switch (pace) {
    case "bedtime":
      return 0.88; // Bem calmo e relaxante para a hora de dormir
    case "storyteller":
      return 0.96; // Doce, acolhedor e envolvente
    case "normal":
      return 1.05; // Fluido
    default:
      return 0.96;
  }
}

export interface VoiceOption {
  voice: SpeechSynthesisVoice;
  displayName: string;
  isFemale: boolean;
  isNatural: boolean;
}

/**
 * Fallback: Identifica e classifica as vozes em português instaladas no sistema
 */
export function getAvailablePortugueseVoices(): VoiceOption[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return [];
  }

  const allVoices = window.speechSynthesis.getVoices();
  const ptVoices = allVoices.filter((v) =>
    v.lang.toLowerCase().startsWith("pt")
  );

  const candidateVoices = ptVoices.length > 0 ? ptVoices : allVoices;

  const FEMALE_NAMES = [
    "luciana", "leticia", "letícia", "yara", "maria", "francisca",
    "joana", "camila", "raquel", "vitória", "vitoria", "zira",
    "google português", "eloise", "heloisa", "fernanda", "ines", "inês"
  ];

  const MALE_NAMES = [
    "felipe", "daniel", "antonio", "antônio", "ricardo", "tiago",
    "jorge", "david", "duarte"
  ];

  return candidateVoices.map((v) => {
    const nameLower = v.name.toLowerCase();
    const isExplicitMale =
      (nameLower.includes("male") && !nameLower.includes("female")) ||
      MALE_NAMES.some((m) => nameLower.includes(m));

    const isExplicitFemale =
      nameLower.includes("female") ||
      FEMALE_NAMES.some((f) => nameLower.includes(f));

    const isFemale = isExplicitFemale || (!isExplicitMale && !nameLower.includes("man"));
    const isNatural =
      nameLower.includes("natural") ||
      nameLower.includes("online") ||
      nameLower.includes("neural") ||
      nameLower.includes("google");

    const cleanName = v.name
      .replace(/Microsoft/g, "")
      .replace(/Google/g, "Google")
      .replace(/Online \(Natural\)/g, "Natural")
      .replace(/- Portuguese \(Brazil\)/g, "(BR)")
      .replace(/- Portuguese \(Portugal\)/g, "(PT)")
      .trim();

    return {
      voice: v,
      displayName: cleanName,
      isFemale,
      isNatural,
    };
  });
}

/**
 * Encontra a melhor voz recomendada do sistema caso a IA não responda
 */
export function findBestVoice(
  voices: VoiceOption[],
  targetGender: VoiceGender,
  preferredVoiceURI: string | null
): SpeechSynthesisVoice | null {
  if (voices.length === 0) return null;

  if (preferredVoiceURI) {
    const found = voices.find((v) => v.voice.voiceURI === preferredVoiceURI);
    if (found) return found.voice;
  }

  const isTargetFemale = targetGender === "female";
  const matchingGender = voices.filter((v) => v.isFemale === isTargetFemale);

  if (matchingGender.length > 0) {
    const natural = matchingGender.find((v) => v.isNatural);
    return natural ? natural.voice : matchingGender[0].voice;
  }

  return voices[0].voice;
}

export function getAcousticParameters(settings: VoiceSettings, hasNaturalVoice: boolean) {
  let rate = 0.90;
  if (settings.pace === "bedtime") {
    rate = 0.82;
  } else if (settings.pace === "normal") {
    rate = 0.98;
  }

  let pitch = 1.0;
  if (settings.gender === "female") {
    pitch = hasNaturalVoice ? 1.02 : 1.08;
  } else {
    pitch = hasNaturalVoice ? 0.95 : 0.86;
  }

  return { rate, pitch };
}
