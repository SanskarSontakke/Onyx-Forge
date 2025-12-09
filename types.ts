export interface GeneratedImage {
  id: string;
  url: string;
  aspectRatio: string;
  prompt: string;
  createdAt: number;
}

export type AspectRatio = '1:1' | '3:4' | '4:3' | '9:16' | '16:9';

export type Quality = 'Standard' | 'High' | 'Ultra';

export type StylePreset = 'None' | 'Cyberpunk' | 'Minimalist' | 'Luxe' | 'Retro' | 'Industrial';

export type VariationCount = 1 | 2 | 3;

export interface GenerationParams {
  description: string;
  productUrl: string;
  aspectRatio: AspectRatio;
  quality: Quality;
  style: StylePreset;
  transparentBackground: boolean;
  variations: VariationCount;
}