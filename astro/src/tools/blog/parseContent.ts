import { marked } from 'marked';
import { BlogContent } from "./BlogContent";
import { ParsedBlog } from "./ParsedBlog";

/**
 * Takes in the blog content as returned from getCollection and parses it to a friendly object for the blog pages to use.
 *
 * This will grab and render the content above the `excerpt_separator` as markdown after stripping off any imports.
 * Authors, Categories, Tags will be split by comma and added to object. The slug will be added, and the rest of the frontmatter
 * will be present
 *
 * @param blog to be parsed.
 */
export const parseContent = (blog: BlogContent): ParsedBlog => {
  // parse the excerpt "blurb"
  const blurbLines: string[] = [];
  const separator = blog.data.excerpt_separator;
  const lines = blog.body.split('\n');

  for (let line of lines) {
    // stop at the excerpt_separator line
    if (separator && line.includes(separator)) {
      break;
    }

    // filter out imports
    if (line && !line.trim().startsWith('import')) {
      blurbLines.push(line);
    }
  }

  // remove markdown headings, code formatting, and links from the blurb
  let blurb = blurbLines.map((l) => l.replace(/^##* /, '').replaceAll('`', '')).join('\n');

  blurb = blurb.replaceAll(/\[([^\]]*)]\([^)]*\)/g, (t) => {
    return t.replace('[', '').replace(/].*/, '');
  });

  // and trim
  if (blurb.length > 160) {
    blurb = blurb.substring(0, 160);

    // don't split mid-word
    const snapPoint = Math.max(...[' ', '.'].map(c => blurb.lastIndexOf(c)))
    blurb = blurb.substring(0, snapPoint) + '...';
  }

  // split frontmatter lists to arrays
  const categories = blog.data.categories.split(',').map(cat => cat.trim());
  const tags = blog.data.tags.split(',').map(tag => tag.trim());
  const authors = blog.data.authors.split(',').map(author => author.trim());

  return {
    ...blog.data,
    blurb,
    slug: blog.slug,
    categories,
    tags,
    authors
  };
};
