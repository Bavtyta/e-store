export const FOCUSABLE_ELEMENT_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function getFocusableElements(root: ParentNode): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENT_SELECTOR)).filter(
    (element) => element.getAttribute('aria-hidden') !== 'true',
  );
}