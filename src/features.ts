/**
 * Every optional feature lives here once.
 *
 * To add a feature:
 *   1. Add templates/<language>/<id>/ with the files it adds or overrides.
 *   2. Add an entry to this array.
 *
 * The prompt, file layering, and package.json merging all derive from this list.
 */
export const FEATURES = [
  {
    id: "error-handler",
    prompt: "Create central error handling middleware?",
    defaultValue: true,
  },
] as const;

export type Feature = (typeof FEATURES)[number];
export type FeatureId = Feature["id"];
