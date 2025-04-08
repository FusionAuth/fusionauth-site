import { AstroGlobal } from "astro";

export const getPagePath = (Astro: AstroGlobal): string => {
  const path = Astro.url.pathname.replace('/docs/', '');
  const paths = path.split('/');
  const ps = paths.slice(0, paths.length - 1);
  const myPath = ps.join('/') + '/';
  return myPath;
};