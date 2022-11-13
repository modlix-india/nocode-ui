import { FunctionDefinition, FunctionExecutionParameters, KIRuntime, TokenValueExtractor } from '@fincity/kirun-js';
import { localStoreExtractor, setData, storeExtractor } from '../../context/StoreContext';
import { UIFunctionRepository } from '../../functions';
import { UISchemaRepository } from '../../schemas';
import UUID from './uuid';

export const runEvent = async (functionDefinition: any, key: string = UUID(), page = 'global') => {
	setData(`Store.functionExecutions.${page}.${key}.isRunning`, true);
	try {
		const def: FunctionDefinition = FunctionDefinition.from(functionDefinition);
		const runtime = new KIRuntime(def);
		const fep = new FunctionExecutionParameters(UIFunctionRepository, UISchemaRepository, key).setValuesMap(
			new Map<string, TokenValueExtractor>([
				[storeExtractor.getPrefix(), storeExtractor],
				[localStoreExtractor.getPrefix(), localStoreExtractor],
			]),
		);
		const x = await runtime.execute(fep);
		setData(`Store.functionExecutions.${page}.${key}.isRunning`, false);
		return new Promise(resolve => resolve(x));
	} catch (error) {
		setData(`Store.functionExecutions.${key}.isRunning`, false);
		return new Promise((_, rej) => rej(error));
	}
};
