import { VoiceGender, VoiceSettings, StoryPace } from "../types";

export interface VoiceOption {
  voice: SpeechSynthesisVoice;
  displayName: string;
  isFemale: boolean;
  isNatural: boolean;
}

const FEMALE_NAMES = [
  "luciana", "leticia", "letícia", "yara", "maria", "francisca",
  "joana", "camila", "raquel", "vitória", "vitoria", "zira",
  "google português", "eloise", "heloisa", "fernanda", "ines", "inês"
];

const MALE_NAMES = [
  "felipe", "daniel", "antonio", "antônio", "ricardo", "tiago",
  "jorge", "david", "duarte"
];

/**
 * Identifica e classifica as vozes em português instaladas no navegador/sistema
 */
export function getAvailablePortugueseVoices(): VoiceOption[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return [];
  }

  const allVoices = window.speechSynthesis.getVoices();
  const ptVoices = allVoices.filter((v) =>
    v.lang.toLowerCase().startsWith("pt")
  );

  // Se não encontrar nenhuma voz em PT, pega as disponíveis como fallback
  const candidateVoices = ptVoices.length > 0 ? ptVoices : allVoices;

  return candidateVoices.map((v) => {
    const nameLower = v.name.toLowerCase();
    const isExplicitMale =
      nameLower.includes("male") && !nameLower.includes("female") ||
      MALE_NAMES.some((m) => nameLower.includes(m));

    const isExplicitFemale =
      nameLower.includes("female") ||
      FEMALE_NAMES.some((f) => nameLower.includes(f));

    // Heurística padrão caso o nome não traga gênero explícito
    const isFemale = isExplicitFemale || (!isExplicitMale && !nameLower.includes("man"));
    const isNatural = nameLower.includes("natural") || nameLower.includes("online") || nameLower.includes("neural") || nameLower.includes("google");

    let cleanName = v.name
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
 * Encontra a melhor voz recomendada com base no gênero e nos recursos do navegador
 */
export function findBestVoice(
  voices: VoiceOption[],
  targetGender: VoiceGender,
  preferredVoiceURI: string | null
): SpeechSynthesisVoice | null {
  if (voices.length === 0) return null;

  // 1. Se o usuário selecionou uma voz específica manualmente
  if (preferredVoiceURI) {
    const found = voices.find((v) => v.voice.voiceURI === preferredVoiceURI);
    if (found) return found.voice;
  }

  const isTargetFemale = targetGender === "female";
  const matchingGender = voices.filter((v) => v.isFemale === isTargetFemale);

  if (matchingGender.length > 0) {
    // Dá preferência para vozes naturais/neurais
    const natural = matchingGender.find((v) => v.isNatural);
    return natural ? natural.voice : matchingGender[0].voice;
  }

  // Fallback para qualquer voz disponível
  return voices[0].voice;
}

/**
 * Calcula taxa (rate) e pitch (tom) ideais para conto infantil
 */
export function getAcousticParameters(settings: VoiceSettings, hasNaturalVoice: boolean) {
  // Ritmo da leitura
  let rate = 0.90; // Contação ideal de histórias
  if (settings.pace === "bedtime") {
    rate = 0.82; // Mais pausado, suave para hora de dormir
  } else if (settings.pace === "normal") {
    rate = 0.98; // Ritmo mais ágil
  }

  // Tom e ressonância emocional para crianças
  let pitch = 1.0;
  if (settings.gender === "female") {
    // Voz feminina suave, doce, acolhedora
    pitch = hasNaturalVoice ? 1.02 : 1.08;
  } else {
    // Voz masculina serena, calma, protetora
    pitch = hasNaturalVoice ? 0.95 : 0.86;
  }

  return { rate, pitch };
}
