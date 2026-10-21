import { mkdir } from "node:fs/promises";

export async function createDirectory(dirName: string) {
  if (dirName === ".") return;

  const path = `./${dirName}`;

  await mkdir(path, { recursive: true });
}
