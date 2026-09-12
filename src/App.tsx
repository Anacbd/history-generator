import React, { useState, useEffect, useRef } from "react";
import { Chapter, StoryFormData, StoryResponse, VoiceSettings } from "./types";
import { StoryForm } from "./components/StoryForm";
import { StoryboardCard } from "./components/StoryboardCard";
import { JornalzinhoView } from "./components/JornalzinhoView";
import { PythonCodeViewer } from "./components/PythonCodeViewer";
import { NarrationControlBar } from "./components/NarrationControlBar";
import {
  findBestVoice,
  getAvailablePortugueseVoices,
  getAcousticParameters,
} from "./utils/speechUtils";
import {
  Sparkles,
  BookOpen,
  Code2,
  Download,
  AlertCircle,
  HeartHandshake,
  Wand2,
  CheckCircle2,
  RotateCcw,
  Newspaper,
  LayoutGrid,
} from "lucide-react";

export default function App() {
  const [activeView, setActiveView] = useState<"interactive" | "python">("interactive");
  const [storyDisplayMode, setStoryDisplayMode] = useState<"jornalzinho" | "storyboard">("jornalzinho");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFormData, setLastFormData] = useState<StoryFormData | null>(null);
  const [story, setStory] = useState<StoryResponse | null>(null);

  // Narração e Vozes Naturais
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    gender: "female",
    pace: "storyteller",
    preferredVoiceURI: null,
  });
  const [isPlayingNarration, setIsPlayingNarration] = useState(false);
  const [currentPlayingChapter, setCurrentPlayingChapter] = useState<number | null>(null);
  const queueIndexRef = useRef<number>(0);
  const isCancelledRef = useRef<boolean>(false);

  // Limpa áudio ao desmontar ou trocar de aba
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const stopNarration = () => {
    isCancelledRef.current = true;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingNarration(false);
    setCurrentPlayingChapter(null);
  };

  const playSingleChapter = (chapterNumber: number) => {
    if (!story || typeof window === "undefined" || !("speechSynthesis" in window)) return;

    stopNarration();
    isCancelledRef.current = false;

    const chapter = story.chapters.find((c) => c.chapter_number === chapterNumber);
    if (!chapter) return;

    const textToSpeak = `${chapter.chapter_title}. ${chapter.story_text}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = "pt-BR";

    const voices = getAvailablePortugueseVoices();
    const voice = findBestVoice(voices, voiceSettings.gender, voiceSettings.preferredVoiceURI);
    if (voice) {
      utterance.voice = voice;
    }

    const { rate, pitch } = getAcousticParameters(
      voiceSettings,
      Boolean(voice?.name.toLowerCase().includes("natural") || voice?.name.toLowerCase().includes("google"))
    );
    utterance.rate = rate;
    utterance.pitch = pitch;

    utterance.onstart = () => {
      setIsPlayingNarration(true);
      setCurrentPlayingChapter(chapterNumber);
    };

    utterance.onend = () => {
      setIsPlayingNarration(false);
      setCurrentPlayingChapter(null);
    };

    utterance.onerror = () => {
      setIsPlayingNarration(false);
      setCurrentPlayingChapter(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const playFullStory = () => {
    if (!story || story.chapters.length === 0 || typeof window === "undefined" || !("speechSynthesis" in window)) return;

    stopNarration();
    isCancelledRef.current = false;
    setIsPlayingNarration(true);
    setCurrentPlayingChapter(-1);
    queueIndexRef.current = 0;

    const voices = getAvailablePortugueseVoices();
    const voice = findBestVoice(voices, voiceSettings.gender, voiceSettings.preferredVoiceURI);
    const { rate, pitch } = getAcousticParameters(
      voiceSettings,
      Boolean(voice?.name.toLowerCase().includes("natural") || voice?.name.toLowerCase().includes("google"))
    );

    const playNext = (index: number) => {
      if (isCancelledRef.current) return;

      if (index >= story.chapters.length) {
        // Encerramento carinhoso com a lição moral
        const closing = new SpeechSynthesisUtterance(
          `E assim termina a nossa história. A lição de hoje é: ${story.moral_lesson_summary}`
        );
        closing.lang = "pt-BR";
        if (voice) closing.voice = voice;
        closing.rate = rate;
        closing.pitch = pitch;

        closing.onend = () => {
          setIsPlayingNarration(false);
          setCurrentPlayingChapter(null);
        };
        closing.onerror = () => {
          setIsPlayingNarration(false);
          setCurrentPlayingChapter(null);
        };

        window.speechSynthesis.speak(closing);
        return;
      }

      const chapter = story.chapters[index];
      setCurrentPlayingChapter(chapter.chapter_number);

      const utterance = new SpeechSynthesisUtterance(
        `Capítulo ${chapter.chapter_number}: ${chapter.chapter_title}. ${chapter.story_text}`
      );
      utterance.lang = "pt-BR";
      if (voice) utterance.voice = voice;
      utterance.rate = rate;
      utterance.pitch = pitch;

      utterance.onend = () => {
        if (!isCancelledRef.current) {
          // Pausa suave de 800ms entre capítulos
          setTimeout(() => {
            if (!isCancelledRef.current) {
              playNext(index + 1);
            }
          }, 800);
        }
      };

      utterance.onerror = () => {
        setIsPlayingNarration(false);
        setCurrentPlayingChapter(null);
      };

      window.speechSynthesis.speak(utterance);
    };

    playNext(0);
  };

  const generateImageForChapter = async (
    chapterNumber: number,
    prompt: string,
    visualStyle?: string,
    customSeed?: number
  ) => {
    // Marca capítulo em estado de carregamento de imagem
    setStory((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        chapters: prev.chapters.map((c) =>
          c.chapter_number === chapterNumber
            ? { ...c, isGeneratingImage: true, imageError: undefined }
            : c
        ),
      };
    });

    try {
      const seed = customSeed || Math.floor(Math.random() * 899999) + 100000;
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          visualStyle: visualStyle || "Aquarela mágica de livro infantil",
          seed,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.imageUrl) {
        throw new Error(data.error || "Não foi possível gerar a imagem");
      }

      setStory((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          chapters: prev.chapters.map((c) =>
            c.chapter_number === chapterNumber
              ? { ...c, imageUrl: data.imageUrl, isGeneratingImage: false }
              : c
          ),
        };
      });
    } catch (err: any) {
      console.warn(`[ImageGen] Erro no capítulo ${chapterNumber}:`, err?.message);
      setStory((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          chapters: prev.chapters.map((c) =>
            c.chapter_number === chapterNumber
              ? { ...c, isGeneratingImage: false, imageError: err?.message }
              : c
          ),
        };
      });
    }
  };

  const handleRegenerateSingleImage = (chapterNumber: number) => {
    if (!story) return;
    const chapter = story.chapters.find((c) => c.chapter_number === chapterNumber);
    if (!chapter) return;
    generateImageForChapter(
      chapterNumber,
      chapter.image_prompt,
      lastFormData?.visualStyle,
      Math.floor(Math.random() * 899999) + 100000
    );
  };

  const handleRegenerateAllImages = () => {
    if (!story) return;
    story.chapters.forEach((chapter) => {
      generateImageForChapter(
        chapter.chapter_number,
        chapter.image_prompt,
        lastFormData?.visualStyle,
        Math.floor(Math.random() * 899999) + 100000
      );
    });
  };

  const handleGenerateStory = async (formData: StoryFormData) => {
    stopNarration();
    setIsLoading(true);
    setError(null);
    setLastFormData(formData);

    try {
      const response = await fetch("/api/generate-story", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Não foi possível gerar a história.");
      }

      setStory(data);

      // Geração automática das imagens para os 3 capítulos (se habilitado)
      if (formData.autoGenerateImages !== false && Array.isArray(data.chapters)) {
        data.chapters.forEach((cap: Chapter) => {
          generateImageForChapter(
            cap.chapter_number,
            cap.image_prompt,
            formData.visualStyle
          );
        });
      }

      // Rola suavemente até os resultados
      setTimeout(() => {
        const resultsEl = document.getElementById("storyboard-results-section");
        resultsEl?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Ocorreu um erro ao conectar com o Gemini.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadMarkdown = () => {
    if (!story) return;

    let content = `# ${story.title}\n\n`;
    content += `> ${story.synopsis}\n\n`;
    content += `**🌟 Lição Moral:** ${story.moral_lesson_summary}\n\n`;
    content += `**🎨 Guia Visual da Personagem:** ${story.character_visual_guide}\n\n`;
    content += `---\n\n`;

    story.chapters.forEach((cap) => {
      content += `## Capítulo ${cap.chapter_number}: ${cap.chapter_title}\n\n`;
      content += `${cap.story_text}\n\n`;
      content += `*Cena:* ${cap.scene_description}\n\n`;
      content += `**Prompt para Geração de Imagem (Midjourney / DALL-E):**\n`;
      content += `\`\`\`\n${cap.image_prompt}\n\`\`\`\n\n`;
      content += `---\n\n`;
    });

    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${story.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-amber-500 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-extrabold text-slate-800 tracking-tight leading-tight">
                Contos & Storyboard
              </h1>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Gerador de Histórias Infantis com IA do Gemini
              </p>
            </div>
          </div>

          {/* Navigation View Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              id="tab-interactive-app"
              onClick={() => setActiveView("interactive")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeView === "interactive"
                  ? "bg-white text-indigo-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Testar no Navegador</span>
            </button>

            <button
              id="tab-python-code"
              onClick={() => setActiveView("python")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeView === "python"
                  ? "bg-white text-emerald-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>Código Python (Streamlit)</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === "interactive" ? (
          <div className="space-y-8">
            {/* Story Creator Form */}
            <StoryForm onSubmit={handleGenerateStory} isLoading={isLoading} />

            {/* Error Message */}
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm shadow-xs">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-rose-900">Aviso da geração</p>
                    <p className="text-rose-700 mt-0.5">{error}</p>
                  </div>
                </div>

                {lastFormData && (
                  <button
                    id="retry-generate-btn"
                    onClick={() => handleGenerateStory(lastFormData)}
                    disabled={isLoading}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-semibold text-xs sm:text-sm shadow-xs transition-all shrink-0 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Tentar Novamente</span>
                  </button>
                )}
              </div>
            )}

            {/* Loading Indicator with Animated Storybook Elements */}
            {isLoading && (
              <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center shadow-xs">
                <div className="w-16 h-16 rounded-full bg-indigo-50 border border-indigo-100 mx-auto flex items-center justify-center text-indigo-600 mb-4 animate-bounce">
                  <Wand2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">
                  Escrevendo os 3 capítulos e desenhando o storyboard...
                </h3>
                <p className="text-slate-500 text-sm max-w-md mx-auto mt-2">
                  A IA do Gemini está estruturando a narrativa infantil carinhosa e formulando os prompts em inglês otimizados para Midjourney e DALL-E.
                </p>
              </div>
            )}

            {/* Storyboard Results */}
            {story && !isLoading && (
              <div id="storyboard-results-section" className="space-y-8 pt-4">
                {/* Story Overview Header Card */}
                <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-3 max-w-3xl">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>História Pronta com 3 Capítulos</span>
                      </div>

                      <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white font-serif">
                        {story.title}
                      </h2>

                      <p className="text-slate-200 text-base leading-relaxed italic">
                        "{story.synopsis}"
                      </p>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
                        <div className="flex items-center gap-2 text-xs text-amber-200 bg-white/10 px-3.5 py-2 rounded-xl backdrop-blur-xs">
                          <HeartHandshake className="w-4 h-4 text-amber-300 shrink-0" />
                          <span><strong>Lição Moral:</strong> {story.moral_lesson_summary}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-row md:flex-col gap-2 shrink-0">
                      <button
                        id="download-story-btn"
                        onClick={handleDownloadMarkdown}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 active:scale-95 font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
                      >
                        <Download className="w-4 h-4 text-indigo-600" />
                        <span>Baixar Livro (.md)</span>
                      </button>

                      <button
                        onClick={() => {
                          window.print();
                        }}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm backdrop-blur-xs transition-colors cursor-pointer"
                      >
                        <span>Imprimir / PDF</span>
                      </button>
                    </div>
                  </div>

                  {/* Character consistency banner */}
                  <div className="mt-6 pt-6 border-t border-white/10 text-xs text-slate-300 flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="font-semibold text-amber-300">
                      🎨 Consistência da Personagem nos Prompts:
                    </span>
                    <span className="text-slate-200">{story.character_visual_guide}</span>
                  </div>
                </div>

                {/* Barra de Controle de Narração com Voz Natural (Feminina / Masculina) */}
                <NarrationControlBar
                  settings={voiceSettings}
                  onSettingsChange={setVoiceSettings}
                  chapters={story.chapters}
                  currentPlayingChapter={currentPlayingChapter}
                  onPlayChapter={playSingleChapter}
                  onPlayAll={playFullStory}
                  onStop={stopNarration}
                  isPlaying={isPlayingNarration}
                />

                {/* Seletor de Modo de Exibição: Jornalzinho Infantil vs. Storyboard & Prompts */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                  <div className="flex items-center gap-2">
                    <button
                      id="view-mode-jornalzinho-btn"
                      onClick={() => setStoryDisplayMode("jornalzinho")}
                      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                        storyDisplayMode === "jornalzinho"
                          ? "bg-amber-600 text-white shadow-sm ring-2 ring-amber-300"
                          : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                      }`}
                    >
                      <Newspaper className="w-4 h-4" />
                      <span>Modo Jornalzinho Infantil</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                        storyDisplayMode === "jornalzinho" ? "bg-amber-700 text-amber-100" : "bg-amber-100 text-amber-800"
                      }`}>
                        Novo
                      </span>
                    </button>

                    <button
                      id="view-mode-storyboard-btn"
                      onClick={() => setStoryDisplayMode("storyboard")}
                      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                        storyDisplayMode === "storyboard"
                          ? "bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300"
                          : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                      }`}
                    >
                      <LayoutGrid className="w-4 h-4" />
                      <span>Storyboard & Prompts IA</span>
                    </button>
                  </div>

                  <span className="text-xs text-slate-500">
                    {storyDisplayMode === "jornalzinho"
                      ? "📰 Formato jornalzinho diagramado com ilustrações automáticas"
                      : "🎬 3 Capítulos individuais com prompts para Midjourney e DALL-E"}
                  </span>
                </div>

                {/* Exibição condicional de acordo com o modo selecionado */}
                {storyDisplayMode === "jornalzinho" ? (
                  <JornalzinhoView
                    story={story}
                    isPlayingNarration={isPlayingNarration}
                    currentPlayingChapter={currentPlayingChapter}
                    voiceSettings={voiceSettings}
                    onPlayAll={playFullStory}
                    onStopNarration={stopNarration}
                    onRegenerateImage={handleRegenerateSingleImage}
                    onRegenerateAllImages={handleRegenerateAllImages}
                    isGeneratingAnyImage={story.chapters.some((c) => c.isGeneratingImage)}
                  />
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-slate-800">
                        Storyboard: 3 Capítulos Ilustrados
                      </h3>
                      <button
                        onClick={handleRegenerateAllImages}
                        disabled={story.chapters.some((c) => c.isGeneratingImage)}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <RotateCcw className={`w-3.5 h-3.5 ${story.chapters.some((c) => c.isGeneratingImage) ? "animate-spin" : ""}`} />
                        <span>Regerar Todas as Imagens</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {story.chapters.map((chapter) => (
                        <StoryboardCard
                          key={chapter.chapter_number}
                          chapter={chapter}
                          characterVisualGuide={story.character_visual_guide}
                          totalChapters={story.chapters.length}
                          isPlayingThisChapter={currentPlayingChapter === chapter.chapter_number}
                          onPlayThisChapter={() => playSingleChapter(chapter.chapter_number)}
                          onStopThisChapter={stopNarration}
                          voiceGenderLabel={voiceSettings.gender === "female" ? "Feminina Suave" : "Masculina Serena"}
                          onRegenerateImage={() => handleRegenerateSingleImage(chapter.chapter_number)}
                        />
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        ) : (
          /* Python Streamlit Code Viewer */
          <PythonCodeViewer />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Integrado com a API oficial do Google Gemini e exportação para Streamlit</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveView("python")}
              className="hover:text-indigo-600 font-medium transition-colors"
            >
              Ver código em Python
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveView("interactive")}
              className="hover:text-indigo-600 font-medium transition-colors"
            >
              Gerar história interativa
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
