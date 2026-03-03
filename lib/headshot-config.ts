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
          'Place the person outdoors in a lush green park or garden setting during golden hour. Use minimal styling — keep their look effortless and authentic. Warm sunlight filtering through leaves, soft natural shadows on the face.',
      },
      {
        id: 'casual',
        label: 'Casual',
        icon: '😊',
        promptFragment:
          'Dress the person in a clean, relaxed casual outfit (simple crew-neck or open-collar shirt). Set against a softly blurred outdoor background with gentle natural daylight. The mood should feel friendly, approachable, and warm.',
      },
      {
        id: 'mono',
        label: 'Mono',
        icon: '⚫',
        promptFragment:
          'Render the photograph entirely in black and white. Use high-contrast studio lighting with a single key light to create dramatic shadows on one side of the face. Clean dark background. The result should feel timeless and classic.',
      },
      {
        id: 'vintage',
        label: 'Vintage',
        icon: '📷',
        promptFragment:
          'Apply a warm analog film aesthetic — slightly faded, muted earthy tones with gentle grain. Dress the person in classic, understated attire. Soft-focus edges with a sharp center. The image should feel like a rediscovered portrait from the 1970s.',
      },
      {
        id: 'street',
        label: 'Street',
        icon: '🏙️',
        promptFragment:
          'Place the person on an urban sidewalk or city street in casual street-style clothing. Natural midday daylight with architectural lines in the background. The feel should be candid and editorial, as if captured mid-stride by a street photographer.',
      },
      {
        id: 'corporate',
        label: 'Corporate',
        icon: '🏢',
        promptFragment:
          'Dress the person in polished professional business attire (tailored suit or blazer). Use a clean, solid white or light gray backdrop with even, diffused studio lighting. The image should look sharp, confident, and ready for a company website or LinkedIn.',
      },
      {
        id: 'office',
        label: 'Office',
        icon: '💼',
        promptFragment:
          'Dress the person in smart casual attire (blazer over an open-collar shirt or a neat blouse). Set in a modern, bright office environment with blurred desks and warm interior lighting behind them. The mood should be professional yet approachable.',
      },
      {
        id: 'luxury',
        label: 'Luxury',
        icon: '🖤',
        promptFragment:
          'Dress the person in high-end designer attire — dark tones, rich textures. Use a dark, moody backdrop with dramatic Rembrandt lighting creating a triangle of light on the cheek. The image should feel elegant, refined, and magazine-editorial quality.',
      },
      {
        id: 'fashion',
        label: 'Fashion',
        icon: '✨',
        promptFragment:
          'Dress the person in bold, trendy editorial fashion. Use dramatic directional lighting with strong color contrast. Urban or architectural backdrop with cinematic bokeh. The feel should be high-fashion editorial — striking, confident, and visually dynamic.',
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
