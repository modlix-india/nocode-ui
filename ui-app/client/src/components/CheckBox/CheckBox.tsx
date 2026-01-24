import React, { useEffect, useState } from 'react';
import CommonCheckbox from '../../commonComponents/CommonCheckbox';
import {
	PageStoreExtractor,
	addListenerAndCallImmediately,
	getPathFromLocation,
	setData,
	UrlDetailsExtractor,
} from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { SubHelperComponent } from '../HelperComponents/SubHelperComponent';
import { getTranslations } from '../util/getTranslations';
import { runEvent } from '../util/runEvent';
import useDefinition from '../util/useDefinition';
import CheckBoxStyle from './CheckBoxStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './checkBoxProperties';
import { styleProperties, styleDefaults, stylePropertiesForTheme } from './checkBoxStyleProperties';
import { IconHelper } from '../util/IconHelper';
import { findPropertyDefinitions } from '../util/lazyStylePropertyUtil';

function CheckBox(props: Readonly<ComponentProps>) {
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
	const urlExtractor = UrlDetailsExtractor.getForContext(context.pageName);
	const {
		key,
		properties: {
			label,
			readOnly,
			orientation,
			onClick,
			designType,
			colorScheme,
			hideLabel,
		} = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
		urlExtractor,
	);

	const clickEvent = onClick ? pageDefinition.eventFunctions[onClick] : undefined;

	const bindingPathPath =
		bindingPath && getPathFromLocation(bindingPath, locationHistory, pageExtractor);

	useEffect(() => {
		if (!bindingPathPath) return;
		return addListenerAndCallImmediately(
			props.context.pageName,
			(_, value) => {
				setCheckBoxData(!!value);
			},
			bindingPathPath,
		);
	}, [bindingPath]);
	const resolvedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{ hover, focus, disabled: readOnly },
		stylePropertiesWithPseudoStates,
	);
	const handleChange = async (value: boolean) => {
		if (readOnly || !bindingPathPath) return;
		if (bindingPathPath) setData(bindingPathPath, value, context.pageName);
		if (clickEvent)
			await runEvent(
				pageDefinition.eventFunctions[onClick],
				key,
				context.pageName,
				locationHistory,
				pageDefinition,
			);
	};

	const labelText = getTranslations(label, translations);

	return (
		<div
			className={`comp compCheckbox ${designType} ${colorScheme}`}
			style={resolvedStyles.comp ?? {}}
			title={labelText}
		>
			<HelperComponent context={props.context} definition={definition} />

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
				onClick={() => handleChange(!checkBoxdata)}
			>
				<SubHelperComponent definition={props.definition} subComponentName="label" />
				<CommonCheckbox
					isChecked={checkBoxdata}
					isReadOnly={readOnly}
					id={key}
					onChange={handleChange}
					styles={resolvedStyles.checkbox ?? {}}
					thumbStyles={resolvedStyles.thumb ?? {}}
					focusHandler={
						stylePropertiesWithPseudoStates?.focus ? () => setFocus(true) : undefined
					}
					blurHandler={
						stylePropertiesWithPseudoStates?.focus ? () => setFocus(false) : undefined
					}
					definition={props.definition}
				/>
				{hideLabel ? undefined : labelText}
			</label>
		</div>
	);
}

const { designType, colorScheme } = findPropertyDefinitions(
	propertiesDefinition,
	'designType',
	'colorScheme',
);

const component: Component = {
	order: 8,
	name: 'CheckBox',
	displayName: 'Check Box',
	description: 'CheckBox component',
	styleComponent: CheckBoxStyle,
	styleDefaults: styleDefaults,
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
		stylePropertiesForTheme: stylePropertiesForTheme,
	propertiesForTheme: [designType, colorScheme],
};

export default component;
