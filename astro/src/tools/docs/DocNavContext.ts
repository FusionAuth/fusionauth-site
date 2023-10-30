export interface DocNavEntry  {
  title: string;
  href: string;
  description?: string;
  topOfNav?: boolean;
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