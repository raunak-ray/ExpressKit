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

  public async basicProjectSetup(): Promise<void> {
    await this.fileService.createFiles(
      this.projectPath,
      this.selectedLanguage,
      this.getTemplateFiles(),
    );
  }

  public async runInstallCommand(): Promise<void> {
    return new Promise((resolve, reject) => {
      const child = spawn("npm", ["install"], {
        cwd: this.projectPath, // run inside the NEW project, not where the CLI was launched
        stdio: "inherit", // stream npm's output live so it's visible in the terminal
        shell: process.platform === "win32",
      });

      child.on("error", reject);

      child.on("close", (code: number) => {
        if (code === 0) {
          console.log("All dependencies installed...");
          resolve();
        } else {
          reject(new Error(`npm install failed with error code: ${code}`));
        }
      });
    });
  }

  // Both languages share the same layout — only the source extension differs.
  private getTemplateFiles(): TemplateFile[] {
    const extension = this.selectedLanguage === "typescript" ? "ts" : "js";

    return [
      { fileName: "package.json" },
      ...(this.selectedLanguage === "typescript"
        ? [{ fileName: "tsconfig.json" }]
        : []),
      { fileName: `app.${extension}`, destination: "src" },
      { fileName: `server.${extension}`, destination: "src" },
    ];
  }
}
