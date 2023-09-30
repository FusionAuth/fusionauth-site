import { getCollection } from "astro:content";

export const filterPartials = (entry) => {
  const parts = entry.slug.split("/");
  const doc = parts[parts.length - 1];
  return !doc.startsWith("_");
};

export const getStaticDocPaths = (path: string) => {
  return async () => {
    const entry = await getCollection('docs', filterPartials);
    return entry.map(entry => {
      const slug = entry.slug.replace(path, '');
      entry.slug = slug;
      return {
        params: { slug }, props: { entry },
      }
    });
  }
}