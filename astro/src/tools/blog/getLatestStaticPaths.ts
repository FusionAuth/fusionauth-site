import { getCollection } from 'astro:content';
import { GetStaticPathsResult, PaginateFunction, PaginateOptions } from 'astro';
import { sortByDate } from "./sortByDate";

/**
 * Returns data for GetStaticPaths for the blog landing page. Paginates them to a default page size of 7
 *
 * @param paginate paginate astro function
 * @return the static paths result from the paginate function
 */
export const getLatestStaticPaths = async (paginate: PaginateFunction): Promise<GetStaticPathsResult> => {
  const blogs = await getCollection('blog');

  // newest first
  blogs.sort(sortByDate);

  return paginate(blogs, {
    pageSize: 7
  } as PaginateOptions);
};
