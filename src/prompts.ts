import { cancel, isCancel, text } from "@clack/prompts";

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

  if (isCancel(response)) {
    cancel("Project creation cancelled");
    process.exit(0);
  }

  return response.trim();
}
