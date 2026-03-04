export const GENERATION_CONFIG = {
  model: 'gemini-3-pro-image-preview' as const,
  provider: 'google-gemini' as const,
  style: 'photo' as const,
  aspectRatio: '1:1' as const,
  outputMimeType: 'image/png' as const,
  variations: {
    min: 1,
    ideal: 3,
  },
} as const;

export const VARIATION_MODIFIERS = [
  'Looking straight at the camera, centered composition, soft even lighting from both sides, neutral expression or slight smile.',
  'Slight three-quarter turn to the left, soft directional key light from the right, natural relaxed expression.',
  'Gentle head tilt, warm Rembrandt-style lighting from above-left, confident genuine smile, subtle background bokeh.',
] as const;
