import { refCase } from 'src/tools/string/refCase';

/**
 * Takes the name of the tag, author, or category, lowercases and replaces spaces with - and returns the friendly relative ref to the page
 * @param name of author, category, or tag
 * @param section category, tag, or author
 * @return the href or empty string if missing params
 */
export const getHref = (
  name: string,
  section: "author" | "category" | "tag"
): string =>
  !!name && !!section
    ? '/blog/' + section + '/' + refCase(name) + '/'
    : "";
