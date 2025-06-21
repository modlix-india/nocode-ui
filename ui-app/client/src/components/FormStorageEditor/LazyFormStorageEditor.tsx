import { useCallback, useEffect, useState } from 'react';
import {
	addListenerAndCallImmediatelyWithChildrenActivity,
	addListenerWithChildrenActivity,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
} from '../../context/StoreContext';
import { ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './formStorageEditorProperties';
import ObjectTypeEditor from './components/ObjectTypeEditor';
import { deepEqual } from '@fincity/kirun-js';
import { runEvent } from '../util/runEvent';

export default function FormStorageEditor(props: Readonly<ComponentProps>) {
	const {
		definition,
		definition: { bindingPath },
		locationHistory,
		context,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);

	const {
		key,
		stylePropertiesWithPseudoStates,
		properties: { readOnly, restrictToSchema, onChange, hideAddFieldButton, detailType } = {},
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

	const resolvedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);

	const resolvedHoverStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{ hover: true },
		stylePropertiesWithPseudoStates,
	);

	const [schema, setSchema] = useState<any>(undefined);

	useEffect(() => {
		if (!bindingPathPath) {
			setSchema(restrictToSchema ?? { type: 'OBJECT' });
			return;
		}

		return addListenerAndCallImmediatelyWithChildrenActivity(
			(_, value) =>
				setSchema((existing: any) => {
					if (existing && deepEqual(existing, value)) return existing;
					return value ?? { type: 'OBJECT' };
				}),
			pageExtractor,
			bindingPathPath,
		);
	}, [bindingPathPath, restrictToSchema]);

	const onChangeOfSchema = (schema: any) => {
		if (!bindingPathPath) return;

		setData(bindingPathPath, schema, pageExtractor.getPageName());

		const clickEvent = onChange ? props.pageDefinition.eventFunctions?.[onChange] : undefined;

		if (!clickEvent) return;
		(async () =>
			await runEvent(
				clickEvent,
				onChange,
				props.context.pageName,
				props.locationHistory,
				props.pageDefinition,
			))();
	};
	return (
		<div className="comp compFormStorageEditor" style={resolvedStyles.comp ?? {}}>
			<HelperComponent key={`${key}_hlp`} definition={definition} context={context} />
			<ObjectTypeEditor
				restrictToSchema={restrictToSchema}
				schema={schema}
				onChange={onChangeOfSchema}
				readOnly={readOnly}
				styles={{ regular: resolvedStyles, hover: resolvedHoverStyles }}
				hideAddFieldButton={hideAddFieldButton}
				path="Object"
				detailType={detailType}
			/>
		</div>
	);
}
