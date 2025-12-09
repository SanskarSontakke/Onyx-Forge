import { AspectRatio, Quality, StylePreset } from "./types";

export const ASPECT_RATIOS: { value: AspectRatio; label: string; icon: string }[] = [
  { value: '1:1', label: 'Square (1:1)', icon: '▢' },
  { value: '16:9', label: 'Landscape (16:9)', icon: '▭' },
  { value: '9:16', label: 'Portrait (9:16)', icon: '▯' },
  { value: '4:3', label: 'Classic TV (4:3)', icon: '📺' },
  { value: '3:4', label: 'Classic Portrait (3:4)', icon: '🖼️' },
];

export const QUALITY_OPTIONS: { value: Quality; label: string }[] = [
  { value: 'Standard', label: 'Standard' },
  { value: 'High', label: 'High' },
  { value: 'Ultra', label: 'Ultra' },
];

export const STYLE_OPTIONS: { value: StylePreset; label: string }[] = [
  { value: 'None', label: 'Raw' },
  { value: 'Cyberpunk', label: 'Cyberpunk' },
  { value: 'Minimalist', label: 'Minimal' },
  { value: 'Luxe', label: 'Luxe' },
  { value: 'Retro', label: 'Retro' },
  { value: 'Industrial', label: 'Industrial' },
];

export const SAMPLE_PROMPTS = [
  { description: "A sleek, carbon-fiber racing bicycle on a mountain pass at sunset", url: "https://example.com/bike" },
  { description: "Organic artisan coffee beans spilling out of a burlap sack, rustic vibe", url: "https://example.com/coffee" },
  { description: "Futuristic noise-canceling headphones with neon lighting accents", url: "https://example.com/headphones" },
  { description: "A luxurious anti-aging serum bottle with gold accents on a marble vanity, soft floral background", url: "https://example.com/skincare" },
  { description: "A rugged, waterproof hiking boot splashing through a muddy trail, dynamic action shot", url: "https://example.com/boots" },
  { description: "A smart home thermostat with a glass interface, mounted on a modern textured wall, warm ambient lighting", url: "https://example.com/thermostat" },
  { description: "A vintage leather camera bag sitting on a rustic wooden table, map and compass nearby, travel aesthetic", url: "https://example.com/camerabag" },
  { description: "High-performance RGB mechanical gaming keyboard glowing in a dark room, cyberpunk atmosphere", url: "https://example.com/keyboard" },
  { description: "A minimalist mid-century modern velvet armchair in mustard yellow, placed in a sunlit corner with plants", url: "https://example.com/armchair" },
  { description: "Professional grade Japanese Damascus steel chef knife slicing through a fresh bell pepper, high shutter speed, dramatic lighting", url: "https://example.com/knife" },
  { description: "Hand-forged copper cookware set hanging in a sun-drenched Tuscan kitchen, steam rising from a pot", url: "https://example.com/cookware" },
];