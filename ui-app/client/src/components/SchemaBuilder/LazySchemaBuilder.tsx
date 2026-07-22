import { HybridRepository, isNullValue, Repository, Schema } from '@fincity/kirun-js';
import React, { useEffect, useMemo } from 'react';
import { RemoteRepository, REPO_SERVER } from '../../Engine/RemoteRepository';
import {
	addListenerAndCallImmediately,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
	UrlDetailsExtractor,
} from '../../context/StoreContext';
import { UISchemaRepository } from '../../schemas/common';
import { ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import useDefinition from '../util/useDefinition';
import SchemaEditor from './editor/SchemaEditor';
import { propertiesDefinition, stylePropertiesDefinition } from './schemaBuilderProperties';

let UI_SCHEMA_REPO: UISchemaRepository;

export default function SchemaBuilder(props: Readonly<ComponentProps>) {
	if (!UI_SCHEMA_REPO) UI_SCHEMA_REPO = new UISchemaRepository();

	const {
		definition,
		definition: { bindingPath },
		locationHistory,
		context,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const urlExtractor = UrlDetailsExtractor.getForContext(context.pageName);
	const {
		properties: { readOnly, rootSchemaType, defaultView, appCode, clientCode } = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
		urlExtractor,
	);

	const bindingPathPath = bindingPath
		? getPathFromLocation(bindingPath, locationHistory, pageExtractor)
		: undefined;

	const [value, setValue] = React.useState<any>();
	useEffect(() => {
		if (!bindingPathPath) return;
		return addListenerAndCallImmediately(
			pageExtractor.getPageName(),
			(_, v) => setValue(v),
			bindingPathPath,
		);
	}, [bindingPathPath]);

	const isReadonly = readOnly || !bindingPathPath;

	const schemaRepository: Repository<Schema> = useMemo(() => {
		if (!appCode || !clientCode) return UI_SCHEMA_REPO;
		return new HybridRepository<Schema>(
			UI_SCHEMA_REPO,
			RemoteRepository.getRemoteSchemaRepository(appCode, clientCode, false, REPO_SERVER.UI),
			RemoteRepository.getRemoteSchemaRepository(
				appCode,
				clientCode,
				false,
				REPO_SERVER.CORE,
			),
		);
	}, [appCode, clientCode]);

	const resolvedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);

	return (
		<div className="comp compSchemaBuilder" style={resolvedStyles.comp ?? {}}>
			<HelperComponent context={props.context} definition={definition} />
			<SchemaEditor
				value={value}
				readOnly={isReadonly}
				defaultMode={defaultView}
				rootType={rootSchemaType}
				onChange={v => {
					if (isReadonly) return;
					if (rootSchemaType) {
						v.type = rootSchemaType;
					}
					if (isNullValue(v.version)) {
						v.version = 1;
					}
					setData(bindingPathPath!, v, pageExtractor.getPageName());
				}}
				schemaRepository={schemaRepository}
				showNameNamespace={true}
			/>
		</div>
	);
}
