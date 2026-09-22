// inject <link rel="preload" as="style"> for every stylesheet, placed at head-prepend
// so CSS bytes are requested before scripts, fonts, and JSON-LD
export function cssPreload() {
  return {
    name: 'css-preload',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        const tags = [];
        // match <link ... rel="stylesheet" ... href="..."> in any attribute order
        const re = /<link\b([^>]*)>/gi;
        let m;
        while ((m = re.exec(html)) !== null) {
          const attrs = m[1];
          if (!/\brel="stylesheet"/i.test(attrs)) continue;
          const hrefMatch = attrs.match(/\bhref="([^"]+)"/);
          if (!hrefMatch) continue;
          tags.push({
            tag: 'link',
            attrs: { rel: 'preload', as: 'style', href: hrefMatch[1] },
            injectTo: 'head-prepend',
          });
        }
        return tags;
      },
    },
  };
}
