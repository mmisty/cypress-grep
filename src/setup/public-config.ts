type PublicValue = string | boolean | number | null | undefined | Record<string, unknown> | unknown[];

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

  return undefined;
};

/** Write public config. Mirrors to both `expose` and `env` while env is still allowed. */
export const setPublic = (key: string, value: PublicValue): void => {
  const ex = exposeApi();
  ex?.(key, value);
};
