/**
 * Takes a string and returns it in start case
 * @param inputString
 * @return start-cased string
 */
export const startCase = (inputString: string): string => inputString
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
