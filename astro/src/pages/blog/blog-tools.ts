import { getCollection } from 'astro:content';
import { marked } from 'marked';

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

export const getAuthorHref = (author) => !!author ? '/blog/author/' + author.replace(' ', '-').toLowerCase() + '/' : '';

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
  let preblurb = blurbLines.join('\n');
  let blurb = preblurb;
  if (preblurb.length > 160) {
    blurb = preblurb.substring(0, 160);
    // handle when someone put a link in the blurb and it is in the middle of the cutoff. kinda hacky, sorry
    const linkOpen = blurb.lastIndexOf('[');
    let linkClose = blurb.lastIndexOf(')');
    if (linkOpen > 1 && linkClose < linkOpen) {
      linkClose = preblurb.substring(linkOpen).indexOf(')');
      if (linkClose > 0) {
        blurb = preblurb.substring(0, linkOpen + linkClose + 1);
      }
    }
    blurb = blurb + '...';
  }
  blurb = marked.parse(blurb);
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
  const aDate = a.data.updated_date ? a.data.updated_date : a.data.publish_date;
  const bDate = b.data.updated_date ? b.data.updated_date : b.data.publish_date;
  if (aDate > bDate) {
    return -1;
  } else if (aDate == bDate) {
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
    const params = {} as any;
    params[paramName] = target.trim().replace(' ', '-').toLowerCase();
    const props = {} as any;
    if (attribute === 'authors') {
      props.authorName = target;
    }
    return paginate(filteredPosts, {
      params,
      props,
      pageSize: 7
    });
  });
}

export const getStaticTagPaths = async (paginate) => getStaticIndexPaths(paginate, 'tags', ' ', 'tag');
export const getStaticCategoryPaths = async (paginate) => getStaticIndexPaths(paginate, 'categories', ' ', 'category');
export const getStaticAuthorPaths = async (paginate) => getStaticIndexPaths(paginate, 'authors', ',', 'author');
