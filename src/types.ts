export interface Chapter {
  chapter_number: number;
  chapter_title: string;
  story_text: string;
  scene_description: string;
  image_prompt: string;
  imageUrl?: string;
  isGeneratingImage?: boolean;
  imageError?: string;
}

export interface StoryResponse {
  title: string;
  synopsis: string;
  character_visual_guide: string;
  moral_lesson_summary: string;
  chapters: Chapter[];
}

export interface StoryFormData {
  theme: string;
  characterName: string;
  moralLesson: string;
  visualStyle: string;
  autoGenerateImages?: boolean;
}

export type VoiceGender = "female" | "male";
export type StoryPace = "bedtime" | "storyteller" | "normal";

export interface VoiceSettings {
  gender: VoiceGender;
  pace: StoryPace;
  preferredVoiceURI: string | null;
}
