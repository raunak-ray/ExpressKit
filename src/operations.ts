import { mkdir, readFile } from "node:fs/promises";
import type { Language } from "./types.js";
import path from "node:path";
import { fileURLToPath } from "node:url";

export async function createDirectory(dirName: string) {
  if (dirName === ".") return;

  const path = `./${dirName}`;

  await mkdir(path, { recursive: true });
}

export async function readFileContents(filePath: string) {
  try {
    const content = await readFile(filePath, { encoding: "utf-8" });

    return content;
  } catch (error: unknown) {
    const message = (error instanceof Error) ? error.message : "Something went wrong";
    console.error("Error reading file contents:", message);
    process.exit(0);
  }
}

export async function readTemplate(
  language: Language = "javascript",
  fileName: string,
): Promise<string> {
  const currDir = path.dirname(fileURLToPath(import.meta.url));
  const templateDir = path.resolve(currDir, "./templates");

  const templatePath = path.resolve(templateDir, language, fileName);

  return readFileContents(templatePath);
}
