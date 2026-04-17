type PublicValue = string | boolean | number | null | undefined | Record<string, unknown> | unknown[];

const envApi = () => {
  const cy = typeof Cypress !== 'undefined' ? (Cypress as Cypress.Cypress & { env?: unknown }) : undefined;
  return typeof cy?.env === 'function' ? (cy.env as (key: string) => unknown) : undefined;
};

const exposeApi = () => {
  const cy = typeof Cypress !== 'undefined' ? (Cypress as Cypress.Cypress & { expose?: unknown }) : undefined;
  return typeof cy?.expose === 'function'
    ? (cy.expose as ((key: string) => unknown) & ((key: string, value: unknown) => void))
    : undefined;
};

/**
 * Prefer `Cypress.expose()` (Cypress 15.10+). Fall back to `Cypress.env()` for compatibility with `CYPRESS_*`
 * variables (while `allowCypressEnv: true` is enabled).
 */
export const getPublic = (key: string): unknown => {
  const ex = exposeApi();
  const viaExpose = ex?.(key);
  if (viaExpose !== undefined) return viaExpose;

  const en = envApi();
  return en?.(key);
};

/** Write public config. Mirrors to both `expose` and `env` while env is still allowed. */
export const setPublic = (key: string, value: PublicValue): void => {
  const ex = exposeApi();
  ex?.(key, value);

  const en = envApi();
  // Cypress.env setter form: Cypress.env(key, value)
  (en as unknown as ((key: string, value: unknown) => void) | undefined)?.(key, value);
};

