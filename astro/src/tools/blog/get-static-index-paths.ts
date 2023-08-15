import { getCollection } from 'astro:content';
import { GetStaticPathsResult, PaginateFunction, PaginateOptions } from 'astro';
import { sortByDate } from './sort-by-date';
import { BlogContent } from './blog-content';
import { BlogFrontmatter } from './blog-frontmatter';

const getAllEntries = (blogs: BlogContent[], attribute: keyof BlogFrontmatter) => {
  const reducer = (entries, entry) => {
    if (!entries.includes(entry)) {
      entries.push(entry);
    }
    return entries;
  }
  return blogs.flatMap(blog => (blog.data[attribute] as string)
      .split(',')
      .map(entry => entry.trim()))
      .filter(entry => !!entry)
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
export const getStaticIndexPaths = async (paginate: PaginateFunction, attribute: keyof BlogFrontmatter, paramName: 'tag' | 'category' | 'author'): Promise<GetStaticPathsResult> => {
  const blogs = await getCollection('blog');
  const allTags = getAllEntries(blogs, attribute)
  return allTags.map((target) => {

    const filteredPosts = blogs.filter((post) => post.data[attribute].includes(target));
    // newest first
    filteredPosts.sort(sortByDate);
    const params = {} as any;
    params[paramName] = target.trim().replaceAll(' ', '-').toLowerCase();

    // Put the readable name into the astro props
    const props = {} as any;
    props[paramName + "Name"] = target;

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
export const getStaticCategoryPaths = async (paginate) => getStaticIndexPaths(paginate, 'categories', 'category');

/**
 * Returns data for GetStaticPaths for the blog author index pages. Paginates them to a default page size of 7
 *
 * @param paginate paginate astro function
 * @return the static paths result from the paginate function
 */
export const getStaticAuthorPaths = async (paginate) => getStaticIndexPaths(paginate, 'authors', 'author');