import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

// The CLI requires package.json in its cwd. Keep the source config with React
// and expose a temporary root config while running against Laravel's package.
const root = fileURLToPath(new URL('../', import.meta.url));
const source = path.join(root, 'resources/js/app/components.json');
const target = path.join(root, 'components.json');
if (fs.existsSync(target)) {
    throw new Error('Root components.json already exists; remove the duplicate before running npm run ui.');
}
const config = JSON.parse(fs.readFileSync(source, 'utf8'));
config.tailwind.css = path.relative(root, path.resolve(path.dirname(source), config.tailwind.css)).split(path.sep).join('/');
let result;
try {
    fs.writeFileSync(target, JSON.stringify(config, null, 2) + '\n');
    result = spawnSync(process.execPath, [path.join(root, 'node_modules/shadcn/dist/index.js'), ...process.argv.slice(2)], { cwd: root, stdio: 'inherit' });
    if (result.error) throw result.error;
    if (result.status === 0) {
        const updated = JSON.parse(fs.readFileSync(target, 'utf8'));
        updated.tailwind.css = path.relative(path.dirname(source), path.resolve(root, updated.tailwind.css)).split(path.sep).join('/');
        fs.writeFileSync(source, JSON.stringify(updated, null, 2) + '\n');
    }
} finally {
    fs.rmSync(target, { force: true });
}
process.exitCode = result.status ?? 1;
