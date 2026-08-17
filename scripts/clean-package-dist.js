const { existsSync, readFileSync, rmSync } = require("node:fs");
const { isAbsolute, relative, resolve, sep } = require("node:path");

const [outputDirectoryName, ...unexpectedArguments] = process.argv.slice(2);
const packageDirectory = resolve(process.cwd());
const workspaceDirectory = resolve(__dirname, "..");
const packageDirectoryRelativeToWorkspace = relative(
  workspaceDirectory,
  packageDirectory,
);

if (outputDirectoryName !== "dist" || unexpectedArguments.length > 0) {
  throw new Error("Expected exactly one output directory argument: dist.");
}

if (
  packageDirectoryRelativeToWorkspace.length === 0 ||
  packageDirectoryRelativeToWorkspace.startsWith(`..${sep}`) ||
  isAbsolute(packageDirectoryRelativeToWorkspace) ||
  !packageDirectoryRelativeToWorkspace.startsWith(`packages${sep}`)
) {
  throw new Error("Refusing to clean outside a workspace package directory.");
}

const packageManifestPath = resolve(packageDirectory, "package.json");
if (!existsSync(packageManifestPath)) {
  throw new Error("Refusing to clean a directory without package.json.");
}

const packageManifest = JSON.parse(readFileSync(packageManifestPath, "utf8"));
if (
  typeof packageManifest.name !== "string" ||
  !Array.isArray(packageManifest.files) ||
  !packageManifest.files.includes("dist")
) {
  throw new Error("Refusing to clean a package that does not publish dist.");
}

const outputDirectory = resolve(packageDirectory, outputDirectoryName);
if (outputDirectory !== resolve(packageDirectory, "dist")) {
  throw new Error("Refusing to clean an unexpected output directory.");
}

rmSync(outputDirectory, { recursive: true, force: true });
