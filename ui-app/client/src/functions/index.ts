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
 * UIEngine function docs, registered into kirun-ui's registry.
 *
 * Loaded through a dynamic import, and that is not a micro-optimisation.
 * `@fincity/kirun-ui` statically imports the whole of `monaco-editor`, so a
 * top-level import here put the entire code editor into the module graph of
 * this file -- which the app bootstrap awaits. Measured: 55 monaco chunks,
 * ~2.9MB gzipped, downloaded before the first render of EVERY page, including
 * pages that never open an editor. This one import was 73% of the boot
 * payload.
 *
 * Deferring it is safe because nothing in this application reads the registry.
 * Its only consumer is kirun-ui's own documentation panel inside the KIRun
 * editor, which is itself behind React.lazy, so the registration has to be
 * done before that panel opens rather than before the page renders. The
 * promise is exported so a caller wanting that guarantee can await it.
 */
export const functionDocumentationReady: Promise<void> = import('@fincity/kirun-ui')
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
		// Documentation is a nicety. A chunk that fails to load must not take
		// the function repository -- and with it the whole page -- down.
	});

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
