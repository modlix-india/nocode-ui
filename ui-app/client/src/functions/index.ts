import {
	Function,
	HybridRepository,
	Repository,
	KIRunFunctionRepository,
	AbstractFunction,
} from '@fincity/kirun-js';
import { NAMESPACE_UI_ENGINE } from '../constants';
import * as map from './all';

type FunctionsModule = typeof map;

class _UIFunctionepository implements Repository<Function> {
	find<K extends keyof FunctionsModule>(
		namespace: string,
		name: K,
	): Function | undefined {
		if (namespace !== NAMESPACE_UI_ENGINE) return undefined;
		return new map[name]();
	}
}

export const UIFunctionRepository = new HybridRepository<Function>(
	new KIRunFunctionRepository(),
	new _UIFunctionepository(),
);
