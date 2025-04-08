import { filterByPath } from 'src/tools/docs/filterByPath';
import { filterPartials } from 'src/tools/docs/filterPartials';

export const filterDocs = (entry, path) => filterPartials(entry) && filterByPath(entry, path);