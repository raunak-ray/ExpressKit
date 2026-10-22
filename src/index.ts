import { FileService } from "./services/file.service.js";
import { PromptService } from "./services/prompts.service.js";

async function main(): Promise<void> {
  const promptService = new PromptService();
  const fileService = new FileService();

  const projectName = await promptService.askProjectName();
  const selectedLanguage = await promptService.askLanguage();

  const projectPath = await fileService.createDirectory(projectName);

  await fileService.createFiles(projectPath, selectedLanguage, [
    // { fileName: "package.json" },
    { fileName: "server.js", destination: "src" },
    { fileName: "app.js", destination: "src" },
  ]);

  console.log(`Project directory: ${projectPath}`);
  console.log(`Selected language: ${selectedLanguage}`);
  console.log("Project created successfully!");
}

main().catch((err: unknown) => {
  const message =
    err instanceof Error ? err.message : "An unexpected error occurred";

  console.error(`ExpressKit: ${message}`);
  process.exitCode = 1;
});
