import React, { useState } from "react";
import { Chapter } from "../types";
import {
  Copy,
  Check,
  Volume2,
  VolumeX,
  Sparkles,
  BookOpen,
  Layers,
  RotateCw,
  Image as ImageIcon,
  Maximize2,
} from "lucide-react";

interface StoryboardCardProps {
  chapter: Chapter;
  characterVisualGuide?: string;
  totalChapters: number;
  isPlayingThisChapter?: boolean;
  onPlayThisChapter?: () => void;
  onStopThisChapter?: () => void;
  voiceGenderLabel?: string;
  onRegenerateImage?: () => void;
}

export const StoryboardCard: React.FC<StoryboardCardProps> = ({
  chapter,
  characterVisualGuide,
  totalChapters,
  isPlayingThisChapter = false,
  onPlayThisChapter,
  onStopThisChapter,
  voiceGenderLabel,
  onRegenerateImage,
}) => {
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [showImageZoom, setShowImageZoom] = useState(false);
  const [promptFormat, setPromptFormat] = useState<"standard" | "midjourney" | "dalle">("standard");

  const getFormattedPrompt = () => {
    if (promptFormat === "midjourney") {
      return `${chapter.image_prompt} --ar 16:9 --v 6.0 --style raw`;
    }
    if (promptFormat === "dalle") {
      return `A children's book illustration in wide 16:9 format. ${chapter.image_prompt}`;
    }
    return chapter.image_prompt;
  };

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(getFormattedPrompt());
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(`${chapter.chapter_title}\n\n${chapter.story_text}`);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleSpeech = () => {
    if (isPlayingThisChapter) {
      onStopThisChapter?.();
    } else {
      onPlayThisChapter?.();
    }
  };

  return (
    <div
      id={`chapter-card-${chapter.chapter_number}`}
      className={`bg-white border rounded-2xl p-6 transition-all relative overflow-hidden flex flex-col justify-between ${
        isPlayingThisChapter
          ? "border-amber-400 shadow-md ring-2 ring-amber-200/60"
          : "border-slate-200 shadow-sm hover:shadow-md"
      }`}
    >
      {/* Top Header Badge */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Capítulo {chapter.chapter_number} de {totalChapters}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              id={`read-aloud-btn-${chapter.chapter_number}`}
              onClick={handleToggleSpeech}
              title={isPlayingThisChapter ? "Pausar leitura em voz alta" : `Ouvir narração com voz ${voiceGenderLabel || "suave"}`}
              className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                isPlayingThisChapter
                  ? "bg-rose-500 text-white shadow-xs"
                  : "bg-amber-100/90 text-amber-900 hover:bg-amber-200 border border-amber-200"
              }`}
            >
              {isPlayingThisChapter ? (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>Pausar</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-amber-700" />
                  <span>Ouvir Capítulo</span>
                </>
              )}
            </button>

            <button
              id={`copy-story-text-btn-${chapter.chapter_number}`}
              onClick={handleCopyText}
              title="Copiar texto da história"
              className="text-xs px-2 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              {copiedText ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">{copiedText ? "Copiado!" : "Copiar"}</span>
            </button>
          </div>
        </div>

        {/* Chapter Title */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <h3 className="text-xl font-bold text-slate-800 tracking-tight">
            {chapter.chapter_title}
          </h3>
          {isPlayingThisChapter && (
            <span className="flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              Narrando agora
            </span>
          )}
        </div>

        {/* Narrative Text */}
        <div className={`border-l-4 p-4 rounded-r-xl mb-4 transition-colors ${
          isPlayingThisChapter
            ? "bg-amber-100/40 border-amber-500"
            : "bg-amber-50/50 border-amber-400"
        }`}>
          <p className="text-slate-700 text-base leading-relaxed font-serif whitespace-pre-line">
            {chapter.story_text}
          </p>
        </div>

        {/* Generated Illustration / Image Preview */}
        <div className="mb-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
              <span>Ilustração Automática do Capítulo:</span>
            </span>

            {chapter.imageUrl && onRegenerateImage && (
              <button
                onClick={onRegenerateImage}
                disabled={chapter.isGeneratingImage}
                title="Gerar outra variação desta ilustração"
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <RotateCw className={`w-3 h-3 ${chapter.isGeneratingImage ? "animate-spin" : ""}`} />
                <span>Regerar Arte</span>
              </button>
            )}
          </div>

          {chapter.imageUrl ? (
            <div className="relative group overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-xs">
              <img
                src={chapter.imageUrl}
                alt={chapter.scene_description}
                referrerPolicy="no-referrer"
                className="w-full h-48 sm:h-56 object-cover rounded-xl transition-transform duration-300 group-hover:scale-[1.02] cursor-pointer"
                onClick={() => setShowImageZoom(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3 pointer-events-none">
                <span className="text-[11px] text-white/95 font-medium line-clamp-1 italic">
                  "{chapter.scene_description}"
                </span>
                <button
                  type="button"
                  onClick={() => setShowImageZoom(true)}
                  className="pointer-events-auto bg-white/90 hover:bg-white text-slate-800 p-1.5 rounded-lg shadow-sm text-xs cursor-pointer ml-2 shrink-0"
                  title="Ver imagem ampliada"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : chapter.isGeneratingImage ? (
            <div className="h-44 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/50 flex flex-col items-center justify-center p-4 text-center">
              <RotateCw className="w-6 h-6 text-amber-600 animate-spin mb-2" />
              <p className="text-xs font-semibold text-amber-900">Gerando ilustração com IA...</p>
              <p className="text-[11px] text-amber-700 mt-0.5">Criando pintura mágica no estilo da história</p>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ImageIcon className="w-4 h-4 text-slate-400" />
                <span>Nenhuma ilustração gerada ainda.</span>
              </div>
              {onRegenerateImage && (
                <button
                  onClick={onRegenerateImage}
                  className="text-xs bg-amber-500 hover:bg-amber-600 text-white font-medium px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  Gerar Ilustração Agora
                </button>
              )}
            </div>
          )}
        </div>

        {/* Scene Description */}
        <div className="mb-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <Layers className="w-3.5 h-3.5 text-indigo-500" />
            <span>Cena do Storyboard</span>
          </div>
          <p className="text-sm text-slate-600 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            "{chapter.scene_description}"
          </p>
        </div>
      </div>

      {/* Image Prompt for Midjourney / DALL-E */}
      <div className="mt-4 pt-4 border-t border-slate-100">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-900">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Prompt em Inglês para Geração de Imagem:</span>
          </div>

          {/* Prompt format selector */}
          <div className="inline-flex rounded-lg p-0.5 bg-slate-100 border border-slate-200 text-xs">
            <button
              onClick={() => setPromptFormat("standard")}
              className={`px-2 py-0.5 rounded-md transition-colors ${
                promptFormat === "standard" ? "bg-white text-slate-900 font-medium shadow-xs" : "text-slate-500"
              }`}
            >
              Padrão
            </button>
            <button
              onClick={() => setPromptFormat("midjourney")}
              className={`px-2 py-0.5 rounded-md transition-colors ${
                promptFormat === "midjourney" ? "bg-white text-indigo-700 font-medium shadow-xs" : "text-slate-500"
              }`}
            >
              Midjourney
            </button>
            <button
              onClick={() => setPromptFormat("dalle")}
              className={`px-2 py-0.5 rounded-md transition-colors ${
                promptFormat === "dalle" ? "bg-white text-emerald-700 font-medium shadow-xs" : "text-slate-500"
              }`}
            >
              DALL-E 3
            </button>
          </div>
        </div>

        {/* Prompt Code Block */}
        <div className="relative group">
          <pre className="bg-slate-900 text-slate-100 text-xs p-3.5 rounded-xl overflow-x-auto font-mono whitespace-pre-wrap leading-relaxed border border-slate-800">
            {getFormattedPrompt()}
          </pre>

          <button
            id={`copy-prompt-btn-${chapter.chapter_number}`}
            onClick={handleCopyPrompt}
            className="absolute top-2.5 right-2.5 inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-sm transition-all active:scale-95"
          >
            {copiedPrompt ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Prompt</span>
              </>
            )}
          </button>
        </div>

        {promptFormat === "midjourney" && (
          <p className="text-[11px] text-indigo-600 mt-1.5 font-medium">
            ✨ Inclui parâmetros Midjourney otimizados: <code className="bg-indigo-50 px-1 py-0.5 rounded">--ar 16:9 --v 6.0 --style raw</code>
          </p>
        )}
      </div>

      {/* Modal Zoom de Imagem */}
      {showImageZoom && chapter.imageUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setShowImageZoom(false)}
        >
          <div className="max-w-3xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl p-2 relative">
            <img
              src={chapter.imageUrl}
              alt={chapter.scene_description}
              referrerPolicy="no-referrer"
              className="w-full h-auto rounded-xl object-contain max-h-[85vh]"
            />
            <div className="p-3 text-center">
              <p className="text-xs text-slate-500 font-sans">
                Ilustração do Capítulo {chapter.chapter_number} • Clique em qualquer lugar para fechar
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
