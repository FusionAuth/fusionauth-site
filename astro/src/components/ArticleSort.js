"use strict";

// sort by featured descending unless equal, then by title descending, unless title overridden by sortTitle, which allows for finer grained sorting, in which case use sortTitle
export function sortArticle(a,b) {
  const titleToSortByForA = typeof(a.data.sortTitle) !== 'undefined' ? a.data.sortTitle : a.data.title
  const titleToSortByForB = typeof(b.data.sortTitle) !== 'undefined' ? b.data.sortTitle : b.data.title
  
  return Number(b.data.featured) - Number(a.data.featured) || titleToSortByForA.localeCompare(titleToSortByForB)
}
