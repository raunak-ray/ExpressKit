import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Language, TemplateFile } from "../types";

export class FileService {
  private readonly templatePath: string;

  constructor() {
    const serviceDirectory = path.dirname(fileURLToPath(import.meta.url));

    // templates/ sits two levels up from src/services (and dist/services).
    this.templatePath = path.resolve(serviceDirectory, "../../templates");
  }

  public async createDirectory(projectName: string): Promise<string> {
    const dirPath = path.resolve(process.cwd(), projectName);

    try {
      await mkdir(dirPath, { recursive: true });
      return dirPath;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown filesystem error";

      throw new Error(
        `Failed to create project directory "${dirPath}": ${message}`,
        { cause: error },
      );
    }
  }

  public async createFiles(
    projectDirectory: string,
    language: Language,
    files: TemplateFile[],
  ): Promise<void> {
    // Refuse before writing anything if the project files are already there.
    const existingFiles = await this.getExistingFiles(projectDirectory, files);

    if (existingFiles.length > 0) {
      throw new Error(
        `Cannot create project: these files already exist in "${projectDirectory}": ${existingFiles.join(", ")}`,
      );
    }

    // Create all files in parallel, then report every failure at once.
    const results = await Promise.allSettled(
      files.map(({ fileName, destination = "" }) =>
        this.copyTemplateFile(projectDirectory, fileName, language, destination),
      ),
    );

    const failures = results.filter((result) => result.status === "rejected");

    if (failures.length > 0) {
      throw new Error(
        `Failed to create ${failures.length} of ${files.length} files.`,
        { cause: failures.map((failure) => failure.reason) },
      );
    }
  }

  // Returns the destination files that already exist (relative paths).
  private async getExistingFiles(
    projectDirectory: string,
    files: TemplateFile[],
  ): Promise<string[]> {
    const checks = files.map(async ({ fileName, destination = "" }) => {
      try {
        await access(path.join(projectDirectory, destination, fileName));
        return destination ? `${destination}/${fileName}` : fileName;
      } catch {
        return null;
      }
    });

    const results = await Promise.all(checks);

    return results.filter((file): file is string => file !== null);
  }

  private async copyTemplateFile(
    projectDirectory: string,
    fileName: string,
    language: Language,
    destination: string,
  ): Promise<void> {
    const templateFilePath = path.resolve(
      this.templatePath,
      language,
      fileName,
    );

    const contents = await readFile(templateFilePath, { encoding: "utf-8" });

    const destinationFilePath = path.join(
      projectDirectory,
      destination,
      fileName,
    );

    await mkdir(path.dirname(destinationFilePath), { recursive: true });

    // "wx" fails if the file exists, so we never overwrite user files.
    await writeFile(destinationFilePath, contents, {
      encoding: "utf-8",
      flag: "wx",
    });
  }
}
