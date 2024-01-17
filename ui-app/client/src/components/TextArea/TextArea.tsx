import { isNullValue } from '@fincity/kirun-js';
import React, { useCallback, useEffect, useState } from 'react';
import { STORE_PATH_FUNCTION_EXECUTION } from '../../constants';
import {
	PageStoreExtractor,
	addListener,
	addListenerAndCallImmediately,
	getDataFromPath,
	getPathFromLocation,
	setData,
} from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { validate } from '../../util/validationProcessor';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { getTranslations } from '../util/getTranslations';
import { runEvent } from '../util/runEvent';
import useDefinition from '../util/useDefinition';
import { flattenUUID } from '../util/uuid';
import TextAreaStyle from './TextAreaStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './textAreaProperties';
import { SubHelperComponent } from '../HelperComponents/SubHelperComponent';
import CommonInputText from '../../commonComponents/CommonInputText';
import { styleDefaults } from './textAreaStyleProperties';
import { IconHelper } from '../util/IconHelper';

interface mapType {
	[key: string]: any;
}

function TextArea(props: ComponentProps) {
	const [focus, setFocus] = React.useState(false);
	const [validationMessages, setValidationMessages] = React.useState<Array<string>>([]);
	const [isDirty, setIsDirty] = React.useState(false);
	const mapValue: mapType = {
		UNDEFINED: undefined,
		NULL: null,
		ENMPTYSTRING: '',
		ZERO: 0,
	};
	const {
		definition: { bindingPath },
		definition,
		pageDefinition: { translations },
		locationHistory,
		context,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const {
		properties: {
			updateStoreImmediately: upStoreImm,
			removeKeyWhenEmpty,
			emptyValue,
			supportingText,
			readOnly,
			defaultValue,
			label,
			noFloat,
			onChange,
			validation,
			placeholder,
			messageDisplay,
			autoComplete,
			onClear,
			autoFocus,
			designType,
			colorScheme,
			onFocus,
			onBlur,
		} = {},
		stylePropertiesWithPseudoStates,
		key,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);
	const computedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{ focus, readOnly },
		stylePropertiesWithPseudoStates,
	);
	const [value, setValue] = React.useState(defaultValue ?? '');

	const bindingPathPath = bindingPath
		? getPathFromLocation(bindingPath, locationHistory, pageExtractor)
		: undefined;

	React.useEffect(() => {
		if (!bindingPathPath) return;
		return addListenerAndCallImmediately(
			(_, value) => {
				if (isNullValue(value)) {
					setValue('');
					return;
				}
				setValue(value);
			},
			pageExtractor,
			bindingPathPath,
		);
	}, [bindingPathPath]);

	// const spinnerPath1 = onChange
	// 	? `${STORE_PATH_FUNCTION_EXECUTION}.${props.context.pageName}.${flattenUUID(
	// 			onChange,
	// 	  )}.isRunning`
	// 	: undefined;

	// const spinnerPath2 = onClear
	// 	? `${STORE_PATH_FUNCTION_EXECUTION}.${props.context.pageName}.${flattenUUID(
	// 			onClear,
	// 	  )}.isRunning`
	// 	: undefined;

	// const [isLoading, setIsLoading] = useState(
	// 	(getDataFromPath(spinnerPath1, props.locationHistory, pageExtractor) ||
	// 		getDataFromPath(spinnerPath2, props.locationHistory, pageExtractor)) ??
	// 		false,
	// );

	// useEffect(() => {
	// 	let paths = [];
	// 	if (spinnerPath1) paths.push(spinnerPath1);
	// 	if (spinnerPath2) paths.push(spinnerPath2);

	// 	if (!paths.length) return;
	// 	return addListener((_, value) => setIsLoading(value), pageExtractor, ...paths);
	// }, []);

	useEffect(() => {
		if (!validation?.length) return;

		const msgs = validate(
			props.definition,
			props.pageDefinition,
			validation,
			value,
			locationHistory,
			pageExtractor,
		);
		setValidationMessages(msgs);

		setData(
			`Store.validations.${context.pageName}.${flattenUUID(definition.key)}`,
			msgs.length ? msgs : undefined,
			context.pageName,
			true,
		);
		return () =>
			setData(
				`Store.validations.${context.pageName}.${flattenUUID(definition.key)}`,
				undefined,
				context.pageName,
				true,
			);
	}, [value, validation]);

	const updateStoreImmediately = upStoreImm || autoComplete === 'on';

	const changeEvent = onChange ? props.pageDefinition.eventFunctions?.[onChange] : undefined;
	const blurEvent = onBlur ? props.pageDefinition.eventFunctions?.[onBlur] : undefined;
	const focusEvent = onFocus ? props.pageDefinition.eventFunctions?.[onFocus] : undefined;

	const callChangeEvent = useCallback(() => {
		if (!changeEvent) return;
		(async () =>
			await runEvent(
				changeEvent,
				onChange,
				props.context.pageName,
				props.locationHistory,
				props.pageDefinition,
			))();
	}, [changeEvent]);

	const callBlurEvent = useCallback(() => {
		if (!blurEvent) return;
		(async () =>
			await runEvent(
				blurEvent,
				onBlur,
				props.context.pageName,
				props.locationHistory,
				props.pageDefinition,
			))();
	}, [blurEvent]);

	const callFocusEvent = useCallback(() => {
		if (!focusEvent) return;
		(async () =>
			await runEvent(
				focusEvent,
				onFocus,
				props.context.pageName,
				props.locationHistory,
				props.pageDefinition,
			))();
	}, [focusEvent]);

	const handleClickClose = async () => {
		let temp = mapValue[emptyValue];
		if (removeKeyWhenEmpty && bindingPathPath) {
			setData(bindingPathPath, undefined, context?.pageName, true);
			callChangeEvent();
		} else if (bindingPathPath) {
			setData(bindingPathPath, temp, context?.pageName);
			callChangeEvent();
		}
		if (!onClear) return;
		const clearEvent = props.pageDefinition.eventFunctions?.[onClear];
		if (!clearEvent) return;
		await runEvent(
			clearEvent,
			onClear,
			props.context.pageName,
			props.locationHistory,
			props.pageDefinition,
		);
	};

	const handleBlur = (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		let temp = value === '' && emptyValue ? mapValue[emptyValue] : value;
		if (!updateStoreImmediately && bindingPathPath) {
			if (event?.target.value === '' && removeKeyWhenEmpty) {
				setData(bindingPathPath, undefined, context?.pageName, true);
			} else {
				setData(bindingPathPath, temp, context?.pageName);
			}
			callChangeEvent();
		}
		callBlurEvent();
		setFocus(false);
		setIsDirty(true);
	};

	const handleInputFocus = () => {
		setFocus(true);
		callFocusEvent();
	};

	const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const text = event.target.value;
		if (removeKeyWhenEmpty && text === '' && bindingPathPath) {
			setData(bindingPathPath, undefined, context?.pageName, true);
			callChangeEvent();
			return;
		}
		let temp = text === '' && emptyValue ? mapValue[emptyValue] : text;
		if (updateStoreImmediately && bindingPathPath) {
			setData(bindingPathPath, temp, context?.pageName);
			callChangeEvent();
		}
		if (!updateStoreImmediately) setValue(text);
	};

	return (
		<CommonInputText
			cssPrefix="comp compTextArea"
			id={key}
			noFloat={noFloat}
			readOnly={readOnly}
			value={value}
			label={label}
			translations={translations}
			placeholder={placeholder}
			hasFocusStyles={stylePropertiesWithPseudoStates?.focus}
			validationMessages={validationMessages}
			context={context}
			handleChange={handleChange}
			clearContentHandler={handleClickClose}
			blurHandler={handleBlur}
			focusHandler={() => handleInputFocus()}
			supportingText={supportingText}
			messageDisplay={messageDisplay}
			styles={computedStyles}
			designType={designType}
			colorScheme={colorScheme}
			definition={props.definition}
			autoComplete={autoComplete}
			autoFocus={autoFocus}
			hasValidationCheck={validation?.length > 0}
			inputType="TextArea"
		/>
	);
}

