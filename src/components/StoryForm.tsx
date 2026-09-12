import React, { useState } from "react";
import { StoryFormData } from "../types";
import { Sparkles, Lightbulb, Wand2, BookHeart } from "lucide-react";

interface StoryFormProps {
  onSubmit: (data: StoryFormData) => void;
  isLoading: boolean;
}

const PRESET_IDEAS = [
  {
    theme: "Amizade e solidariedade na floresta",
    character: "Pipoca, a pequena raposinha de cachecol amarelo",
    moral: "Quando ajudamos um amigo em dificuldade, nosso coração fica quentinho e mais forte.",
    style: "Whimsical watercolor children's book illustration, soft pastel tones, cozy warm lighting",
  },
  {
    theme: "Coragem para vencer o medo do escuro",
    character: "Benício e sua lanterna mágica em forma de estrela",
    moral: "O medo diminui quando descobrimos que as sombras são apenas amigos esperando para brincar.",
    style: "3D animated movie style (Pixar/Disney inspired), rich textures, vibrant warm colors",
  },
  {
    theme: "Curiosidade, descobertas e o amor pela natureza",
    character: "Luna, a garotinha botânica de botas verdes",
    moral: "Cuidar da menor sementinha é cuidar do futuro de todo o planeta.",
    style: "Vintage storybook illustration, delicate ink outlines, gouache painting, textured paper",
  },
];

