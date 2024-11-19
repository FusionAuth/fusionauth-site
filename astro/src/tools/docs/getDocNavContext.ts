import { getCollection } from 'astro:content';
import { getDocHref } from 'src/tools/docs/getDocHref';
import { Category, DocNavContext } from 'src/tools/docs/DocNavContext';

const joinup = (...parts: string[]) => [...parts].join('/')

const prepContext = (context: DocNavContext, subcategory: string, tertcategory: string, quatercategory: string): Category => {
  let subContext: Category = null;
  let tertContext: Category = null;
  let qautContext: Category = null;
  if (subcategory) {
    subContext = context.category.subcategories.find(sub => sub.name === subcategory);
    if (!subContext) {
      subContext = {
        name: subcategory,
        href: getDocHref(joinup(context.category.name, subcategory)),
        entries: [],
        subcategories: []
      }
      context.category.subcategories.push(subContext);
    }
  } else {
    return context.category;
  }
  if (tertcategory) {
    tertContext = subContext.subcategories.find(sub => sub.name === tertcategory);
    if (!tertContext) {
      tertContext = {
        name: tertcategory,
        href: getDocHref(joinup(context.category.name, subcategory, tertcategory)),
        entries: [],
        subcategories: [],
      }
      subContext.subcategories.push(tertContext);
    }
  } else {
    return subContext;
  }
  if (quatercategory) {
    qautContext = tertContext.subcategories.find(sub => sub.name === quatercategory);
    if (!qautContext) {
      qautContext = {
        name: quatercategory,
        href: getDocHref(joinup(context.category.name, subcategory, tertcategory, quatercategory)),
        entries: [],
        subcategories: []
      }
      tertContext.subcategories.push(qautContext);
    }
    return qautContext;
  } else {
    return tertContext;
  }
}

const recursiveSort = (category: Category) => {
  if (category.entries.length > 0) {

    category.entries.sort((a, b) => {
      // everything has a default of 1000, so sorts to bottom
      const numCompare = a.navOrder - b.navOrder;
      if (numCompare !== 0) {
        return numCompare;
      }
      return a.title.localeCompare(b.title);
    });
  }
  if (category.subcategories.length > 0) {
    category.subcategories.sort((a, b) => a.name.localeCompare(b.name));
    category.subcategories.forEach(sub => recursiveSort(sub));
  }
}

export const getDocNavContext = async (section: string) => {
  const context: DocNavContext = {
    category: {
      name: section,
      href: getDocHref(section),
      entries: [],
      subcategories: [],
    },
  };

  const sectionDocs = await getCollection('docs', doc => doc.data.section === section);
  sectionDocs.forEach(doc => {
    const { subcategory, tertcategory, quatercategory, title, description, navOrder } = doc.data;
    const category = prepContext(context, subcategory, tertcategory, quatercategory);
    category.entries.push({
      title,
      description,
      href: getDocHref(doc.slug),
      navOrder,
    })
  });
  recursiveSort(context.category);
  return context;
}
