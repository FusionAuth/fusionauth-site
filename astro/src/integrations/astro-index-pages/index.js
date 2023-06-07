import fs from "fs";

function recurse(dir) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(file => {
    const subDir = file.name.replace(/\.html/, "");
    if (file.isDirectory()) {
      recurse(dir + file.name + "/");
    } else if (file.isFile() && file.name.endsWith(".html") && fs.existsSync(dir + subDir)) {
      console.log(`Moving ${dir + file.name} to ${dir + subDir + "/index.html"}`);
      fs.renameSync(dir + file.name, dir + subDir + "/index.html");
    }

  });
}

export default function AstroIndexPages() {
  return {
    name: "astro-index-pages",
    hooks: {
      "astro:build:done": async ({ dir, routes }) => {
        recurse(dir.pathname);
      }
    }
  };
}