/** @vitest-environment happy-dom */
import { describe, expect, it } from 'vitest';
import { shouldIgnoreKeyboardShortcut } from './a11y';

describe('shouldIgnoreKeyboardShortcut', () => {
  it('retorna false para alvo body', () => {
    const event = new KeyboardEvent('keydown', { bubbles: true });
    document.body.dispatchEvent(event);
    expect(shouldIgnoreKeyboardShortcut(event)).toBe(false);
  });

  it('retorna true quando o evento vem de um input', () => {
    const input = document.createElement('input');
    document.body.appendChild(input);
    const event = new KeyboardEvent('keydown', { bubbles: true });
    input.dispatchEvent(event);
    expect(shouldIgnoreKeyboardShortcut(event)).toBe(true);
    input.remove();
  });
});
