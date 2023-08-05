import { getCollection } from 'astro:content';

const months = {
  0: 'January',
  1: 'February',
  2: 'March',
  3: 'April',
  4: 'May',
  5: 'June',
  6: 'July',
  7: 'August',
  8: 'September',
  9: 'October',
  10: 'November',
  11: 'December'
};

export const getDateString = (date) => months[date.getUTCMonth()] + " " + date.getUTCDate() + ", " + date.getUTCFullYear();

export const parseContent = (blog) => {
  const blurbLines = [];
  const separator = blog.data.excerpt_separator;
  const lines = blog.body.split('\n');
  for (let line of lines) {
    if (separator && line.includes(separator)) {
      break;
    }
    if (line && !line.trim().startsWith('import')) {
      blurbLines.push(line);
    }
  }
  let blurb = blurbLines.join('\n');
  if (blurb.length > 160) {
    blurb = blurb.substring(0, 160) + '...';
  }
  const categories = blog.data.categories.split(' ');
  const tags = blog.data.tags.split(' ');
  const authors = blog.data.authors.split(',').map(author => author.trim());
  return {
    ...blog.data,
    blurb,
    slug: blog.slug,
    categories,
    tags,
    authors
  };
};

const getAllEntries = (blogs, attribute, splitter) => {
  const reducer = (entries, entry) => {
    if (!entries.includes(entry)) {
      entries.push(entry);
    }
    return entries;
  }
  return blogs.flatMap(blog => blog.data[attribute]
      .split(splitter)
      .map(entry => entry.trim()))
      .reduce(reducer, []);
};

export const sortByDate = (a,b) => {
  if (a.data.publish_date > b.data.publish_date) {
    return -1;
  } else if (a.data.publish_date == b.data.publish_date) {
    return 0;
  } else {
    return 1;
  }
};

export const getLatestStaticPaths = async(paginate) => {
  const blogs = await getCollection('blog');
  // newest first
  blogs.sort(sortByDate);
  return paginate(blogs, {
    pageSize: 7
  });
}

export const getStaticIndexPaths = async (paginate, attribute, splitter, paramName) => {
  const blogs = await getCollection('blog');
  const allTags = getAllEntries(blogs, attribute, splitter)
  return allTags.map((target) => {
    const filteredPosts = blogs.filter((post) => post.data[attribute].includes(target));
    // newest first
    filteredPosts.sort(sortByDate);
    const params = {};
    params[paramName] = target;
    return paginate(filteredPosts, {
      params,
      pageSize: 7
    });
  });
}

export const getStaticTagPaths = async (paginate) => getStaticIndexPaths(paginate, 'tags', ' ', 'tag');
export const getStaticCategoryPaths = async (paginate) => getStaticIndexPaths(paginate, 'categories', ' ', 'category');
export const getStaticAuthorPaths = async (paginate) => getStaticIndexPaths(paginate, 'authors', ',', 'author');
