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

/**
 * Parses a Date and returns a string in Month Day, Year (ex January 1, 1990)
 * @param date
 */
export const getDateString = (date: Date): string =>
    months[date.getUTCMonth()]
    + " "
    + date.getUTCDate()
    + ", "
    + date.getUTCFullYear();
