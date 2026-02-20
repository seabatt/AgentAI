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
    id: 'backdrop',
    title: 'Backdrop',
    required: true,
    columns: 4,
    options: [
      {
        id: 'day-city',
        label: 'Day City',
        icon: '🏙️',
        promptFragment: 'daytime city skyline backdrop, soft natural light',
      },
      {
        id: 'night-city',
        label: 'Night City',
        icon: '🌃',
        promptFragment: 'nighttime city lights backdrop, moody ambient lighting',
      },
      {
        id: 'day-outdoors',
        label: 'Day Outdoors',
        icon: '🏞️',
        promptFragment: 'outdoor natural landscape backdrop, golden hour sunlight',
      },
      {
        id: 'dusk-outdoors',
        label: 'Dusk Outdoors',
        icon: '🌅',
        promptFragment: 'dusk outdoor setting, warm sunset tones',
      },
    ],
  },
  {
    id: 'attire',
    title: 'Attire',
    required: true,
    columns: 4,
    options: [
      {
        id: 'button-down',
        label: 'Button Down',
        icon: '👔',
        promptFragment: 'wearing a crisp button-down shirt',
      },
      {
        id: 'suit-tie',
        label: 'Suit & Tie',
        icon: '🤵',
        promptFragment: 'wearing a tailored suit and tie',
      },
      {
        id: 'blouse',
        label: 'Blouse',
        icon: '👩‍💼',
        promptFragment: 'wearing a professional blouse',
      },
      {
        id: 'cocktail-dress',
        label: 'Cocktail Dress',
        icon: '👗',
        promptFragment: 'wearing an elegant cocktail dress',
      },
    ],
  },
  {
    id: 'color',
    title: 'Color',
    required: true,
    columns: 4,
    options: [
      {
        id: 'black',
        label: 'Black',
        icon: '⬛',
        promptFragment: 'in black',
      },
      {
        id: 'white',
        label: 'White',
        icon: '⬜',
        promptFragment: 'in white',
      },
      {
        id: 'blue',
        label: 'Blue',
        icon: '🟦',
        promptFragment: 'in blue',
      },
      {
        id: 'red',
        label: 'Red',
        icon: '🟥',
        promptFragment: 'in red',
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
