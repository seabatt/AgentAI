export interface SelectionOption {
  id: string;
  label: string;
  icon: string;
  promptFragment: string;
}

export interface SelectionCategory {
  id: string;
  title: string;
  required: boolean;
  columns: number;
  options: SelectionOption[];
}

export const HEADSHOT_CATEGORIES: SelectionCategory[] = [
  {
    id: 'style',
    title: 'Choose your style',
    required: true,
    columns: 3,
    options: [
      {
        id: 'natural',
        label: 'Natural',
        icon: '🌿',
        promptFragment:
          'minimal styling, lush outdoor greenery backdrop, warm golden-hour sunlight, authentic and effortless',
      },
      {
        id: 'casual',
        label: 'Casual',
        icon: '😊',
        promptFragment:
          'wearing a relaxed casual outfit, soft natural light, blurred outdoor background, approachable and friendly',
      },
      {
        id: 'mono',
        label: 'Mono',
        icon: '⚫',
        promptFragment:
          'black and white photograph, high contrast, studio lighting, timeless monochrome portrait',
      },
      {
        id: 'vintage',
        label: 'Vintage',
        icon: '📷',
        promptFragment:
          'retro film look, warm muted earthy tones, soft focus, classic attire, nostalgic analog photography feel',
      },
      {
        id: 'street',
        label: 'Street',
        icon: '🏙️',
        promptFragment:
          'casual street style clothing, urban city environment, natural daylight, candid editorial feel',
      },
      {
        id: 'corporate',
        label: 'Corporate',
        icon: '🏢',
        promptFragment:
          'professional business attire, clean white backdrop, even studio lighting, sharp and polished',
      },
      {
        id: 'office',
        label: 'Office',
        icon: '💼',
        promptFragment:
          'smart casual attire, modern office environment in background, warm interior lighting, approachable professional',
      },
      {
        id: 'luxury',
        label: 'Luxury',
        icon: '🖤',
        promptFragment:
          'upscale designer attire, dark moody backdrop, dramatic Rembrandt lighting, elegant and refined',
      },
      {
        id: 'fashion',
        label: 'Fashion',
        icon: '✨',
        promptFragment:
          'trendy editorial streetwear, dramatic directional lighting, urban backdrop with cinematic bokeh',
      },
    ],
  },
];

export function getMissingCategories(
  selections: Record<string, string | null>
): string[] {
  return HEADSHOT_CATEGORIES
    .filter((cat) => cat.required && !selections[cat.id])
    .map((cat) => cat.title.toLowerCase());
}

export function allRequiredSelected(
  selections: Record<string, string | null>
): boolean {
  return getMissingCategories(selections).length === 0;
}
