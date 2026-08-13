export function slugifyOrgName(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return base || "organization";
}

export function uniqueOrgSlug(name: string): string {
  const base = slugifyOrgName(name);
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base}-${suffix}`;
}
