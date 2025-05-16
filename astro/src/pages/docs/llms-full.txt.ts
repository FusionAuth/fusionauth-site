import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import fs from "fs/promises";
import path from "path";

// Utility: Render eligible .astro components to static HTML
async function renderAstroComponent(filePath: string): Promise<string> {
  const content = await fs.readFile(filePath, "utf8");
  return content.replace(/^---[\s\S]*?---/, "").trim();
}

// Check if a component should be inlined
function shouldInline(importPath: string): boolean {
  return (
    importPath.startsWith("src/content") ||
    importPath.startsWith("src/diagrams")
  );
}

export const GET: APIRoute = async () => {
  const docs = await getCollection("docs");

  const processedDocs = await Promise.all(
    docs.map(async (doc) => {
      let body = doc.body;

      const importRegex = /import (\w+) from ['"](.+?)['"][;]*/g;
      const importMap: Record<string, string> = {};
      let match;

      // Collect imports
      while ((match = importRegex.exec(body)) !== null) {
        const [, name, importPath] = match;
        importMap[name] = importPath;
      }

      // Inline eligible components
      for (const [componentName, importPath] of Object.entries(importMap)) {
        if (!shouldInline(importPath)) continue;

        const fullPath = path.resolve(process.cwd(), importPath);
        const rendered = await renderAstroComponent(fullPath);

        const usageRegex = new RegExp(`<${componentName}\\s*/>`, "g");
        body = body.replace(usageRegex, rendered.trim());
      }

      // Strip all import lines
      body = body.replace(importRegex, "").trim();

      return `# ${doc.data.title}\n\n${body}\n\n`;
    })
  );

  return new Response(
    `## FusionAuth.io Full Documentation\n\n${processedDocs.join("")}`,
    {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    }
  );
};

