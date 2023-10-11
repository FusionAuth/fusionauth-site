import { AstroGlobal } from "astro";
import { startCase } from 'src/tools/string';
import { refCase } from 'src/tools/string/refCase';
import { getDocsPages } from 'src/tools/docs/getDocsPages';

export const getDocsSideMenu = async (Astro: AstroGlobal) => {
  const { entry } = Astro.props;
  const docs = await getDocsPages();
  const subCatDocs = docs.filter(doc => doc.data.section === entry.data.section);
  const allSubs = Array.from(subCatDocs.map(sec => sec.data.subcategory).filter(sub => !!sub).reduce((subs, sub) => subs.add(sub), new Set<string>()));
  return allSubs.map((sub: string) => {
  const subItems = subCatDocs.filter(s => s.data.subcategory === sub)
      .map(s => ({title: startCase(s.data.title), path: `/docs/${s.slug}`}));
  return {
    title: startCase(sub),
    href: `/docs/${refCase(sub)}`,
    items: subItems,
  }
});
}

export const getDocNavSections = async () => {
  const docs = await getDocsPages();
  const allSections = docs.map(doc => doc.data.section).reduce((set, section) => set.add(section), new Set<string>());
  return Array.from(allSections).filter(section => !!section).map((section: string) => ({
    path: `/docs/${section}`,
    title: startCase(section),
  }));
};

export const getDocNavContext = async (Astro: AstroGlobal) => {
  const sideMenu = await getDocsSideMenu(Astro);
  const sections = await getDocNavSections();
  return { sideMenu, sections };
}