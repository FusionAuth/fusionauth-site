import { execSync } from 'child_process';

const prNumber = process.env.PR_NUMBER;
if (!prNumber) {
  console.error('Error: PR_NUMBER environment variable is not set.');
  process.exit(1);
}

const validExtensions = ['js', 'mjs', 'cjs', 'ts', 'md', 'mdx'];
const validStatus = ['added', 'modified'];

// Get the list of changed files in the pull request
const modifiedFilesJson = execSync(`gh api repos/FusionAuth/fusionauth-site/pulls/${prNumber}/files`).toString();
const modifiedFiles = JSON.parse(modifiedFilesJson);

const changedSrcFiles = modifiedFiles
    .filter(file => file.filename.startsWith('astro/src/'))
    .filter(file => validExtensions.some(ext => file.filename.endsWith(ext)))
    .filter(file => validStatus.includes(file.status))
    .map(file => file.filename.replace('astro/', ''));

if (changedSrcFiles.length > 0) {
  console.log(`Linting changed files: ${changedSrcFiles.join(', ')}`);
  try {
    const output = execSync(`npm run lint -- ${changedSrcFiles.join(' ')}`);
    console.log(output.toString());
  } catch (e) {
    console.error(e.stdout.toString());
    process.exit(1);
  }
} else {
  console.log('No changed files to lint.');
  process.exit(0);
}
