import { mkdir, readFile } from "node:fs/promises";
import type { Language } from "./types.js";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

export async function createDirectory(
  dirName: string,
): Promise<string> {
  const targetPath = path.resolve(process.cwd(), dirName);

  await mkdir(targetPath, { recursive: true });

  return targetPath;
}

export async function readFileContents(filePath: string) {
  try {
    const content = await readFile(filePath, { encoding: "utf-8" });

    return content;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Something went wrong";
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

export async function runInstallCommands(rootDirectory: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn("npm", ["install"], {
      cwd: path.resolve(rootDirectory),
      stdio: "inherit",
      shell: process.platform === "win32",
    });

    child.on("error", reject);

    child.on("close", (code) => {
      if (code === 0) {
        console.log("All dependencies installed...");
        resolve();
      } else {
        reject(new Error(`npm install failed with exit code ${code}`));
      }
    });
  });
}
