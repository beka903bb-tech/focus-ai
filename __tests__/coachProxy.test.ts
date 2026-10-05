import { validateMessages } from '../api/coach';

describe('coach proxy input validation', () => {
  it('accepts a normal chat', () => {
    expect(validateMessages([{ role: 'system', content: 'rules' }, { role: 'user', content: 'hi' }])).toHaveLength(2);
  });
  it('rejects unknown roles, empty lists and huge payloads', () => {
    expect(validateMessages([])).toBeNull();
    expect(validateMessages([{ role: 'tool', content: 'x' }])).toBeNull();
    expect(validateMessages([{ role: 'user', content: 'x'.repeat(7000) }])).toBeNull();
    expect(validateMessages(Array.from({ length: 20 }, () => ({ role: 'user', content: 'x' })))).toBeNull();
  });
  it('requires the last message to be from the user', () => {
    expect(validateMessages([{ role: 'user', content: 'a' }, { role: 'assistant', content: 'b' }])).toBeNull();
  });
});
