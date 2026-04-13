import { execSync } from 'child_process';

const baseRef = process.env.BASE_REF || 'origin/main';
const headRef = process.env.HEAD_REF || 'HEAD';

const validExtensions = ['js', 'mjs', 'cjs', 'ts', 'md', 'mdx'];

let diffOutput;
try {
  console.log(`Comparing ${headRef} against ${baseRef}...`);
  // --name-only returns just the file paths (no git status formatting)
  // --diff-filter=AM inherently restricts the output to (A)dded and (M)odified files
  // '...' finds the merge-base, effectively showing what changed in the PR
  diffOutput = execSync(`git diff --name-only --diff-filter=AM ${baseRef}...${headRef}`)
    .toString()
    .trim();
} catch (error) {
  console.error(`Error executing git diff. Ensure your base ref exists locally.\n${error.message}`);
  process.exit(1);
}

if (!diffOutput) {
  console.log('No added or modified files found.');
  process.exit(0);
}

const changedSrcFiles = diffOutput
  .split('\n')
  .filter(filename => filename.startsWith('astro/src/'))
  .filter(filename => validExtensions.some(ext => filename.endsWith(ext)))
  .map(filename => filename.replace('astro/', ''));

if (changedSrcFiles.length > 0) {
  console.log(`Linting changed files: ${changedSrcFiles.join(', ')}`);
  try {
    const output = execSync(`npm run lint -- ${changedSrcFiles.join(' ')}`);
    console.log(output.toString());
  } catch (e) {
    console.error(e.stdout ? e.stdout.toString() : e.message);
    process.exit(1);
  }
} else {
  console.log('No valid changed files to lint in astro/src/.');
  process.exit(0);
}