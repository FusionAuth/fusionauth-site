import { BlogContent } from "./BlogContent";

/**
 * Sort function for blog posts by checking first updated_date if it exists or publish_date otherwise
 *
 * @param a BlogContent to sort
 * @param b BlogContent to sort
 * @return sort integer result
 */
export const sortByDate = (a: BlogContent, b: BlogContent): number => {
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
