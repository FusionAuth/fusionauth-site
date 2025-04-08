import { getDateString } from "./getDateString";
import { ParsedBlog } from "src/tools/blog";

/**
 * Returns either the updated date if available or the publish date if not in Month Day, Year format (ex, January 1, 1970)
 * @param post the ParsedBlog to parse
 */
export const getLatestDateString = (post: ParsedBlog): string =>
    getDateString(post.updated_date ? post.updated_date : post.publish_date);
