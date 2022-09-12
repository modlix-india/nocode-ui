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

class _UIFunctionepository implements Repository<Function> {
	find(namespace: string, name: string): Function | undefined {
		if (namespace !== NAMESPACE_UI_ENGINE) return undefined;
		return functionMap.get(name);
	}
}

export const UIFunctionRepository = new HybridRepository<Function>(
	new KIRunFunctionRepository(),
	new _UIFunctionepository(),
);
