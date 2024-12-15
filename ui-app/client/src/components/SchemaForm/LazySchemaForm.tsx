import { deepEqual, duplicate, Repository, Schema } from '@fincity/kirun-js';
import { setStoreData, StoreExtractor } from '@fincity/path-reactive-state-management';
import React, { useEffect } from 'react';
import {
	addListenerAndCallImmediately,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
} from '../../context/StoreContext';
import { UISchemaRepository } from '../../schemas/common';
import { ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { AnyValueEditor } from '../PageEditor/editors/propertyValueEditors/AnyValueEditor';
import useDefinition from '../util/useDefinition';
import SingleSchema from './components/SingleSchemaForm';
import { propertiesDefinition, stylePropertiesDefinition } from './schemaFormProperties';

export default function SchemaForm(
	props: ComponentProps & {
		schema?: Schema;
		schemaRepository?: Repository<Schema>;
		onChange?: (value: any) => void;
		value?: any;
	},
) {
	const {
		definition,
		definition: { bindingPath },
		locationHistory,
		context,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const {
		key,
		properties: { schema: jsonSchema, design, readOnly, showJSONEditorButton } = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);

	const bindingPathPath = bindingPath
		? getPathFromLocation(bindingPath, locationHistory, pageExtractor)
		: undefined;

	const [value, setValue] = React.useState<any>(null);
	useEffect(() => {
		if (!bindingPathPath) {
			setValue(props.value);
			return;
		}
		return addListenerAndCallImmediately((_, v) => setValue(v), pageExtractor, bindingPathPath);
	}, [bindingPathPath, props.value]);

	const isReadonly = readOnly || (!bindingPathPath && !props.onChange);

	const schema = React.useMemo(() => props.schema ?? Schema.from(jsonSchema), [jsonSchema]);

	const resolvedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);
	const schemaRepository = props.schemaRepository ?? UISchemaRepository;

	return (
		<div className="comp compSchemaForm" style={resolvedStyles.comp ?? {}}>
			<HelperComponent context={props.context} definition={definition} />
			{showJSONEditorButton && (
				<AnyValueEditor
					value={value === undefined ? null : value}
					onChange={v => {
						if (isReadonly || deepEqual(v, value)) return;
						if (bindingPathPath)
							setData(bindingPathPath, v, pageExtractor.getPageName());
						else if (props.onChange) props.onChange(v);
					}}
					isIconButton={true}
				/>
			)}
			<SingleSchema
				schema={schema}
				path=""
				value={value}
				schemaRepository={schemaRepository}
				onChange={(path, v) => {
					const internal = { value: duplicate(value) };

					const map = new Map([['Internal.', new StoreExtractor(internal, 'Internal.')]]);

					setStoreData(
						'Internal.value' + (path ? '.' + path : ''),
						internal,
						v,
						'Internal',
						map,
					);

					if (bindingPathPath) {
						setData(bindingPathPath, internal.value, pageExtractor.getPageName());
					}
					props.onChange?.(internal.value);
				}}
			/>
		</div>
	);
}
