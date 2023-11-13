import { getCollection } from 'astro:content';

export const getDocsPages = async () => await getCollection('docs');