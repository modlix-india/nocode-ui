import fs from 'fs';
import path from 'path';

/**
 * The four report entries are registered eagerly (components/index.ts), so whatever they import
 * statically ships with every page. Only the entry, its property and style property files, its
 * Style component and the shared CSS text (reportStyle.ts) may be on that path; everything that
 * runs lives behind the React.lazy import.
 */

const ROOT = path.resolve(__dirname, '..');
const ENTRIES = ['ReportWidget', 'Dashboard', 'ReportEditor', 'ReportLibrary'];

function resolveLocal(from: string, spec: string): string | undefined {
	if (!spec.startsWith('.')) return undefined;
	const base = path.resolve(path.dirname(from), spec);
	for (const ext of ['.ts', '.tsx', '/index.ts', '/index.tsx'])
		if (fs.existsSync(base + ext)) return base + ext;
	return undefined;
}

/** Static imports only: `import(...)` (lazy) and `import type` are not on the load path. */
function staticImports(file: string): string[] {
	const src = fs.readFileSync(file, 'utf8');
	const out: string[] = [];
	const re = /^\s*(import|export)\s+(?!type\s)[^'";]*?from\s+['"]([^'"]+)['"]/gm;
	let m: RegExpExecArray | null;
	while ((m = re.exec(src))) out.push(m[2]);
	const bare = /^\s*import\s+['"]([^'"]+)['"]/gm;
	while ((m = bare.exec(src))) out.push(m[1]);
	return out;
}

function reportsGraph(entry: string): string[] {
	const seen = new Set<string>();
	const walk = (file: string) => {
		if (seen.has(file)) return;
		seen.add(file);
		for (const spec of staticImports(file)) {
			const r = resolveLocal(file, spec);
			if (r && r.startsWith(ROOT + path.sep)) walk(r);
		}
	};
	walk(entry);
	return [...seen].map(f => path.relative(ROOT, f)).sort();
}

describe('report entries load slim', () => {
	it.each(ENTRIES)('%s eagerly imports only its definitions and CSS', name => {
		const dir = path.join(ROOT, name);
		const files = fs.readdirSync(dir);
		const pick = (re: RegExp) => files.find(f => re.test(f))!;
		const allowed = new Set(
			[
				`${name}.tsx`,
				pick(/^[a-z]\w*Properties\.ts$/),
				pick(/^[a-z]\w*StyleProperties\.ts$/),
				`${name}Style.tsx`,
			]
				.map(f => path.join(name, f))
				.concat('reportStyle.ts'),
		);
		const graph = reportsGraph(path.join(dir, `${name}.tsx`));
		expect(graph.filter(f => !allowed.has(f))).toEqual([]);
	});

	it('reportStyle.ts holds no runtime code', () => {
		const src = fs.readFileSync(path.join(ROOT, 'reportStyle.ts'), 'utf8');
		const imports = staticImports(path.join(ROOT, 'reportStyle.ts'));
		expect(imports).toEqual(['../../types/common']);
		expect(src).not.toMatch(/\buse(State|Effect|Ref|Memo)\b/);
		expect(src).not.toMatch(/getComputedStyle|document\./);
	});
});
