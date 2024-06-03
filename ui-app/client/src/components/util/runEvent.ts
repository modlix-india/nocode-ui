import {
	FunctionDefinition,
	FunctionExecutionParameters,
	HybridRepository,
	KIRuntime,
	LinkedList,
	ParameterReferenceType,
	TokenValueExtractor,
} from '@fincity/kirun-js';
import { MESSAGE_TYPE, addMessage } from '../../App/Messages/Messages';
import { GLOBAL_CONTEXT_NAME } from '../../constants';
import { ParentExtractorForRunEvent } from '../../context/ParentExtractor';
import {
	PageStoreExtractor,
	getDataFromLocation,
	getDataFromPath,
	localStoreExtractor,
	setData,
	storeExtractor,
	themeExtractor,
} from '../../context/StoreContext';
import { UIFunctionRepository } from '../../functions';
import { UISchemaRepository } from '../../schemas/common';
import { LocationHistory, PageDefinition } from '../../types/common';
import PageDefintionFunctionsRepository from './PageDefinitionFunctionsRepository';
import UUID, { flattenUUID } from './uuid';
import { REPO_SERVER, RemoteRepository } from '../../Engine/RemoteRepository';

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
	window.lastInteracted = Date.now();
	const isRunningPath = `Store.functionExecutions.${page}.${flattenUUID(key)}.isRunning`;
	try {
		const def: FunctionDefinition = FunctionDefinition.from(functionDefinition);
		const pageExtractor = PageStoreExtractor.getForContext(page);
		// if (locationHistory?.length)
		// 	updateExpressionsWithLocationHistory(def, locationHistory, pageExtractor);

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
				Object.entries(pageDefinition.componentDefinition[key].children ?? {})
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

		const valuesMap = new Map<string, TokenValueExtractor>([
			[storeExtractor.getPrefix(), storeExtractor],
			[localStoreExtractor.getPrefix(), localStoreExtractor],
			[pageExtractor.getPrefix(), pageExtractor],
			[themeExtractor.getPrefix(), themeExtractor],
		]);

		if (locationHistory?.length) {
			const pse = new ParentExtractorForRunEvent(locationHistory, valuesMap);
			valuesMap.set(pse.getPrefix(), pse);
		}

		const runtime = new KIRuntime(def, isDesignMode || isDebugMode);
		const fep = new FunctionExecutionParameters(
			new HybridRepository(
				UIFunctionRepository,
				new PageDefintionFunctionsRepository(pageDefinition),
				RemoteRepository.getRemoteFunctionRepository(
					undefined,
					undefined,
					false,
					REPO_SERVER.CORE,
				),
				RemoteRepository.getRemoteFunctionRepository(
					undefined,
					undefined,
					false,
					REPO_SERVER.UI,
				),
			),
			new HybridRepository(
				UISchemaRepository,
				RemoteRepository.getRemoteSchemaRepository(
					undefined,
					undefined,
					false,
					REPO_SERVER.CORE,
				),
				RemoteRepository.getRemoteSchemaRepository(
					undefined,
					undefined,
					false,
					REPO_SERVER.UI,
				),
			),
			key,
		).setValuesMap(valuesMap);
		if (args) {
			fep.setArguments(args);
		}

		setData(isRunningPath, true);
		const x = await runtime.execute(fep);
		setData(isRunningPath, false);
		return new Promise(resolve => resolve(x));
	} catch (error: any) {
		setData(isRunningPath, false);
		addMessage(MESSAGE_TYPE.ERROR, error, true, page);
		console.error(error);
		return new Promise(resolve => resolve(error));
	}
};
