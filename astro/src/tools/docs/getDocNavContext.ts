import { getCollection } from 'astro:content';
import { getDocHref } from 'src/tools/docs/getDocHref';
import { Category, DocNavContext } from 'src/tools/docs/DocNavContext';

// all category names here will be sorted to the top of their category listing. 
// if there is more than one under a given category, they'll be sorted alphabetically
import categoriesToFloatToTop from 'src/tools/docs/categoriesToFloatToTop.json';

const joinup = (...parts: string[]) => [...parts].join('/')


// definition of the order (could be json)
const categoryList: Category[] = [{
  name: 'get started',
  entries: [],
  subcategories: [{
    name: 'download and install',
  }, {
    name: 'core concepts'
  }]
}];
const prepContext = (context: DocNavContext, subcategory: string, tertcategory: string, quatercategory: string): Category => {
  let subContext: Category = null;
  let tertContext: Category = null;
  let qautContext: Category = null;
  
  // for (const categoryName in categoriesToFloatToTop) {
  //   if (context.category.name === categoryName) {
  //     const secondaryKeys = Object.keys(categoriesToFloatToTop[categoryName]);
  //     context.category.sortFunction = ( (a, b) => {
  //
  //       // if both are included, sort lexically
  //       if (secondaryKeys.includes(a.name) && secondaryKeys.includes(b.name)) {
  //         return a.name.localeCompare(b.name);
  //       }
  //
  //       // if one should be sorted to the top, do so
  //       if (secondaryKeys.includes(a.name)) return -1;
  //       if (secondaryKeys.includes(b.name)) return 1;
  //
  //       // if neither are included, sort lexically
  //       return a.name.localeCompare(b.name);
  //     } )
  //   }
  // }
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
      // everything has a default of 1000, so sorts to bottom
      // const numCompare = a.navOrder - b.navOrder;
      // if (numCompare !== 0) {
      //   return numCompare;
      // }
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

    // if (category.sortFunction) {
    //   category.subcategories.sort(category.sortFunction);
    // } else {
    //   category.subcategories.sort((a, b) => a.name.localeCompare(b.name));
    // }
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
