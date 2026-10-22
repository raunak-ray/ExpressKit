import type { Language, TemplateFile } from "@/types";
import { FileService } from "./file.service";
import { spawn } from "node:child_process";

export class ProjectService {
  private readonly projectPath: string;
  private readonly selectedLanguage: Language;
  private readonly fileService: FileService;

  constructor(projectPath: string, selectedLanguage: Language) {
    this.projectPath = projectPath;
    this.selectedLanguage = selectedLanguage;
    this.fileService = new FileService();
  }

  public async createProject(shouldCreateCentralError: boolean): Promise<void> {
    await this.fileService.createFiles(
      this.projectPath,
      this.selectedLanguage,
      this.getTemplateFiles(shouldCreateCentralError),
    );
  }

  public async runInstallCommand(): Promise<void> {
    return new Promise((resolve, reject) => {
      const child = spawn("npm", ["install"], {
        cwd: this.projectPath, // run inside the NEW project, not where the CLI was launched
        stdio: ["ignore", "ignore", "pipe"], // hide npm output from the spinner; stderr kept for errors
        shell: process.platform === "win32",
      });

      let stderr = "";
      child.stderr?.on("data", (chunk: Buffer) => {
        stderr += chunk.toString();
      });

      child.on("error", reject);

      child.on("close", (code: number) => {
        if (code === 0) {
          resolve();
        } else {
          const details = stderr.trim();

          reject(
            new Error(
              `npm install failed with exit code ${code}${details ? `\n${details}` : ""}`,
            ),
          );
        }
      });
    });
  }

  // Template folders mirror the new project — source defaults to destination.
  private getTemplateFiles(shouldCreateCentralError: boolean): TemplateFile[] {
    const extension = this.selectedLanguage === "typescript" ? "ts" : "js";

    // "No" → the same app, just without the middleware wiring.
    const appFile: TemplateFile = shouldCreateCentralError
      ? { fileName: `app.${extension}`, destination: "src" }
      : { fileName: `app.${extension}`, source: "basic", destination: "src" };

    const files: TemplateFile[] = [
      { fileName: "package.json" },
      ...(this.selectedLanguage === "typescript"
        ? [{ fileName: "tsconfig.json" }]
        : []),
      { fileName: `server.${extension}`, destination: "src" },
      appFile,
      { fileName: `helpers.${extension}`, destination: "src/utils" },
      { fileName: `responseHelpers.${extension}`, destination: "src/utils" },
    ];

    if (shouldCreateCentralError) {
      files.push(
        { fileName: `AppError.${extension}`, destination: "src/utils" },
        {
          fileName: `error.middleware.${extension}`,
          destination: "src/middleware",
        },
        {
          fileName: `notFound.middleware.${extension}`,
          destination: "src/middleware",
        },
      );
    }

    return files;
  }
}
