import { getCollection } from 'astro:content';
import { filterDocs } from 'src/tools/docs/filterDocs';

/**
 * Get static paths for docs. filters out partials (starts with "_")
 * @param path the path of hte current subdirectory in the docs tree
 */
export const getStaticDocPaths = (path: string) => {
  return async () => {
    const entries = await getCollection('docs', entry => filterDocs(entry, path));
    return entries.map(entry => {
      const slug = entry.slug.replace(path, '');
      //@ts-ignore
      entry.slug = slug;
      return {
        params: { slug }, props: { entry },
      }
    });
  }
};