const component: Component = {
	name: 'TextArea',
	displayName: 'TextArea',
	description: 'TextArea component',
	component: TextArea,
	styleComponent: TextAreaStyle,
	styleDefaults: styleDefaults,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	stylePseudoStates: ['focus', 'disabled'],
	styleProperties: stylePropertiesDefinition,
	bindingPaths: {
		bindingPath: { name: 'Text Binding' },
	},
	defaultTemplate: {
		key: '',
		type: 'TextArea',
		name: 'TextArea',
		properties: {
			label: { value: 'TextArea' },
		},
	},
	sections: [{ name: 'Text Area', pageName: 'textArea' }],
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 24 24">
					<path
						d="M9.80078 9.7002C9.80078 9.14791 10.2485 8.7002 10.8008 8.7002H19.7008V19.7002H9.80078V9.7002Z"
						fill="currentColor"
						fillOpacity="0.2"
					/>
					<rect
						x="3.94922"
						y="3.9502"
						width="16.1"
						height="16.1"
						stroke="currentColor"
						strokeWidth="1.5"
						fill="transparent"
					/>
					<rect x="1" y="1" width="4.4" height="4.4" rx="0.4" fill="currentColor" />
					<rect x="1" y="18.6001" width="4.4" height="4.4" rx="0.4" fill="currentColor" />
					<rect x="18.5996" y="1" width="4.4" height="4.4" rx="0.4" fill="currentColor" />
					<rect
						x="18.5996"
						y="18.6001"
						width="4.4"
						height="4.4"
						rx="0.4"
						fill="currentColor"
					/>
				</IconHelper>
			),
		},
		{
			name: 'inputContainer',
			displayName: 'Input Container',
			description: 'Input Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'inputBox',
			displayName: 'Input Box',
			description: 'Input Box',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'floatingLabel',
			displayName: 'Floating Label',
			description: 'Floating Label',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'noFloatLabel',
			displayName: 'No Float Label',
			description: 'No Float Label',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'supportText',
			displayName: 'Support Text',
			description: 'Support Text',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'errorText',
			displayName: 'Error Text',
			description: 'Error Text',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'errorTextContainer',
			displayName: 'Error Text Container',
			description: 'Error Text Container',
			icon: 'fa-solid fa-box',
		},
	],
};

export default component;
