export function isValidKey(e: KeyboardEvent) {
  if (e.repeat || e.ctrlKey || e.altKey || e.metaKey) return false;

  const target = e.target as HTMLElement | null;
  if (!target) return false;

  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable) return false;

  return true;
}
