import { useCallback, useEffect, useState } from 'react';
import {
	addListenerAndCallImmediatelyWithChildrenActivity,
	addListenerWithChildrenActivity,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
	UrlDetailsExtractor,
} from '../../context/StoreContext';
import { ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './formEditorProperties';
import ObjectTypeEditor from './components/ObjectTypeEditor';
import { deepEqual } from '@fincity/kirun-js';
import { runEvent } from '../util/runEvent';

export default function FormEditor(props: Readonly<ComponentProps>) {
	const {
		definition,
		definition: { bindingPath },
		locationHistory,
		context,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const urlExtractor = UrlDetailsExtractor.getForContext(context.pageName);

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
		urlExtractor,
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
			pageExtractor.getPageName(),
			(_, value) =>
				setSchema((existing: any) => {
					if (existing && deepEqual(existing, value)) return existing;
					return value ?? restrictToSchema ?? { type: 'OBJECT' };
				}),
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
		<div className="comp compFormEditor" style={resolvedStyles.comp ?? {}}>
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
