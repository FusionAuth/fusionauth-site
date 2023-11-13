export const filterPartials = (entry) => {
  const parts = entry.slug.split("/");
  const doc = parts[parts.length - 1];
  return !doc.startsWith("_");
};
