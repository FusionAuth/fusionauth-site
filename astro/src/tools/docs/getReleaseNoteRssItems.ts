import { getCollection } from 'astro:content';
import { Marked } from 'marked';
import { parseReleaseItems, categoryLabel, FALLBACK_DESCRIPTION, releaseUrl } from './parseReleaseItems';

const md = new Marked();

async function itemsToHtml(body: string): Promise<string> {
  const items = parseReleaseItems(body);
  if (!items.length) return '';
  const parts = await Promise.all(
    items.map(async ({ category, body: rawBody }) => {
      const html = await md.parse(rawBody);
      return `<section data-category="${category}"><h4>${categoryLabel(category)}</h4>${html}</section>`;
    })
  );
  return parts.join('\n');
}

export const getReleaseNoteRssItems = async () => {
  const releases = await getCollection('releases');
  const items = await Promise.all(releases.map(async item => {
    const url = releaseUrl(item.data.version);
    const description = item.data.description ?? FALLBACK_DESCRIPTION(item.data.version);
    const content = await itemsToHtml(item.body ?? '');
    return {
      id: url,
      link: url,
      description,
      content: content || undefined,
      title: `Release ${item.data.version}`,
      pubDate: item.data.date,
    };
  }));

  items.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
  return items;
};
