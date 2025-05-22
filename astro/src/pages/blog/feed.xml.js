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
    author: post.data.authors,
    categories: post.data.categories.split(",").map(item => item.trim()),
  }
}

export async function GET(context) {
  const blog = await getCollection('blog');
  const sortedPosts = blog.sort((a, b) => { 
    const a_date = a.data.updated_date ? a.data.updated_date : a.data.publish_date;
    const b_date = b.data.updated_date ? b.data.updated_date : b.data.publish_date;
    return new Date(b_date).getTime() - new Date(a_date).getTime();
  });
  return rss({
    title: "FusionAuth Blog",
    description: "The FusionAuth blog offers all kinds of insight on software development, authentication and the FusionAuth product.",
    site: context.site,
    trailingSlash: false,
    items: sortedPosts.map(convertToRSS)
  });
}

