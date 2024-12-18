import React, { useEffect } from 'react';
import {
	addListenerAndCallImmediately,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
} from '../../context/StoreContext';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './schemaBuilderProperties';
import SingleSchema from './components/SingleSchema';
import { UISchemaRepository } from '../../schemas/common';
import { isNullValue } from '@fincity/kirun-js';
import { ComponentProps } from '../../types/common';

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
	const { properties: { readOnly, rootSchemaType } = {}, stylePropertiesWithPseudoStates } =
		useDefinition(
			definition,
			propertiesDefinition,
			stylePropertiesDefinition,
			locationHistory,
			pageExtractor,
		);

	const bindingPathPath = bindingPath
		? getPathFromLocation(bindingPath, locationHistory, pageExtractor)
		: undefined;

	const [value, setValue] = React.useState<any>();
	useEffect(() => {
		if (!bindingPathPath) return;
		return addListenerAndCallImmediately((_, v) => setValue(v), pageExtractor, bindingPathPath);
	}, [bindingPathPath]);

	const isReadonly = readOnly || !bindingPathPath;

	const resolvedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);

	return (
		<div className="comp compSchemaBuilder" style={resolvedStyles.comp ?? {}}>
			<HelperComponent context={props.context} definition={definition} />
			<SingleSchema
				schema={value}
				type={rootSchemaType}
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
				schemaRepository={UI_SCHEMA_REPO}
				shouldShowNameNamespace={true}
			/>
		</div>
	);
}
