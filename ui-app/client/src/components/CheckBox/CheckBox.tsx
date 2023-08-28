import React, { useEffect, useState } from 'react';
import CommonCheckbox from '../../commonComponents/CommonCheckbox';
import {
	PageStoreExtractor,
	addListenerAndCallImmediately,
	getPathFromLocation,
	setData,
} from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponent';
import { SubHelperComponent } from '../SubHelperComponent';
import { getTranslations } from '../util/getTranslations';
import { runEvent } from '../util/runEvent';
import useDefinition from '../util/useDefinition';
import CheckBoxStyle from './CheckBoxStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './checkBoxProperties';

function CheckBox(props: ComponentProps) {
	const [checkBoxdata, setCheckBoxData] = useState(false);
	const [hover, setHover] = useState(false);
	const [focus, setFocus] = useState(false);
	const {
		pageDefinition: { translations },
		pageDefinition,
		definition: { bindingPath },
		locationHistory,
		definition,
		context,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const {
		key,
		properties: { label, readOnly, orientation, onClick, designType, colorScheme } = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);

	const clickEvent = onClick ? pageDefinition.eventFunctions[onClick] : undefined;

	const bindingPathPath =
		bindingPath && getPathFromLocation(bindingPath, locationHistory, pageExtractor);

	useEffect(() => {
		if (!bindingPathPath) return;
		return addListenerAndCallImmediately(
			(_, value) => {
				setCheckBoxData(!!value);
			},
			pageExtractor,
			bindingPathPath,
		);
	}, [bindingPath]);
	const resolvedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{ hover, focus, disabled: readOnly },
		stylePropertiesWithPseudoStates,
	);
	const handleChange = async (event: any) => {
		if (bindingPathPath) setData(bindingPathPath, !!event.target.checked, context.pageName);
		if (clickEvent)
			await runEvent(
				pageDefinition.eventFunctions[onClick],
				key,
				context.pageName,
				locationHistory,
				pageDefinition,
			);
	};

	return (
		<div
			className={`comp compCheckbox ${designType} ${colorScheme}`}
			style={resolvedStyles.comp ?? {}}
		>
			<HelperComponent definition={definition} />
			<label
				onMouseEnter={
					stylePropertiesWithPseudoStates?.hover ? () => setHover(true) : undefined
				}
				onMouseLeave={
					stylePropertiesWithPseudoStates?.hover ? () => setHover(false) : undefined
				}
				style={resolvedStyles.label ?? {}}
				className={`checkbox ${orientation === 'VERTICAL' ? 'vertical' : 'horizontal'} ${
					readOnly ? '_disabled' : ''
				}`}
				htmlFor={key}
			>
				<SubHelperComponent definition={props.definition} subComponentName="label" />
				<CommonCheckbox
					isChecked={checkBoxdata}
					isReadOnly={readOnly}
					id={key}
					onChange={handleChange}
					styles={resolvedStyles.checkbox ?? {}}
					focusHandler={
						stylePropertiesWithPseudoStates?.focus ? () => setFocus(true) : undefined
					}
					blurHandler={
						stylePropertiesWithPseudoStates?.focus ? () => setFocus(false) : undefined
					}
					definition={props.definition}
				/>
				{getTranslations(label, translations)}
			</label>
		</div>
	);
}

const component: Component = {
	icon: 'fa-solid fa-square-check',
	name: 'CheckBox',
	displayName: 'CheckBox',
	description: 'CheckBox component',
	styleComponent: CheckBoxStyle,
	component: CheckBox,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	bindingPaths: {
		bindingPath: { name: 'Data Binding' },
	},
	stylePseudoStates: ['hover', 'focus', 'disabled'],
	defaultTemplate: {
		key: '',
		name: 'CheckBox',
		type: 'CheckBox',
		properties: {
			label: { value: 'Checkbox' },
		},
	},
	sections: [{ name: 'Checkbox', pageName: 'checkbox' }],
};

export default component;
