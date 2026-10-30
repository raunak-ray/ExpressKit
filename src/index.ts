#!/usr/bin/env node

import { spinner } from "@clack/prompts";
import type { ProjectAnswers } from "./types.js";
import { FileService } from "./services/file.service.js";
import { ProjectService } from "./services/project.service.js";
import { PromptService } from "./services/prompts.service.js";
import { TemplateService } from "./services/template.service.js";

async function main(): Promise<void> {
  const promptService = new PromptService();
  const fileService = new FileService();
  const templateService = new TemplateService();

  // 1. Collect every answer first — the spinner only starts after all prompts are done
  const projectName = await promptService.askProjectName();
  const language = await promptService.askLanguage();
  const availableFeatures =
    await templateService.getAvailableFeatures(language);
  const features = await promptService.askFeatureAnswers(availableFeatures);
  const linter = await promptService.askLinter();
  const formatter = await promptService.askFormatter();
  const installDependencies = await promptService.askShouldInstall();

  const answers: ProjectAnswers = {
    projectName,
    language,
    features,
    linter,
    formatter,
    installDependencies,
  };

  // 2. Run the commands behind a spinner
  const loading = spinner();
  loading.start("Creating project");

  try {
    const projectPath = await fileService.createDirectory(projectName);
    const projectService = new ProjectService(projectPath, answers);
    await projectService.createProject();

    if (installDependencies) {
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
