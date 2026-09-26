import {
	Function,
	HybridRepository,
	Repository,
	KIRunFunctionRepository,
	AbstractFunction,
} from '@fincity/kirun-js';
import { NAMESPACE_UI_ENGINE } from '../constants';
import * as map from './all';

const functionMap = new Map<string, AbstractFunction>();
Object.entries(map).forEach(([k, v]) => functionMap.set(k, new v()));

/**
 * UIEngine function docs, registered into kirun-ui's registry on demand.
 *
 * Call this; do not import `@fincity/kirun-ui` from module scope here.
 *
 * That package's dist/module.js is one 104KB bundle whose FIRST import is
 * `monaco-editor` -- the whole package, all 55 language chunks, ~2.9MB
 * gzipped -- and it declares no `sideEffects`, so webpack cannot drop that
 * import even though the only thing wanted from the file is one helper at the
 * far end of it.
 *
 * A top-level `import` put monaco in the graph the bootstrap AWAITS. A
 * top-level `import()` was no better in practice: it stopped blocking the
 * bootstrap but still ran the instant this module was evaluated, so every page
 * downloaded the editor milliseconds later. Measured on dev, where the
 * bootstrap's own chunk list was clean and monaco arrived anyway.
 *
 * So the load has to hang off a CALL, not off module evaluation. The only
 * consumer of this registry is kirun-ui's own documentation panel inside the
 * KIRun editor, which is lazy, so LazyKIRunEditor invokes this and a page that
 * never opens an editor never pays for one.
 *
 * Idempotent: repeated calls share the first promise.
 */
let docsRegistration: Promise<void> | undefined;

export function registerUIEngineFunctionDocs(): Promise<void> {
	docsRegistration ??= import('@fincity/kirun-ui')
		.then(({ registerFunctionDocumentation }) => {
			functionMap.forEach(fn => {
				const sig = fn.getSignature();
				const description = sig.getDescription?.();
				const documentation = sig.getDocumentation?.();
				if (description || documentation) {
					registerFunctionDocumentation({
						fullName: sig.getFullName(),
						description: description || '',
						documentation: documentation || '',
						availableIn: ['JS'],
					});
				}
			});
		})
		.catch(() => {
			// Documentation is a nicety. A chunk that fails to load must not
			// take the function repository -- and with it the page -- down.
		});
	return docsRegistration;
}

class _UIFunctionRepository implements Repository<Function> {
	public find(namespace: string, name: string): Promise<Function | undefined> {
		if (namespace !== NAMESPACE_UI_ENGINE) return Promise.resolve(undefined);
		return Promise.resolve(functionMap.get(name));
	}

	public filter(name: string): Promise<string[]> {
		const lowerCaseName = name.toLowerCase();
		return Promise.resolve(
			Array.from(
				new Set(
					Array.from(functionMap.values())
						.map(e => e.getSignature().getFullName())
						.filter(e => e.toLowerCase().includes(lowerCaseName))
						.map(e => e),
				),
			),
		);
	}
}

export class UIFunctionRepository extends HybridRepository<Function> {
	constructor() {
		super(new KIRunFunctionRepository(), new _UIFunctionRepository());
	}
}
