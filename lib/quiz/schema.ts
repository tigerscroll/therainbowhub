export function schemaObject(value: unknown, name: string, file: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${file}: ${name} must be an object.`);
  }
  return value as Record<string, unknown>;
}

export function schemaText(value: unknown, name: string, file: string) {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${file}: ${name} is required.`);
  return value;
}

export function schemaStrings(value: unknown, name: string, file: string) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || !item.trim())) {
    throw new Error(`${file}: ${name} must be a string array.`);
  }
  return value as string[];
}

export function assertExactKeys(
  value: Record<string, unknown>,
  allowed: readonly string[],
  name: string,
  file: string,
) {
  const extras = Object.keys(value).filter((key) => !allowed.includes(key));
  if (extras.length) throw new Error(`${file}: ${name} has unsupported keys: ${extras.join(", ")}.`);
}
