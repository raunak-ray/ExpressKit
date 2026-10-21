import { createDirectory, readFileContents, readTemplate } from "./operations.js";
import { promptLanguageSelection, promptProjectName } from "./prompts.js";

async function main(): Promise<void> {
  const projectName = await promptProjectName();
  const language = await promptLanguageSelection();

  console.log("Project name:", projectName);
  console.log("Selected language:", language);

  // await createDirectory(projectName);
  console.log(await readTemplate(language, "server.js"))
}

main().catch((err) => {
  console.error("Something went wrong: ", err);
  process.exitCode = 1;
})
