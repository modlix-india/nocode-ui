import { Repository, Schema } from '@fincity/kirun-js';
import React from 'react';
import { getPathFromLocation, PageStoreExtractor } from '../../context/StoreContext';
import { UISchemaRepository } from '../../schemas/common';
import { ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './schemaForm2Properties';
import generateChildren from './components/generateChildren';
import Children from '../Children';

let UI_SCHEMA_REPO: UISchemaRepository;

export default function SchemaForm2(
	props: ComponentProps & {
		schema?: Schema;
		schemaRepository?: Repository<Schema>;
		onChange?: (value: any) => void;
		value?: any;
	},
) {
	if (!UI_SCHEMA_REPO) UI_SCHEMA_REPO = new UISchemaRepository();

	const {
		definition,
		definition: { bindingPath },
		locationHistory,
		context,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const { properties: { schema: jsonSchema } = {}, stylePropertiesWithPseudoStates } =
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

	const schema = React.useMemo(() => props.schema ?? Schema.from(jsonSchema), [jsonSchema]);

	const resolvedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);

	const schemaRepository = props.schemaRepository ?? UI_SCHEMA_REPO;

	const { children, pageDef } = generateChildren({
		schema,
		schemaRepository,
		bindingPathPath,
	});

	return (
		<div className="comp compSchemaForm2" style={resolvedStyles.comp ?? {}}>
			<HelperComponent context={props.context} definition={definition} />
			<Children
				pageDefinition={pageDef}
				renderableChildren={children}
				context={context}
				locationHistory={locationHistory}
			/>
		</div>
	);
}
