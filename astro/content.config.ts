// 1. Import utilities from `astro:content`
import { defineCollection } from 'astro:content';
import { renderMarkdown } from '@astrojs/markdown-remark';
import fs from 'node:fs/promises';
import path from 'node:path';
import glob from 'fast-glob';

// 2. Import loader(s)
import { glob, file } from 'astro/loaders';

// 3. Import Zod
import { z } from 'astro/zod';

// 4. Define your collection(s)
const releases = defineCollection({ '/src/releases' });

// 5. Export a single `collections` object to register your collection(s)
export const collections = { releases };