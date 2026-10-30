import type { FeatureId } from "./features.js";

export type Language = "javascript" | "typescript";
export type Linter = "oxlint" | "eslint" | "biome" | "none";
export type Formatter = "prettier" | "biome" | "none";

/** One answer per registered feature. */
export type FeatureAnswers = Record<FeatureId, boolean>;

/** Everything the user answered, collected before any files are written. */
export type ProjectAnswers = {
  projectName: string;
  language: Language;
  features: FeatureAnswers;
  linter: Linter;
  formatter: Formatter;
  installDependencies: boolean;
};

/** Final project files keyed by their path relative to the project root. */
export type ProjectFileMap = Record<string, string>;

/** The only parts of a feature package.json that get merged. */
export type PackageFragment = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
};
