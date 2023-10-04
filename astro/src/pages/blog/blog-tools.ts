import { getCollection } from "astro:content";
import { marked } from "marked";

const months = {
  0: "January",
  1: "February",
  2: "March",
  3: "April",
  4: "May",
  5: "June",
  6: "July",
  7: "August",
  8: "September",
  9: "October",
  10: "November",
  11: "December",
};

export const getDateString = (date) => months[date.getUTCMonth()] + " " + date.getUTCDate() + ", " + date.getUTCFullYear();

export const getLatestDateString = (post) => getDateString(post.updated_date ? post.updated_date : post.publish_date);

export const refCase = (target) => target.replaceAll(' ', '-').toLowerCase();

export const getHref = (name, section) => !!name && !!section
    ? '/blog/' + section + '/' + refCase(name) + '/'
    : '';

export const mapRelated = (collection, metaSection, target, currentSlug) => collection ? collection
    .filter(blog => blog.data
        && blog.data[metaSection]
        && blog.data[metaSection].split(',').includes(target)
        && blog.slug !== currentSlug)
    .sort(sortByDate)
    .slice(0, 3)
    .map(parseContent) : [];

export const parseContent = (blog) => {
  // grab the excerpt text
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

  // render the markdown
  let blurb = marked.parse(blurbLines.join('\n'));
  if (blurb.length > 160) {
    blurb = blurb.substring(0, 160);

    // don't split mid-word
    const snapPoint = Math.max(blurb.lastIndexOf(' '), blurb.lastIndexOf('.'))
    blurb = blurb.substring(0, snapPoint) + '...';
  }

  // split the categories, authors, and tags into lists
  const categories = blog.data.categories.split(',').map(cat => cat.trim());
  const tags = blog.data.tags.split(',').map(tag => tag.trim());
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

const getAllEntries = (blogs, attribute) => {
  const reducer = (entries, entry) => {
    if (!entries.includes(entry)) {
      entries.push(entry);
    }
    return entries;
  }
  return blogs.flatMap(blog => blog.data[attribute]
      .split(',')
      .map(entry => entry.trim()))
      .filter(entry => !!entry)
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

export const startCase = (inputString) => inputString
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
export const getStaticIndexPaths = async (paginate, attribute, paramName) => {
  const blogs = await getCollection('blog');
  const allTags = getAllEntries(blogs, attribute)
  return allTags.map((target) => {

    const filteredPosts = blogs.filter((post) => post.data[attribute].includes(target));
    // newest first
    filteredPosts.sort(sortByDate);
    const params = {} as any;
    params[paramName] = target.trim().replaceAll(' ', '-').toLowerCase();

    // Put the readable name into the astro props
    const props = {} as any;
    props[paramName + "Name"] = target;

    return paginate(filteredPosts, {
      params,
      props,
      pageSize: 7
    });
  });
}

export const getStaticTagPaths = async (paginate) => getStaticIndexPaths(paginate, 'tags', 'tag');
export const getStaticCategoryPaths = async (paginate) => getStaticIndexPaths(paginate, 'categories', 'category');
export const getStaticAuthorPaths = async (paginate) => getStaticIndexPaths(paginate, 'authors', 'author');
