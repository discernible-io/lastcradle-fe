/** Tiny pub/sub so route pages (e.g. turn recap) can enrich document meta. */

let overrides = null;
const listeners = new Set();

export function getPageMetaOverrides() {
  return overrides;
}

export function setPageMetaOverrides(next) {
  overrides = next && (next.title || next.description) ? next : null;
  listeners.forEach((fn) => {
    try {
      fn(overrides);
    } catch {
      /* ignore subscriber errors */
    }
  });
}

export function subscribePageMetaOverrides(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
