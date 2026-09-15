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

const SITE_URL = ((import.meta.env.SITE_URL as string | undefined) ?? 'https://fusionauth.io').replace(/\/$/, '');

export const releaseUrl = (version: string) =>
  `${SITE_URL}/docs/release-notes#version-${version.replace(/\./g, '-')}`;

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
