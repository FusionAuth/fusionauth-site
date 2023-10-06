import { getCollection } from "astro:content";

import { AstroGlobal } from "astro";
import { refCase, startCase } from "src/pages/blog/blog-tools";

export interface Feature {
  displayName: string;
  edition: 'premium' | 'advanced' | 'enterprise';
  link: string;
}

export const sortFeatures = (featA: Feature, featB: Feature) => featA.displayName.localeCompare(featB.displayName);

export const filterPartials = (entry) => {
  const parts = entry.slug.split("/");
  const doc = parts[parts.length - 1];
  return !doc.startsWith("_");
};

export const getPagePath = (Astro: AstroGlobal): string => {
  const path = Astro.url.pathname.replace('/docs/', '');
  const paths = path.split('/');
  const ps = paths.slice(0, paths.length - 1);
  const myPath = ps.join('/') + '/';
  return myPath;
};

export const getDocsPages = async () => await getCollection('docs', filterPartials);

export const getDocsSideMenu = async (Astro: AstroGlobal) => {
  const { entry } = Astro.props;
  const docs = await getDocsPages();
  const subCatDocs = docs.filter(doc => doc.data.section === entry.data.section);
  const allSubs = Array.from(subCatDocs.map(sec => sec.data.subcategory).filter(sub => !!sub).reduce((subs, sub) => subs.add(sub), new Set<string>()));
  return allSubs.map(sub => {
  const subItems = subCatDocs.filter(s => s.data.subcategory === sub)
      .map(s => ({title: startCase(s.data.title), path: `/docs/${s.slug}`}));
  return {
    title: startCase(sub),
    href: `/docs/${refCase(sub)}`,
    items: subItems,
  }
});
}

export const getStaticDocPaths = (path: string) => {
  return async () => {
    const entry = await getCollection('docs', filterPartials);
    return entry.map(entry => {
      const slug = entry.slug.replace(path, '');
      entry.slug = slug;
      return {
        params: { slug }, props: { entry },
      }
    });
  }
};

export const getDocNavSections = async () => {
  const docs = await getDocsPages();
  const allSections = docs.map(doc => doc.data.section).reduce((set, section) => set.add(section), new Set<string>());
  return Array.from(allSections).map((section) => ({
    path: `/docs/${section}`,
    title: startCase(section),
  }));
};

export const getDocNavContext = async (Astro: AstroGlobal) => {
  const sideMenu = await getDocsSideMenu(Astro);
  const sections = await getDocNavSections();
  return { sideMenu, sections };
}