import React, { useState, useEffect } from "react";
import { StoryResponse, VoiceSettings, StoryFormData } from "../types";
import {
  BookOpen,
  Volume2,
  VolumeX,
  RotateCw,
  Printer,
  Share2,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Heart,
  Star,
  Maximize2,
  ExternalLink,
  HelpCircle,
  Pencil,
  RotateCcw,
  Layers,
  BookMarked,
} from "lucide-react";

interface LivroInfantilViewProps {
  story: StoryResponse;
  formData?: StoryFormData | null;
  isPlayingNarration: boolean;
  currentPlayingChapter: number | null;
  voiceSettings: VoiceSettings;
  onPlayAll: () => void;
  onPlayChapter: (chapterNumber: number) => void;
  onStopNarration: () => void;
  onRegenerateImage: (chapterNumber: number) => void;
  onRegenerateAllImages: () => void;
  isGeneratingAnyImage: boolean;
}

export const LivroInfantilView: React.FC<LivroInfantilViewProps> = ({
  story,
  formData,
  isPlayingNarration,
  currentPlayingChapter,
  voiceSettings,
  onPlayAll,
  onPlayChapter,
  onStopNarration,
  onRegenerateImage,
  onRegenerateAllImages,
  isGeneratingAnyImage,
}) => {
  // Páginas do livro:
  // 0: Capa (Cover)
  // 1: Capítulo 1
  // 2: Capítulo 2
  // 3: Capítulo 3
  // 4: Contracapa & Moral da História (Epílogo)
  const totalBookPages = story.chapters.length + 2; // Capa (0), Capítulos (1..3), Contracapa (4)
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [viewStyle, setViewStyle] = useState<"flip" | "continuous">("flip");
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedImageModal, setSelectedImageModal] = useState<string | null>(null);
  const [childName, setChildName] = useState<string>(formData?.characterName ? "" : "");

  // Sincroniza a página do livro automaticamente com o capítulo narrado por áudio
  useEffect(() => {
    if (currentPlayingChapter && currentPlayingChapter >= 1 && currentPlayingChapter <= story.chapters.length) {
      setCurrentPage(currentPlayingChapter);
    }
  }, [currentPlayingChapter, story.chapters.length]);

  // Suporte à navegação por setas do teclado no modo Folhear
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewStyle !== "flip") return;
      // Não intercepta se o usuário estiver digitando em um input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === "ArrowRight") {
        setCurrentPage((prev) => Math.min(prev + 1, totalBookPages - 1));
      } else if (e.key === "ArrowLeft") {
        setCurrentPage((prev) => Math.max(prev - 1, 0));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [viewStyle, totalBookPages]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const text = `📖 LIVRO INFANTIL: "${story.title}"\n\n${story.synopsis}\n\nLição com Amor: ${story.moral_lesson_summary}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Obter primeira letra para a capitular decorada
  const getDropCap = (text: string) => {
    const trimmed = text.trim();
    return {
      firstChar: trimmed.charAt(0) || "E",
      rest: trimmed.slice(1),
    };
  };

  return (
    <div className="w-full">
      {/* Barra de Ações Superior do Livro Infantil */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 print:hidden bg-gradient-to-r from-amber-50 via-orange-50/70 to-rose-50/50 border border-amber-200/80 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700 text-xl shadow-2xs">
            📖
          </span>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
              <span>Livro Infantil Ilustrado</span>
              <span className="text-[11px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                Edição Mágica
              </span>
            </h4>
            <p className="text-xs text-slate-600">
              Formato de livro de histórias com capa, páginas ilustradas e lição acolhedora.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Alternador de Modo: Folhear (Página a Página) vs Todas as Páginas */}
          <div className="inline-flex rounded-xl bg-white p-1 border border-slate-200 shadow-2xs">
            <button
              id="book-mode-flip-btn"
              type="button"
              onClick={() => setViewStyle("flip")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewStyle === "flip"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <BookMarked className="w-3.5 h-3.5" />
              <span>Folhear Páginas</span>
            </button>

            <button
              id="book-mode-continuous-btn"
              type="button"
              onClick={() => setViewStyle("continuous")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewStyle === "continuous"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Todas as Páginas</span>
            </button>
          </div>

          {/* Botão de Narração */}
          <button
            id="book-narration-btn"
            type="button"
            onClick={isPlayingNarration ? onStopNarration : onPlayAll}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
              isPlayingNarration
                ? "bg-rose-500 text-white hover:bg-rose-600"
                : "bg-amber-600 text-white hover:bg-amber-700"
            }`}
          >
            {isPlayingNarration ? (
              <>
                <VolumeX className="w-4 h-4" />
                <span>Pausar Narração</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" />
                <span>Ouvir Livro Completo</span>
              </>
            )}
          </button>

          {/* Botão Regerar Ilustrações */}
          <button
            id="book-regen-images-btn"
            type="button"
            onClick={onRegenerateAllImages}
            disabled={isGeneratingAnyImage}
            title="Gerar novas ilustrações para todas as páginas do livro"
            className="px-3 py-2 bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isGeneratingAnyImage ? "animate-spin text-amber-600" : ""}`} />
            <span>{isGeneratingAnyImage ? "Pintando..." : "Regerar Ilustrações"}</span>
          </button>

          {/* Botão Imprimir / Salvar PDF */}
          <button
            id="book-print-btn"
            type="button"
            onClick={handlePrint}
            title="Imprimir livrinho ou salvar em PDF"
            className="px-3.5 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir Livro</span>
          </button>

          {/* Botão Compartilhar */}
          <button
            id="book-share-btn"
            type="button"
            onClick={handleShare}
            className="p-2 bg-white border border-amber-300 text-amber-800 hover:bg-amber-100 rounded-xl text-xs transition-colors cursor-pointer shadow-2xs"
            title="Copiar texto do livro"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODO 1: FOLHEAR PÁGINA POR PÁGINA (LEITOR INTERATIVO)     */}
      {/* ========================================================= */}
      {viewStyle === "flip" && (
        <div className="space-y-4">
          {/* Navegação de Páginas e Indicador */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white/90 border border-amber-200/80 rounded-2xl px-4 py-3 shadow-2xs print:hidden">
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Botão Capa */}
              <button
                type="button"
                onClick={() => setCurrentPage(0)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentPage === 0
                    ? "bg-amber-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-amber-50 hover:text-amber-900"
                }`}
              >
                📕 Capa
              </button>

              {/* Botões dos Capítulos */}
              {story.chapters.map((chapter) => (
                <button
                  key={chapter.chapter_number}
                  type="button"
                  onClick={() => setCurrentPage(chapter.chapter_number)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
                    currentPage === chapter.chapter_number
                      ? "bg-amber-600 text-white shadow-xs"
                      : "text-slate-600 hover:bg-amber-50 hover:text-amber-900"
                  }`}
                >
                  <span>Pág. {chapter.chapter_number}</span>
                  {currentPlayingChapter === chapter.chapter_number && (
                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                  )}
                </button>
              ))}

              {/* Botão Contracapa */}
              <button
                type="button"
                onClick={() => setCurrentPage(totalBookPages - 1)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentPage === totalBookPages - 1
                    ? "bg-amber-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-amber-50 hover:text-amber-900"
                }`}
              >
                ⭐ Contracapa & Moral
              </button>
            </div>

            {/* Setas Anterior / Próxima */}
            <div className="flex items-center gap-2">
              <button
                id="prev-page-btn"
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 0))}
                disabled={currentPage === 0}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Página Anterior</span>
              </button>

              <span className="text-xs font-bold text-amber-900 px-2 py-1 bg-amber-50 rounded-lg border border-amber-200/60 font-mono">
                {currentPage === 0
                  ? "Capa"
                  : currentPage === totalBookPages - 1
                  ? "Contracapa"
                  : `Página ${currentPage} de ${story.chapters.length}`}
              </span>

              <button
                id="next-page-btn"
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalBookPages - 1))}
                disabled={currentPage === totalBookPages - 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
              >
                <span className="hidden sm:inline">Próxima Página</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* MOLDURA DO LIVRO INFANTIL (ESTILO CAPA DURA COM ENCADERNAÇÃO E PÁGINAS CREME) */}
          <div
            id="book-main-frame"
            className="relative bg-[#F9F5EB] border-4 sm:border-8 border-[#5A3825] rounded-3xl p-4 sm:p-8 md:p-10 shadow-2xl transition-all overflow-hidden"
            style={{
              boxShadow: "0 20px 45px -10px rgba(50, 25, 10, 0.25), 0 0 0 1px rgba(255,255,255,0.3) inset",
            }}
          >
            {/* Efeito sutil de dobra central da lombada do livro */}
            <div className="hidden lg:block absolute inset-y-0 left-1/2 w-8 -ml-4 bg-gradient-to-r from-black/5 via-black/10 to-transparent pointer-events-none z-10" />

            {/* Fita marcadora de página suspensa */}
            <div className="absolute top-0 right-12 w-6 h-12 bg-gradient-to-b from-red-600 to-red-700 rounded-b-md shadow-md z-20 pointer-events-none print:hidden flex items-end justify-center pb-1">
              <span className="w-2 h-2 bg-yellow-400 rotate-45"></span>
            </div>

            {/* CONTEÚDO DA PÁGINA SELECIONADA */}

            {/* 1. CAPA DO LIVRO (PÁGINA 0) */}
            {currentPage === 0 && (
              <div className="max-w-3xl mx-auto py-6 sm:py-10 text-center animate-fadeIn">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100/90 border border-amber-300 text-amber-900 text-xs font-bold uppercase tracking-widest mb-6 shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Era uma vez... Um Livro Feito com Amor</span>
                </div>

                {/* Título Principal na Capa */}
                <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-[#3A2213] tracking-tight font-serif mb-4 leading-tight drop-shadow-xs">
                  {story.title}
                </h1>

                {/* Subtítulo / Sinopse na Capa */}
                <p className="text-base sm:text-xl italic text-[#5F4532] max-w-xl mx-auto mb-8 font-serif leading-relaxed">
                  "{story.synopsis}"
                </p>

                {/* Ilustração Destaque da Capa (Cena do Capítulo 1) */}
                <div className="relative max-w-md mx-auto mb-8 group">
                  <div className="relative rounded-2xl overflow-hidden border-4 border-white shadow-xl aspect-4/3 bg-amber-100">
                    {story.chapters[0]?.imageUrl ? (
                      <img
                        src={story.chapters[0].imageUrl}
                        alt={`Capa do livro: ${story.title}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                        onClick={() => setSelectedImageModal(story.chapters[0]?.imageUrl || null)}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-amber-800">
                        <Sparkles className="w-12 h-12 text-amber-500 animate-spin mb-3" />
                        <p className="text-sm font-semibold">Pintando a capa do livro...</p>
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-800 text-amber-50 text-[11px] font-bold px-3 py-1 rounded-full shadow-md whitespace-nowrap">
                    ⭐ Edição Ilustrada Completa
                  </div>
                </div>

                {/* Detalhes da Criação / Personagem */}
                <div className="inline-flex flex-wrap items-center justify-center gap-3 bg-amber-100/70 border border-amber-200/80 rounded-2xl px-5 py-3 text-xs text-amber-950 font-medium mb-8">
                  {formData?.characterName && (
                    <span className="flex items-center gap-1 font-bold text-amber-900">
                      <span>🧸 Personagem Principal:</span>
                      <span className="underline decoration-amber-400">{formData.characterName}</span>
                    </span>
                  )}
                  {formData?.theme && (
                    <span className="flex items-center gap-1">
                      <span>•</span>
                      <span>Tema: {formData.theme}</span>
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <span>•</span>
                    <span>3 Capítulos para Sonhar</span>
                  </span>
                </div>

                {/* Ações da Capa */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentPage(1)}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-700 hover:bg-amber-800 text-white font-black text-base shadow-lg hover:shadow-xl transition-all active:scale-95 cursor-pointer"
                  >
                    <BookOpen className="w-5 h-5" />
                    <span>Abrir Livro e Começar a Ler</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={isPlayingNarration ? onStopNarration : onPlayAll}
                    className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white hover:bg-amber-50 text-amber-950 font-bold text-sm border-2 border-amber-300 shadow-sm transition-all active:scale-95 cursor-pointer"
                  >
                    {isPlayingNarration ? (
                      <>
                        <VolumeX className="w-4 h-4 text-rose-600" />
                        <span>Pausar Narração</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4 text-amber-700" />
                        <span>Ouvir História com Voz Calma</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* 2. PÁGINAS DE CAPÍTULO (CAPÍTULOS 1, 2 e 3) */}
            {currentPage >= 1 && currentPage <= story.chapters.length && (
              (() => {
                const chapter = story.chapters[currentPage - 1];
                if (!chapter) return null;
                const { firstChar, rest } = getDropCap(chapter.story_text);
                const isThisChapterPlaying = currentPlayingChapter === chapter.chapter_number;

                return (
                  <div className="animate-fadeIn">
                    {/* Topo da Página do Livro */}
                    <div className="flex items-center justify-between border-b-2 border-amber-900/20 pb-3 mb-6">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#6B4E38]">
                        <span className="p-1 rounded-md bg-amber-200/80 text-amber-900">
                          <Sparkles className="w-3.5 h-3.5" />
                        </span>
                        <span>
                          Capítulo {chapter.chapter_number} de {story.chapters.length}
                        </span>
                      </div>

                      {/* Botão de Narração rápida deste capítulo */}
                      <button
                        type="button"
                        onClick={() =>
                          isThisChapterPlaying ? onStopNarration() : onPlayChapter(chapter.chapter_number)
                        }
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                          isThisChapterPlaying
                            ? "bg-rose-600 text-white animate-pulse"
                            : "bg-amber-100/90 text-amber-900 hover:bg-amber-200 border border-amber-300"
                        }`}
                      >
                        {isThisChapterPlaying ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5" />
                            <span>Pausar</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Ouvir este capítulo</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Diagramação Dupla de Livro Infantil (Ilustração em uma página + Texto na outra) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                      {/* PÁGINA ESQUERDA: ILUSTRAÇÃO ARTÍSTICA DA CENA */}
                      <div className="lg:col-span-6 flex flex-col items-center">
                        <div className="relative w-full rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-amber-100/80 aspect-4/3 group">
                          {chapter.imageUrl ? (
                            <>
                              <img
                                src={chapter.imageUrl}
                                alt={chapter.chapter_title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                                onClick={() => setSelectedImageModal(chapter.imageUrl || null)}
                              />
                              <button
                                type="button"
                                onClick={() => setSelectedImageModal(chapter.imageUrl || null)}
                                className="absolute bottom-2.5 right-2.5 p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                title="Expandir ilustração"
                              >
                                <Maximize2 className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-amber-800">
                              <Sparkles className="w-10 h-10 text-amber-500 animate-spin mb-2" />
                              <p className="text-xs font-semibold">
                                {chapter.isGeneratingImage
                                  ? "Pintando a cena deste capítulo com IA..."
                                  : "Ilustração mágica"}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Legenda lúdica da cena & botão de regerar imagem */}
                        <div className="w-full flex items-center justify-between mt-3 text-xs text-[#5C4533] px-1">
                          <span className="italic truncate pr-2">
                            "{chapter.scene_description}"
                          </span>
                          <button
                            type="button"
                            onClick={() => onRegenerateImage(chapter.chapter_number)}
                            disabled={chapter.isGeneratingImage}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 hover:text-amber-950 underline decoration-dotted cursor-pointer shrink-0 disabled:opacity-50"
                          >
                            <RotateCw className={`w-3 h-3 ${chapter.isGeneratingImage ? "animate-spin" : ""}`} />
                            <span>Pintar de novo</span>
                          </button>
                        </div>
                      </div>

                      {/* PÁGINA DIREITA: TEXTO DO CAPÍTULO COM TIPOGRAFIA DE LIVRO DE HISTÓRIA */}
                      <div className="lg:col-span-6 space-y-4">
                        <h2 className="text-2xl sm:text-3xl font-black text-[#2D1B10] font-serif leading-tight">
                          {chapter.chapter_title}
                        </h2>

                        {/* Parágrafo com Letra Capitular (Drop Cap) */}
                        <div className="text-base sm:text-lg text-[#3E291A] font-serif leading-relaxed sm:leading-loose">
                          <span className="float-left text-5xl sm:text-6xl font-black font-serif leading-none pr-3 pt-1 text-amber-800 select-none">
                            {firstChar}
                          </span>
                          <span>{rest}</span>
                        </div>

                        {/* Enfeite decorativo de rodapé de página de livro */}
                        <div className="pt-6 flex items-center justify-center gap-2 text-amber-700/60 select-none">
                          <span>❧</span>
                          <span className="w-12 h-[1px] bg-amber-900/20"></span>
                          <span>✦</span>
                          <span className="w-12 h-[1px] bg-amber-900/20"></span>
                          <span>❧</span>
                        </div>
                      </div>
                    </div>

                    {/* Rodapé da Página: Número da Página e Botões de Virar */}
                    <div className="mt-8 pt-4 border-t border-amber-900/20 flex items-center justify-between text-xs text-[#6B4E38]">
                      <button
                        type="button"
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 0))}
                        className="inline-flex items-center gap-1 font-bold text-amber-900 hover:text-amber-700 cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>{currentPage === 1 ? "Voltar à Capa" : `Capítulo ${currentPage - 1}`}</span>
                      </button>

                      <span className="font-serif font-bold text-sm tracking-wider text-[#3A2213]">
                        — Página {currentPage} —
                      </span>

                      <button
                        type="button"
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalBookPages - 1))}
                        className="inline-flex items-center gap-1 font-bold text-amber-900 hover:text-amber-700 cursor-pointer"
                      >
                        <span>
                          {currentPage === story.chapters.length ? "Ir para a Contracapa" : `Capítulo ${currentPage + 1}`}
                        </span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })()
            )}

            {/* 3. CONTRACAPA & MORAL DA HISTÓRIA (EPÍLOGO) */}
            {currentPage === totalBookPages - 1 && (
              <div className="max-w-2xl mx-auto py-6 text-center animate-fadeIn space-y-6">
                <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-xs uppercase tracking-wider border border-emerald-300">
                  <Star className="w-4 h-4 text-emerald-600 fill-emerald-500" />
                  <span>O Fim da História... e o Começo do Aprendizado</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-black text-[#2A180D] font-serif">
                  A Lição Deste Livro
                </h2>

                {/* Moldura Dourada da Moral da História */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-3xl p-6 sm:p-8 shadow-sm text-center relative overflow-hidden">
                  <div className="absolute top-2 right-3 text-amber-400 opacity-40 text-4xl select-none">✨</div>
                  <div className="flex justify-center mb-3">
                    <span className="p-2 rounded-2xl bg-amber-200/80 text-amber-900">
                      <Heart className="w-6 h-6 fill-amber-600 text-amber-600" />
                    </span>
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-amber-900 mb-2">
                    Mensagem para o Coraçãozinho da Criança
                  </h3>
                  <p className="text-lg sm:text-xl font-bold font-serif text-[#2B1B10] leading-relaxed">
                    "{story.moral_lesson_summary}"
                  </p>
                </div>

                {/* Perguntinhas para Conversar em Família */}
                <div className="bg-white/80 border border-amber-200/80 rounded-2xl p-5 text-left text-xs sm:text-sm text-[#4E3727] space-y-2">
                  <h4 className="font-bold text-[#2A180D] flex items-center gap-1.5 text-sm">
                    <HelpCircle className="w-4 h-4 text-amber-700" />
                    <span>Para Conversar com a Criança antes de Dormir:</span>
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 pl-1">
                    <li>O que você achou da atitude do personagem principal?</li>
                    <li>Como nós podemos praticar essa mesma lição amanhã?</li>
                    <li>Qual parte da história você mais gostou de imaginar?</li>
                  </ul>
                </div>

                {/* Dedicatória & Espaço de Registro do Leitor */}
                <div className="bg-amber-100/60 border border-dashed border-amber-300 rounded-2xl p-4 text-xs text-amber-950 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-left">
                    <Pencil className="w-4 h-4 text-amber-700 shrink-0" />
                    <div>
                      <span className="font-bold">Lido com muito carinho para: </span>
                      <input
                        type="text"
                        placeholder="Nome da criança..."
                        value={childName}
                        onChange={(e) => setChildName(e.target.value)}
                        className="bg-white border border-amber-300 rounded-lg px-2.5 py-1 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                  <span className="text-[11px] text-amber-800 italic">
                    {new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(new Date())}
                  </span>
                </div>

                {/* Botões de Ação Final */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setCurrentPage(0)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-amber-300 text-amber-900 hover:bg-amber-50 font-bold text-xs shadow-xs cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Voltar à Capa</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs shadow-md cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Imprimir Livrinho para Colorir</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODO 2: TODAS AS PÁGINAS (VISÃO DO LIVRO COMPLETO CONTÍNUO)*/}
      {/* ========================================================= */}
      {viewStyle === "continuous" && (
        <article
          id="book-continuous-mode"
          className="bg-[#F9F5EB] border-4 sm:border-8 border-[#5A3825] rounded-3xl p-6 sm:p-10 shadow-xl space-y-12 font-serif text-[#2B1B10] print:border-none print:shadow-none print:p-0 print:bg-white"
        >
          {/* Capa do Livro em Destaque */}
          <header className="text-center border-b-2 border-amber-900/20 pb-10">
            <div className="inline-block bg-amber-100 text-amber-900 text-xs font-sans font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
              ✨ Livro Infantil Ilustrado
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#2B1B10] uppercase my-2">
              {story.title}
            </h1>
            <p className="text-base sm:text-lg italic text-[#5F4532] max-w-xl mx-auto">
              "{story.synopsis}"
            </p>
          </header>

          {/* Páginas dos Capítulos */}
          <div className="space-y-12">
            {story.chapters.map((chapter) => {
              const { firstChar, rest } = getDropCap(chapter.story_text);
              const isThisChapterPlaying = currentPlayingChapter === chapter.chapter_number;

              return (
                <section
                  key={chapter.chapter_number}
                  id={`book-chapter-section-${chapter.chapter_number}`}
                  className={`border-b border-amber-900/20 pb-10 last:border-b-0 ${
                    isThisChapterPlaying ? "bg-amber-100/60 p-5 rounded-2xl -m-5 transition-all" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-sans font-bold uppercase tracking-widest text-amber-900">
                      Capítulo {chapter.chapter_number}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        isThisChapterPlaying ? onStopNarration() : onPlayChapter(chapter.chapter_number)
                      }
                      className="inline-flex items-center gap-1 text-xs font-sans font-bold text-amber-800 hover:text-amber-950 underline decoration-dotted cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{isThisChapterPlaying ? "Pausar" : "Ouvir Capítulo"}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    <div className="md:col-span-5">
                      <div className="relative rounded-2xl overflow-hidden border-4 border-white shadow-md aspect-4/3 bg-amber-100">
                        {chapter.imageUrl ? (
                          <img
                            src={chapter.imageUrl}
                            alt={chapter.chapter_title}
                            className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                            onClick={() => setSelectedImageModal(chapter.imageUrl || null)}
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-amber-800">
                            <Sparkles className="w-8 h-8 text-amber-500 animate-spin mb-2" />
                            <p className="text-xs">Pintando imagem...</p>
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] italic text-[#6B503B] mt-2">
                        "{chapter.scene_description}"
                      </p>
                    </div>

                    <div className="md:col-span-7 space-y-3">
                      <h3 className="text-xl sm:text-2xl font-bold text-[#2A180D]">
                        {chapter.chapter_title}
                      </h3>
                      <div className="text-base sm:text-lg text-[#3E291A] leading-relaxed">
                        <span className="float-left text-4xl sm:text-5xl font-black leading-none pr-2.5 pt-1 text-amber-800 select-none">
                          {firstChar}
                        </span>
                        <span>{rest}</span>
                      </div>
                    </div>
                  </div>
                </section>
              );
            })}
          </div>

          {/* Epílogo & Lição Final */}
          <footer className="pt-8 border-t-2 border-amber-900/20 text-center space-y-4">
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-100 text-amber-900 font-bold text-xs uppercase">
              <Heart className="w-3.5 h-3.5 fill-amber-600 text-amber-600" />
              <span>Moral da História</span>
            </div>
            <p className="text-xl font-bold italic text-[#2B1B10] max-w-xl mx-auto">
              "{story.moral_lesson_summary}"
            </p>
          </footer>
        </article>
      )}

      {/* Modal para Visualização em Alta Resolução da Ilustração */}
      {selectedImageModal && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedImageModal(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-[#F9F5EB] rounded-2xl overflow-hidden shadow-2xl p-2 border-4 border-amber-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImageModal(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition-colors cursor-pointer"
              title="Fechar"
            >
              ✕
            </button>
            <img
              src={selectedImageModal}
              alt="Ilustração em alta resolução"
              className="max-h-[82vh] w-auto mx-auto object-contain rounded-xl"
            />
            <div className="p-3 text-center flex items-center justify-center gap-3">
              <a
                href={selectedImageModal}
                download="ilustracao-livro-infantil.png"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Salvar Imagem em Alta Resolução</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
