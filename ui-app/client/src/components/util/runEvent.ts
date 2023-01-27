import {
	FunctionDefinition,
	FunctionExecutionParameters,
	KIRuntime,
	ParameterReferenceType,
	TokenValueExtractor,
} from '@fincity/kirun-js';
import { addMessage, MESSAGE_TYPE } from '../../App/Messages/Messages';
import { GLOBAL_CONTEXT_NAME } from '../../constants';
import {
	dotPathBuilder,
	getDataFromLocation,
	localStoreExtractor,
	PageStoreExtractor,
	setData,
	storeExtractor,
} from '../../context/StoreContext';
import { UIFunctionRepository } from '../../functions';
import { UISchemaRepository } from '../../schemas/common';
import { LocationHistory } from '../../types/common';
import UUID, { flattenUUID } from './uuid';

export const runEvent = async (
	functionDefinition: any,
	key: string = UUID(),
	page = GLOBAL_CONTEXT_NAME,
	locationHistory: Array<LocationHistory>,
) => {
	setData(`Store.functionExecutions.${page}.${flattenUUID(key)}.isRunning`, true);
	try {
		const def: FunctionDefinition = FunctionDefinition.from(functionDefinition);
		const pageExtractor = PageStoreExtractor.getForContext(page);
		if (locationHistory?.length) {
			def.getSteps().forEach(e =>
				e.getParameterMap().forEach(p =>
					p.forEach(pr => {
						if (pr.getType() !== ParameterReferenceType.EXPRESSION) return;
						pr.setValue(
							dotPathBuilder(
								getDataFromLocation(
									{ type: 'EXPRESSION', expression: pr.getExpression() },
									locationHistory,
									pageExtractor,
								),
								locationHistory,
							),
						);
						pr.setType(ParameterReferenceType.VALUE);
						pr.setExpression('');
					}),
				),
			);
		}
		const runtime = new KIRuntime(def, false);
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
		console.log(error);
		return new Promise(resolve => resolve(error));
	}
};
