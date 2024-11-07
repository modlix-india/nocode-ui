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
				<IconHelper viewBox="0 0 30 30">
					<rect
						x="1"
						y="1"
						width="28"
						height="24"
						rx="3"
						fill="url(#paint0_linear_3817_9683)"
					/>
					<path
						fill-rule="evenodd"
						clip-rule="evenodd"
						d="M0 4.6875C0 3.4443 0.49386 2.25201 1.37294 1.37294C2.25201 0.49386 3.4443 0 4.6875 0H25.3125C26.5557 0 27.748 0.49386 28.6271 1.37294C29.5061 2.25201 30 3.4443 30 4.6875V21.2888C30 22.532 29.5061 23.7242 28.6271 24.6033C27.748 25.4824 26.5557 25.9763 25.3125 25.9763H4.6875C3.4443 25.9763 2.25201 25.4824 1.37294 24.6033C0.49386 23.7242 0 22.532 0 21.2888L0 4.6875ZM4.6875 1.875C3.94158 1.875 3.22621 2.17132 2.69876 2.69876C2.17132 3.22621 1.875 3.94158 1.875 4.6875V21.2888C1.875 22.0347 2.17132 22.75 2.69876 23.2775C3.22621 23.8049 3.94158 24.1013 4.6875 24.1013H25.3125C26.0584 24.1013 26.7738 23.8049 27.3012 23.2775C27.8287 22.75 28.125 22.0347 28.125 21.2888V4.6875C28.125 3.94158 27.8287 3.22621 27.3012 2.69876C26.7738 2.17132 26.0584 1.875 25.3125 1.875H4.6875Z"
						fill="url(#paint1_linear_3817_9683)"
					/>
					<path
						className="_TAFirstLine"
						d="M26.5013 15.9382C26.5013 15.6896 26.4025 15.4512 26.2268 15.2754C26.1397 15.1881 26.0362 15.1189 25.9223 15.0716C25.8084 15.0243 25.6863 15 25.563 15C25.4397 15 25.3176 15.0243 25.2037 15.0716C25.0898 15.1189 24.9864 15.1881 24.8993 15.2754L19.2743 20.9004C19.0985 21.0765 18.9998 21.3151 19 21.5639C19.0002 21.8127 19.0992 22.0512 19.2752 22.227C19.4512 22.4028 19.6899 22.5014 19.9387 22.5013C20.1875 22.5011 20.426 22.4021 20.6018 22.2261L26.2268 16.601C26.4025 16.4252 26.5013 16.1868 26.5013 15.9382Z"
						fill="white"
					/>
					<path
						className="_TASecondLine"
						d="M26.5013 20.6257C26.5013 20.3771 26.4025 20.1387 26.2268 19.9629C26.1397 19.8756 26.0362 19.8064 25.9223 19.7591C25.8084 19.7118 25.6863 19.6875 25.563 19.6875C25.4397 19.6875 25.3176 19.7118 25.2037 19.7591C25.0898 19.8064 24.9864 19.8756 24.8993 19.9629L23.9618 20.9004C23.786 21.0765 23.6873 21.3151 23.6875 21.5639C23.6877 21.8127 23.7867 22.0512 23.9627 22.227C24.1387 22.4028 24.3774 22.5014 24.6262 22.5013C24.875 22.5011 25.1135 22.4021 25.2893 22.2261L26.2268 21.2886C26.4025 21.1127 26.5013 20.8743 26.5013 20.6257Z"
						fill="white"
					/>
					<defs>
						<linearGradient
							id="paint0_linear_3817_9683"
							x1="15"
							y1="1"
							x2="15"
							y2="25"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#C6BAEE" stopOpacity="0.933333" />
							<stop offset="1" stopColor="#9B82F3" />
						</linearGradient>
						<linearGradient
							id="paint1_linear_3817_9683"
							x1="15"
							y1="0"
							x2="15"
							y2="25.9763"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#C6BAEE" />
							<stop offset="1" stopColor="#9B82F3" />
						</linearGradient>
					</defs>
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
