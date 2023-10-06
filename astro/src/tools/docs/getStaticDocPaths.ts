import { getCollection } from 'astro:content';
import { filterPartials } from './filterPartials';

/**
 * Get static paths for docs. filters out partials (starts with "_")
 * @param path the path of hte current subdirectory in the docs tree
 */
export const getStaticDocPaths = (path: string) => {
  return async () => {
    const entry = await getCollection('docs', filterPartials);
    return entry.map(entry => {
      const slug = entry.slug.replace(path, '');
      //@ts-ignore
      entry.slug = slug;
      return {
        params: { slug }, props: { entry },
      }
    });
  }
};