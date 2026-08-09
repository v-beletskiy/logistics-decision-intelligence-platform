import { readFile, readdir, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { compileFromFile } from "json-schema-to-typescript";

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const schemasRoot = path.resolve(packageRoot, "../schemas");
const outputRoot = path.resolve(packageRoot, "src/generated");
const generatedContractsPath = path.join(
  outputRoot,
  "integration-event-contracts.ts",
);
// eslint-disable-next-line no-undef
const checkOnly = process.argv.includes("--check");
const staleOutputs = [];
const integrationContracts = [];

for (const schemaPath of await findSchemas(schemasRoot)) {
  const relativePath = path
    .relative(schemasRoot, schemaPath)
    .replace(/\.schema\.json$/, ".ts");
  const outputPath = path.join(outputRoot, relativePath);
  const generated = await compileFromFile(schemaPath, {
    cwd: path.dirname(schemaPath),
    unknownAny: true,
  });

  await ensureGeneratedFile(outputPath, generated, relativePath);

  const schema = JSON.parse(await readFile(schemaPath, "utf8"));
  if (typeof schema.title === "string" && schema.title.endsWith("Payload")) {
    integrationContracts.push({
      eventType: eventTypeFromPath(relativePath),
      payloadType: schema.title,
      relativePath,
      schemaPath,
    });
  }
}

await ensureGeneratedFile(
  generatedContractsPath,
  generateIntegrationContracts(integrationContracts),
  "integration-event-contracts.ts",
);

if (staleOutputs.length > 0) {
  throw new Error(
    `Generated integration-contract types are stale: ${staleOutputs.join(", ")}`,
  );
}

async function findSchemas(directory) {
  const schemas = [];
  const entries = await readdir(directory, { withFileTypes: true });
  entries.sort((left, right) => left.name.localeCompare(right.name));

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      schemas.push(...(await findSchemas(entryPath)));
    } else if (entry.name.endsWith(".schema.json")) {
      schemas.push(entryPath);
    }
  }

  return schemas;
}

async function ensureGeneratedFile(outputPath, generated, relativePath) {
  if (checkOnly) {
    const current = await readFile(outputPath, "utf8").catch(() => undefined);
    if (current !== generated) staleOutputs.push(relativePath);
    return;
  }

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, generated, "utf8");
}

function generateIntegrationContracts(contracts) {
  const seenEventTypes = new Set();
  const seenSymbols = new Set();
  const declarations = contracts
    .sort((left, right) => left.relativePath.localeCompare(right.relativePath))
    .map((contract) => {
      if (
        typeof contract.payloadType !== "string" ||
        !contract.payloadType.endsWith("Payload")
      ) {
        throw new Error(
          `Integration event schema ${contract.relativePath} must define a title ending in Payload.`,
        );
      }

      const symbol = lowerFirst(
        contract.payloadType.slice(0, -"Payload".length),
      );
      if (seenEventTypes.has(contract.eventType)) {
        throw new Error(
          `Duplicate integration event type: ${contract.eventType}.`,
        );
      }
      if (seenSymbols.has(symbol)) {
        throw new Error(
          `Duplicate generated integration contract symbol: ${symbol}.`,
        );
      }
      seenEventTypes.add(contract.eventType);
      seenSymbols.add(symbol);

      const typeImportPath = `./${contract.relativePath.replace(/\.ts$/, "")}`;
      const schemaImportPath = path
        .relative(outputRoot, contract.schemaPath)
        .replace(/\\/g, "/");
      const normalizedSchemaImportPath = schemaImportPath.startsWith(".")
        ? schemaImportPath
        : `./${schemaImportPath}`;

      return [
        `import ${symbol}Schema from "${normalizedSchemaImportPath}";`,
        `import type { ${contract.payloadType} } from "${typeImportPath}";`,
        `export type { ${contract.payloadType} } from "${typeImportPath}";`,
        "",
        `export const ${symbol} = defineContract<${contract.payloadType}>()(`,
        `  "${contract.eventType}",`,
        `  ${symbol}Schema,`,
        ");",
      ].join("\n");
    });

  return [
    "/* This file is generated from JSON Schema. Do not edit it manually. */",
    'import { defineContract } from "../contract";',
    "",
    declarations.join("\n\n"),
    "",
  ].join("\n");
}

function lowerFirst(value) {
  return `${value[0].toLowerCase()}${value.slice(1)}`;
}

function eventTypeFromPath(relativePath) {
  const segments = relativePath.replace(/\.ts$/, "").split(path.sep);
  if (segments.length < 3) {
    throw new Error(
      `Integration event schema ${relativePath} must be nested under its producer directory.`,
    );
  }

  return segments.slice(1).join(".");
}
