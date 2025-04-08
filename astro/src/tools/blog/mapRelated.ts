import { BlogContent } from "./BlogContent";
import { ParsedBlog } from "./ParsedBlog";
import { sortByDate } from "./sortByDate";
import { parseContent } from "./parseContent";

type MetaSection = "categories" | "authors" | "tags";

/**
 * Maps raw blog content to parsed content for related posts, filtering to top three and ordering by date
 * @param collection all blogs to parse through
 * @param metaSection which section to filter on
 * @param target the target metaSection value to filter for
 * @param currentSlug the current post to exclude from the results
 */
export const mapRelated = (collection: BlogContent[], metaSection: MetaSection, target: string, currentSlug: string): ParsedBlog[] =>
    collection ? collection
        .filter(blog => blog.data
            && blog.data[metaSection]
            && blog.data[metaSection].split(',').includes(target)
            && blog.slug !== currentSlug)
        .sort(sortByDate)
        .slice(0, 3)
        .map(parseContent) : [];
