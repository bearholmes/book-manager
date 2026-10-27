import { execFileSync } from 'node:child_process';

const packageManager = process.env.npm_execpath;
if (!packageManager) throw new Error('Use pnpm build.');
function run(...args) {
  execFileSync(process.execPath, [packageManager, ...args], { stdio: 'inherit' });
}
const options = process.argv.slice(2);
run('check');
run('exec', 'vite', 'build', '--config', 'tooling/config/vite.config.ts');
run('exec', 'electrobun', 'build', ...(options.length ? options : ['--env=dev']));
