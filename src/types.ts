export type Language = "javascript" | "typescript";

export type TemplateFile = {
  fileName: string;
  /** Folder inside the new project; empty (default) means the project root. */
  destination?: string;
  /** Folder inside templates/<language>/; defaults to `destination`. */
  source?: string;
};
