export type CreateResourceInput = {
  name: string;
};

export function getResourceName(input: CreateResourceInput): string {
  return input.name.trim().replace(/\s+/g, " ");
}
