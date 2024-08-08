import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';

function convertToRSS(post) {
  return {
    title: post.data.title || 'uh-oh, no title',
    pubDate: post.data.updated_date || post.data.publish_date || '2024-01-01',
    description: post.data.description || 'uh-oh, no desc',
    // Compute RSS link from post `slug`
    // This example assumes all posts are rendered as `/blog/[slug]` routes
    link: `/articles/${post.slug}`,
  }
}

export async function GET(context) {
  const articles = await getCollection('articles');
  return rss({
    title: "FusionAuth Articles",
    description: "The FusionAuth articles offer all kinds of insight on software development, authentication and the FusionAuth product.",
    site: context.site,
    trailingSlash: false,
    items: articles.map(convertToRSS)
  });
}

