export const $ = (container: HTMLElement, selector: string): HTMLElement | null =>
  container.querySelector(selector);

export const $$ = (selector: string) => document.querySelectorAll<HTMLElement>(selector);

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Partial<Omit<HTMLElementTagNameMap[K], 'style' | 'dataset'>> & {
    style?: string | Partial<CSSStyleDeclaration>;
    dataset?: Record<string, string>;
    [key: string]: unknown;
  } = {},
  children: (Node | string | number | boolean | null | undefined)[] = [],
): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v == null || v === false) continue;

    if (k === 'style' && typeof v === 'object') {
      Object.assign(e.style, v);
    } else if (k === 'dataset' && typeof v === 'object') {
      Object.assign(e.dataset, v);
    } else if (k.startsWith('on') && typeof v === 'function') {
      (e as Record<string, unknown>)[k.toLowerCase()] = v;
    } else if (k in e) {
      (e as Record<string, unknown>)[k] = v;
    } else if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
      e.setAttribute(k, String(v));
    }
  }

  if (children.length > 0) {
    const fragment = document.createDocumentFragment();
    for (const c of children) {
      if (c != null && typeof c !== 'boolean') {
        fragment.append(typeof c === 'object' ? c : String(c));
      }
    }
    e.append(fragment);
  }
  return e;
}

export function createBtn(
  config: Omit<Partial<HTMLElementTagNameMap['button']>, 'style'> & {
    text: string;
    class?: string;
    style?: string;
  },
) {
  return el(
    'button',
    {
      type: 'button',
      class: config.class,
      style: `margin-left: 5px;
              cursor: pointer !important;
              transition: color 0.2s;
              border: none;
              background: transparent;
              ${config.style ?? ''}`,
      onclick: config.onclick,
    },
    [config.text],
  );
}
