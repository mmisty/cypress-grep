type PublicValue = string | boolean | number | null | undefined | Record<string, unknown> | unknown[];

const exposeApi = () => {
  const cy = typeof Cypress !== 'undefined' ? (Cypress as Cypress.Cypress & { expose?: unknown }) : undefined;

  return typeof cy?.expose === 'function'
    ? (cy.expose as ((key: string) => unknown) & ((key: string, value: unknown) => void))
    : undefined;
};

/**
 * Prefer `Cypress.expose()` (Cypress 15.10+). Fall back to `Cypress.env()` for
 * `CYPRESS_*` while `allowCypressEnv` still allows it.
 */
export const getPublic = (key: string): unknown => {
  const viaExpose = exposeApi()?.(key);

  if (viaExpose !== undefined) {
    return viaExpose;
  }

  try {
    const cy = typeof Cypress !== 'undefined' ? Cypress : undefined;

    if (typeof cy?.env === 'function') {
      return cy.env(key);
    }
  } catch {
    // allowCypressEnv: false throws on Cypress.env()
  }

  return undefined;
};

/** Write public config via `Cypress.expose()`. */
export const setPublic = (key: string, value: PublicValue): void => {
  exposeApi()?.(key, value);
};

const persistRaw = (key: string, value: PublicValue): void => {
  if (typeof window === 'undefined' || !window.sessionStorage) {
    return;
  }

  if (value === undefined || value === null) {
    window.sessionStorage.removeItem(key);

    return;
  }

  window.sessionStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
};

/**
 * Persist a public value so reporter remounts (Cypress 15.19+ pages) keep UI state.
 * Session storage survives remount; `Cypress.expose` is what grep reads at filter time.
 */
export const persistPublic = (key: string, value: PublicValue): void => {
  persistRaw(key, value);
  setPublic(key, value);
};

export const readPersistedPublic = <T>(key: string, fallback: T): T => {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    const stored = window.sessionStorage.getItem(key);

    if (stored != null) {
      if (typeof fallback === 'boolean') {
        return (stored === 'true') as T;
      }

      return stored as T;
    }
  }

  const exposed = getPublic(key);

  return (exposed !== undefined ? exposed : fallback) as T;
};
