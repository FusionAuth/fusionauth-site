import { visit } from 'unist-util-visit';

// TODO borrowed from https://github.com/kevinzunigacuellar/remark-code-title/blob/main/packages/remark-code-title/src/remarkPlugin.ts
// This puts the title before the code block but it needs to get inside the astro-code wrapper so it gets spaced right. Options:
// 1. Client-side javascript (yuck)
// 2. Stop using the default <Code> stuff from astro and write our own. (ugh)
export const codeTitleRemark = () => {
   return (tree, file) => {
     visit(tree, "code", (node, index, parent) => {

       const metaString = `${node.lang ?? ""} ${node.meta ?? ""}`.trim();
       if (!metaString) return;
       const [title] = metaString.match(/(?<=title=("|'))(.*?)(?=("|'))/) ?? [""];
       if (!title && metaString.includes("title=")) {
         file.message("Invalid title", node, "remark-code-title");
         return;
       }
       if (!title) return;

       const emNode = {
          type: "emphasis",
          data: {
            hName: "em",
          },
          children: [{ type: "text", value: title }],
       }

       const titleNode = {
         type: "paragraph",
         data: {
           hName: "p",
           hProperties: {
               "data-title": title,
           },
         },
         children: [ emNode ],
       };


       parent.children.splice(index+1, 0, titleNode);
       /* Skips this node (title) and the next node (code) */
       return index + 2
    });
  };
}