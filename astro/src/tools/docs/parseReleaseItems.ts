import { releaseCategories } from './releaseCategories';

export interface ReleaseItem {
  category: string;
  issue?: string;
  bonusIssue?: string;
  since?: string;
  resolvedIn?: string;
  viaIssue?: string;
  body: string;
}

export function categoryLabel(id: string): string {
  return releaseCategories.find(c => c.id === id)?.label ?? id;
}

export const FALLBACK_DESCRIPTION = (version: string) =>
  `Release ${version} includes bug fixes and performance updates.`;

export const releaseUrl = (version: string) =>
  new URL(`/docs/release-notes#version-${version.replace(/\./g, '-')}`, import.meta.env.SITE).href;

// feeds get read off-site, so make root-relative md links absolute
const absolutizeLinks = (body: string) =>
  body.replace(/\]\((\/[^)\s]*)/g, (_, path) => `](${new URL(path, import.meta.env.SITE).href}`);

export function parseReleaseItems(body: string): ReleaseItem[] {
  const items: ReleaseItem[] = [];
  // match <Item attr="val" ...>content</Item> — attrs are always quoted, no nested <Item>
  const re = /<Item((?:\s+\w+=(?:"[^"]*"|'[^']*'))*\s*)>([\s\S]*?)<\/Item>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) {
    const propsStr = m[1];
    const rawBody = absolutizeLinks(m[2].trim());
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
