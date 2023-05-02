import { deepEqual } from '@fincity/kirun-js';
import React, { useEffect, useState } from 'react';
import CommonCheckbox from '../../commonComponents/CommonCheckbox';
import {
	addListenerAndCallImmediately,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
} from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponent';
import { getRenderData } from '../util/getRenderData';
import { getSelectedKeys } from '../util/getSelectedKeys';
import { getTranslations } from '../util/getTranslations';
import { runEvent } from '../util/runEvent';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './radioButtonProperties';
import RadioButtonStyle from './RadioButtonStyle';

function RadioButton(props: ComponentProps) {
	const pageExtractor = PageStoreExtractor.getForContext(props.context.pageName);
	const {
		definition: { bindingPath },
		locationHistory,
		context,
		definition,
		pageDefinition: { translations },
		pageDefinition,
	} = props;
	const {
		key,
		stylePropertiesWithPseudoStates,
		properties: {
			orientation,
			labelKey,
			uniqueKey,
			selectionKey,
			labelKeyType,
			selectionType,
			uniqueKeyType,
			onClick,
			datatype,
			data,
			layout,
			readOnly,
			isMultiSelect,
		} = {},
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);

	const [hover, setHover] = useState('');
	const [focus, setFocus] = useState('');

	const radioButtonData = React.useMemo(
		() =>
			getRenderData(
				data,
				datatype,
				uniqueKeyType,
				uniqueKey,
				selectionType,
				selectionKey,
				labelKeyType,
				labelKey,
			),
		[
			data,
			datatype,
			uniqueKeyType,
			uniqueKey,
			selectionType,
			selectionKey,
			labelKeyType,
			labelKey,
		],
	);

	const [selected, setSelected] = useState<any>();

	const resolvedStyles = processComponentStylePseudoClasses(
		{ hover: false, focus: false, disabled: readOnly },
		stylePropertiesWithPseudoStates,
	);

	const resolvedStylesHover = processComponentStylePseudoClasses(
		{ hover: true, focus: false, disabled: readOnly },
		stylePropertiesWithPseudoStates,
	);

	const resolvedStylesFocus = processComponentStylePseudoClasses(
		{ hover: false, focus: true, disabled: readOnly },
		stylePropertiesWithPseudoStates,
	);

	const clickEvent = onClick ? pageDefinition.eventFunctions[onClick] : undefined;

	const bindingPathPath = bindingPath
		? getPathFromLocation(bindingPath, locationHistory, pageExtractor)
		: undefined;

	useEffect(() => {
		if (!bindingPathPath) return;

		return addListenerAndCallImmediately(
			(_, value) => {
				setSelected(value);
			},
			pageExtractor,
			bindingPathPath,
		);
	}, [bindingPathPath]);

	const handleClick = async (each: { key: any; label: any; value: any } | undefined) => {
		if (!each || !bindingPathPath) return;

		if (!isMultiSelect) {
			setData(
				bindingPathPath,
				deepEqual(each.value, selected) ? undefined : each.value,
				context?.pageName,
			);
		} else {
			const index = (selected ?? []).findIndex((e: any) => deepEqual(e, each.value));
			const newValue = [...(selected ?? [])];
			if (index === -1) newValue.push(each.value);
			else newValue.splice(index, 1);
			setData(bindingPathPath, newValue, context?.pageName);
		}

		if (clickEvent)
			await runEvent(clickEvent, key, context.pageName, locationHistory, pageDefinition);
	};

	const selectedDataKey: Array<any> | string | undefined = React.useMemo(
		() => getSelectedKeys(radioButtonData, selected, isMultiSelect),
		[selected],
	);

	const getIsSelected = (key: any) => {
		if (!isMultiSelect) return deepEqual(selectedDataKey, key);
		if (Array.isArray(selectedDataKey))
			return !!selectedDataKey.find((e: any) => deepEqual(e, key));
		return false;
	};

	return (
		<div className={`comp compRadioButton _${layout}`} style={resolvedStyles.comp ?? {}}>
			<HelperComponent definition={definition} />
			{radioButtonData?.map((e: any) => (
				<label
					className={`radioLabel ${
						orientation === 'VERTICAL' ? 'vertical' : 'horizontal'
					}`}
					key={e.key}
					htmlFor={e.key}
					onMouseEnter={
						stylePropertiesWithPseudoStates?.hover ? () => setHover(e.key) : undefined
					}
					onMouseLeave={
						stylePropertiesWithPseudoStates?.hover ? () => setHover('') : undefined
					}
					style={{
						...((focus === e.key ? resolvedStylesFocus.label : resolvedStyles.label) ??
							{}),
						...((hover === e.key ? resolvedStylesHover.label : resolvedStyles.label) ??
							{}),
					}}
				>
					<CommonCheckbox
						id={e.key}
						isChecked={getIsSelected(e.key)}
						onChange={() => handleClick(e)}
						showAsRadio={!isMultiSelect}
						isReadOnly={readOnly}
						styles={{
							...((focus === e.key
								? resolvedStylesFocus.radio
								: resolvedStyles.radio) ?? {}),
							...((hover === e.key
								? resolvedStylesHover.radio
								: resolvedStyles.radio) ?? {}),
						}}
						focusHandler={
							stylePropertiesWithPseudoStates?.focus
								? () => setFocus(e.key)
								: undefined
						}
						blurHandler={
							stylePropertiesWithPseudoStates?.focus ? () => setFocus('') : undefined
						}
					/>

					{getTranslations(e.label, translations)}
				</label>
			))}
		</div>
	);
}

const component: Component = {
	icon: 'fa-solid fa-circle-dot',
	name: 'RadioButton',
	displayName: 'RadioButton',
	description: 'RadioButton component',
	component: RadioButton,
	styleComponent: RadioButtonStyle,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	stylePseudoStates: ['hover', 'focus', 'disabled'],
	bindingPaths: {
		bindingPath: { name: 'Data Binding' },
	},
	defaultTemplate: {
		key: '',
		type: 'RadioButton',
		name: 'RadioButton',
		properties: {},
		styleProperties: {
			'4c43530094da-f5fd-4b9246-af84-9ebb9d41a49776': {
				resolutions: {
					ALL: {
						width: {
							value: '100%',
						},
						height: {
							value: '50px',
						},
					},
				},
			},
		},
	},
};

export default component;
