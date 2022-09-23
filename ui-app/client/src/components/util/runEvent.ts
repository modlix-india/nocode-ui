import {
	FunctionDefinition,
	FunctionExecutionParameters,
	KIRuntime,
	TokenValueExtractor,
} from '@fincity/kirun-js';
import {
	localStoreExtractor,
	setData,
	storeExtractor,
} from '../../context/StoreContext';
import { UIFunctionRepository } from '../../functions';
import { UISchemaRepository } from '../../schemas';
import UUID from './uuid';

export const runEvent = (functionDefinition: any, key: string = UUID()) => {
	setData(`Store.functionExecutions.${key}.isRunning`, true);
	const def: FunctionDefinition = FunctionDefinition.from(functionDefinition);
	return new KIRuntime(def).execute(
		new FunctionExecutionParameters(
			UIFunctionRepository,
			UISchemaRepository,
			key,
		).setValuesMap(
			new Map<string, TokenValueExtractor>([
				[storeExtractor.getPrefix(), storeExtractor],
				[localStoreExtractor.getPrefix(), localStoreExtractor],
			]),
		),
	);
};
