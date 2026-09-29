// Copies the shared JSON data from the repository root (../data) into the
// extension so it can be bundled and published on its own.
import { copyFile, mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOURCE_DIR = path.resolve(__dirname, "../../data");
const TARGET_DIR = path.resolve(__dirname, "../src/data");

await mkdir(TARGET_DIR, { recursive: true });

const files = (await readdir(SOURCE_DIR)).filter((f) => f.endsWith(".json"));
for (const file of files) {
  await copyFile(path.join(SOURCE_DIR, file), path.join(TARGET_DIR, file));
  console.log(`copied ${file}`);
}
