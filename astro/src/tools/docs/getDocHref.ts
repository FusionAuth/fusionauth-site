import { refCase } from 'src/tools/string';

export const getDocHref = (ref: string) => `/docs/${refCase(ref)}`;