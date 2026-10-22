import { FileService } from "./services/file.service";
import { ProjectService } from "./services/project.service";
import { PromptService } from "./services/prompts.service";

async function main(): Promise<void> {
  const promptService = new PromptService();
  const fileService = new FileService();

  // 1. Ask what to create
  const projectName = await promptService.askProjectName();
  const language = await promptService.askLanguage();
  const shouldInstallDependencies = await promptService.askShouldInstall();

  // 2. Create the project folder
  const projectPath = await fileService.createDirectory(projectName);

  // 3. Copy the template files for the chosen language
  const projectService = new ProjectService(projectPath, language);
  await projectService.basicProjectSetup();

  if (shouldInstallDependencies) {
    await projectService.runInstallCommand();
  }

  console.log(`Created ${language} project at ${projectPath}`);
}

main().catch((err: unknown) => {
  const message =
    err instanceof Error ? err.message : "An unexpected error occurred";

  console.error(`ExpressKit: ${message}`);
  process.exitCode = 1;
});
