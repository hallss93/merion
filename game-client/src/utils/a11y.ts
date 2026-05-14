/** Evita disparar atalhos do jogo enquanto o usuário edita texto em outro controle. */
export function shouldIgnoreKeyboardShortcut(event: KeyboardEvent): boolean {
  const { target } = event;
  if (!target || !(target instanceof HTMLElement)) {
    return false;
  }
  return Boolean(target.closest('input, textarea, select, [contenteditable="true"]'));
}
