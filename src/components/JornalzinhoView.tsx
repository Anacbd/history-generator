import React, { useState } from "react";
import { StoryResponse, VoiceSettings } from "../types";
import {
  Printer,
  Volume2,
  VolumeX,
  RotateCw,
  Sparkles,
  Heart,
  BookOpen,
  Share2,
  Check,
  Image as ImageIcon,
  ExternalLink,
} from "lucide-react";

interface JornalzinhoViewProps {
  story: StoryResponse;
  isPlayingNarration: boolean;
  currentPlayingChapter: number | null;
  voiceSettings: VoiceSettings;
  onPlayAll: () => void;
  onStopNarration: () => void;
  onRegenerateImage: (chapterNumber: number) => void;
  onRegenerateAllImages: () => void;
  isGeneratingAnyImage: boolean;
}

export const JornalzinhoView: React.FC<JornalzinhoViewProps> = ({
  story,
  isPlayingNarration,
  currentPlayingChapter,
  voiceSettings,
  onPlayAll,
  onStopNarration,
  onRegenerateImage,
  onRegenerateAllImages,
  isGeneratingAnyImage,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedImageModal, setSelectedImageModal] = useState<string | null>(null);

  const formattedDate = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const text = `🗞️ O DIÁRIO ENCANTADO - Edição Especial\n\n"${story.title}"\n\n${story.synopsis}\n\nLição do Dia: ${story.moral_lesson_summary}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="w-full">
      {/* Barra de Ações Superior do Jornalzinho */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 print:hidden bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-200/80 text-amber-900 text-lg">
            🗞️
          </span>
          <div>
            <h4 className="text-sm font-bold text-amber-950">Formato Jornalzinho das Crianças</h4>
            <p className="text-xs text-amber-800">
              Edição clássica diagramada com ilustrações automáticas, colunas e lição do dia.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Botão de Narração */}
          <button
            id="jornalzinho-narration-btn"
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
                <span>Ouvir Jornal Falado ({voiceSettings.gender === "female" ? "Voz Doce" : "Voz Serena"})</span>
              </>
            )}
          </button>

          {/* Botão Regerar Ilustrações */}
          <button
            id="jornalzinho-regen-images-btn"
            onClick={onRegenerateAllImages}
            disabled={isGeneratingAnyImage}
            title="Gerar novas ilustrações para todos os capítulos"
            className="px-3 py-2 bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isGeneratingAnyImage ? "animate-spin text-amber-600" : ""}`} />
            <span>{isGeneratingAnyImage ? "Gerando..." : "Regerar Ilustrações"}</span>
          </button>

          {/* Botão Imprimir / PDF */}
          <button
            id="jornalzinho-print-btn"
            onClick={handlePrint}
            title="Imprimir jornalzinho ou salvar como PDF"
            className="px-3.5 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir / PDF</span>
          </button>

          {/* Botão Compartilhar */}
          <button
            id="jornalzinho-share-btn"
            onClick={handleShare}
            className="p-2 bg-white border border-amber-300 text-amber-800 hover:bg-amber-100 rounded-xl text-xs transition-colors cursor-pointer"
            title="Copiar texto do jornalzinho"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* PÁGINA DO JORNALZINHO (ESTILO IMPRESSÃO CLÁSSICA E RETRÔ DE JORNAL INFANTIL) */}
      <article
        id="jornalzinho-printable-page"
        className="bg-[#FCF9F2] text-[#24211E] border-2 border-[#D8CEBA] rounded-2xl p-6 sm:p-10 shadow-md relative overflow-hidden font-serif print:border-none print:shadow-none print:p-0 print:bg-white"
        style={{
          boxShadow: "0 4px 20px -2px rgba(92, 70, 41, 0.08), 0 2px 6px -1px rgba(92, 70, 41, 0.04)",
        }}
      >
        {/* Topo do Jornal: Faixa de Metadados */}
        <div className="border-b-2 border-[#24211E] pb-2 mb-3">
          <div className="flex flex-wrap items-center justify-between text-xs font-mono uppercase tracking-widest text-[#5C5346] gap-2">
            <span>✨ Edição Extraordinária Infantil • Ano I • Nº 1</span>
            <span className="capitalize">{formattedDate}</span>
            <span>Preço: 1 Abraço Quentinho</span>
          </div>
        </div>

        {/* Cabeçalho do Jornal (Masthead) */}
        <header className="text-center py-4 border-b-4 border-double border-[#24211E] mb-6">
          <div className="flex items-center justify-center gap-3 mb-1">
            <span className="h-[2px] w-12 bg-[#24211E]"></span>
            <span className="text-xs uppercase tracking-[0.3em] font-sans font-bold text-[#7A6E5C]">
              O Semanário dos Sonhos e das Crianças
            </span>
            <span className="h-[2px] w-12 bg-[#24211E]"></span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-[#1A1815] uppercase my-2 drop-shadow-xs">
            O Diário Encantado
          </h1>

          <p className="text-xs sm:text-sm italic text-[#5C5346] max-w-xl mx-auto">
            "Notícias do Reino da Imaginação • Histórias que aquecem o coração e ensinam a crescer"
          </p>
        </header>

        {/* Manchete Principal (Headline) */}
        <section className="mb-8 border-b-2 border-[#E2D8C3] pb-6">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-block bg-[#EFE6D1] text-[#614E32] text-xs font-sans font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3">
              Grande Acontecimento do Dia
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#1E1B18] leading-tight mb-3">
              {story.title}
            </h2>
            <p className="text-base sm:text-lg italic text-[#4A4337] leading-relaxed">
              "{story.synopsis}"
            </p>
          </div>
        </section>

        {/* Layout do Conteúdo em Grade de Jornal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Coluna Principal das Matérias (8 colunas) */}
          <div className="lg:col-span-8 space-y-8">
            {story.chapters.map((chapter) => (
              <section
                key={chapter.chapter_number}
                id={`jornalzinho-chapter-${chapter.chapter_number}`}
                className={`border-b border-[#D8CEBA] pb-7 last:border-b-0 ${
                  currentPlayingChapter === chapter.chapter_number
                    ? "bg-[#F3ECD8]/60 p-4 rounded-xl -m-4 transition-all"
                    : ""
                }`}
              >
                {/* Título da Notícia / Capítulo */}
                <div className="flex items-baseline justify-between gap-3 mb-3">
                  <h3 className="text-xl sm:text-2xl font-bold text-[#1F1C18]">
                    <span className="font-sans text-xs uppercase bg-[#D8CEBA] text-[#3D3528] px-2 py-0.5 rounded-sm mr-2 font-semibold tracking-wider align-middle">
                      Ato {chapter.chapter_number}
                    </span>
                    {chapter.chapter_title}
                  </h3>
                  {currentPlayingChapter === chapter.chapter_number && (
                    <span className="text-xs font-sans font-semibold text-amber-700 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md shrink-0 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                      Lendo agora
                    </span>
                  )}
                </div>

                {/* Bloco de Imagem da Notícia (Ilustração do Jornal) */}
                <div className="my-4">
                  {chapter.imageUrl ? (
                    <div className="bg-[#EFE6D1] border border-[#D1C4AB] p-2 rounded-xl shadow-xs">
                      <div className="relative group overflow-hidden rounded-lg">
                        <img
                          src={chapter.imageUrl}
                          alt={chapter.scene_description}
                          referrerPolicy="no-referrer"
                          className="w-full h-auto max-h-[380px] object-cover rounded-lg cursor-pointer transition-transform duration-300 group-hover:scale-[1.01]"
                          onClick={() => chapter.imageUrl && setSelectedImageModal(chapter.imageUrl)}
                        />
                        <button
                          onClick={() => onRegenerateImage(chapter.chapter_number)}
                          disabled={chapter.isGeneratingImage}
                          title="Regerar ilustração com outro estilo"
                          className="absolute bottom-3 right-3 bg-black/70 hover:bg-black/90 text-white text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1 backdrop-blur-xs transition-opacity opacity-0 group-hover:opacity-100 cursor-pointer print:hidden"
                        >
                          <RotateCw className={`w-3 h-3 ${chapter.isGeneratingImage ? "animate-spin" : ""}`} />
                          <span>Mudar Ilustração</span>
                        </button>
                      </div>
                      <p className="text-xs italic text-[#5C5346] mt-2 px-1 text-center font-serif">
                        <span className="font-bold not-italic font-sans text-[10px] uppercase tracking-wider text-[#7A6E5C] mr-1.5">
                          Ilustração Oficial:
                        </span>
                        {chapter.scene_description}
                      </p>
                    </div>
                  ) : chapter.isGeneratingImage ? (
                    <div className="h-56 bg-[#EFE6D1]/80 border-2 border-dashed border-[#D1C4AB] rounded-xl flex flex-col items-center justify-center text-center p-4">
                      <RotateCw className="w-7 h-7 text-[#7A6E5C] animate-spin mb-2" />
                      <p className="text-sm font-sans font-semibold text-[#4A4337]">
                        Pintando a ilustração do Capítulo {chapter.chapter_number}...
                      </p>
                      <p className="text-xs text-[#7A6E5C] mt-1 font-sans">
                        Criando arte personalizada para o jornalzinho
                      </p>
                    </div>
                  ) : (
                    <div className="bg-[#EFE6D1]/50 border border-[#D1C4AB] p-4 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-[#5C5346]">
                        <ImageIcon className="w-4 h-4 text-[#7A6E5C]" />
                        <span>Ilustração não carregada.</span>
                      </div>
                      <button
                        onClick={() => onRegenerateImage(chapter.chapter_number)}
                        className="text-xs bg-[#D8CEBA] hover:bg-[#C8BC9E] text-[#24211E] font-sans font-semibold px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                      >
                        Gerar Ilustração
                      </button>
                    </div>
                  )}
                </div>

                {/* Texto da Matéria com Capitular Estilo Jornal */}
                <div className="text-[#2B2723] text-base leading-relaxed text-justify space-y-3">
                  <p className="first-letter:float-left first-letter:text-4xl sm:first-letter:text-5xl first-letter:font-bold first-letter:text-[#1A1815] first-letter:mr-3 first-letter:leading-none first-letter:font-serif">
                    {chapter.story_text}
                  </p>
                </div>
              </section>
            ))}
          </div>

          {/* Coluna Lateral de Jornal (4 colunas) */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Box 1: O Editorial / A Lição do Dia */}
            <div className="bg-[#EFE7D2] border-2 border-[#D1C4AB] p-5 rounded-2xl relative overflow-hidden">
              <div className="flex items-center gap-2 border-b border-[#D1C4AB] pb-2 mb-3">
                <Heart className="w-4 h-4 text-amber-800" />
                <h4 className="font-sans text-xs uppercase tracking-widest font-black text-[#5C4A2B]">
                  Editorial do Dia
                </h4>
              </div>
              <h5 className="font-bold text-lg text-[#241F18] mb-2 font-serif">
                A Grande Lição desta Aventura
              </h5>
              <p className="text-sm italic leading-relaxed text-[#3B3428] bg-white/70 p-3.5 rounded-xl border border-[#D8CEBA]">
                "{story.moral_lesson_summary}"
              </p>
              <p className="text-xs text-[#6B5E4A] mt-3 font-sans leading-normal">
                ✍️ <em>"Histórias bem contadas ensinam o coração a ter asas e a mente a cultivar bondade."</em>
              </p>
            </div>

            {/* Box 2: Ficha da Personagem Principal */}
            <div className="border border-[#D8CEBA] bg-[#FDFBF7] p-5 rounded-2xl">
              <div className="flex items-center gap-2 border-b border-[#D8CEBA] pb-2 mb-3">
                <BookOpen className="w-4 h-4 text-[#5C5346]" />
                <h4 className="font-sans text-xs uppercase tracking-widest font-bold text-[#5C5346]">
                  Perfil do Protagonista
                </h4>
              </div>
              <div className="text-xs font-sans space-y-2 text-[#474034]">
                <p>
                  <strong className="text-[#1F1C18]">Visual & Identidade:</strong>
                </p>
                <p className="bg-[#EFE7D2]/60 p-2.5 rounded-lg border border-[#D8CEBA]/60 leading-relaxed font-serif text-sm">
                  {story.character_visual_guide}
                </p>
              </div>
            </div>

            {/* Box 3: Dica Divertida para Pais e Crianças */}
            <div className="border border-dashed border-[#B8A88E] bg-[#FAF5E8] p-5 rounded-2xl">
              <h4 className="font-sans text-xs uppercase tracking-widest font-bold text-[#6E5D3E] mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Dica da Redação Mirim
              </h4>
              <p className="text-xs text-[#52493A] leading-relaxed font-sans">
                Depois de ler o jornalzinho, que tal perguntar à criança qual foi o momento mais corajoso da personagem? Você também pode usar os botões no topo para imprimir e montar um mural no quarto!
              </p>
            </div>

            {/* Box 4: Informações de Impressão */}
            <div className="text-center p-4 border-t border-[#D8CEBA] text-xs text-[#7A6E5C] font-mono">
              <p>IMPRESSÃO AUTORIZADA PARA TODOS OS LARES</p>
              <p className="text-[10px] mt-1 text-[#8C806C]">
                Criado com inteligência artificial e muito afeto.
              </p>
            </div>
          </aside>
        </div>

        {/* Rodapé do Jornal */}
        <footer className="mt-10 pt-4 border-t-2 border-[#24211E] flex flex-wrap items-center justify-between text-xs text-[#6B5E4A] font-sans gap-2">
          <span>🗞️ Gazeta Infantil — Publicação Lúdica Familiar</span>
          <span>© Diário Encantado • Histórias Infantis Livres</span>
          <span>Compartilhe carinho e leitura</span>
        </footer>
      </article>

      {/* Modal para Visualizar Imagem Ampliada */}
      {selectedImageModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setSelectedImageModal(null)}
        >
          <div className="max-w-3xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl p-2 relative">
            <img
              src={selectedImageModal}
              alt="Ilustração da história ampliada"
              referrerPolicy="no-referrer"
              className="w-full h-auto rounded-xl object-contain max-h-[85vh]"
            />
            <div className="p-3 text-center">
              <p className="text-xs text-slate-500">Clique em qualquer lugar para fechar</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
