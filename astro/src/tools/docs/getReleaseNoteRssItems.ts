import { getCollection } from 'astro:content';


export const getReleaseNoteRssItems = async () => {
  const releases = await getCollection('releases');
  const items = releases.map(item => {
    const id = `https://fusionauth.io/docs/release-notes#version-${item.data.version.replace(/\./g, '-')}`;
    const link = id;
    const description = item.data.description? item.data.description : `Release ${item.data.version} includes bug fixes and performance updates.`;
    const title = `Release ${item.data.version}`;
    const updated = item.data.date;
    return {
      id,
      link,
      description,
      title,
      pubDate: updated
    };
  });

  items.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
  return items;
}
