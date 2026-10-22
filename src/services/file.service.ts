import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Language } from "../types.js";

export class FileService {
  private readonly cliPath: string;
  private readonly templatePath: string;

  constructor() {
    this.cliPath = path.dirname(fileURLToPath(import.meta.url));
    this.templatePath = path.resolve(this.cliPath, "../../templates");
  }

  public getCliDirectory(): string {
    return this.cliPath;
  }

  public getTemplateDirectory(): string {
    return this.templatePath;
  }

  public getTemplatePath(...segments: string[]): string {
    return path.resolve(this.templatePath, ...segments);
  }

  public getUserDirectory(): string {
    return process.cwd();
  }

  public async createDirectory(projectName: string): Promise<string> {
    const dirPath = path.resolve(this.getUserDirectory(), projectName);

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

  public async readAndCreateFile(
    projectDirectory: string,
    fileName: string,
    selectedLanguage: Language = "javascript",
    destination = "",
  ): Promise<void> {
    const templateFilePath = this.getTemplatePath(selectedLanguage, fileName);

    const contents = await readFile(templateFilePath, {
      encoding: "utf-8",
    });

    const destinationFilePath = path.join(
      projectDirectory,
      destination,
      fileName,
    );

    await mkdir(path.dirname(destinationFilePath), {
      recursive: true,
    });

    await writeFile(destinationFilePath, contents, {
      encoding: "utf-8",
      flag: "wx",
    });
  }

  public async createFiles(
    projectDirectory: string,
    selectedLanguage: Language = "javascript",
    files: { fileName: string; destination?: string }[] = [],
  ): Promise<void> {
    const results = await Promise.allSettled(
      files.map(({ fileName, destination = "" }) =>
        this.readAndCreateFile(
          projectDirectory,
          fileName,
          selectedLanguage,
          destination,
        ),
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
}
