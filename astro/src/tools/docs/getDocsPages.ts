import { getCollection } from 'astro:content';
import { filterPartials } from 'src/tools/docs/filterPartials';

export const getDocsPages = async () => await getCollection('docs', filterPartials);