import { mkdir, writeFile } from 'node:fs/promises';
import openapiTS, { astToString } from 'openapi-typescript';
import { format, resolveConfig } from 'prettier';

const schemaUrl = process.env.API_SCHEMA_URL ?? 'http://localhost:8000/api/schema/?format=json';
const output = new URL('../lib/api/schema.d.ts', import.meta.url);

try {
  const response = await fetch(schemaUrl, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    throw new Error(`Schema request failed (${response.status} ${response.statusText}).`);
  }

  const schema = await response.json();
  const ast = await openapiTS(schema);
  const header =
    '/** Generated from the backend OpenAPI schema. Run npm run generate:api; do not edit. */\n';
  const contents = await format(header + astToString(ast), {
    ...(await resolveConfig(output)),
    filepath: output.pathname,
  });

  await mkdir(new URL('../lib/api/', import.meta.url), { recursive: true });
  await writeFile(output, contents);
  console.log(`API types generated in ${output.pathname}`);
} catch (error) {
  console.error(`Could not generate API types from ${schemaUrl}.`);
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
