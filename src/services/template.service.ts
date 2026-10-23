import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { FEATURES, type Feature } from "../features.js";
import type {
  Language,
  PackageFragment,
  ProjectAnswers,
  ProjectFileMap,
} from "../types.js";

type PackageJson = PackageFragment & Record<string, unknown>;

const PACKAGE_SECTIONS = [
  "dependencies",
  "devDependencies",
  "scripts",
] as const;

type PackageSection = (typeof PACKAGE_SECTIONS)[number];

export class TemplateService {
  private readonly templateRoot: string;

  constructor(templateRoot?: string) {
    if (templateRoot) {
      this.templateRoot = path.resolve(templateRoot);
      return;
    }

    const serviceDirectory = path.dirname(fileURLToPath(import.meta.url));

    // templates/ sits two levels up from src/services (and dist/services).
    this.templateRoot = path.resolve(serviceDirectory, "../../templates");
  }

  public async getAvailableFeatures(
    language: Language,
  ): Promise<Feature[]> {
    const languageDirectory = path.join(this.templateRoot, language);

    let entries;
    try {
      entries = await readdir(languageDirectory, { withFileTypes: true });
    } catch (error: unknown) {
      throw new Error(
        `Unable to read templates for "${language}" at "${languageDirectory}".`,
        { cause: error },
      );
    }

    const folders = new Set(
      entries
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name),
    );

    return FEATURES.filter((feature) => folders.has(feature.id));
  }

  /**
   * Builds the complete project in memory.
   *
   * Base files come first. Each enabled feature is then layered on top:
   * feature files replace base files with the same relative path, while new
   * paths are added. package.json is the exception — feature package.json
   * files are fragments merged into the base package.json.
   */
  public async buildFilePlan(
    answers: ProjectAnswers,
  ): Promise<ProjectFileMap> {
    const baseFiles = await this.readLayer(answers.language, "base");
    const basePackageSource = baseFiles["package.json"];

    if (basePackageSource === undefined) {
      throw new Error(
        `Base template for "${answers.language}" is missing package.json.`,
      );
    }

    let packageJson = this.parseJson<PackageJson>(
      basePackageSource,
      `${answers.language}/base/package.json`,
    );

    let files: ProjectFileMap = { ...baseFiles };

    for (const feature of FEATURES) {
      if (!answers.features[feature.id]) {
        continue;
      }

      const layer = await this.readLayer(answers.language, feature.id);
      const fragmentSource = layer["package.json"];

      if (fragmentSource !== undefined) {
        const fragment = this.parsePackageFragment(
          fragmentSource,
          feature.id,
        );

        packageJson = this.mergePackageJson(
          packageJson,
          fragment,
          feature.id,
        );

        // The merged package.json is written last, not copied from the layer.
        delete layer["package.json"];
      }

      files = { ...files, ...layer };
    }

    files["package.json"] = `${JSON.stringify(packageJson, null, 2)}\n`;

    return files;
  }

  private async readLayer(
    language: Language,
    layerName: string,
  ): Promise<ProjectFileMap> {
    const layerDirectory = path.join(
      this.templateRoot,
      language,
      layerName,
    );

    try {
      await access(layerDirectory);
    } catch (error: unknown) {
      throw new Error(
        `Template folder not found: "${language}/${layerName}".`,
        { cause: error },
      );
    }

    return this.readDirectory(layerDirectory);
  }

  private async readDirectory(
    root: string,
    relativeDirectory = "",
  ): Promise<ProjectFileMap> {
    const directory = path.join(root, relativeDirectory);
    const entries = await readdir(directory, { withFileTypes: true });
    const files: ProjectFileMap = {};

    for (const entry of entries) {
      const relativePath = relativeDirectory
        ? path.posix.join(relativeDirectory, entry.name)
        : entry.name;

      if (entry.isDirectory()) {
        Object.assign(
          files,
          await this.readDirectory(root, relativePath),
        );
      } else if (entry.isFile()) {
        files[relativePath] = await readFile(
          path.join(root, relativePath),
          "utf8",
        );
      }
    }

    return files;
  }

  private parsePackageFragment(
    source: string,
    featureId: string,
  ): PackageFragment {
    const parsed = this.parseJson<Record<string, unknown>>(
      source,
      `${featureId}/package.json`,
    );

    const unknownKeys = Object.keys(parsed).filter(
      (key) => !PACKAGE_SECTIONS.includes(key as PackageSection),
    );

    if (unknownKeys.length > 0) {
      throw new Error(
        `Feature "${featureId}" has unsupported package.json keys: ${unknownKeys.join(
          ", ",
        )}. Only ${PACKAGE_SECTIONS.join(", ")} can be merged.`,
      );
    }

    const fragment: PackageFragment = {};

    for (const section of PACKAGE_SECTIONS) {
      const value = parsed[section];

      if (value === undefined) {
        continue;
      }

      if (!this.isStringRecord(value)) {
        throw new Error(
          `"${section}" in feature "${featureId}" package.json must be an object of string values.`,
        );
      }

      fragment[section] = value;
    }

    return fragment;
  }

  private mergePackageJson(
    base: PackageJson,
    fragment: PackageFragment,
    featureId: string,
  ): PackageJson {
    const merged: PackageJson = { ...base };

    for (const section of PACKAGE_SECTIONS) {
      const additions = fragment[section];

      if (!additions) {
        continue;
      }

      const target: Record<string, string> = merged[section]
        ? { ...merged[section] }
        : {};

      for (const [name, value] of Object.entries(additions)) {
        const existing = target[name];

        if (existing !== undefined && existing !== value) {
          throw new Error(
            `Feature "${featureId}" conflicts with package.json ${section} entry "${name}": "${existing}" (existing) vs "${value}" (feature).`,
          );
        }

        target[name] = value;
      }

      merged[section] = target;
    }

    return merged;
  }

  private isStringRecord(value: unknown): value is Record<string, string> {
    return (
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value) &&
      Object.values(value).every((item) => typeof item === "string")
    );
  }

  private parseJson<T>(source: string, templatePath: string): T {
    try {
      return JSON.parse(source) as T;
    } catch (error: unknown) {
      throw new Error(`Invalid JSON in template "${templatePath}".`, {
        cause: error,
      });
    }
  }
}
