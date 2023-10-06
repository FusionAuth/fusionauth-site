import { Render } from "astro:content";
import { BlogFrontmatter } from "./BlogFrontmatter";

export interface BlogContent {
  id: string;
  slug: string;
  body: string;
  collection: "blog";
  data: BlogFrontmatter;
  render(): Render[".mdx" | ".md"];
}
