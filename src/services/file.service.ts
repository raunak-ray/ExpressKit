import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ProjectFileMap } from "../types";

export class FileService {
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

  /**
   * Writes the complete, already-composed project in one pass.
   * Every destination is checked before the first file is written.
   */
  public async writeFiles(
    projectDirectory: string,
    files: ProjectFileMap,
  ): Promise<void> {
    const entries = Object.entries(files);

    if (entries.length === 0) {
      throw new Error("No files to create.");
    }

    const destinations = entries.map(([relativePath, contents]) => ({
      relativePath,
      contents,
      absolutePath: this.resolveProjectPath(
        projectDirectory,
        relativePath,
      ),
    }));

    const existingFiles = await this.getExistingFiles(destinations);

    if (existingFiles.length > 0) {
      throw new Error(
        `Cannot create project: these files already exist in "${projectDirectory}": ${existingFiles.join(
          ", ",
        )}`,
      );
    }

    const results = await Promise.allSettled(
      destinations.map(({ absolutePath, contents }) =>
        this.writeFile(absolutePath, contents),
      ),
    );

    const failures = results.filter(
      (result) => result.status === "rejected",
    );

    if (failures.length > 0) {
      throw new Error(
        `Failed to create ${failures.length} of ${entries.length} files.`,
        { cause: failures.map((failure) => failure.reason) },
      );
    }
  }

  private resolveProjectPath(
    projectDirectory: string,
    relativePath: string,
  ): string {
    if (!relativePath.trim() || path.isAbsolute(relativePath)) {
      throw new Error(
        `Generated file path must be a non-empty relative path: "${relativePath}".`,
      );
    }

    const projectRoot = path.resolve(projectDirectory);
    const destination = path.resolve(projectRoot, relativePath);

    if (
      destination !== projectRoot &&
      !destination.startsWith(`${projectRoot}${path.sep}`)
    ) {
      throw new Error(
        `Generated file path escapes the project directory: "${relativePath}".`,
      );
    }

    return destination;
  }

  private async getExistingFiles(
    files: { relativePath: string; absolutePath: string }[],
  ): Promise<string[]> {
    const checks = files.map(async ({ relativePath, absolutePath }) => {
      try {
        await access(absolutePath);
        return relativePath;
      } catch {
        return null;
      }
    });

    const results = await Promise.all(checks);

    return results.filter((file): file is string => file !== null);
  }

  private async writeFile(
    filePath: string,
    contents: string,
  ): Promise<void> {
    await mkdir(path.dirname(filePath), { recursive: true });

    // "wx" fails if the file exists, so we never overwrite user files.
    await writeFile(filePath, contents, {
      encoding: "utf-8",
      flag: "wx",
    });
  }
}
