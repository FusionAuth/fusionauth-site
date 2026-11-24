import { getCollection } from 'astro:content';
import { getOgImage as renderOgImage } from 'astro-better-og-images/runtime';

const SECTIONS: Record<string, string> = { docs: 'Docs', articles: 'Articles', blog: 'Blog' };

// folder index titles by folder; getEntry warns for top-level pages such as /docs/release-notes
let folderTitles: Promise<Map<string, string>> | undefined;
const loadFolderTitles = async () => new Map((await getCollection('docs'))
  .filter(entry => /^[^/]+\/index$/.test(entry.id))
  .map(entry => [entry.id.slice(0, -'/index'.length), entry.data.title]));

// "Docs / APIs" for a docs page, from the title of the top-level folder's index page
const sectionLabel = async (pathname: string): Promise<string> => {
  const [section, folder] = pathname.replace(/\.html$/, '').split('/').filter(Boolean);
  const name = SECTIONS[section];
  if (!name) return '';
  if (section !== 'docs' || !folder) return name;
  const title = (await (folderTitles ??= loadFolderTitles())).get(folder);
  return title ? `${name} / ${title}` : name;
};

/** The Open Graph image for a page: a resized copy of the page's own raster image, or a generated title card. */
export async function getOgImage(pathname: string, title: string, source?: string) {
  return renderOgImage({ title, label: await sectionLabel(pathname), source });
}
