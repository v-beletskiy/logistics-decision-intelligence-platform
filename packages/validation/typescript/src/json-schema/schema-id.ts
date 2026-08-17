const SCHEMA_PATH_SEGMENT = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

/** Builds a stable HTTPS JSON Schema identifier from an owned namespace. */
export function createSchemaId(
  baseUri: string,
  ...pathSegments: readonly string[]
): string {
  const base = new URL(baseUri);
  if (
    base.protocol !== "https:" ||
    base.username !== "" ||
    base.password !== "" ||
    base.search !== "" ||
    base.hash !== ""
  ) {
    throw new Error(
      "A schema base URI must be an HTTPS URI without credentials, query, or fragment.",
    );
  }
  if (
    pathSegments.length === 0 ||
    pathSegments.some((segment) => !SCHEMA_PATH_SEGMENT.test(segment))
  ) {
    throw new Error("Schema path segments must use lowercase kebab-case.");
  }

  base.pathname = `${base.pathname.replace(/\/+$/, "")}/`;
  return new URL(pathSegments.join("/"), base).href;
}
