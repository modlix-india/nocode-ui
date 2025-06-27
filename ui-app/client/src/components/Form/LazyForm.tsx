import { HybridRepository, Schema } from '@fincity/kirun-js';
import React, { useEffect } from 'react';
import {
	addListenerAndCallImmediately,
	getPathFromLocation,
	PageStoreExtractor,
} from '../../context/StoreContext';
import { UISchemaRepository } from '../../schemas/common';
import { ComponentDefinition, ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './formProperties';
import { RemoteRepository, REPO_SERVER } from '../../Engine/RemoteRepository';
import Children from '../Children';

let UI_SCHEMA_REPO: UISchemaRepository;

export default function Form(props: Readonly<ComponentProps>) {
	if (!UI_SCHEMA_REPO) UI_SCHEMA_REPO = new UISchemaRepository();

	const {
		definition,
		definition: { bindingPath },
		locationHistory,
		context,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const {
		properties: { schema, onChange, readOnly, useServerSchemas } = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);

	const bindingPathPath =
		bindingPath && !readOnly
			? getPathFromLocation(bindingPath, locationHistory, pageExtractor)
			: undefined;

	const [value, setValue] = React.useState<any>(null);
	useEffect(() => {
		if (!bindingPathPath) return;
		return addListenerAndCallImmediately((_, v) => setValue(v), pageExtractor, bindingPathPath);
	}, [bindingPathPath]);

	const resolvedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);

	const list = [
		UI_SCHEMA_REPO,
		RemoteRepository.getRemoteSchemaRepository(undefined, undefined, false, REPO_SERVER.UI),
	];

	if (useServerSchemas) {
		list.splice(
			1,
			0,
			RemoteRepository.getRemoteSchemaRepository(
				undefined,
				undefined,
				false,
				REPO_SERVER.CORE,
			),
		);
	}

	const schemaRepository = new HybridRepository(...list);

	const childDef: ComponentDefinition = {
		name: 'Test',
		key: 'Test',
		type: 'TextBox',
		bindingPath: { type: 'VALUE', value: 'Page.test' },
		properties: {
			label: { value: 'Test' },
		},
	};

	return (
		<div className="comp compForm" style={resolvedStyles.comp ?? {}}>
			<HelperComponent context={props.context} definition={definition} />
			<Children
				pageDefinition={{
					...props.pageDefinition,
					componentDefinition: {
						...props.pageDefinition.componentDefinition,
						Test: childDef,
					},
				}}
				renderableChildren={{ Test: true }}
				context={props.context}
				locationHistory={locationHistory}
			/>
		</div>
	);
}
