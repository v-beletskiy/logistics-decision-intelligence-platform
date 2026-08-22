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
const contractsManifestPath = path.resolve(
  packageRoot,
  "../contracts.manifest.json",
);
const eventTypePattern =
  /^[a-z][a-z0-9-]*(?:\.[a-z][a-z0-9-]*)+\.v[1-9][0-9]*$/;
// eslint-disable-next-line no-undef
const checkOnly = process.argv.includes("--check");
const staleOutputs = [];
const integrationContracts = [];
const generatedPayloadFiles = [];

for (const schemaPath of await findSchemas(schemasRoot)) {
  const relativePath = path
    .relative(schemasRoot, schemaPath)
    .replace(/\.schema\.json$/, ".ts");
  const outputPath = path.join(outputRoot, relativePath);
  const generated = await compileFromFile(schemaPath, {
    cwd: path.dirname(schemaPath),
    unknownAny: true,
  });

  generatedPayloadFiles.push({ outputPath, generated, relativePath });

  const schema = JSON.parse(await readFile(schemaPath, "utf8"));
  if (typeof schema.title === "string" && schema.title.endsWith("Payload")) {
    assertIntegrationContractSchema(schema, relativePath);
    integrationContracts.push({
      eventType: schema["x-event-type"],
      payloadType: schema.title,
      relativePath,
      schemaId: schema.$id,
      schemaPath,
    });
  }
}

const generatedContracts = generateIntegrationContracts(integrationContracts);
const generatedManifest = generateContractManifest(integrationContracts);
await assertManifestCompatibility(generatedManifest);

for (const generatedFile of generatedPayloadFiles) {
  await ensureGeneratedFile(
    generatedFile.outputPath,
    generatedFile.generated,
    generatedFile.relativePath,
  );
}
await ensureGeneratedFile(
  generatedContractsPath,
  generatedContracts,
  "integration-event-contracts.ts",
);
await ensureGeneratedFile(
  contractsManifestPath,
  `${JSON.stringify(generatedManifest, null, 2)}\n`,
  "contracts.manifest.json",
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

function assertIntegrationContractSchema(schema, relativePath) {
  if (
    typeof schema["x-event-type"] !== "string" ||
    !eventTypePattern.test(schema["x-event-type"])
  ) {
    throw new Error(
      `Integration event schema ${relativePath} must declare a valid versioned x-event-type.`,
    );
  }
  if (typeof schema.$id !== "string" || schema.$id.trim().length === 0) {
    throw new Error(
      `Integration event schema ${relativePath} must declare a schema $id.`,
    );
  }
}

function generateContractManifest(contracts) {
  return Object.fromEntries(
    contracts
      .map((contract) => [
        lowerFirst(contract.payloadType.slice(0, -"Payload".length)),
        {
          eventType: contract.eventType,
          schemaId: contract.schemaId,
        },
      ])
      .sort(([left], [right]) => left.localeCompare(right)),
  );
}

async function assertManifestCompatibility(nextManifest) {
  const currentText = await readFile(contractsManifestPath, "utf8").catch(
    (error) => {
      if (error?.code === "ENOENT") return undefined;
      throw error;
    },
  );
  if (currentText === undefined) return;

  const currentManifest = JSON.parse(currentText);
  for (const [contractName, currentContract] of Object.entries(
    currentManifest,
  )) {
    const nextContract = nextManifest[contractName];
    if (nextContract === undefined) {
      throw new Error(
        `Published integration contract ${contractName} cannot be removed; publish a new version instead.`,
      );
    }
    if (
      currentContract.eventType !== nextContract.eventType ||
      currentContract.schemaId !== nextContract.schemaId
    ) {
      throw new Error(
        `Published integration contract ${contractName} is immutable; publish a new version instead.`,
      );
    }
  }
}
