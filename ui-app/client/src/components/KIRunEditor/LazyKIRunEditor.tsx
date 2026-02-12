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
import { savePersonalizationCurry } from './utils';

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
	},
) {
	const {
		definition: { bindingPath, bindingPath2 },
		definition,
		context,
		locationHistory,
		functionRepository: actualFunctionRepository,
		schemaRepository: actualSchemaRepository,
		tokenValueExtractors = new Map(),
		storePaths = new Set(),
		pageDefinition,
		debugViewMode = false,
		executionLog,
		functionDefinition,
		onChangePersonalizationFunction,
	} = props;

	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const urlExtractor = UrlDetailsExtractor.getForContext(context.pageName);
	const {
		stylePropertiesWithPseudoStates,
		properties: { readOnly, editorType, onChangePersonalization, clientCode, appCode } = {},
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
			const hereDef = correctStatementNames(functionDefinition);
			setRawDef(hereDef);

			const finName = `${hereDef?.namespace ?? '_'}.${hereDef?.name}`;
			if (name !== finName) setName(finName);
		}
		if (!bindingPathPath) return;
		return addListenerAndCallImmediatelyWithChildrenActivity(
			pageExtractor.getPageName(),
			(_, v) => {
				const hereDef = correctStatementNames(v);
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

	// Handle personalization changes — delegate to savePersonalizationCurry
	const handlePersonalizationChange = useCallback(
		(data: PersonalizationData) => {
			if (!savePersonalization) return;
			for (const [pKey, value] of Object.entries(data)) {
				savePersonalization(pKey, value);
			}
		},
		[savePersonalization],
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
				stores={props.stores}
				storePaths={storePaths}
				hideArguments={props.hideArguments}
				debugViewMode={debugViewMode}
				executionLog={executionLog}
				personalization={preference}
				onPersonalizationChange={handlePersonalizationChange}
			/>
		</div>
	);
}
