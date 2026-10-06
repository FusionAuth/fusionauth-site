import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// the scripts use repo-root paths like astro/src/content/...
const REPO_ROOT = fileURLToPath(new URL('../../../', import.meta.url));

const CHECKS = [
  'src/scripts/check-for-incorrect-categories.sh',
  'src/scripts/check-for-absolute-urls.sh',
  'src/scripts/check-for-api-fields-no-name.sh',
];

/** Fails every build when content breaks the rules in src/scripts/check-*.sh. */
export default function contentChecks() {
  return {
    name: 'content-checks',
    hooks: {
      'astro:build:start': ({ logger }) => {
        const failures = [];
        for (const script of CHECKS) {
          try {
            execFileSync('sh', [script], { cwd: REPO_ROOT, encoding: 'utf-8', stdio: 'pipe' });
          } catch (err) {
            failures.push(`${script}:\n${(err.stdout || '') + (err.stderr || '') || err.message}`);
          }
        }
        if (failures.length) throw new Error(`Content checks failed:\n\n${failures.join('\n\n')}`);
        logger.info(`${CHECKS.length} content checks passed`);
      },
    },
  };
}
