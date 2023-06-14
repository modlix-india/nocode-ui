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

class _UIFunctionRepository implements Repository<Function> {
	public find(namespace: string, name: string): Function | undefined {
		if (namespace !== NAMESPACE_UI_ENGINE) return undefined;
		return functionMap.get(name);
	}

	filter(name: string): string[] {
		const lowerCaseName = name.toLowerCase();
		return Array.from(
			new Set(
				Array.from(functionMap.values())
					.map(e => e.getSignature().getFullName())
					.filter(e => e.toLowerCase().includes(lowerCaseName))
					.map(e => e),
			),
		);
	}
}

export const UIFunctionRepository = new HybridRepository<Function>(
	new KIRunFunctionRepository(),
	new _UIFunctionRepository(),
);
