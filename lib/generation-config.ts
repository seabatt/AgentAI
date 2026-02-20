export const GENERATION_CONFIG = {
  model: 'gemini-3-pro-image-preview' as const,
  provider: 'google-gemini' as const,
  style: 'photo' as const,
  aspectRatio: '1:1' as const,
  imageSize: '2K' as const,
  variations: {
    min: 1,
    ideal: 3,
  },
} as const;

export const VARIATION_MODIFIERS = [
  'straight-on angle, centered composition, even studio lighting',
  'slight three-quarter turn, soft directional light from the left, subtle depth',
  'gentle head tilt, Rembrandt-style lighting, warm tone, gentle bokeh',
] as const;
