import { BOOK_LIST } from '@/constants/books';
import { LUNA_BOOKS, LunaPage } from '@/constants/lunaBooks';

describe('book catalog', () => {
  it('ids are unique', () => {
    const ids = BOOK_LIST.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it.each(BOOK_LIST.filter((b) => b.content).map((b) => [b.id, b]))('%s: readable pages are non-empty', (_id, book) => {
    expect(book.content!.length).toBeGreaterThan(0);
    book.content!.forEach((page) => expect(page.trim().length).toBeGreaterThan(40));
  });
  it('copyrighted recommendations never ship their text', () => {
    const copyrighted = ['atomic-habits', 'seven-habits', 'deep-work', 'think-grow-rich', 'power-of-now',
      'mans-search-meaning', 'the-alchemist', 'rich-dad-poor-dad', 'five-am-club', 'grit'];
    copyrighted.forEach((id) => expect(BOOK_LIST.find((b) => b.id === id)?.content).toBeUndefined());
  });
  it('every book has a title, author and positive reading time', () => {
    BOOK_LIST.forEach((b) => {
      expect(b.title.length).toBeGreaterThan(0);
      expect(b.author.length).toBeGreaterThan(0);
      expect(b.estimatedHours).toBeGreaterThan(0);
    });
  });
});

describe('Luna books', () => {
  it('two books, 22 pages total', () => {
    expect(LUNA_BOOKS).toHaveLength(2);
    expect(LUNA_BOOKS.reduce((n, b) => n + b.pages.length, 0)).toBe(22);
  });
  it.each(LUNA_BOOKS.flatMap((b) => b.pages.map((p) => [`${b.id} p${p.page}`, p] as [string, LunaPage])))('%s has illustration and text', (_n, page) => {
    expect(page.image).toBeDefined();
    expect(page.textUz.trim().length).toBeGreaterThan(5);
  });
  it.each(LUNA_BOOKS.map((b) => [b.id, b]))('%s starts with a cover and pages are in order', (_id, book) => {
    expect(book.pages[0].type).toBe('cover');
    book.pages.forEach((p, i) => expect(p.page).toBe(i));
  });
});
