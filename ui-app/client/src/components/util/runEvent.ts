import {
	FunctionDefinition,
	FunctionExecutionParameters,
	KIRuntime,
	TokenValueExtractor,
} from '@fincity/kirun-js';
import { addMessage, MESSAGE_TYPE } from '../../App/Messages/Messages';
import { GOBAL_CONTEXT_NAME } from '../../constants';
import {
	localStoreExtractor,
	PageStoreExtractor,
	setData,
	storeExtractor,
} from '../../context/StoreContext';
import { UIFunctionRepository } from '../../functions';
import { UISchemaRepository } from '../../schemas/common';
import UUID, { flattenUUID } from './uuid';

export const runEvent = async (
	functionDefinition: any,
	key: string = UUID(),
	page = GOBAL_CONTEXT_NAME,
) => {
	setData(`Store.functionExecutions.${page}.${flattenUUID(key)}.isRunning`, true);
	try {
		const def: FunctionDefinition = FunctionDefinition.from(functionDefinition);
		const runtime = new KIRuntime(def);
		const pageExtractor = PageStoreExtractor.getForContext(page);
		const fep = new FunctionExecutionParameters(
			UIFunctionRepository,
			UISchemaRepository,
			key,
		).setValuesMap(
			new Map<string, TokenValueExtractor>([
				[storeExtractor.getPrefix(), storeExtractor],
				[localStoreExtractor.getPrefix(), localStoreExtractor],
				[pageExtractor.getPrefix(), pageExtractor],
			]),
		);
		const x = await runtime.execute(fep);
		setData(`Store.functionExecutions.${page}.${flattenUUID(key)}.isRunning`, false);
		return new Promise(resolve => resolve(x));
	} catch (error: any) {
		setData(`Store.functionExecutions.${page}.${flattenUUID(key)}.isRunning`, false);
		addMessage(MESSAGE_TYPE.ERROR, error, true, page);
		return new Promise(resolve => resolve(error));
	}
};
