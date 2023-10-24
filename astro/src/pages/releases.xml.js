import rss from '@astrojs/rss';
import { getReleaseNoteRssItems } from '../tools/docs';

export async function GET(context) {
  const items = await getReleaseNoteRssItems();
  return rss({
    title: 'FusionAuth Releases Feed',
    id: 'https://fusionauth.io',
    site: 'https://fusionauth.io',
    description: 'The latest releases of FusionAuth',
    author: {
      name: 'FusionAuth'
    },
    updated: new Date(), // should we only do this at certain times?
    items,
  });
}