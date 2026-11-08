import { getCollection } from 'astro:content';
import { parseReleaseItems, FALLBACK_DESCRIPTION, releaseUrl } from 'src/tools/docs/parseReleaseItems';

function versionCmp(a, b) {
  return a.localeCompare(b, undefined, { numeric: true });
}

export async function GET() {
  const raw = await getCollection('releases');

  const releases = raw
    .map(item => {
      const { version, name, date, description } = item.data;
      return {
        version,
        ...(name != null && { name }),
        date: date.toISOString().slice(0, 10),
        description: description ?? FALLBACK_DESCRIPTION(version),
        url: releaseUrl(version),
        items: parseReleaseItems(item.body ?? ''),
      };
    })
    .sort((a, b) => versionCmp(b.version, a.version));

  return new Response(JSON.stringify({ releases }, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
}