export const StoryForm: React.FC<StoryFormProps> = ({ onSubmit, isLoading }) => {
  const [theme, setTheme] = useState("");
  const [characterName, setCharacterName] = useState("");
  const [moralLesson, setMoralLesson] = useState("");
  const [visualStyle, setVisualStyle] = useState(
    "Whimsical watercolor children's book illustration, soft pastel tones, cozy warm lighting"
  );
  const [autoGenerateImages, setAutoGenerateImages] = useState(true);

  const handleSelectPreset = (preset: typeof PRESET_IDEAS[0]) => {
    setTheme(preset.theme);
    setCharacterName(preset.character);
    setMoralLesson(preset.moral);
    setVisualStyle(preset.style);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!theme.trim() || !characterName.trim() || !moralLesson.trim()) {
      return;
    }
    onSubmit({
      theme: theme.trim(),
      characterName: characterName.trim(),
      moralLesson: moralLesson.trim(),
      visualStyle,
      autoGenerateImages,
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 mb-2">
            <BookHeart className="w-3.5 h-3.5 text-amber-600" />
            <span>Fábrica de Histórias Infantis</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
            Criar Nova História & Storyboard
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Preencha os campos abaixo para a IA do Gemini compor os 3 capítulos e os prompts para imagem.
          </p>
        </div>

        {/* Preset suggestions dropdown / buttons */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1 text-xs font-semibold text-slate-500">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>Sugestões rápidas:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESET_IDEAS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                id={`preset-idea-btn-${idx}`}
                onClick={() => handleSelectPreset(preset)}
                className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 text-slate-700 hover:text-indigo-700 transition-colors font-medium text-left"
              >
                {preset.character.split(",")[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. Tema da História */}
          <div>
            <label htmlFor="theme-input" className="block text-sm font-semibold text-slate-800 mb-1.5">
              1. Tema da História <span className="text-rose-500">*</span>
            </label>
            <input
              id="theme-input"
              type="text"
              required
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="Ex: Amizade sincera, Coragem nas tempestades, A magia do perdão..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-slate-800 text-sm placeholder:text-slate-400 outline-hidden transition-all"
            />
            <p className="text-xs text-slate-400 mt-1">
              O coração e o cenário temático da narrativa.
            </p>
          </div>

          {/* 2. Nome da Personagem Principal */}
          <div>
            <label htmlFor="character-input" className="block text-sm font-semibold text-slate-800 mb-1.5">
              2. Nome da Personagem Principal <span className="text-rose-500">*</span>
            </label>
            <input
              id="character-input"
              type="text"
              required
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
              placeholder="Ex: Clara, Pipoca a raposinha, Benício, O robozinho Zico..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-slate-800 text-sm placeholder:text-slate-400 outline-hidden transition-all"
            />
            <p className="text-xs text-slate-400 mt-1">
              Dica: você pode adicionar uma característica marcante (ex: "com capa vermelha").
            </p>
          </div>
        </div>

        {/* 3. Lição Moral */}
        <div>
          <label htmlFor="moral-input" className="block text-sm font-semibold text-slate-800 mb-1.5">
            3. Lição Moral a Transmitir <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="moral-input"
            required
            rows={2}
            value={moralLesson}
            onChange={(e) => setMoralLesson(e.target.value)}
            placeholder="Ex: Ajudar o próximo sem esperar nada em troca nos torna mais felizes; A coragem não é a ausência de medo, mas sim tentar mesmo assim..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-slate-800 text-sm placeholder:text-slate-400 outline-hidden transition-all resize-none"
          />
          <p className="text-xs text-slate-400 mt-1">
            A mensagem de aprendizado e afeto que o final do 3º capítulo celebrará.
          </p>
        </div>

        {/* Estilo Visual das Imagens (Configuração Extra para Midjourney/DALL-E) */}
        <div>
          <label htmlFor="visual-style-select" className="block text-sm font-semibold text-slate-800 mb-1.5">
            🎨 Estilo Artístico para os Prompts de Imagem (Midjourney / DALL-E)
          </label>
          <select
            id="visual-style-select"
            value={visualStyle}
            onChange={(e) => setVisualStyle(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-slate-800 text-sm bg-white outline-hidden transition-all"
          >
            <option value="Whimsical watercolor children's book illustration, soft pastel tones, cozy warm lighting">
              Aquarela mágica de livro infantil (Whimsical Watercolor, tons pastéis)
            </option>
            <option value="3D animated movie style (Pixar/Disney inspired), rich textures, vibrant warm colors, volumetric lighting">
              Animação 3D moderna (Estilo Pixar / Disney, iluminação calorosa)
            </option>
            <option value="Vintage storybook illustration, delicate ink outlines, gouache painting, textured parchment paper">
              Livro clássico vintage (Traço em nanquim e guache, estilo Beatrix Potter)
            </option>
            <option value="Playful cut-paper collage and clay illustration, tactile storybook, high contrast, vibrant cheerful colors">
              Colagem de papel e massinha (Texturizado, lúdico e vibrante)
            </option>
          </select>
        </div>

        {/* Checkbox: Geração Automática das Imagens */}
        <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-4 flex items-start gap-3">
          <input
            id="auto-generate-images-check"
            type="checkbox"
            checked={autoGenerateImages}
            onChange={(e) => setAutoGenerateImages(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
          />
          <label htmlFor="auto-generate-images-check" className="text-sm cursor-pointer select-none">
            <span className="font-semibold text-amber-950 flex items-center gap-1.5">
              <span>🖼️ Gerar ilustrações automaticamente</span>
              <span className="text-[11px] bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                Recomendado
              </span>
            </span>
            <p className="text-xs text-amber-800/90 mt-0.5">
              Cria automaticamente as pinturas dos 3 capítulos para ler no formato <strong>Jornalzinho Infantil</strong> e nos cartões de história.
            </p>
          </label>
        </div>

        {/* Botão de Geração */}
        <div className="pt-2">
          <button
            id="generate-story-btn"
            type="submit"
            disabled={isLoading || !theme.trim() || !characterName.trim() || !moralLesson.trim()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-base shadow-sm hover:shadow-indigo-200 transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <Wand2 className="w-5 h-5 animate-spin text-indigo-200" />
                <span>Criando História Mágica e Prompts...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-amber-300" />
                <span>Gerar História & Storyboard</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
