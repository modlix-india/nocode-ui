import {
	ExecutionLog,
	Function,
	FunctionDefinition,
	HybridRepository,
	Repository,
	Schema,
	TokenValueExtractor,
} from '@fincity/kirun-js';
import { KIRunEditor, PersonalizationData, correctStatementNames } from '@fincity/kirun-ui';
import { registerUIEngineFunctionDocs } from '../../functions';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { usedComponents } from '../../App/usedComponents';
import { RemoteRepository, REPO_SERVER } from '../../Engine/RemoteRepository';
import {
	addListenerAndCallImmediatelyWithChildrenActivity,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
	UrlDetailsExtractor,
} from '../../context/StoreContext';
import { UIFunctionRepository } from '../../functions';
import { UISchemaRepository } from '../../schemas/common';
import { ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './KIRunEditorProperties';
import {
	normalizeParameterTypes,
	PAGE_STORES,
	savePersonalizationCurry,
	withDefaultPreferences,
} from './utils';

// The documentation registry is read by kirun-ui's own help panel, which
// only exists inside this editor. Kicking it off here rather than from
// functions/index.ts is what keeps `@fincity/kirun-ui` -- and the whole of
// monaco-editor that it imports on its first line -- off every page that
// never opens an editor. This module is only reached through React.lazy,
// and it already imports kirun-ui statically, so the call adds nothing.
registerUIEngineFunctionDocs();

let UI_FUN_REPO: Repository<Function>;
let UI_SCHEMA_REPO: Repository<Schema>;

export default function LazyKIRunEditor(
	props: ComponentProps & {
		functionRepository?: Repository<Function>;
		schemaRepository?: Repository<Schema>;
		tokenValueExtractors?: Map<string, TokenValueExtractor>;
		stores?: Array<string>;
		storePaths?: Set<string>;
		hideArguments?: boolean;
		functionKey?: string;
		// Debug mode props
		debugViewMode?: boolean;
		executionLog?: ExecutionLog;
		functionDefinition?: FunctionDefinition;
		onChangePersonalizationFunction?: () => void;
		// Theme overrides for editors rendered directly from code; pages use the properties
		defaultTheme?: string;
		showThemeSelector?: boolean;
	},
) {
	const {
		definition: { bindingPath, bindingPath2, bindingPath3 },
		definition,
		context,
		locationHistory,
		functionRepository: actualFunctionRepository,
		schemaRepository: actualSchemaRepository,
		tokenValueExtractors = new Map(),
		storePaths = new Set(),
		pageDefinition,
		debugViewMode: debugViewModeProp,
		executionLog: executionLogProp,
		functionDefinition,
		onChangePersonalizationFunction,
	} = props;

	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const urlExtractor = UrlDetailsExtractor.getForContext(context.pageName);
	const {
		stylePropertiesWithPseudoStates,
		properties: {
			readOnly,
			editorType,
			onChangePersonalization,
			clientCode,
			appCode,
			defaultTheme,
			showThemeSelector,
			showExpressions,
			showStores,
			allowLightbox,
			debugViewMode: debugViewModeProperty,
		} = {},
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
		urlExtractor,
	);

	const bindingPathPath = bindingPath
		? getPathFromLocation(bindingPath!, locationHistory, pageExtractor)
		: undefined;

	// A run's trace from the store (Execution Log binding): either kirun-js's ExecutionLog or the
	// bare array of log entries that UIEngine.RunKIRun returns as `log`.
	const executionLogPath = bindingPath3
		? getPathFromLocation(bindingPath3, locationHistory, pageExtractor)
		: undefined;
	const [boundLog, setBoundLog] = useState<any>();
	useEffect(() => {
		if (!executionLogPath) return;
		return addListenerAndCallImmediatelyWithChildrenActivity(
			pageExtractor.getPageName(),
			(_, v) => setBoundLog(v),
			executionLogPath,
		);
	}, [executionLogPath, pageExtractor]);
	const executionLog = useMemo<ExecutionLog | undefined>(() => {
		if (executionLogProp) return executionLogProp;
		if (!boundLog) return undefined;
		const logs = Array.isArray(boundLog) ? boundLog : boundLog.logs;
		if (!Array.isArray(logs)) return undefined;
		return {
			executionId: boundLog.executionId ?? 'bound',
			startTime: boundLog.startTime ?? 0,
			errored: !!boundLog.errored,
			logs,
			definitions: new Map(),
		};
	}, [executionLogProp, boundLog]);
	const debugViewMode = debugViewModeProp ?? !!debugViewModeProperty;

	const isReadonly = readOnly || !bindingPathPath || debugViewMode;

	// Getting function definition from store or prop
	const [rawDef, setRawDef] = useState<any>();
	const [name, setName] = useState<string>();

	if (!UI_FUN_REPO) UI_FUN_REPO = new UIFunctionRepository();
	if (!UI_SCHEMA_REPO) UI_SCHEMA_REPO = new UISchemaRepository();

	const functionRepository: Repository<Function> = useMemo(() => {
		if (actualFunctionRepository) return actualFunctionRepository;

		if (editorType === 'ui') {
			return new HybridRepository<Function>(
				UI_FUN_REPO,
				RemoteRepository.getRemoteFunctionRepository(
					appCode,
					clientCode,
					false,
					REPO_SERVER.UI,
				),
				RemoteRepository.getRemoteFunctionRepository(
					appCode,
					clientCode,
					false,
					REPO_SERVER.CORE,
				),
			);
		} else if (editorType === 'core') {
			return RemoteRepository.getRemoteFunctionRepository(
				appCode,
				clientCode,
				true,
				REPO_SERVER.CORE,
			);
		}

		return UI_FUN_REPO;
	}, [actualFunctionRepository, appCode, clientCode, editorType]);

	const schemaRepository: Repository<Schema> = useMemo(() => {
		if (actualSchemaRepository) return actualSchemaRepository;

		if (editorType === 'ui') {
			return new HybridRepository<Schema>(
				UI_SCHEMA_REPO,
				RemoteRepository.getRemoteSchemaRepository(
					appCode,
					clientCode,
					false,
					REPO_SERVER.UI,
				),
				RemoteRepository.getRemoteSchemaRepository(
					appCode,
					clientCode,
					false,
					REPO_SERVER.CORE,
				),
			);
		} else if (editorType === 'core') {
			return RemoteRepository.getRemoteSchemaRepository(
				appCode,
				clientCode,
				true,
				REPO_SERVER.CORE,
			);
		}
		return UI_SCHEMA_REPO;
	}, [actualSchemaRepository, appCode, clientCode, editorType]);

	useEffect(() => usedComponents.using('PageEditor'), []);

	// Subscribe to function definition from store, or use prop override
	useEffect(() => {
		if (functionDefinition) {
			const hereDef = correctStatementNames(normalizeParameterTypes(functionDefinition));
			setRawDef(hereDef);

			const finName = `${hereDef?.namespace ?? '_'}.${hereDef?.name}`;
			if (name !== finName) setName(finName);
		}
		if (!bindingPathPath) return;
		return addListenerAndCallImmediatelyWithChildrenActivity(
			pageExtractor.getPageName(),
			(_, v) => {
				const hereDef = correctStatementNames(normalizeParameterTypes(v));
				setRawDef(hereDef);
				const finName = `${hereDef?.namespace ?? '_'}.${hereDef?.name}`;
				if (name !== finName) setName(finName);
			},
			bindingPathPath,
		);
	}, [bindingPathPath, pageExtractor, name, functionDefinition]);

	// Subscribe to personalization preferences
	const personalizationPath = bindingPath2
		? getPathFromLocation(bindingPath2!, locationHistory, pageExtractor)
		: undefined;
	const [preference, setPreference] = useState<any>({});
	useEffect(() => {
		if (!personalizationPath) return;
		return addListenerAndCallImmediatelyWithChildrenActivity(
			pageExtractor.getPageName(),
			(_, v) => setPreference({ ...(v ?? {}) }),
			personalizationPath,
		);
	}, [personalizationPath, setPreference, pageExtractor]);

	// Build personalization save function
	const savePersonalization = useMemo(() => {
		if (!personalizationPath) return () => {};

		return savePersonalizationCurry(
			personalizationPath,
			context.pageName,
			onChangePersonalizationFunction ??
				pageDefinition.eventFunctions?.[onChangePersonalization],
			locationHistory,
			pageDefinition,
		);
	}, [
		preference,
		personalizationPath,
		context,
		onChangePersonalization,
		locationHistory,
		pageDefinition,
		onChangePersonalizationFunction,
	]);

	// Handle function definition changes — write back to store
	const handleChange = useCallback(
		(def: any) => {
			if (!bindingPathPath) return;
			setData(bindingPathPath, def, context.pageName);
		},
		[bindingPathPath, context.pageName],
	);

	// Handle personalization changes — delegate to savePersonalizationCurry. With no Personalization
	// binding the choices live in this component only, so the toggles still work.
	const handlePersonalizationChange = useCallback(
		(data: PersonalizationData) => {
			if (!personalizationPath) {
				setPreference({ ...data });
				return;
			}
			for (const [pKey, value] of Object.entries(data)) {
				savePersonalization(pKey, value);
			}
		},
		[savePersonalization, personalizationPath],
	);

	const effectivePreference = useMemo(
		() => withDefaultPreferences(preference, { showExpressions, showStores }),
		[preference, showExpressions, showStores],
	);

	const resolvedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);

	return (
		<div
			className={`comp compKIRunEditor ${!props.functionKey ? 'compPageEditor' : ''} ${debugViewMode ? '_debugView' : ''}`}
			style={{
				...(resolvedStyles?.comp ?? {}),
				display: 'flex',
				flexDirection: 'column',
				height: '100%',
				overflow: 'hidden',
			}}
		>
			<HelperComponent context={props.context} definition={definition} />
			<KIRunEditor
				functionDefinition={rawDef}
				onChange={handleChange}
				functionRepository={functionRepository}
				schemaRepository={schemaRepository}
				tokenValueExtractors={tokenValueExtractors}
				readOnly={isReadonly}
				functionKey={props.functionKey}
				stores={props.stores ?? (editorType === 'core' ? undefined : PAGE_STORES)}
				storePaths={storePaths}
				hideArguments={props.hideArguments}
				debugViewMode={debugViewMode}
				executionLog={executionLog}
				personalization={effectivePreference}
				onPersonalizationChange={handlePersonalizationChange}
				defaultTheme={props.defaultTheme ?? defaultTheme}
				showThemeSelector={props.showThemeSelector ?? showThemeSelector}
				allowLightbox={!!allowLightbox}
			/>
		</div>
	);
}
