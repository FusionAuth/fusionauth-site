import { getCollection } from 'astro:content';
import { getDocHref } from 'src/tools/docs/getDocHref';
import { Category, DocNavContext } from 'src/tools/docs/DocNavContext';

import categoryListJSON from 'src/tools/docs/docsOrdering.json';

const categoryList: Category[] = categoryListJSON.categories;

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

const recursiveSort = (category: Category, orderIndex?: Category) => {
  if (category.entries.length > 0) {
    const entries = category.entries;
    category.entries = [];
    orderIndex?.entries?.forEach(entry => {
      const idx = entries.findIndex(e => e.title === entry.title);
      if (idx !== -1) {
        category.entries.push(entries[idx]);
        entries.splice(idx, 1);
      }
    })

    entries.sort((a, b) => {
      return a.title.localeCompare(b.title);
    });

    category.entries.push(...entries);
  }
  if (category.subcategories.length > 0) {
    const subs = category.subcategories;
    category.subcategories = [];
    // use the defined order first
    orderIndex?.subcategories?.forEach(sub => {
      const idx = subs.findIndex(s => s.name === sub.name);
      if (idx !== -1) {
        category.subcategories.push(subs[idx]);
        subs.splice(idx, 1);
      }
    });

    // anything not defined gets sorted lexically
    subs.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });

    category.subcategories.push(...subs);

    category.subcategories.forEach(sub => recursiveSort(sub, orderIndex?.subcategories?.find(s => s.name === sub.name)));
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
  recursiveSort(context.category, categoryList.find(cat => cat.name === section));
  return context;
}
