#!/usr/bin/env node
/**
 * refreshCodeSnippets.ts
 *
 * Scans all MDX files for RemoteSnippet components,
 * clones/pulls required repositories,
 * and runs Bluehawk to generate snippets.
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface SnippetInfo {
  repo: string;
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
const SNIPPET_OUTPUT_DIR = path.join(process.cwd(), 'astro', 'src', 'codeSnippets', 'remote');
const CONTENT_DIR = path.join(process.cwd(), 'astro', 'src', 'content');

function main(): void {
  console.log('=== Refresh Code Snippets ===\n');

  console.log('Scanning for MDX files...');
  const mdxFiles = getListOfAllMdxFiles(CONTENT_DIR);
  console.log(`Found ${mdxFiles.length} MDX files`);

  console.log('\nParsing RemoteSnippet components...');
  const allSnippets = getAllSnippets(mdxFiles);
  console.log(`\nTotal RemoteSnippet components found: ${allSnippets.length}`);

  if (allSnippets.length === 0) {
    console.log('No RemoteSnippet components found. Exiting.');
    return;
  }

  console.log('\nIdentifying unique repositories...');
  const repos = groupSnippetsByRepo(allSnippets);
  console.log(`Found ${repos.size} unique repository(ies)`);

  for (const [repoName, repoInfo] of repos)
    console.log(`  - ${repoName} (${repoInfo.url}) -> ${repoInfo.localPath}`);

  console.log('\n=== Cloning/Pulling Repositories ===');
  for (const [repoName, repoInfo] of repos)
    cloneOrUpdateRepo(repoInfo);

  console.log('\n=== Generating Snippets ===');
  const processedDirs = new Map<string, string>();

  for (const snippet of allSnippets) {
    const repoName = getRepoName(snippet.repo);
    const repoPath = path.join(CACHE_DIR, repoName);
    const fileDir = path.dirname(snippet.filepath);
    const dirKey = `${repoName}:${fileDir}`;

    const lastBranch = processedDirs.get(dirKey);
    if (lastBranch === snippet.branch) {
      console.log(`  Skipping already processed directory on same branch: ${fileDir}`);
      continue;
    }

    checkoutBranch(repoPath, snippet.branch);
    generateSnippets(snippet, repoPath);
    processedDirs.set(dirKey, snippet.branch);
  }

  console.log('\n=== Done ===');
  console.log(`Processed ${allSnippets.length} snippet(s) from ${repos.size} repo(s)`);
}

function getListOfAllMdxFiles(dir: string): string[] {
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
  return files;
}

function getAllSnippets(mdxFiles: string[]): SnippetInfo[] {
  const snippets: SnippetInfo[] = [];
  for (const file of mdxFiles) {
    const fileSnippets = getSnippetsFromFile(file);
    snippets.push(...fileSnippets);
    if (fileSnippets.length > 0)
      console.log(`  ${file}: ${fileSnippets.length} snippet(s)`);
  }
  return snippets;
}

function getSnippetsFromFile(filePath: string): SnippetInfo[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const snippets: SnippetInfo[] = [];

  const regex = /<RemoteSnippet\s+([^>]+)\/>/g;
  let match;

  while ((match = regex.exec(content)) !== null) {
    const propsStr = match[1];

    const repoMatch = propsStr.match(/repo=["']([^"']+)["']/);
    const branchMatch = propsStr.match(/branch=["']([^"']+)["']/);
    const filepathMatch = propsStr.match(/filepath=["']([^"']+)["']/);
    const tagMatch = propsStr.match(/tag=["']([^"']+)["']/);
    const langMatch = propsStr.match(/lang=["']([^"']+)["']/);
    const titleMatch = propsStr.match(/title=["']([^"']+)["']/);

    if (repoMatch && branchMatch && filepathMatch) {
      snippets.push({
        repo: repoMatch[1],
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

function groupSnippetsByRepo(snippets: SnippetInfo[]): Map<string, RepoInfo> {
  const repos = new Map<string, RepoInfo>();

  for (const snippet of snippets) {
    const repoName = getRepoName(snippet.repo);
    const existing = repos.get(repoName);
    if (existing)
      existing.branches.add(snippet.branch);
    else
      repos.set(repoName, {
        url: snippet.repo,
        localPath: path.join(CACHE_DIR, repoName),
        branches: new Set([snippet.branch])
      });
  }

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
      console.log(`  Fetched successfully`);
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
      console.log(`  Cloned successfully`);
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
  const fileDir = path.dirname(snippet.filepath);
  const sourceDir = path.join(repoPath, fileDir);

  console.log(`\nProcessing snippet:`);
  console.log(`  Repo: ${snippet.repo}`);
  console.log(`  Branch: ${snippet.branch}`);
  console.log(`  File: ${snippet.filepath}`);
  console.log(`  Tag: ${snippet.tag || '(full file)'}`);

  if (!fs.existsSync(sourceDir)) {
    console.error(`  Error: Directory not found: ${sourceDir}`);
    process.exit(1);
  }

  fs.mkdirSync(SNIPPET_OUTPUT_DIR, { recursive: true });

  const relativePath = path.relative(process.cwd(), sourceDir);
  const command = `cd astro && npx bluehawk snip "../${relativePath}" --output src/codeSnippets/remote/`;
  console.log(`  Running: ${command}`);

  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`  Snippet generation completed`);
  }
  catch (error) {
    console.error(`  Snippet generation failed: ${error}`);
    process.exit(1);
  }
}

main();
