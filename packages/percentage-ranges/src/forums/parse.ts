export function parseRawHtml(html: string, url: string) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  // Remove 'dropped by'
  doc.querySelector('div[style*="border-top"] p')?.remove();

  // TODO: remove #showequip
  const content = doc.querySelector<HTMLElement>('.showequip, #showequip');

  if (!content) {
    throw new Error(doc.body.textContent);
  }

  const titleDiv = content.firstElementChild as HTMLElement | null;
  if (titleDiv) {
    const link = a(
      {
        href: url,
        target: '_blank',
        class: 'color-inherit decoration-none cursor-pointer',
      },
      Array.from(titleDiv.childNodes),
    );
    titleDiv.replaceChildren(link);
  }

  return content.outerHTML;
}
