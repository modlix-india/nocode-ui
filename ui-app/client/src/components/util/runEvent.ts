import {
	FunctionDefinition,
	FunctionExecutionParameters,
	KIRuntime,
	LinkedList,
	ParameterReferenceType,
	TokenValueExtractor,
} from '@fincity/kirun-js';
import { addMessage, MESSAGE_TYPE } from '../../App/Messages/Messages';
import { GLOBAL_CONTEXT_NAME } from '../../constants';
import {
	dotPathBuilder,
	getDataFromLocation,
	getDataFromPath,
	localStoreExtractor,
	PageStoreExtractor,
	setData,
	storeExtractor,
} from '../../context/StoreContext';
import { UIFunctionRepository } from '../../functions';
import { UISchemaRepository } from '../../schemas/common';
import { LocationHistory, PageDefinition } from '../../types/common';
import UUID, { flattenUUID } from './uuid';

function updateExpressionsWithLocationHistory(
	def: FunctionDefinition,
	locationHistory: Array<LocationHistory>,
	pageExtractor: PageStoreExtractor,
) {
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

function addValidationTriggers(
	flatId: string,
	page: string,
	locationHistory: LocationHistory[],
): Array<string> {
	const suffixes: Array<string> = [];
	setData(`Store.validationTriggers.${page}.${flatId}`, true, page);
	for (let i = 0; i < locationHistory?.length ?? 0; i++) {
		suffixes.push((i === 0 ? '' : suffixes[i - 1]) + '_' + locationHistory[i].index);
		setData(`Store.validationTriggers.${page}.${flatId}${suffixes[i]}`, true, page);
	}
	return suffixes;
}

export const runEvent = async (
	functionDefinition: any,
	key: string = UUID(),
	page = GLOBAL_CONTEXT_NAME,
	locationHistory: Array<LocationHistory>,
	pageDefinition?: PageDefinition,
	args?: Map<string, any>,
) => {
	try {
		const def: FunctionDefinition = FunctionDefinition.from(functionDefinition);
		const pageExtractor = PageStoreExtractor.getForContext(page);
		if (locationHistory?.length)
			updateExpressionsWithLocationHistory(def, locationHistory, pageExtractor);

		if (functionDefinition.validationCheck && pageDefinition) {
			const flatId = flattenUUID(functionDefinition.validationCheck);
			const suffixes: Array<string> = addValidationTriggers(flatId, page, locationHistory);
			const invalidEntries = getDataFromPath(`Store.validations.${page}`, locationHistory);
			const list: LinkedList<string> = new LinkedList<string>();

			list.add(functionDefinition.validationCheck);
			let valid: boolean = true;

			while (list.size()) {
				const key = list.pop();
				const flat = flattenUUID(key);
				if (invalidEntries[flat]?.length) {
					valid = false;
					break;
				}
				for (let i = 0; i < suffixes.length; i++) {
					if (invalidEntries[flat + suffixes[i]]?.length) {
						valid = false;
						break;
					}
				}
				if (!pageDefinition.componentDefinition[key].children) continue;
				Object.entries(pageDefinition.componentDefinition[key].children)
					.filter(([, v]: [string, boolean]) => v)
					.forEach(([k]) => list.add(k));
			}

			if (!valid) {
				addMessage(
					MESSAGE_TYPE.ERROR,
					'Some of the fields have validation errors',
					false,
					page,
				);
				return;
			}
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
		if (args) {
			fep.setArguments(args);
		}
		setData(`Store.functionExecutions.${page}.${flattenUUID(key)}.isRunning`, true);
		const x = await runtime.execute(fep);
		setData(`Store.functionExecutions.${page}.${flattenUUID(key)}.isRunning`, false);
		return new Promise(resolve => resolve(x));
	} catch (error: any) {
		setData(`Store.functionExecutions.${page}.${flattenUUID(key)}.isRunning`, false);
		addMessage(MESSAGE_TYPE.ERROR, error, true, page);
		console.error(error);
		return new Promise(resolve => resolve(error));
	}
};
