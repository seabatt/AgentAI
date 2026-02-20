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
    columns: 4,
    options: [
      {
        id: 'formal',
        label: 'Formal',
        icon: '👔',
        promptFragment:
          'wearing a dark formal suit, studio lighting, neutral gray backdrop, polished corporate headshot',
      },
      {
        id: 'casual',
        label: 'Casual',
        icon: '😊',
        promptFragment:
          'wearing a relaxed casual outfit, soft natural light, blurred outdoor background, approachable and friendly',
      },
      {
        id: 'natural',
        label: 'Natural',
        icon: '🌿',
        promptFragment:
          'minimal styling, lush outdoor greenery backdrop, warm golden-hour sunlight, authentic and effortless',
      },
      {
        id: 'corporate',
        label: 'Corporate',
        icon: '🏢',
        promptFragment:
          'professional business attire, clean white backdrop, even studio lighting, sharp and polished',
      },
      {
        id: 'fashion',
        label: 'Fashion',
        icon: '✨',
        promptFragment:
          'trendy editorial streetwear, dramatic directional lighting, urban backdrop with cinematic bokeh',
      },
      {
        id: 'office',
        label: 'Office',
        icon: '💼',
        promptFragment:
          'smart casual attire, modern office environment in background, warm interior lighting, approachable professional',
      },
      {
        id: 'yearbook',
        label: 'Yearbook',
        icon: '🎓',
        promptFragment:
          'classic portrait style, traditional mottled blue-gray studio backdrop, soft fill light, timeless school portrait',
      },
      {
        id: 'luxury',
        label: 'Luxury',
        icon: '🖤',
        promptFragment:
          'upscale designer attire, dark moody backdrop, dramatic Rembrandt lighting, elegant and refined',
      },
      {
        id: 'street',
        label: 'Street',
        icon: '🏙️',
        promptFragment:
          'casual street style clothing, urban city environment, natural daylight, candid editorial feel',
      },
      {
        id: 'mono',
        label: 'Mono',
        icon: '⚫',
        promptFragment:
          'black and white photograph, high contrast, studio lighting, timeless monochrome portrait',
      },
      {
        id: 'xmas',
        label: 'Xmas',
        icon: '🎄',
        promptFragment:
          'festive holiday setting, warm red and green tones, cozy bokeh lights, cheerful holiday portrait',
      },
      {
        id: 'vintage',
        label: 'Vintage',
        icon: '📷',
        promptFragment:
          'retro film look, warm muted earthy tones, soft focus, classic attire, nostalgic analog photography feel',
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
