# FusionAuth Web Template

This project contains a web template that was inspired by Tailwind, Astro, and other designs. We plan on using this design for the FusionAuth docs, blogs, and auxiliary websites.

The project also contains a custom search widget that uses Algolia's REST API. This could quite easily be ported to Lunr or any other search solution.

And most of all, this project is free and open source. Feel free to use any part of it for your own projects!

Happy coding!

## Astro

We are currently using Astro for our SSG technology. We aren't leveraging any Astro components really because we wanted a template that would make it simple for someone to extract our HTML, CSS, and JavaScript and port it to anything (Jekyll, Hugo, Next, etc).

To run the project, just type this:

```
npm install
```

Then, generate your pages:

```
npm run start
```

## Dev

To run in dev, so file changes are picked up:

```
npm run dev
```
