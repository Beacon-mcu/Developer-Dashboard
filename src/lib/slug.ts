import type { App } from "./api";

// Address bars show the app's name ("/apps/my-app/playground"), not its Client ID.
// Two apps with the same name get "-2", "-3"... in the order they were created.

const slugify = (name: string): string =>
  name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "") || "app";

// Every app's slug, given all of the developer's apps.
export function slugsFor(apps: App[]): Map<string, string> {
  const ordered = [...apps].sort((a, b) => a.created_at - b.created_at || a.client_id.localeCompare(b.client_id));
  const used = new Map<string, number>(); // base slug -> how many apps already use it
  const slugs = new Map<string, string>(); // client_id -> slug
  for (const app of ordered) {
    const base = slugify(app.name);
    const count = (used.get(base) ?? 0) + 1;
    used.set(base, count);
    slugs.set(app.client_id, count === 1 ? base : `${base}-${count}`);
  }
  return slugs;
}

export const findBySlug = (apps: App[], slug: string): App | null => {
  const slugs = slugsFor(apps);
  // An old link that still has the Client ID in it also works (and is then replaced with the name).
  return apps.find((a) => slugs.get(a.client_id) === slug) ?? apps.find((a) => a.client_id === slug) ?? null;
};
