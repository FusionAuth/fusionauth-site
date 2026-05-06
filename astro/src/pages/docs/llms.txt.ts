import { getCollection } from "astro:content";
import type { APIRoute } from "astro";

const docs = await getCollection("docs");

export const GET: APIRoute = async ({}) => {
    return new Response(
        `## FusionAuth.io Documentation\n\n${docs
            .map((doc) => {
                const slug = doc.id === "index" ? "" : doc.id.replace(/\/index$/, "");
                return `- [${doc.data.title}](https://fusionauth.io/docs/${slug})\n`;
            })
            .join("")}`,
        { headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
};
