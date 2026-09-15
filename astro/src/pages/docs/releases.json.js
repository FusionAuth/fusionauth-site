import { getCollection } from 'astro:content';
import { parseReleaseItems } from 'src/tools/docs/parseReleaseItems';

function versionCmp(a, b) {
  return a.localeCompare(b, undefined, { numeric: true });
}

export async function GET() {
  const raw = await getCollection('releases');

  const releases = raw
    .map(item => {
      const version = item.data.version;
      const anchor = `version-${version.replace(/\./g, '-')}`;
      const items = parseReleaseItems(item.body ?? '').map(({ category, issue, bonusIssue, since, resolvedIn, viaIssue, body }) => ({
        category,
        ...(issue      != null && { issue }),
        ...(bonusIssue != null && { bonusIssue }),
        ...(since      != null && { since }),
        ...(resolvedIn != null && { resolvedIn }),
        ...(viaIssue   != null && { viaIssue }),
        body,
      }));
      return {
        version,
        ...(item.data.name != null && { name: item.data.name }),
        date: item.data.date.toISOString().slice(0, 10),
        description: item.data.description ?? `Release ${version} includes bug fixes and performance updates.`,
        url: `https://fusionauth.io/docs/release-notes#${anchor}`,
        items,
      };
    })
    .sort((a, b) => versionCmp(b.version, a.version));

  return new Response(JSON.stringify({ releases }, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
}
