export interface DocNavEntry  {
  title: string;
  sideNavTitle?: string;
  href: string;
  description?: string;
  navOrder?: number;
}
export interface DocNavContext {
  category: Category;
}

export interface Category {
  name: string;
  href: string;
  entries: DocNavEntry[];
  subcategories: Category[];
  sortFunction: (a: Category, b: Category) => number;
}
