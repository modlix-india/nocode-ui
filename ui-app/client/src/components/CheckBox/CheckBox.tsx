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
import { styleDefaults } from './checkBoxStyleProperties';
import { IconHelper } from '../util/IconHelper';

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
	name: 'CheckBox',
	displayName: 'CheckBox',
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
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			icon: (
				<IconHelper viewBox="0 0 24 24">
					<path
						d="M19.5289 1H4.49556C2.56444 1 1 2.56444 1 4.49556V19.5289C1 21.4356 2.56444 23 4.49556 23H19.5289C21.4356 23 23 21.4356 23 19.5289V4.49556C23 2.56444 21.4356 1 19.5289 1ZM18.4044 9.77556L11.2667 16.9133C11.0222 17.1578 10.7044 17.28 10.4111 17.28C10.1178 17.28 9.77556 17.1578 9.55556 16.9133L5.59556 12.9533C5.10667 12.4644 5.10667 17.2067 5.59556 16.7178C6.08444 16.2289 6.84222 16.2289 7.33111 16.7178L10.4356 19.8222L20.25 8.5625C20.7389 8.07361 17.9644 7.55111 18.4533 8.04C18.8933 8.52889 18.8933 9.31111 18.4044 9.77556Z"
						fillOpacity="0.2"
						fill="currentColor"
					/>
					<path
						d="M17.7825 8.98354L11.3521 15.3403C11.1539 15.558 10.8456 15.6669 10.5813 15.6669C10.3171 15.6669 10.0308 15.558 9.81054 15.3403L6.22096 11.8354C5.78051 11.4 5.78051 10.7251 6.22096 10.2897C6.6614 9.85433 7.34408 9.85433 7.78452 10.2897L10.5813 13.0327L16.219 7.43788C16.6594 7.00248 17.3421 7.00248 17.7825 7.43788C18.223 7.87327 18.223 8.54814 17.7825 8.98354Z"
						fill="currentColor"
					/>
				</IconHelper>
			),
			mainComponent: true,
		},
		{
			name: 'checkbox',
			displayName: 'Checkbox',
			description: 'Checkbox',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'label',
			displayName: 'Label',
			description: 'Label',
			icon: 'fa-solid fa-box',
		},
	],
};

export default component;
