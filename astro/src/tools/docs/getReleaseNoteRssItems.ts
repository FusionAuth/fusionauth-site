import { getEntry } from 'astro:content';
import { getCollection } from 'astro:content';


export const getReleaseNoteRssItems = async () => {
  const archive = await getEntry('docs', 'release-notes/archive');
  const lines = archive.body.split("\n");
  const items = lines.map(line => line.match(/ReleaseNoteHeading version=['"]([^('|")]*)['"] releaseDate=['"]([^('|")]*)['"]/))
      .filter(line => !!line)
      .map(match => ({version: match[1], date: match[2]}))
      .map(version => ({
        version: version.version,
        versionRef: version.version.replaceAll('.', '-'),
        date: new Date(version.date.replace(/(\d+)(st|nd|rd|th)/, '$1'))
      }))
      .map(version => {
        const id = `https://fusionauth.io/docs/release-notes/archive#version-${version.versionRef}`;
        const link = id;
        const title = `Release ${version.version}`;
        const description = `Release ${version.version}`;
        const updated = version.date;
        return {
          id,
          link,
          description,
          title,
          pubDate: updated
        };
      });
  const nonArchivedReleases = await getCollection('releases');
  const nonArchivedItems = nonArchivedReleases.map(item => {
    const id = `https://fusionauth.io/docs/release-notes#version-${item.data.version.replace(/\./g, '-')}`;
    const link = id;
    const description = item.data.description? item.data.description : `Release ${item.data.version} includes bug fixes and performance updates.`;
    const content = item.data.blogpost? `For more information, check out our <a href="https://fusionauth.io/blog/${item.data.blogpost}">release post</a>.` : ``
    const title = `Release ${item.data.version}`;
    const updated = item.data.date;
    return {
      id,
      link,
      description,
      content,
      title,
      pubDate: updated
    };
  });
  const allItems = [...items, ...nonArchivedItems]

  allItems.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
  return allItems;
}
