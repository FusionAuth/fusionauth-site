#!/usr/bin/env node

/**
 * Scans all MDX files for RemoteSnippet components,
 * clones/pulls required repositories,
 * and runs Bluehawk to generate snippets.
 *
 * Run this script with:
 * docker run --init -it --rm --name "app" -v ".:/app" -w "/app" node:26 sh -c "node src/scripts/refreshRemoteCodeSnippets.ts"
 *
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface SnippetInfo {
  url: string;
  branch: string;
  filepath: string;
  tag?: string;
  lang?: string;
  title?: string;
  sourceFile: string;
}

interface RepoInfo {
  url: string;
  localPath: string;
  branches: Set<string>;
}

const CACHE_DIR = path.join(process.cwd(), '.cache', 'repos');
const SNIPPET_OUTPUT_DIR = path.join(process.cwd(), 'src', 'codeSnippets', 'remote');
const CONTENT_DIR = path.join(process.cwd(), 'src', 'content');

function main(): void {
  console.log('=== Refresh Code Snippets ===\n');

  const mdxFiles = getListOfAllMdxFiles(CONTENT_DIR);

  const allSnippets = getAllSnippets(mdxFiles);
  if (allSnippets.length === 0) return console.log('No RemoteSnippet components found. Exiting.');

  const repos = groupSnippetsByRepo(allSnippets);

  console.log('\n=== Cloning/Pulling Repositories ===');
  for (const [repoName, repoInfo] of repos) cloneOrUpdateRepo(repoInfo);

  console.log('\n=== Generating Snippets ===');
  const processedDirs = new Map<string, string>();
  for (const snippet of allSnippets) {
    const repoName = getRepoName(snippet.url);
    const repoPath = path.join(CACHE_DIR, repoName);
    const fileDir = path.dirname(snippet.filepath);
    const dirKey = `${repoName}:${fileDir}`;

    // For tagged snippets, bluehawk snip processes the whole directory at once,
    // so skip if we've already run it for this dir+branch combination.
    // For untagged snippets, each file is copied individually — never skip.
    if (snippet.tag) {
      const lastBranch = processedDirs.get(dirKey);
      if (lastBranch === snippet.branch) {
        console.log(`  Skipping already processed directory on same branch: ${fileDir}`);
        continue;
      }
    }

    checkoutBranch(repoPath, snippet.branch);
    generateSnippets(snippet, repoPath);
    if (snippet.tag) processedDirs.set(dirKey, snippet.branch);
  }

  console.log('\n=== Done ===');
  console.log(`Processed ${allSnippets.length} snippet(s) from ${repos.size} repo(s)`);
}

function getListOfAllMdxFiles(dir: string): string[] {
  console.log('Scanning for MDX files...');
  const files: string[] = [];

  function walk(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory())
        walk(fullPath);
      else if (entry.name.endsWith('.mdx'))
        files.push(fullPath);
    }
  }

  walk(dir);
  console.log(`Found ${files.length} MDX files`);
  return files;
}

function getAllSnippets(mdxFiles: string[]): SnippetInfo[] {
  console.log('\nParsing RemoteSnippet components...');
  const snippets: SnippetInfo[] = [];
  for (const file of mdxFiles) {
    const fileSnippets = getSnippetsFromFile(file);
    snippets.push(...fileSnippets);
    if (fileSnippets.length > 0)
      console.log(`  ${file}: ${fileSnippets.length} snippet(s)`);
  }
  console.log(`\nTotal RemoteSnippet components found: ${snippets.length}`);
  return snippets;
}

function getSnippetsFromFile(filePath: string): SnippetInfo[] {
  const mdxContent = fs.readFileSync(filePath, 'utf-8');
  const frontmatter = getFrontmatterFromMdxContent(mdxContent);
  const snippets: SnippetInfo[] = [];

  const regex = /<RemoteSnippet\s+([^>]+)\/>/g;
  let match;

  while ((match = regex.exec(mdxContent)) !== null) {
    const propsStr = match[1];

    const urlMatch = propsStr.match(/url=(?:\{([^}]+)\}|["']([^"']+)["'])/);
    const branchMatch = propsStr.match(/branch=["']([^"']+)["']/);
    const filepathMatch = propsStr.match(/filepath=["']([^"']+)["']/);
    const tagMatch = propsStr.match(/tag=["']([^"']+)["']/);
    const langMatch = propsStr.match(/lang=["']([^"']+)["']/);
    const titleMatch = propsStr.match(/title=["']([^"']+)["']/);

    if (urlMatch && branchMatch && filepathMatch) {
      const frontmatterVariable = urlMatch[1];
      const literalString = urlMatch[2];
      const rawUrl = literalString || frontmatterVariable;
      const url = getUrlFromFrontmatterOrLiteral(rawUrl, frontmatter);
      snippets.push({
        url,
        branch: branchMatch[1],
        filepath: filepathMatch[1],
        tag: tagMatch?.[1],
        lang: langMatch?.[1],
        title: titleMatch?.[1],
        sourceFile: filePath
      });
    }
  }

  return snippets;
}

function getFrontmatterFromMdxContent(mdxContent: string): Record<string, string> {
  const frontmatter: Record<string, string> = {};
  const match = mdxContent.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return frontmatter;
  const lines = match[1].split('\n');
  for (const line of lines) {
    const kv = line.match(/^(\w+):\s*(.+)$/);
    if (kv) frontmatter[kv[1]] = kv[2];
  }
  return frontmatter;
}

function getUrlFromFrontmatterOrLiteral(value: string, frontmatter: Record<string, string>): string {
  const fmMatch = value.match(/^frontmatter\.(\w+)$/);
  if (!fmMatch) return value;
  const varName = fmMatch[1];
  const resolved = frontmatter[varName];
  if (!resolved) {
    console.error(`  Error: Frontmatter variable '${varName}' not found`);
    process.exit(1);
  }
  return resolved;
}

function groupSnippetsByRepo(snippets: SnippetInfo[]): Map<string, RepoInfo> {
  console.log('\nIdentifying unique repositories...');
  const repos = new Map<string, RepoInfo>();

  for (const snippet of snippets) {
    const repoName = getRepoName(snippet.url);
    const existing = repos.get(repoName);
    if (existing)
      existing.branches.add(snippet.branch);
    else
      repos.set(repoName, {
        url: snippet.url,
        localPath: path.join(CACHE_DIR, repoName),
        branches: new Set([snippet.branch])
      });
  }

  console.log(`Found ${repos.size} unique repository(ies)`);
  for (const [repoName, repoInfo] of repos)
    console.log(`  - ${repoName} (${repoInfo.url}) -> ${repoInfo.localPath}`);

  return repos;
}

function getRepoName(repoUrl: string): string {
  const match = repoUrl.match(/\/([^\/]+?)\.git$/);
  if (match)
    return match[1];
  const parts = repoUrl.split('/');
  return parts[parts.length - 1].replace('.git', '') || 'unknown-repo';
}

function cloneOrUpdateRepo(repoInfo: RepoInfo): void {
  console.log(`Processing repo: ${repoInfo.url}`);
  console.log(`  Branches needed: ${Array.from(repoInfo.branches).join(', ')}`);

  if (fs.existsSync(repoInfo.localPath)) {
    console.log(`  Repository exists, fetching updates...`);
    try {
      execSync(`git -C "${repoInfo.localPath}" fetch origin`, { stdio: 'inherit' });
    }
    catch (error) {
      console.error(`  Failed to fetch repo: ${error}`);
      process.exit(1);
    }
  }
  else {
    console.log(`  Repository not found, cloning...`);
    try {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
      execSync(`git clone "${repoInfo.url}" "${repoInfo.localPath}"`, {
        stdio: 'inherit',
        cwd: CACHE_DIR
      });
    }
    catch (error) {
      console.error(`  Failed to clone repo: ${error}`);
      process.exit(1);
    }
  }
}

function checkoutBranch(repoPath: string, branch: string): void {
  console.log(`  Checking out branch: ${branch}`);
  try {
    execSync(`git -C "${repoPath}" checkout ${branch}`, { stdio: 'inherit' });
    execSync(`git -C "${repoPath}" pull origin ${branch}`, { stdio: 'inherit' });
  }
  catch (error) {
    console.error(`  Failed to checkout branch ${branch}: ${error}`);
    process.exit(1);
  }
}

function generateSnippets(snippet: SnippetInfo, repoPath: string): void {
  const repoName = getRepoName(snippet.url);
  const fileDir = path.dirname(snippet.filepath);
  const sourceDir = path.join(repoPath, fileDir);
  const filename = path.basename(snippet.filepath);

  console.log(`\nProcessing snippet:`);
  console.log(`  Repo: ${snippet.url}`);
  console.log(`  Branch: ${snippet.branch}`);
  console.log(`  File: ${snippet.filepath}`);
  console.log(`  Tag: ${snippet.tag || '(full file)'}`);

  if (!fs.existsSync(sourceDir)) {
    console.error(`  Error: Directory not found: ${sourceDir}`);
    process.exit(1);
  }

  const repoOutputDir = path.join(SNIPPET_OUTPUT_DIR, repoName);
  fs.mkdirSync(repoOutputDir, { recursive: true });

  if (snippet.tag) {
    const command = `npx bluehawk snip "${sourceDir}" --output "src/codeSnippets/remote/${repoName}/"`;
    console.log(`  Running: ${command}`);
    try {
      execSync(command, { stdio: 'inherit' });
    }
    catch (error) {
      console.error(`  Snippet generation failed: ${error}`);
      process.exit(1);
    }
  }
  else {
    const sourceFile = path.join(sourceDir, filename);
    const destDir = path.join(SNIPPET_OUTPUT_DIR, repoName, fileDir);
    const destFile = path.join(destDir, filename);
    try {
      fs.mkdirSync(destDir, { recursive: true });
      fs.copyFileSync(sourceFile, destFile);
    }
    catch (error) {
      console.error(`  Failed to copy file: ${error}`);
      process.exit(1);
    }
  }
}

main();
