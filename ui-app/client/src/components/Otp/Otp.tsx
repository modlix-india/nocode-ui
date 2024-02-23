import React, { useEffect } from 'react';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import {
	PageStoreExtractor,
	addListenerAndCallImmediately,
	getPathFromLocation,
	setData,
} from '../../context/StoreContext';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './otpProperties';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { isNullValue } from '@fincity/kirun-js';
import { validate } from '../../util/validationProcessor';
import { flattenUUID } from '../util/uuid';
import { IconHelper } from '../util/IconHelper';
import { styleDefaults } from './otpStyleProperties';
import OtpInputStyle from './OtpStyle';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { SubHelperComponent } from '../HelperComponents/SubHelperComponent';

function Otp(props: ComponentProps) {
	const [focus, setFocus] = React.useState(false);
	const [focusBoxIndex, setFocusBoxIndex] = React.useState(0);
	const [validationMessages, setValidationMessages] = React.useState<Array<string>>([]);
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
			readOnly,
			validation,
			autoFocus,
			messageDisplay,
			designType,
			colorScheme,
			otpLength,
			valueType,
			supportingText,
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
	const [isDirty, setIsDirty] = React.useState(false);
	const [value, setValue] = React.useState(Array.from({ length: otpLength }, () => ' ').join(''));

	const bindingPathPath = bindingPath
		? getPathFromLocation(bindingPath, locationHistory, pageExtractor)
		: undefined;

	React.useEffect(() => {
		if (!bindingPathPath) return;
		return addListenerAndCallImmediately(
			(_, value) => {
				if (
					isNullValue(value) ||
					!isValidInputValue(value, valueType) ||
					value.length > otpLength
				) {
					setValue(Array.from({ length: otpLength }, () => ' ').join(''));
					return;
				}
				setValue(value)
			},
			pageExtractor,
			bindingPathPath,
		);
	}, [bindingPathPath]);
	useEffect(() => {
		if (!validation) return;
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

		const isValidInputValue = (value: string, valueType: string) => {
			
			if (valueType === 'NUMERIC') {
				return /^(\d| )*$/.test(value);
			} else if (valueType === 'ALPHABETICAL') {
				return /^[a-zA-Z ]*$/.test(value);
			} else if (valueType === 'ALPHANUMERIC') {
				return /^[a-zA-Z0-9 ]*$/.test(value);
			} else if (valueType === 'ANY') {
				return true;
			}
			return false;
		};


	const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: any) => {
		setIsDirty(true);

		let target = e.target;
		let inputValue =target.value;
		if (isValidInputValue(inputValue, valueType)) {
			let newValueArray = value?.split('');
			newValueArray[index] = inputValue === '' ? ' ' : inputValue;
			(bindingPathPath !== undefined)
				? setData(bindingPathPath, newValueArray.join(''), context?.pageName)
				: setValue(newValueArray.join(''));
			if (inputValue === '' && index > 0 && target.previousSibling !== null) {
				const prevSibling = target.previousSibling as HTMLInputElement;
				prevSibling.focus();
			} else if (target.nextSibling && inputValue !== '' && index < otpLength - 1) {
				const nxtSibling = target.nextSibling as HTMLInputElement;
				nxtSibling.focus();
			}
		}
	};

	const handleBlur = () => {
		setFocus(false);
		setIsDirty(true);
		setFocusBoxIndex(-1);
		
	}
	const handleFocus = (index: number) => {
		setFocus(true);
		setFocusBoxIndex(index);
	};

	const handleKeyDown = (index: number) => {
		return (e: React.KeyboardEvent<HTMLInputElement>) => {
			const target = e.target as HTMLInputElement;
			if (e.key === 'ArrowLeft') {
				e.preventDefault();
				const prevSibling = target.previousSibling as HTMLElement;
				if (prevSibling && 'focus' in prevSibling) {
					prevSibling.focus();
				}
			} else if (e.key === 'ArrowRight') {
				e.preventDefault();
				const nextSibling = target.nextSibling as HTMLElement;
				if (nextSibling && 'focus' in nextSibling) {
					nextSibling.focus();
				}
			} else if (e.key === 'Backspace' && (value === '' || value[index] === ' ')) {
				e.preventDefault();
				const prevSibling = target.previousSibling as HTMLInputElement;
				if (prevSibling && 'focus' in prevSibling) {
					prevSibling.focus();
				}
			}
		};
	};

	let inputStyle = computedStyles.inputBox ?? {};

	if (!handleChange) inputStyle = { ...inputStyle, caretColor: 'transparent' };
	const hasErrorMessages =
		validationMessages?.length &&
		(value.trim() == null || isDirty || context.showValidationMessages)&& !readOnly;

	let validationsOrSupportText = undefined;
	if (hasErrorMessages) {
		validationsOrSupportText = (
			<div
				className={`_validationMessages ${messageDisplay}`}
				style={computedStyles.errorTextContainer ?? {}}
			>
				<SubHelperComponent definition={definition} subComponentName="errorTextContainer" />
				{validationMessages.map(msg => (
					<div
						className={`_eachValidationMessage`}
						style={computedStyles.errorText ?? {}}
						key={msg}
					>
						<SubHelperComponent definition={definition} subComponentName="errorText" />
						{msg}
					</div>
				))}
			</div>
		);
	}

	if (!validationsOrSupportText && supportingText && !hasErrorMessages) {
		validationsOrSupportText = (
			<span
				style={computedStyles.supportText ?? {}}
				className={`_supportText ${readOnly ? 'disabled' : ''} ${focus ? '_supportTextActive' : ''}`}
			>
				<SubHelperComponent definition={definition} subComponentName="supportText" />
				{supportingText}
			</span>
		);
	}

	return (
		<div
			className={`comp compOtp ${designType} ${colorScheme} ${readOnly ? '_disabled' : ''} ${(hasErrorMessages) ? '_hasError' : ''}`}
			style={computedStyles.comp ?? {}}
		>
			{Array.from({ length: otpLength }).map((_, index) => (
				<input
					autoFocus={autoFocus === true && index === 0}
					type="text"
					name="otp"
					maxLength={1}
					key={index}
					disabled={readOnly}
					value={index < value.length ? (value[index] == ' ' ? '' : value[index]) : ''}
					onChange={e => handleChange(e, index)}
					onFocus={() => handleFocus(index)}
					onBlur={handleBlur}
					onKeyDown={handleKeyDown(index)}
					style={inputStyle}
					className={`_inputBox ${focusBoxIndex === index && focus ? '_isActive' : ''}${!(focusBoxIndex === index && focus) && value[index]?.trim()?.length ? '_hasValue' : ''}`}
				/>
			))}

			{validationsOrSupportText}

			<HelperComponent context={props.context} definition={definition} />
		</div>
	);
}

function OTP_VALIDATION(validation: any, value: any): Array<string> {
	if (value.includes(' ')) return [validation.message];
	return [];
}

const component: Component = {
	name: 'Otp',
	displayName: 'Otp',
	description: 'OtpInput component',
	component: Otp,
	styleComponent: OtpInputStyle,
	styleDefaults: styleDefaults,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	stylePseudoStates: ['focus', 'disabled'],
	styleProperties: stylePropertiesDefinition,
	bindingPaths: {
		bindingPath: { name: 'OTP Binding' },
	},
	defaultTemplate: {
		key: '',
		type: 'Otp',
		name: 'Otp',
		properties: {
			label: { value: 'Otp' },
		},
	},
	validations: {
		OTP_VALIDATION: {
			functionCode: OTP_VALIDATION,
		},
	},
	sections: [{ name: 'Otp', pageName: 'otp' }],
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 24 24">
					<rect
						x="3.94922"
						y="3.9502"
						width="16.1"
						height="16.1"
						stroke="currentColor"
						stroke-width="1.5"
						fill="transparent"
					/>
					<circle cx="12" cy="12" r="1.5" fill="currentColor" />
					<circle cx="7" cy="12" r="1.5" fill="currentColor" />
					<circle cx="17" cy="12" r="1.5" fill="currentColor" />
					<circle cx="12" cy="7" r="1.5" fill="currentColor" />
					<circle cx="12" cy="17" r="1.5" fill="currentColor" />
				</IconHelper>
			),
		},
		{
			name: 'inputBox',
			displayName: 'Input Box',
			description: 'Input Box',
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
