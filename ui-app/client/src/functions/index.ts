import {
	Function,
	HybridRepository,
	Repository,
	KIRunFunctionRepository,
	AbstractFunction,
} from '@fincity/kirun-js';
import { registerFunctionDocumentation } from '@fincity/kirun-ui';
import { NAMESPACE_UI_ENGINE } from '../constants';
import * as map from './all';

const functionMap = new Map<string, AbstractFunction>();
Object.entries(map).forEach(([k, v]) => functionMap.set(k, new v()));

// Register UIEngine function docs into kirun-ui registry from signatures
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
