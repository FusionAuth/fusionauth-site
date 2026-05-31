import { GetStaticPathsResult, PaginateFunction, PaginateOptions } from "astro";
import { getCollection } from "astro:content";
import { BlogContent } from "./BlogContent";
import { BlogFrontmatter } from "./BlogFrontmatter";
import { sortByDate } from "./sortByDate";

export const getAllEntries = (
  blogs: BlogContent[],
  attribute: keyof BlogFrontmatter
) => {
  const reducer = (entries, entry) => {
    if (!entries.includes(entry)) {
      entries.push(entry);
    }
    return entries;
  };
  return blogs
    .flatMap((blog) =>
      (blog.data[attribute] as string).split(",").map((entry) => entry.trim())
    )
    .filter((entry) => !!entry)
    .reduce(reducer, []);
};

/**
 * Returns data for GetStaticPaths for the blog index pages. Paginates them to a default page size of 7
 *
 * @param paginate paginate astro function
 * @param attribute which frontmatter attribute to parse for
 * @param paramName which parameter to add the normalized value to
 * @return the static paths result from the paginate function
 */
/**
 * Returns data for GetStaticPaths for the blog index pages. Paginates them to a default page size of 7
 *
 * @param paginate paginate astro function
 * @param attribute which frontmatter attribute to parse for
 * @param paramName which parameter to add the normalized value to
 * @return the static paths result from the paginate function
 */
export const getStaticIndexPaths = async (
  paginate: PaginateFunction,
  attribute: keyof BlogFrontmatter,
  paramName: 'tag' | 'author'
): Promise<GetStaticPathsResult> => {
  const blogs = await getCollection('blog');

  const allRawEntries = getAllEntries(blogs, attribute);

  // Deduplicate based on the final URL slug, mapping slug -> Display Name
  const uniqueSlugs = new Map<string, string>();
  allRawEntries.forEach(entry => {
    const slug = entry.trim().replaceAll(' ', '-').toLowerCase();
    if (!uniqueSlugs.has(slug)) {
      uniqueSlugs.set(slug, entry); // Save the first found format as the readable name
    }
  });

  return Array.from(uniqueSlugs.entries()).flatMap(([slug, displayName]) => {

    const filteredPosts = blogs.filter((post) => {
      // Convert the post's comma-separated string into an array of slugs
      const postEntries = (post.data[attribute] as string)
        .split(",")
        .map(e => e.trim().replaceAll(' ', '-').toLowerCase());

      return postEntries.includes(slug);
    });

    filteredPosts.sort(sortByDate);

    const params: Record<string, string> = {};
    params[paramName] = slug; // Use the deduplicated slug

    const props: Record<string, string> = {};
    props[paramName + "Name"] = displayName; // Use the preserved readable name

    return paginate(filteredPosts, {
      params,
      props,
      pageSize: 7
    } as PaginateOptions);
  });
};

/**
 * Returns data for GetStaticPaths for the blog tag index pages. Paginates them to a default page size of 7
 *
 * @param paginate paginate astro function
 * @return the static paths result from the paginate function
 */
export const getStaticTagPaths = async (paginate) => getStaticIndexPaths(paginate, 'tags', 'tag');

/**
 * Returns data for GetStaticPaths for the blog category index pages. Paginates them to a default page size of 7
 *
 * @param paginate paginate astro function
 * @return the static paths result from the paginate function
 */
export const getStaticCategoryPaths = async (paginate: PaginateFunction): Promise<GetStaticPathsResult> => {
  const blogs = await getCollection('blog');
  const allTags = getAllEntries(blogs, "categories");

  return allTags.flatMap((target) => {

    const filteredPosts = blogs.filter((post) => post.data["categories"].includes(target));
    // newest first
    filteredPosts.sort(sortByDate);
    const params: Record<string, string> = {};
    params["category"] = target.trim().replaceAll(' ', '-').toLowerCase();

    // Put the readable name into the astro props
    const props: Record<string, string> = {};
    props["category" + "Name"] = target;

    return paginate(filteredPosts, {
      params,
      props,
      pageSize: 7
    } as PaginateOptions);
  });
};

/**
 * Returns data for GetStaticPaths for the blog author index pages. Paginates them to a default page size of 7
 *
 * @param paginate paginate astro function
 * @return the static paths result from the paginate function
 */
export const getStaticAuthorPaths = async (paginate) => getStaticIndexPaths(paginate, 'authors', 'author');
