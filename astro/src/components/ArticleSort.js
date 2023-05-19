"use strict";

// sort by sortOrder descending unless equal, then by title descending
export function sortArticle(a,b) {
  return a.data.sortOrder - b.data.sortOrder || a.data.title.localeCompare(b.data.title)
}
