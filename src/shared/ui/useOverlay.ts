import { type RefObject, useLayoutEffect, useRef, useSyncExternalStore } from 'react';

const stack: HTMLElement[] = [];
const originalInert = new Map<HTMLElement, boolean>();
let originalOverflow = '';
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
const overlayHost = () => topOverlay() ?? document.body;

/** Keep live notifications inside the active dialog rather than its inert background. */
export function useOverlayHost() {
  return useSyncExternalStore(subscribe, overlayHost, () => null);
}

function topOverlay() {
  return stack[stack.length - 1];
}

function syncBackground() {
  const top = topOverlay();
  if (!top) {
    for (const [element, inert] of originalInert) element.inert = inert;
    originalInert.clear();
    document.body.style.overflow = originalOverflow;
    return;
  }
  for (const element of document.body.children) {
    if (!(element instanceof HTMLElement)) continue;
    if (!originalInert.has(element)) originalInert.set(element, element.inert);
    element.inert = element !== top;
  }
}

function focusableElements(root: HTMLElement) {
  return Array.from(
    root.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]'),
  ).filter((element) => {
    if (element.tabIndex < 0 || element.matches(':disabled')) return false;
    if (element.closest('[hidden], [inert], [aria-hidden="true"]')) return false;
    for (let parent: HTMLElement | null = element; parent; parent = parent.parentElement) {
      const style = getComputedStyle(parent);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      if (parent === root) break;
    }
    return true;
  });
}

function focusFirst(root: HTMLElement) {
  (focusableElements(root)[0] ?? root).focus({ preventScroll: true });
}

/** Shared lifecycle for portalled dialogs: only the top overlay owns focus and Escape. */
export function useOverlay(
  isOpen: boolean,
  rootRef: RefObject<HTMLDivElement | null>,
  onClose: () => void,
) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!isOpen || !root) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (stack.length === 0) originalOverflow = document.body.style.overflow;
    stack.push(root);
    document.body.style.overflow = 'hidden';
    syncBackground();
    for (const listener of listeners) listener();
    focusFirst(root);

    const onFocus = (event: FocusEvent) => {
      if (topOverlay() === root && !root.contains(event.target as Node)) focusFirst(root);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (topOverlay() !== root) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        closeRef.current();
      } else if (event.key === 'Tab') {
        const elements = focusableElements(root);
        const first = elements[0];
        const last = elements[elements.length - 1];
        if (!first || !last) {
          event.preventDefault();
          root.focus();
        } else if (
          event.shiftKey &&
          (document.activeElement === first || document.activeElement === root)
        ) {
          event.preventDefault();
          last.focus();
        } else if (
          !event.shiftKey &&
          (document.activeElement === last || document.activeElement === root)
        ) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('focusin', onFocus);
    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('focusin', onFocus);
      document.removeEventListener('keydown', onKeyDown, true);
      const wasTop = topOverlay() === root;
      stack.splice(stack.indexOf(root), 1);
      syncBackground();
      for (const listener of listeners) listener();
      if (!wasTop) return;
      const next = topOverlay();
      if (previous?.isConnected && (!next || next.contains(previous))) {
        previous.focus({ preventScroll: true });
      } else if (next) {
        focusFirst(next);
      }
    };
  }, [isOpen, rootRef]);
}
