import { spawn } from "node:child_process";
import type { ProjectAnswers } from "../types.js";
import { FileService } from "./file.service.js";
import { TemplateService } from "./template.service.js";

export class ProjectService {
  private readonly projectPath: string;
  private readonly answers: ProjectAnswers;
  private readonly fileService: FileService;
  private readonly templateService: TemplateService;

  constructor(
    projectPath: string,
    answers: ProjectAnswers,
    fileService = new FileService(),
    templateService = new TemplateService(),
  ) {
    this.projectPath = projectPath;
    this.answers = answers;
    this.fileService = fileService;
    this.templateService = templateService;
  }

  public async createProject(): Promise<void> {
    const files = await this.templateService.buildFilePlan(this.answers);

    // Build the whole plan first, then write it in one pass.
    await this.fileService.writeFiles(this.projectPath, files);
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
}
