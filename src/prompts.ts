import { cancel, isCancel, select, text } from "@clack/prompts";
import type { Language } from "./types.js";

function handleCancel(response: unknown): asserts response is string {
  if (isCancel(response)) {
    cancel("Project creation cancelled");
    process.exit(0);
  }
}

export async function promptProjectName(): Promise<string> {
  const response = await text({
    message: "What shall be the name of the project?",
    placeholder: "my-api",
    defaultValue: ".",
    validate(value) {
      if (!value?.trim()) {
        return "Please enter a valid project name or '.' for using current directory";
      }
    },
  });

  handleCancel(response);

  return response.toString().trim();
}

export async function promptLanguageSelection(): Promise<Language> {
  const response = await select({
    message: "Please select language: ",
    options: [
      { value: "javascript", label: "Javascript" },
      { value: "typescript", label: "Typescript" },
    ],
    initialValue: "javascript",
  });

  handleCancel(response);

  if (response !== "javascript" && response !== "typescript") {
    throw new Error("Invalid language selection");
  }

  return response;
}
