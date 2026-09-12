import React, { useState, useEffect } from "react";
import { VoiceSettings, VoiceGender, StoryPace, Chapter } from "../types";
import {
  getAvailablePortugueseVoices,
  VoiceOption,
  findBestVoice,
  getAcousticParameters,
} from "../utils/speechUtils";
import {
  Volume2,
  VolumeX,
  Play,
  Square,
  Sparkles,
  Moon,
  BookOpen,
  Sun,
  User,
  AudioWaveform as Waveform,
} from "lucide-react";

interface NarrationControlBarProps {
  settings: VoiceSettings;
  onSettingsChange: (newSettings: VoiceSettings) => void;
  chapters: Chapter[];
  currentPlayingChapter: number | null; // null se nada estiver tocando, -1 se história completa, ou 1, 2, 3
  onPlayChapter: (chapterNumber: number) => void;
  onPlayAll: () => void;
  onStop: () => void;
  isPlaying: boolean;
}

export const NarrationControlBar: React.FC<NarrationControlBarProps> = ({
  settings,
  onSettingsChange,
  chapters,
  currentPlayingChapter,
  onPlayChapter,
  onPlayAll,
  onStop,
  isPlaying,
}) => {
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [isTestingVoice, setIsTestingVoice] = useState(false);

  // Carrega vozes do navegador
  useEffect(() => {
    const loadVoices = () => {
      const available = getAvailablePortugueseVoices();
      setVoices(available);
    };

    loadVoices();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const handleGenderSelect = (gender: VoiceGender) => {
    onSettingsChange({
      ...settings,
      gender,
      preferredVoiceURI: null, // reseta para recalcular a melhor voz daquele gênero
    });
    // Se estiver tocando, para
    if (isPlaying) {
      onStop();
    }
  };

  const handlePaceSelect = (pace: StoryPace) => {
    onSettingsChange({
      ...settings,
      pace,
    });
  };

  const handleTestVoice = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    if (isPlaying) onStop();

    setIsTestingVoice(true);

    const testText =
      settings.gender === "female"
        ? "Olá! Eu sou a sua narradora de histórias mágicas. Vamos ouvir uma linda historinha juntos?"
        : "Olá! Eu sou o seu narrador de histórias. Prepare-se para uma aventura cheia de carinho e aprendizado.";

    const utterance = new SpeechSynthesisUtterance(testText);
    utterance.lang = "pt-BR";

    const voice = findBestVoice(voices, settings.gender, settings.preferredVoiceURI);
    if (voice) {
      utterance.voice = voice;
    }

    const { rate, pitch } = getAcousticParameters(settings, Boolean(voice?.name.toLowerCase().includes("natural") || voice?.name.toLowerCase().includes("google")));
    utterance.rate = rate;
    utterance.pitch = pitch;

    utterance.onend = () => setIsTestingVoice(false);
    utterance.onerror = () => setIsTestingVoice(false);

    window.speechSynthesis.speak(utterance);
  };

  const activeVoice = findBestVoice(voices, settings.gender, settings.preferredVoiceURI);

  return (
    <div
      id="narration-control-bar"
      className="bg-gradient-to-r from-amber-50 via-orange-50/50 to-indigo-50/60 border border-amber-200/70 rounded-2xl p-5 shadow-xs mb-6"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Left side: Voice & Persona Settings */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-amber-500/10 text-amber-700">
              <Sparkles className="w-4 h-4" />
            </span>
            <h4 className="font-bold text-slate-800 text-sm sm:text-base">
              Narração em Voz Alta para Crianças
            </h4>
            <span className="text-[11px] font-medium bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
              Suave & Calma
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Escolha do Gênero da Voz */}
            <div className="inline-flex rounded-xl bg-white p-1 border border-slate-200/90 shadow-2xs">
              <button
                id="voice-female-btn"
                type="button"
                onClick={() => handleGenderSelect("female")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  settings.gender === "female"
                    ? "bg-rose-500 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <span>👩</span>
                <span>Feminina (Doce & Suave)</span>
              </button>

              <button
                id="voice-male-btn"
                type="button"
                onClick={() => handleGenderSelect("male")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  settings.gender === "male"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <span>👨</span>
                <span>Masculina (Calma & Serena)</span>
              </button>
            </div>

            {/* Ritmo / Tom da história */}
            <div className="inline-flex rounded-xl bg-white p-1 border border-slate-200/90 shadow-2xs">
              <button
                id="pace-bedtime-btn"
                type="button"
                onClick={() => handlePaceSelect("bedtime")}
                title="Ritmo mais pausado e relaxante para a hora de dormir"
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  settings.pace === "bedtime"
                    ? "bg-amber-100 text-amber-900 font-semibold"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Moon className="w-3 h-3 text-amber-600" />
                <span>Hora de Dormir</span>
              </button>

              <button
                id="pace-storyteller-btn"
                type="button"
                onClick={() => handlePaceSelect("storyteller")}
                title="Ritmo perfeito e envolvente para historinhas"
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  settings.pace === "storyteller"
                    ? "bg-amber-100 text-amber-900 font-semibold"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <BookOpen className="w-3 h-3 text-indigo-600" />
                <span>Contação Padrão</span>
              </button>

              <button
                id="pace-normal-btn"
                type="button"
                onClick={() => handlePaceSelect("normal")}
                title="Ritmo um pouco mais dinâmico"
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  settings.pace === "normal"
                    ? "bg-amber-100 text-amber-900 font-semibold"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Sun className="w-3 h-3 text-amber-500" />
                <span>Dinâmico</span>
              </button>
            </div>

            {/* Testar voz */}
            <button
              id="test-voice-btn"
              type="button"
              onClick={handleTestVoice}
              disabled={isTestingVoice}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 active:scale-95 text-xs font-medium transition-all shadow-2xs ${
                isTestingVoice ? "ring-2 ring-amber-400 animate-pulse" : ""
              }`}
            >
              <Volume2 className="w-3.5 h-3.5 text-amber-600" />
              <span>{isTestingVoice ? "Ouvindo teste..." : "Testar Voz"}</span>
            </button>
          </div>

          {activeVoice && (
            <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <span>Voz do sistema em uso:</span>
              <span className="font-semibold text-slate-700">{activeVoice.name}</span>
              <span className="text-slate-400">({activeVoice.lang})</span>
            </p>
          )}
        </div>

        {/* Right side: Global Play / Stop Controls */}
        <div className="flex items-center gap-2.5 self-start lg:self-center shrink-0">
          {isPlaying ? (
            <button
              id="stop-all-narration-btn"
              type="button"
              onClick={onStop}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>Pausar Narração</span>
            </button>
          ) : (
            <button
              id="play-all-narration-btn"
              type="button"
              onClick={onPlayAll}
              disabled={chapters.length === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-sm shadow-sm transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Ouvir História Completa</span>
            </button>
          )}

          {isPlaying && (
            <div className="flex items-center gap-1 px-3 py-2 rounded-xl bg-amber-100/90 text-amber-900 border border-amber-200 text-xs font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600"></span>
              </span>
              <span>
                {currentPlayingChapter === -1
                  ? "Narrando conto completo..."
                  : `Narrando Capítulo ${currentPlayingChapter}...`}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
