export const SYMBOL_CLASSES = {
  LOWER: /[a-z]/,
  UPPER: /[A-Z]/,
  DIGIT: /[0-9]/,
  SPECIAL: /[$@#]/,  // Only $, @, # are valid special characters
} as const;

export const SYMBOL_CLASS_LABELS = ['a-z', 'A-Z', '0-9', '$@#'] as const;

export type SymbolClassLabel = (typeof SYMBOL_CLASS_LABELS)[number];

export function getSymbolClass(char: string): SymbolClassLabel {
  if (SYMBOL_CLASSES.LOWER.test(char)) return 'a-z';
  if (SYMBOL_CLASSES.UPPER.test(char)) return 'A-Z';
  if (SYMBOL_CLASSES.DIGIT.test(char)) return '0-9';
  return '$@#';
}
