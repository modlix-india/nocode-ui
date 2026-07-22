import {
	FunctionDefinition,
	FunctionExecutionParameters,
	DebugCollector,
	HybridRepository,
	KIRuntime,
	LinkedList,
	TokenValueExtractor,
} from '@fincity/kirun-js';
import { MESSAGE_TYPE, addMessage } from '../../App/Messages/Messages';
import { GLOBAL_CONTEXT_NAME } from '../../constants';
import { ParentExtractorForRunEvent } from '../../context/ParentExtractor';
import {
	PageStoreExtractor,
	UrlDetailsExtractor,
	getDataFromPath,
	localStoreExtractor,
	setData,
	storeExtractor,
	themeExtractor
} from '../../context/StoreContext';
import { REPO_SERVER, RemoteRepository } from '../../Engine/RemoteRepository';
import { UIFunctionRepository } from '../../functions';
import { UISchemaRepository } from '../../schemas/common';
import { LocationHistory, PageDefinition } from '../../types/common';
import PageDefintionFunctionsRepository from './PageDefinitionFunctionsRepository';
import UUID, { flattenUUID } from './uuid';
import { shortUUID } from '../../util/shortUUID';

function addValidationTriggers(
	flatId: string,
	page: string,
	locationHistory: LocationHistory[] | undefined,
): Array<string> {
	const suffixes: Array<string> = [];
	setData(`Store.validationTriggers.${page}.${flatId}`, true, page);
	for (let i = 0; i < (locationHistory?.length ?? 0); i++) {
		suffixes.push((i === 0 ? '' : suffixes[i - 1]) + '_' + locationHistory![i].index);
		setData(`Store.validationTriggers.${page}.${flatId}${suffixes[i]}`, true, page);
	}
	return suffixes;
}

let UI_FUN_REPO: UIFunctionRepository;
let UI_SCHEMA_REPO: UISchemaRepository;

// Cap the number of retained debug contexts so long editing sessions don't leak
// (each execution used to add an entry that pinned a full page definition, forever).
const DEBUG_CONTEXT_MAX = 10;
const debugContextOrder: string[] = [];

// Expose DebugCollector to console for debugging
if (typeof globalThis !== 'undefined') {
	(globalThis as any).DebugCollector = DebugCollector;
}

// Add listener for debug executions to send to PageEditor
// Only add listener if in design mode or debug mode
if (typeof globalThis !== 'undefined' && (globalThis.isDesignMode || globalThis.isDebugMode)) {
	DebugCollector.getInstance().addEventListener((event) => {
		// Only send executionEnd events when in PAGE design mode
		if (event.type === 'executionEnd' && globalThis.designMode === 'PAGE') {
			try {
				const executionLog = DebugCollector.getInstance().getExecution(event.executionId);
				const debugContext = (globalThis as any).debugContext?.[event.executionId];

				if (executionLog) {
					// Send the execution log. The page definition is intentionally NOT
					// included: the editor (master) already holds it, and re-sending +
					// retaining it per execution was the primary memory leak.
					window.parent.postMessage(
						{
							type: 'SLAVE_DEBUG_EXECUTION',
							editorType: 'PAGE',
							screenType: globalThis.screenType,
							payload: {
								executionLog: {
									...executionLog,
									// Convert Map to plain object for serialization
									definitions: executionLog.definitions
										? Object.fromEntries(executionLog.definitions)
										: {},
								},
								executionId: event.executionId,
								screenType: globalThis.screenType,
								locationHistory: debugContext?.locationHistory || [],
							},
						},
						'*',
					);
				} else {
					console.warn('[DEBUG] No execution log found for:', event.executionId);
				}
			} catch (error) {
				console.error('Failed to send debug execution message:', error);
			}
		}
	});
}

export const runEvent = async (
	functionDefinition: any,
	key: string = UUID(),
	page = GLOBAL_CONTEXT_NAME,
	locationHistory: Array<LocationHistory>,
	pageDefinition?: PageDefinition,
	args?: Map<string, any>,
	runSequentially?: boolean,
) => {
	if (!UI_FUN_REPO) UI_FUN_REPO = new UIFunctionRepository();

	if (!UI_SCHEMA_REPO) UI_SCHEMA_REPO = new UISchemaRepository();

	window.lastInteracted = Date.now();
	const isRunningPath = `Store.functionExecutions.${page}.${flattenUUID(key)}.isRunning`;
	try {
		const def: FunctionDefinition = FunctionDefinition.from(functionDefinition);
		const pageExtractor = PageStoreExtractor.getForContext(page);
		const urlExtractor = UrlDetailsExtractor.getForContext(page);
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
				if (invalidEntries?.[flat]?.length) {
					valid = false;
					break;
				}
				for (let i = 0; i < suffixes.length; i++) {
					if (invalidEntries?.[flat + suffixes[i]]?.length) {
						valid = false;
						break;
					}
				}
				if (!pageDefinition.componentDefinition[key]?.children) continue;
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
			[urlExtractor.getPrefix(), urlExtractor],
		]);

		if (locationHistory?.length) {
			const pse = new ParentExtractorForRunEvent(locationHistory, valuesMap);
			valuesMap.set(pse.getPrefix(), pse);
		}

		const eid = `${key}_${shortUUID()}`;
		const functionRepository = new HybridRepository(
				UI_FUN_REPO,
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
			);

		const schemaRepository = new HybridRepository(
				UI_SCHEMA_REPO,
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
			);

		const runtime = new KIRuntime(def, isDesignMode || isDebugMode);
		const fep = new FunctionExecutionParameters(
			functionRepository,
			schemaRepository,
			eid,
		).setValuesMap(valuesMap);
		if (args) {
			fep.setArguments(args);
		}
		
		if (runSequentially) {
			while (getDataFromPath(isRunningPath, locationHistory)) {
				await new Promise(resolve => setTimeout(resolve, 100));
			}
		}

		if (isDebugMode || isDesignMode){
			if (!globalThis.debugContext) globalThis.debugContext = {};
			// In the Page Editor the master already holds the page definition and nothing
			// reads the repositories back out of debugContext, so keep only the lightweight
			// fields there. The standalone ?debug window still needs the full context.
			globalThis.debugContext[eid] =
				globalThis.designMode === 'PAGE'
					? {
						locationHistory,
						tokenValueExtractors: valuesMap,
					}
					: {
						pageDefinition,
						functionRepository,
						schemaRepository,
						locationHistory,
						tokenValueExtractors: valuesMap,
					};
			// Bound the map: drop the oldest entries once we exceed the cap.
			debugContextOrder.push(eid);
			while (debugContextOrder.length > DEBUG_CONTEXT_MAX) {
				const old = debugContextOrder.shift();
				if (old) delete globalThis.debugContext[old];
			}
		}

		setData(isRunningPath, true);
		const x = await runtime.execute(fep);
		setData(isRunningPath, false);
		return Promise.resolve(x);
	} catch (error: any) {
		setData(isRunningPath, false);
		addMessage(MESSAGE_TYPE.ERROR, error, true, page);
		console.error(error);
		return Promise.resolve(error);
	}
};
