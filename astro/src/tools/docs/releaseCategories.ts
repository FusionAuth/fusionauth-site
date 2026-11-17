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

// `impact` prop on <Item>; icon names match the Aside caution and danger types
export const releaseImpacts = [
  {
    id: 'caution',
    label: 'Review before updating',
    chipLabel: 'Review Before Updating',
    description: 'This change may affect a small number of installations. Test before you update.',
    color: '#ea580c',
    icon: 'caution',
  },
  {
    id: 'breaking',
    label: 'Breaking change',
    chipLabel: 'Breaking Change',
    description: 'This change requires action in some installations. Read the note before you update.',
    color: '#dc2626',
    icon: 'danger',
  },
];

// filter chips only, match items by `impact` instead of category
export const impactFilters = releaseImpacts.map(i => ({ id: `impact-${i.id}`, label: i.chipLabel, color: i.color }));

const impactHint = 'impact="breaking" or impact="caution"';

export function getReleaseCategory(id: string) {
  const cat = releaseCategories.find(c => c.id === id);
  if (!cat) {
    const hint = id === 'breaking-change' ? ` Use a regular category and add ${impactHint}.` : '';
    throw new Error(`Unknown release note category "${id}".${hint}`);
  }
  return cat;
}

export function getReleaseImpact(id: string) {
  const impact = releaseImpacts.find(i => i.id === id);
  if (!impact) {
    throw new Error(`Unknown release note impact "${id}". Use ${impactHint}.`);
  }
  return impact;
}

export function rejectBreakingFlag(props: Record<string, unknown>) {
  if ('breaking' in props) throw new Error(`The release note \`breaking\` flag was removed. Use ${impactHint} instead.`);
}
