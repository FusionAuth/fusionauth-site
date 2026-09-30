import fs from "fs";
import path from "path";

// Astro's `build.format: 'file'` writes every page as `<slug>.html`, so a folder
// index page lands at `<folder>.html` rather than inside the folder. This moves
// it to `<folder>/index.html`, which makes the trailing-slash URL the one that
// serves the file and is what `indexPaths` in src/redirects.json describes.
//
// Pass one handles any `X.html` sitting next to an `X/` directory. Pass two
// covers folder index pages whose folder holds no other page, where there is no
// directory to move into -- without it those pages stay flat and need to be left
// out of `indexPaths`, which is the special case this integration exists to
// avoid. Every routable `<folder>/index.mdx` gets one `indexPaths` entry, no
// exceptions.

const COLLECTIONS = [
  ["content/docs", "docs"],
  ["content/articles", "articles"],
  ["content/blog", "blog"],
];

function move(from, to) {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  console.log(`Moving ${from} to ${to}`);
  fs.renameSync(from, to);
}

function recurse(dir) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(file => {
    const subDir = file.name.replace(/\.html/, "");
    if (file.isDirectory()) {
      recurse(dir + file.name + "/");
    } else if (file.isFile() && file.name.endsWith(".html") && fs.existsSync(dir + subDir)) {
      move(dir + file.name, dir + subDir + "/index.html");
    }
  });
}

// URL paths of every folder index page that gets built, e.g. docs/theme
function folderIndexPaths(srcDir) {
  const found = [];
  for (const [base, prefix] of COLLECTIONS) {
    const walk = dir => {
      const abs = path.join(srcDir, dir);
      if (!fs.existsSync(abs)) return;
      for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
        if (entry.name.startsWith("_")) continue;
        if (entry.isDirectory()) {
          walk(path.join(dir, entry.name));
        } else if (entry.name === "index.mdx" && dir !== base) {
          // `route: false` pages are kept in the collection for nav order only
          const source = fs.readFileSync(path.join(abs, entry.name), "utf-8");
          const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source);
          if (frontmatter && /^route:\s*false\s*$/m.test(frontmatter[1])) continue;
          found.push(`${prefix}/${path.relative(base, dir).split(path.sep).join("/")}`);
        }
      }
    };
    walk(base);
  }
  return found;
}

export default function AstroIndexPages() {
  let srcDir;
  return {
    name: "astro-index-pages",
    hooks: {
      "astro:config:done": ({ config }) => {
        srcDir = config.srcDir.pathname;
      },
      "astro:build:done": async ({ dir, logger }) => {
        const out = dir.pathname;
        recurse(out);

        // An indexPaths entry exists for each of these, so finding none means
        // the collections moved and every section page is about to 404.
        const indexes = folderIndexPaths(srcDir);
        if (!indexes.length) {
          throw new Error(`astro-index-pages: no folder index pages found under ${srcDir}`);
        }

        let moved = 0;
        for (const urlPath of indexes) {
          const flat = path.join(out, `${urlPath}.html`);
          const nested = path.join(out, urlPath, "index.html");
          if (fs.existsSync(flat) && !fs.existsSync(nested)) {
            move(flat, nested);
            moved++;
          }
        }
        logger.info(`${indexes.length} folder index pages, ${moved} with no sibling pages`);
      }
    }
  };
}
