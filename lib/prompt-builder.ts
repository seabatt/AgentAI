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
    'Professional headshot photograph of the person in the reference image',
    ...fragments,
    'sharp focus, shallow depth of field, professional photography',
    'high resolution, 8k',
  ].join(', ');
}

export function buildVariationPrompts(
  selections: Record<string, string>
): string[] {
  const base = buildBasePrompt(selections);
  return VARIATION_MODIFIERS.map(
    (modifier) => `${base}, ${modifier}`
  );
}
