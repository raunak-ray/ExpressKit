import { spinner } from "@clack/prompts";
import { FileService } from "./services/file.service";
import { ProjectService } from "./services/project.service";
import { PromptService } from "./services/prompts.service";

async function main(): Promise<void> {
  const promptService = new PromptService();
  const fileService = new FileService();

  // 1. Collect every answer first — the spinner only starts after all prompts are done
  const projectName = await promptService.askProjectName();
  const language = await promptService.askLanguage();
  const shouldCreateCentralError = await promptService.askCentralErrorHandler();
  const shouldInstallDependencies = await promptService.askShouldInstall();

  // 2. Run the commands behind a spinner
  const loading = spinner();
  loading.start("Creating project");

  try {
    const projectPath = await fileService.createDirectory(projectName);
    const projectService = new ProjectService(projectPath, language);
    await projectService.createProject(shouldCreateCentralError);

    if (shouldInstallDependencies) {
      loading.message("Installing dependencies");
      await projectService.runInstallCommand();
    }

    loading.stop(`Created ${language} project at ${projectPath}`);
  } catch (error) {
    loading.error("Project creation failed");
    throw error;
  }
}

main().catch((err: unknown) => {
  const message =
    err instanceof Error ? err.message : "An unexpected error occurred";

  console.error(`ExpressKit: ${message}`);
  process.exitCode = 1;
});
