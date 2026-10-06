import {
  addThought,
  cleanThoughtText,
  clearDoneThoughts,
  openThoughtCount,
  ParkedThought,
  removeThought,
  THOUGHT_LIST_LIMIT,
  THOUGHT_MAX_LENGTH,
  thoughtsSince,
  toggleThought,
} from '@/utils/thoughts';

const NOW = new Date('2026-10-06T09:00:00Z');

describe('thought pad', () => {
  it('cleans whitespace and caps the length', () => {
    expect(cleanThoughtText('  call\n\n mom  ')).toBe('call mom');
    expect(cleanThoughtText('x'.repeat(500))).toHaveLength(THOUGHT_MAX_LENGTH);
  });

  it('ignores blank input and returns the same list', () => {
    const list: ParkedThought[] = [];
    expect(addThought(list, '   ', { id: 'a', now: NOW })).toBe(list);
  });

  it('adds newest first with habit name', () => {
    let list = addThought([], 'first', { id: 'a', now: NOW });
    list = addThought(list, 'second', { id: 'b', now: NOW, habitName: 'Reading' });
    expect(list.map((t) => t.id)).toEqual(['b', 'a']);
    expect(list[0]).toMatchObject({ text: 'second', habitName: 'Reading', done: false });
    expect(list[1].habitName).toBeUndefined();
  });

  it('toggles, removes, clears done and counts open', () => {
    let list = addThought([], 'one', { id: 'a', now: NOW });
    list = addThought(list, 'two', { id: 'b', now: NOW });
    list = toggleThought(list, 'a');
    expect(openThoughtCount(list)).toBe(1);
    expect(clearDoneThoughts(list).map((t) => t.id)).toEqual(['b']);
    expect(removeThought(list, 'b').map((t) => t.id)).toEqual(['a']);
    expect(toggleThought(list, 'a').find((t) => t.id === 'a')?.done).toBe(false);
  });

  it('when over the limit, drops finished thoughts before open ones', () => {
    let list: ParkedThought[] = [];
    for (let i = 0; i < THOUGHT_LIST_LIMIT; i += 1) {
      list = addThought(list, `t${i}`, { id: `id${i}`, now: NOW });
    }
    list = toggleThought(list, 'id5'); // a finished one somewhere in the middle
    list = addThought(list, 'new', { id: 'new', now: NOW });
    expect(list).toHaveLength(THOUGHT_LIST_LIMIT);
    expect(list.find((t) => t.id === 'id5')).toBeUndefined();
    expect(list.find((t) => t.id === 'id0')).toBeDefined(); // oldest open one kept
    list = addThought(list, 'newer', { id: 'newer', now: NOW });
    expect(list).toHaveLength(THOUGHT_LIST_LIMIT);
    expect(list.find((t) => t.id === 'id0')).toBeUndefined(); // now the oldest open one goes
    expect(list[0].id).toBe('newer');
  });

  it('counts thoughts parked since a moment', () => {
    let list = addThought([], 'old', { id: 'a', now: new Date('2026-10-06T08:00:00Z') });
    list = addThought(list, 'new', { id: 'b', now: NOW });
    expect(thoughtsSince(list, Date.parse('2026-10-06T08:30:00Z'))).toBe(1);
  });
});
