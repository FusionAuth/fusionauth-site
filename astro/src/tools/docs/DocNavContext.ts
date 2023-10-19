export interface DocNavEntry  {
  title: string;
  href: string;
}
export interface DocNavContext {
  category: Category;
}

export interface Category {
  name: string;
  href: string;
  entries: DocNavEntry[];
  subcategories: Category[];
}