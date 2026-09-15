export interface ReleaseItem {
  category: string;
  issue?: string;
  bonusIssue?: string;
  since?: string;
  resolvedIn?: string;
  viaIssue?: string;
  body: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  'theme-upgrade':      'Theme Upgrade',
  'new-feature':        'New Feature',
  'enhancement':        'Enhancement',
  'known-issue':        'Known Issue',
  'deprecated':         'Deprecated',
  'fix':                'Fix',
  'security':           'Security',
  'internal':           'Internal',
  'sdk':                'SDK',
  'breaking-change':    'Breaking Change',
  'database-migration': 'Database Migration',
};

export function categoryLabel(id: string): string {
  return CATEGORY_LABELS[id] ?? id;
}

// strip MDX component tags, leaving inner text (e.g. <Breadcrumb>foo</Breadcrumb> → foo)
export function stripMdxComponents(text: string): string {
  let prev = '';
  while (prev !== text) {
    prev = text;
    text = text.replace(/<([A-Z][A-Za-z0-9.]*)(?:\s[^>]*)?>([^<]*?)<\/\1>/g, '$2');
    text = text.replace(/<[A-Z][A-Za-z0-9.]*(?:\s[^>]*)?\/>/g, '');
  }
  return text.trim();
}

export function parseReleaseItems(body: string): ReleaseItem[] {
  const items: ReleaseItem[] = [];
  // match <Item attr="val" ...>content</Item> — attrs are always quoted, no nested <Item>
  const re = /<Item((?:\s+\w+=(?:"[^"]*"|'[^']*'))*\s*)>([\s\S]*?)<\/Item>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) {
    const propsStr = m[1];
    const rawBody = m[2].trim();
    const props: Record<string, string> = {};
    const propRe = /(\w+)=(?:"([^"]*)"|'([^']*)')/g;
    let pm: RegExpExecArray | null;
    while ((pm = propRe.exec(propsStr)) !== null) {
      props[pm[1]] = pm[2] ?? pm[3] ?? '';
    }
    if (!props.category) continue;
    const item: ReleaseItem = { category: props.category, body: rawBody };
    if (props.issue      !== undefined) item.issue      = props.issue;
    if (props.bonusIssue !== undefined) item.bonusIssue = props.bonusIssue;
    if (props.since      !== undefined) item.since      = props.since;
    if (props.resolvedIn !== undefined) item.resolvedIn = props.resolvedIn;
    if (props.viaIssue   !== undefined) item.viaIssue   = props.viaIssue;
    items.push(item);
  }
  return items;
}
