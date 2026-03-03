import {
  HEADSHOT_CATEGORIES,
  type SelectionCategory,
} from './headshot-config';
import { VARIATION_MODIFIERS } from './generation-config';

export function buildBasePrompt(
  selections: Record<string, string>,
  categories: SelectionCategory[] = HEADSHOT_CATEGORIES
): string {
  const fragments = categories
    .map((cat) => {
      const selected = cat.options.find((o) => o.id === selections[cat.id]);
      return selected?.promptFragment;
    })
    .filter(Boolean);

  return [
    'Generate a new photograph of the exact same person shown in the attached reference photo(s).',
    'Preserve their face shape, skin tone, eye color, hair color, hair style, and all distinguishing features precisely.',
    'The output must look like the same real individual, not a similar-looking person.',
    '',
    'Style:',
    ...fragments,
    '',
    'Technical: head-and-shoulders framing, sharp focus on eyes, shallow depth of field, photorealistic, no artifacts, no distortion.',
  ].join('\n');
}

export function buildVariationPrompts(
  selections: Record<string, string>
): string[] {
  const base = buildBasePrompt(selections);
  return VARIATION_MODIFIERS.map(
    (modifier) => `${base}\n\nPose & lighting: ${modifier}`
  );
}
