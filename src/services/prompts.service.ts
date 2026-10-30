import { cancel, confirm, isCancel, select, text } from "@clack/prompts";
import { FEATURES, type Feature } from "../features.js";
import type { FeatureAnswers, Formatter, Language, Linter } from "../types.js";

export class PromptService {
  private readonly LANGUAGE_OPTIONS: {
    value: Language;
    label: string;
  }[] = [
    { value: "javascript", label: "JavaScript" },
    { value: "typescript", label: "TypeScript" },
  ];

  private readonly LINTER_OPTIONS: {
    value: Linter;
    label: string;
  }[] = [
    { value: "none", label: "None" },
    { value: "eslint", label: "ESLint" },
    { value: "biome", label: "Biome" },
    { value: "oxlint", label: "Oxlint" },
  ];

  private readonly FORMATTER_OPTIONS: {
    value: Formatter;
    label: string;
  }[] = [
    { value: "none", label: "None" },
    { value: "prettier", label: "Prettier" },
    { value: "biome", label: "Biome" },
  ];

  public async askProjectName(): Promise<string> {
    const response = await text({
      message: "What would you like to name your project?",
      placeholder: "my-api",
      defaultValue: ".",
      validate(value) {
        if (!value?.trim()) {
          return "Please enter a project name or '.' to use the current directory.";
        }
      },
    });

    this.handleCancel<string>(response);

    return response.trim();
  }

  public async askLanguage(): Promise<Language> {
    const response = await select({
      message: "Which language would you like to use?",
      options: this.LANGUAGE_OPTIONS,
      initialValue: "javascript",
    });

    this.handleCancel<Language>(response);

    return response;
  }

  /**
   * Asks one confirm per registered feature available for the chosen
   * language. Unavailable features default to false.
   */
  public async askFeatureAnswers(
    availableFeatures: readonly Feature[],
  ): Promise<FeatureAnswers> {
    const answers = Object.fromEntries(
      FEATURES.map((feature) => [feature.id, false]),
    ) as FeatureAnswers;

    for (const feature of availableFeatures) {
      const response = await confirm({
        message: feature.prompt,
        initialValue: feature.defaultValue,
      });

      this.handleCancel<boolean>(response);

      answers[feature.id] = response;
    }

    return answers;
  }

  public async askLinter(): Promise<Linter> {
    const response = await select({
      message: "Which linter would you like to use?",
      options: this.LINTER_OPTIONS,
      initialValue: "oxlint",
    });

    this.handleCancel<Linter>(response);

    return response;
  }

  public async askFormatter(): Promise<Formatter> {
    const response = await select({
      message: "Which formatter would you like to use?",
      options: this.FORMATTER_OPTIONS,
      initialValue: "biome",
    });

    this.handleCancel<Formatter>(response);

    return response;
  }

  public async askShouldInstall(): Promise<boolean> {
    const response = await confirm({
      message: "Install dependencies?",
      initialValue: true,
    });

    this.handleCancel<boolean>(response);

    return response;
  }

  // Catches Ctrl+C / Esc so the CLI exits cleanly instead of crashing.
  private handleCancel<T>(response: unknown): asserts response is T {
    if (isCancel(response)) {
      cancel("Project setup cancelled.");
      process.exit(0);
    }
  }
}
