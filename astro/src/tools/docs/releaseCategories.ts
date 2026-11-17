export const releaseCategories = [
  { id: 'theme-update',        label: 'Theme Update',        color: '#e11d48' },
  { id: 'new-feature',         label: 'New Feature',         color: '#16a34a' },
  { id: 'enhancement',         label: 'Enhancement',         color: '#2563eb' },
  { id: 'known-issue',         label: 'Known Issue',         color: '#bb4448' },
  { id: 'deprecated',          label: 'Deprecated',          color: '#ffcc48' },
  { id: 'fix',                 label: 'Fix',                 color: '#d97706' },
  { id: 'security',            label: 'Security',            color: '#566f98' },
  { id: 'internal',            label: 'Internal',            color: '#71717a' },
  { id: 'sdk',                 label: 'SDK',                 color: '#d98fd9' },
  { id: 'database-migration',  label: 'Database Migration',  color: '#aa1d48' },
];

// filter chip only, matches items with the `breaking` flag
export const breakingFilter = { id: 'breaking-change', label: 'Breaking Change', color: '#dc2626' };

export function getReleaseCategory(id: string) {
  const cat = releaseCategories.find(c => c.id === id);
  if (!cat) {
    const hint = id === 'breaking-change' ? ' Use a regular category and add the `breaking` flag.' : '';
    throw new Error(`Unknown release note category "${id}".${hint}`);
  }
  return cat;
}
