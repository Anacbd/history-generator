import React, { useState, useEffect, useRef } from "react";
import { VoiceSettings, VoiceGender, StoryPace, Chapter } from "../types";
import {
  getAvailablePortugueseVoices,
  VoiceOption,
  findBestVoice,
  fetchAISpeech,
  getPlaybackRateForPace,
} from "../utils/speechUtils";
import {
  Volume2,
  Play,
  Square,
  Sparkles,
  Moon,
  BookOpen,
  Sun,
  Loader2,
  Heart,
  AudioLines,
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
  isLoadingAudio?: boolean;
}

export const NarrationControlBar: React.FC<NarrationControlBarProps> = ({
  settings,
  onSettingsChange,
  chapters,
  currentPlayingChapter,
  onPlayAll,
  onStop,
  isPlaying,
  isLoadingAudio = false,
}) => {
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [isTestingVoice, setIsTestingVoice] = useState(false);
  const audioTestRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const loadVoices = () => {
      const available = getAvailablePortugueseVoices();
      setVoices(available);
    };

    loadVoices();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (audioTestRef.current) {
        audioTestRef.current.pause();
        audioTestRef.current = null;
      }
    };
  }, []);

  const handleGenderSelect = (gender: VoiceGender) => {
    if (isPlaying) {
      onStop();
    }
    if (audioTestRef.current) {
      audioTestRef.current.pause();
      audioTestRef.current = null;
      setIsTestingVoice(false);
    }

    onSettingsChange({
      ...settings,
      gender,
    });
  };

  const handlePaceSelect = (pace: StoryPace) => {
    onSettingsChange({
      ...settings,
      pace,
    });
  };

  const handleTestVoice = async () => {
    if (isPlaying) onStop();
    if (audioTestRef.current) {
      audioTestRef.current.pause();
      audioTestRef.current = null;
    }

    setIsTestingVoice(true);

    const testText =
      settings.gender === "female"
        ? "Era uma vez um lindo reino de flores e estrelas... Feche os olhinhos para ouvir uma história cheia de amor e carinho."
        : "Olá, amiguinho! Prepare-se para uma historinha serena e cheia de aprendizados para aquecer o coração.";

    try {
      const speech = await fetchAISpeech(testText, settings.gender, settings.pace);
      const audio = new Audio(speech.audioData);
      audio.playbackRate = getPlaybackRateForPace(settings.pace);
      audioTestRef.current = audio;

      audio.onended = () => {
        setIsTestingVoice(false);
        audioTestRef.current = null;
      };
      audio.onerror = () => {
        setIsTestingVoice(false);
        audioTestRef.current = null;
      };

      await audio.play();
    } catch (err) {
      console.warn("Falha no teste com IA, utilizando fallback local:", err);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(testText);
        utterance.lang = "pt-BR";
        const voice = findBestVoice(voices, settings.gender, settings.preferredVoiceURI);
        if (voice) utterance.voice = voice;
        utterance.rate = 0.88;
        utterance.onend = () => setIsTestingVoice(false);
        utterance.onerror = () => setIsTestingVoice(false);
        window.speechSynthesis.speak(utterance);
      } else {
        setIsTestingVoice(false);
      }
    }
  };

  return (
    <div
      id="narration-control-bar"
      className="bg-gradient-to-r from-amber-50/90 via-orange-50/70 to-rose-50/60 border border-amber-200/80 rounded-2xl p-5 shadow-xs mb-6 transition-all"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Left side: Voice Profile & Acoustic Tone */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="p-1.5 rounded-xl bg-amber-500/15 text-amber-700">
              <Sparkles className="w-4 h-4" />
            </span>
            <h4 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-1.5">
              <span>Narração com Voz Humana por IA</span>
            </h4>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
              <Heart className="w-3 h-3 text-emerald-600 fill-emerald-500" />
              Tom Calmo, Sereno & Acolhedor
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Escolha da Voz Natural IA */}
            <div className="inline-flex rounded-xl bg-white p-1 border border-slate-200/90 shadow-2xs">
              <button
                id="voice-female-btn"
                type="button"
                onClick={() => handleGenderSelect("female")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  settings.gender === "female"
                    ? "bg-rose-500 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <span>👩</span>
                <span>Voz Serena Feminina</span>
              </button>

              <button
                id="voice-male-btn"
                type="button"
                onClick={() => handleGenderSelect("male")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  settings.gender === "male"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <span>👨</span>
                <span>Voz Calma Masculina</span>
              </button>
            </div>

            {/* Ritmo / Cadência Acolhedora */}
            <div className="inline-flex rounded-xl bg-white p-1 border border-slate-200/90 shadow-2xs">
              <button
                id="pace-bedtime-btn"
                type="button"
                onClick={() => handlePaceSelect("bedtime")}
                title="Ritmo bem pausado e suave para ninar e relaxar"
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  settings.pace === "bedtime"
                    ? "bg-amber-100 text-amber-950 font-semibold"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Moon className="w-3 h-3 text-amber-600" />
                <span>Hora de Dormir (Mais Lenta)</span>
              </button>

              <button
                id="pace-storyteller-btn"
                type="button"
                onClick={() => handlePaceSelect("storyteller")}
                title="Ritmo ideal e envolvente de conto de fadas"
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  settings.pace === "storyteller"
                    ? "bg-amber-100 text-amber-950 font-semibold"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <BookOpen className="w-3 h-3 text-indigo-600" />
                <span>Contação de Histórias</span>
              </button>

              <button
                id="pace-normal-btn"
                type="button"
                onClick={() => handlePaceSelect("normal")}
                title="Ritmo normal e fluido"
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  settings.pace === "normal"
                    ? "bg-amber-100 text-amber-950 font-semibold"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Sun className="w-3 h-3 text-amber-500" />
                <span>Ritmo Fluido</span>
              </button>
            </div>

            {/* Testar voz com IA */}
            <button
              id="test-voice-btn"
              type="button"
              onClick={handleTestVoice}
              disabled={isTestingVoice || isLoadingAudio}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 active:scale-95 text-xs font-semibold transition-all shadow-2xs cursor-pointer ${
                isTestingVoice ? "ring-2 ring-amber-400 bg-amber-50 text-amber-900 animate-pulse" : ""
              }`}
            >
              {isTestingVoice ? (
                <>
                  <AudioLines className="w-3.5 h-3.5 text-amber-600 animate-bounce" />
                  <span>Ouvindo Amostra...</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Ouvir Amostra da Voz</span>
                </>
              )}
            </button>
          </div>

          <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            <span>Voz de alta fidelidade:</span>
            <span className="font-semibold text-slate-700">
              {settings.gender === "female"
                ? "Narradora Serena (Entonação suave e terna)"
                : "Narrador Calmo (Entonação gentil e protetora)"}
            </span>
          </p>
        </div>

        {/* Right side: Global Play / Stop Controls */}
        <div className="flex items-center gap-2.5 self-start lg:self-center shrink-0">
          {isLoadingAudio ? (
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-100 text-amber-900 font-semibold text-xs border border-amber-300 shadow-2xs">
              <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
              <span>Sintetizando voz natural com IA...</span>
            </div>
          ) : isPlaying ? (
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
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-sm shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Ouvir História Completa</span>
            </button>
          )}

          {isPlaying && (
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-100/90 text-amber-900 border border-amber-200 text-xs font-semibold">
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
