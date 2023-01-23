import React, { useEffect, useState } from 'react';
import {
	addListener,
	getData,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
} from '../../context/StoreContext';
import { HelperComponent } from '../HelperComponent';
import {
	DataLocation,
	ComponentProperty,
	RenderContext,
	ComponentProps,
	ComponentPropertyDefinition,
} from '../../types/common';
import { getTranslations } from '../util/getTranslations';
import { getSelectedKeys } from '../util/getSelectedKeys';
import { propertiesDefinition, stylePropertiesDefinition } from './radioButtonProperties';
import { Component } from '../../types/common';
import useDefinition from '../util/useDefinition';
import { getRenderData } from '../util/getRenderData';
import RadioButtonStyle from './RadioButtonStyles';
import { runEvent } from '../util/runEvent';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';

function RadioButton(props: ComponentProps) {
	const pageExtractor = PageStoreExtractor.getForContext(props.context.pageName);
	const [selected, setSelected] = useState();

	const {
		definition: { bindingPath },
		locationHistory,
		context,
		pageDefinition,
	} = props;

	const {
		key,
		properties: {
			labelKey,
			uniqueKey,
			selectionKey,
			labelKeyType,
			selectionType,
			uniqueKeyType,
			onClick,
			name,
			datatype,
			dataBinding,
			readOnly,
		} = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		props.definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);

	// if (!bindingPath) throw new Error('Definition requires binding path');
	if (!bindingPath) return <>Binding Path Required</>;
	const bindingPathPath = getPathFromLocation(bindingPath, locationHistory, pageExtractor);

	useEffect(() => {
		addListener(
			(_, value) => {
				setSelected(value);
			},
			pageExtractor,
			bindingPathPath,
		);
	}, []);

	const resolvedStyles = processComponentStylePseudoClasses(
		{ disabled: readOnly },
		stylePropertiesWithPseudoStates,
	);

	const radioButtonData: any = getRenderData(
		dataBinding,
		datatype,
		uniqueKeyType,
		uniqueKey,
		selectionType,
		selectionKey,
		labelKeyType,
		labelKey,
	);

	const clickEvent = onClick ? props.pageDefinition.eventFunctions[onClick] : undefined;
	// const selectedDataKey = getSelectedKeys(radioButtonData, selected);

	const handleSelect = async (each: { key: any; label: any; value: any }) => {
		console.log('select ', each);
		setData(bindingPathPath, each.value, context?.pageName);
		if (clickEvent) {
			await runEvent(clickEvent, key, context.pageName);
		}
	};

	return (
		<div className="comp compRadioButton" style={resolvedStyles.comp ?? {}}>
			<HelperComponent definition={props.definition} />
			{radioButtonData?.map((each: any, index: number) => (
				<label className="radiobutton" key={index} style={resolvedStyles.radiobutton ?? {}}>
					<input
						className="radioInput"
						style={resolvedStyles.input ?? {}}
						type="radio"
						name={name}
						value={selected}
						onChange={() => handleSelect(each)}
					/>
					{getTranslations(each?.label, props.pageDefinition.translations)}
				</label>
			))}
		</div>
	);
}

const component: Component = {
	name: 'RadioButton',
	displayName: 'RadioButton',
	description: 'RadioButton component',
	component: RadioButton,
	styleComponent: RadioButtonStyle,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	stylePseudoStates: ['focus', 'hover', 'disabled'],
};

export default component;
