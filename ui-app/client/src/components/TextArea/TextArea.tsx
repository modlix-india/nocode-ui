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
			showMandatoryAsterisk,
			hideClearButton,
			maxChars,
			rows,
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
			maxChars={maxChars}
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
			hideClearContentIcon={hideClearButton}
			inputType="TextArea"
			rows={rows}
			showMandatoryAsterisk={
				(validation ?? []).find(
					(e: any) => e.type === undefined || e.type === 'MANDATORY',
				) && showMandatoryAsterisk
					? true
					: false
			}
		/>
	);
}

const component: Component = {
	order: 13,
	name: 'TextArea',
	displayName: 'Text Area',
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
				<IconHelper viewBox="0 0 30 24">
					<rect width="28" height="24" rx="3" fill="#9B82F3" />
					<path
						className="_TAFirstLine"
						d="M25.5013 14.9382C25.5013 14.6896 25.4025 14.4512 25.2268 14.2754C25.1397 14.1881 25.0362 14.1189 24.9223 14.0716C24.8084 14.0243 24.6863 14 24.563 14C24.4397 14 24.3176 14.0243 24.2037 14.0716C24.0898 14.1189 23.9864 14.1881 23.8993 14.2754L18.2743 19.9004C18.0985 20.0765 17.9998 20.3151 18 20.5639C18.0002 20.8127 18.0992 21.0512 18.2752 21.227C18.4512 21.4028 18.6899 21.5014 18.9387 21.5013C19.1875 21.5011 19.426 21.4021 19.6018 21.2261L25.2268 15.601C25.4025 15.4252 25.5013 15.1868 25.5013 14.9382Z"
						fill="white"
					/>
					<path
						className="_TASecondLine"
						d="M25.5013 19.6257C25.5013 19.3771 25.4025 19.1387 25.2268 18.9629C25.1397 18.8756 25.0362 18.8064 24.9223 18.7591C24.8084 18.7118 24.6863 18.6875 24.563 18.6875C24.4397 18.6875 24.3176 18.7118 24.2037 18.7591C24.0898 18.8064 23.9864 18.8756 23.8993 18.9629L22.9618 19.9004C22.786 20.0765 22.6873 20.3151 22.6875 20.5639C22.6877 20.8127 22.7867 21.0512 22.9627 21.227C23.1387 21.4028 23.3774 21.5014 23.6262 21.5013C23.875 21.5011 24.1135 21.4021 24.2893 21.2261L25.2268 20.2886C25.4025 20.1127 25.5013 19.8743 25.5013 19.6257Z"
						fill="white"
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
			name: 'label',
			displayName: 'Label',
			description: 'Label',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'asterisk',
			displayName: 'Asterisk',
			description: 'Asterisk',
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
