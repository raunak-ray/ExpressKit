import { createDirectory } from "./operations.js";
import { promptProjectName } from "./prompts.js";

async function main(): Promise<void> {
  const projectName = await promptProjectName();

  console.log("Project name:", projectName);

  await createDirectory(projectName);
}

main().catch((err) => {
  console.error("Something went wrong: ", err);
  process.exitCode = 1;
})
