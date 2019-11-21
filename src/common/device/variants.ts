import { Names, Variants } from './keyboard';
import { KeyboardDetails, KeyDetails } from './types';

// TODO: This should all be done offline or during build time.

function row(strings: TemplateStringsArray): KeyDetails[] {
  const keys: KeyDetails[] = [];
  const defs = strings[0].split(' ');

  for (let i = 0, left = 0; i < defs.length; i++) {
    const def = defs[i];
    if (!def.length) continue;
    const key = {
      size: parseFloat(def),
      left,
      isSpace: def.includes('s'),
      isDifference: def.includes('d'),
      isVertical: def.includes('v')
    };
    keys.push(key);
    left += key.size;
  }

  return keys;
}

function buildDetailsList(): Map<string, KeyboardDetails[]> {
  const variant = (name: string, rows: number[], keys: KeyDetails[][]): KeyboardDetails => ({ name, rows, keys });

  const fokal = [
    variant(
      Variants.Standard,
      [0, 1.5, 2.5, 3.5, 4.5, 5.5],
      [
        row`1 0.5s 1 1 1 1 1 1 1 1 1 1 1 1 1`,
        row`1 1 1 1 1 1 1 1 1 1 1 1 1 2 1`,
        row`1.5 1 1 1 1 1 1 1 1 1 1 1 1 1.5 1`,
        row`1.75 1 1 1 1 1 1 1 1 1 1 1 2.25 1`,
        row`2.25 1 1 1 1 1 1 1 1 1 1 1.75 1`,
        row`1.25 1.25 1.25 6.25 1 1 1 1`
      ]
    )
  ];

  return new Map([[Names.Fokal, fokal]]);
}

export const variantDetails: ReadonlyMap<string, KeyboardDetails[]> = buildDetailsList();
