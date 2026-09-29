#!/usr/bin/env node
/**
 * Copy the files that the SSR service and the browser client must agree on.
 *
 * The page-routing evaluator decides which page a request renders. SSR runs it
 * to choose what to bootstrap; the browser runs it again on in-app navigation.
 * If the two ever disagree, SSR bootstraps one page and the browser fetches
 * another — a wasted round trip and the wrong variant, with nothing logged and
 * nothing thrown. One source file, copied, removes the possibility.
 *
 * The client owns the original because that is where it is unit-tested. The
 * copy is a build artifact: it is gitignored, and editing it is pointless
 * because the next build overwrites it.
 *
 * The shared file may not import anything — SSR compiles under `module:
 * NodeNext`, which requires explicit `.js` extensions on relative imports,
 * while the client compiles under `moduleResolution: bundler`, which does not.
 * A file with no relative imports is the only kind that satisfies both. That is
 * checked here rather than left to fail later as a confusing tsc error.
 */
import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const CLIENT_SRC = join(__dirname, '..', '..', 'client', 'src');
const SHARED_DIR = join(__dirname, '..', 'src', 'shared');

/** Client-relative path -> name inside src/shared. */
const SHARED_FILES = [['util/pageRouting.ts', 'pageRouting.ts']];

const RELATIVE_IMPORT = /^\s*(?:import|export)\s[^;]*?\sfrom\s+['"]\.{1,2}\//m;

mkdirSync(SHARED_DIR, { recursive: true });

for (const [from, to] of SHARED_FILES) {
	const source = join(CLIENT_SRC, from);
	const contents = readFileSync(source, 'utf-8');

	if (RELATIVE_IMPORT.test(contents)) {
		console.error(
			`copyShared: ${from} has a relative import. Shared files must be self-contained — ` +
				`SSR (NodeNext) and the client (bundler) disagree about extensions, so a relative ` +
				`import cannot compile in both. Inline what it needs.`,
		);
		process.exit(1);
	}

	copyFileSync(source, join(SHARED_DIR, to));
	console.log(`copyShared: ${from} -> src/shared/${to}`);
}
