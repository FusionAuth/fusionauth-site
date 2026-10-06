const cache = new Map<string, readonly string[]>();

// comma-separated frontmatter tags, lowercased; memoized since every page scores every entry
export function parseTagList(tags?: string): readonly string[] {
  if (!tags) return [];
  let list = cache.get(tags);
  if (!list) {
    list = Object.freeze(tags.split(',').map(t => t.trim().toLowerCase()));
    cache.set(tags, list);
  }
  return list;
}
