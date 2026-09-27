/** Where a published dataset is served from (see ./registry and scripts/export-data.mjs). */
export function dataFile(name: string): string {
  return `/data/${name}`;
}
