import uz from '@/i18n/locales/uz.json';
import ru from '@/i18n/locales/ru.json';
import en from '@/i18n/locales/en.json';

type Tree = { [key: string]: unknown };
function flatten(tree: Tree, prefix = ''): Record<string, unknown> {
  return Object.entries(tree).reduce<Record<string, unknown>>((out, [key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) Object.assign(out, flatten(value as Tree, path));
    else out[path] = value;
    return out;
  }, {});
}
// Russian has extra plural forms (_few/_many) — compare on the base key.
const base = (key: string) => key.replace(/_(zero|one|two|few|many|other)$/, '');
const placeholders = (text: unknown) =>
  typeof text === 'string' ? (text.match(/{{\s*\w+\s*}}/g) ?? []).map((p) => p.replace(/\s/g, '')).sort() : [];

const locales = { uz: flatten(uz as Tree), ru: flatten(ru as Tree), en: flatten(en as Tree) };

describe('translations are complete in all 3 languages', () => {
  const uzKeys = new Set(Object.keys(locales.uz).map(base));
  it.each(['ru', 'en'] as const)('%s has every uz key', (lang) => {
    const keys = new Set(Object.keys(locales[lang]).map(base));
    expect([...uzKeys].filter((k) => !keys.has(k))).toEqual([]);
  });
  it.each(['ru', 'en'] as const)('%s has no extra keys', (lang) => {
    expect(Object.keys(locales[lang]).map(base).filter((k) => !uzKeys.has(k))).toEqual([]);
  });
  it.each(['uz', 'ru', 'en'] as const)('%s has no empty strings', (lang) => {
    const empty = Object.entries(locales[lang]).filter(([, v]) => typeof v === 'string' && v.trim() === '');
    expect(empty).toEqual([]);
  });
  it('interpolation placeholders match across languages', () => {
    const mismatched = Object.keys(locales.en).filter((key) => {
      const enP = placeholders(locales.en[key]);
      const uzP = placeholders(locales.uz[key]);
      return key in locales.uz && JSON.stringify(enP) !== JSON.stringify(uzP);
    });
    expect(mismatched).toEqual([]);
  });
  it('demo habit names exist in every language (5 each)', () => {
    [uz, ru, en].forEach((l) => expect((l as { profile: { demoHabits: string[] } }).profile.demoHabits).toHaveLength(5));
  });
});
