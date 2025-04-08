import { getEntry } from 'astro:content';

export const getReleaseNoteRssItems = async () => {
  const releaseNotes = await getEntry('docs', 'release-notes');
  const archive = await getEntry('docs', 'release-notes/archive');
  const releaseLines = releaseNotes.body.split("\n");
  const archiveLines = archive.body.split("\n");
  const lines = [...releaseLines, ...archiveLines];
  const items = lines.map(line => line.match(/ReleaseNoteHeading version=['"]([^('|")]*)['"] releaseDate=['"]([^('|")]*)['"]/))
      .filter(line => !!line)
      .map(match => ({version: match[1], date: match[2]}))
      .map(version => ({
        version: version.version,
        versionRef: version.version.replaceAll('.', '-'),
        date: new Date(version.date.replace(/(\d+)(st|nd|rd|th)/, '$1'))
      }))
      .map(version => {
        const id = `https://fusionauth.io/docs/release-notes#version-${version.versionRef}`;
        const link = id;
        const title = `Release ${version.version}`;
        const updated = version.date;
        return {
          id,
          link,
          title,
          pubDate: updated
        };
      });
  items.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
  return items;
}
