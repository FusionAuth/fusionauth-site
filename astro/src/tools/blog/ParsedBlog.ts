export interface ParsedBlog {
  /**
   * List of authors of this post.
   */
  authors: string[];

  /**
   * List of tags associated with this post
   */
  categories: string[];

  /**
   * The description of this post
   */
  description: string;

  /**
   * Determines the string used to separate the leading excerpt from the rest of the blog. Shown on index pages.
   */
  excerpt_separator: string;

  /**
   * Single tag used to populate the sidebar of the post
   */
  featured_category: string;

  /**
   * Single tag used to populate the related posts on the page
   */
  featured_tag?: string;

  /**
   * the href location of this post's header image
   */
  image: string;

  /**
   * The publish date of this post.
   */
  publish_date: Date;

  /**
   * List of tags associated with this post
   */
  tags: string[];

  /**
   * The title of this post.
   */
  title: string;

  /**
   * The updated date (optional)
   */
  updated_date?: Date;

  /**
   * The parsed excerpt of the blog for display on index pages.
   */
  blurb: string;

  /**
   * The slug handle of the post.
   */
  slug: string;
}
