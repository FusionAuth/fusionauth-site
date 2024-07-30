import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';

function convertToRSS(post) {
  return {
    title: post.data.title || 'uh-oh, no title',
    pubDate: post.data.updated_date || post.data.publish_date || '2024-08-11',
    description: post.data.description || 'uh-oh, no desc',
    // Compute RSS link from post `slug`
    // This example assumes all posts are rendered as `/articles/[slug]**` routes
    link: `/blog/${post.slug}`,
  }
}

export async function GET(context) {
  const blog = await getCollection('blog');
  return rss({
    title: "FusionAuth Blog",
    description: "The FusionAuth blog offers all kinds of insight on software development, authentication and the FusionAuth product.",
    site: context.site,
    trailingSlash: false,
    items: blog.map(convertToRSS)
  });
}

