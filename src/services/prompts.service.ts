import { cancel, isCancel, select, text } from "@clack/prompts";
import type { Language } from "../types.js";

export class PromptService {
  private readonly LANGUAGE_OPTIONS: {
    value: Language;
    label: string;
  }[] = [
    { value: "javascript", label: "JavaScript" },
    { value: "typescript", label: "TypeScript" },
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

    this.handleCancel(response);

    return response.trim();
  }

  public async askLanguage(): Promise<Language> {
    const response = await select({
      message: "Which language would you like to use?",
      options: this.LANGUAGE_OPTIONS,
      initialValue: "javascript",
    });

    this.handleCancel(response);

    if (response !== "javascript" && response !== "typescript") {
      throw new Error("Invalid language selection.");
    }

    return response;
  }

  private handleCancel(response: unknown): asserts response is string {
    if (isCancel(response)) {
      cancel("Project setup cancelled.");
      process.exit(0);
    }
  }
}
