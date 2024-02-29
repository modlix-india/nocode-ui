import React, { useEffect } from 'react';
import {
	Component,
	ComponentDefinition,
	ComponentPropertyDefinition,
	ComponentProps,
	LocationHistory,
} from '../../types/common';
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
import { makePropertiesObject } from '../util/make';

function Otp(props: ComponentProps) {
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
		{ focus: focusBoxIndex != -1, readOnly },
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
				setValue(value);
			},
			pageExtractor,
			bindingPathPath,
		);
	}, [bindingPathPath, valueType]);

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
		let inputValue = target.value;
		if (isValidInputValue(inputValue, valueType)) {
			let newValueArray = value?.split('');
			newValueArray[index] = inputValue === '' ? ' ' : inputValue;
			bindingPathPath !== undefined
				? setData(bindingPathPath, newValueArray.join(''), context?.pageName)
				: setValue(newValueArray.join(''));
			if (inputValue === '' && index > 0 && target.previousSibling !== null) {
				if (target.previousSibling instanceof HTMLInputElement)
					(target.previousSibling as HTMLInputElement).focus();
			} else if (target.nextSibling && inputValue !== '' && index < otpLength - 1) {
				if (target.nextSibling instanceof HTMLInputElement)
					(target.nextSibling as HTMLInputElement).focus();
			}
		}
	};

	const handleBlur = () => {
		setIsDirty(true);
		setFocusBoxIndex(-1);
	};
	const handleFocus = (index: number) => setFocusBoxIndex(index);

	const handleKeyDown = (index: number) => {
		return (e: React.KeyboardEvent<HTMLInputElement>) => {
			if (!(e.target instanceof HTMLInputElement)) return;
			const target = e.target as HTMLInputElement;
			if (e.key === 'ArrowLeft') {
				e.preventDefault();
				if (!(target.previousSibling instanceof HTMLInputElement)) return;
				const prevSibling = target.previousSibling as HTMLInputElement;
				if (prevSibling) {
					prevSibling?.focus();
				}
			} else if (e.key === 'ArrowRight') {
				e.preventDefault();
				if (!(target.nextSibling instanceof HTMLInputElement)) return;
				const nextSibling = target.nextSibling as HTMLInputElement;
				if (nextSibling) {
					nextSibling?.focus();
				}
			} else if (e.key === 'Backspace' && (value === '' || value[index] === ' ')) {
				e.preventDefault();
				if (!(target.previousSibling instanceof HTMLInputElement)) return;
				const prevSibling = target.previousSibling as HTMLInputElement;
				if (prevSibling) {
					prevSibling?.focus();
				}
			}
		};
	};

	let inputStyle = computedStyles.inputBox ?? {};

	if (!handleChange) inputStyle = { ...inputStyle, caretColor: 'transparent' };
	const hasErrorMessages =
		validationMessages?.length &&
		(value.trim() == null || isDirty || context.showValidationMessages) &&
		!readOnly;

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
				className={`_supportText ${readOnly ? 'disabled' : ''} ${
					focusBoxIndex != -1 ? '_supportTextActive' : ''
				}`}
			>
				<SubHelperComponent definition={definition} subComponentName="supportText" />
				{supportingText}
			</span>
		);
	}

	return (
		<div
			className={`comp compOtp ${designType} ${colorScheme} ${readOnly ? '_disabled' : ''} ${
				hasErrorMessages ? '_hasError' : ''
			}`}
			style={computedStyles.comp ?? {}}
		>
			<HelperComponent context={props.context} definition={definition} />
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
					className={`_inputBox ${
						focusBoxIndex === index && focusBoxIndex != -1 ? '_isActive' : ''
					}${
						!(focusBoxIndex === index && focus) && value[index]?.trim()?.length
							? '_hasValue'
							: ''
					}`}
				/>
			))}

			{validationsOrSupportText}
		</div>
	);
}

function MANDATORY(
	validation: any,
	value: any,
	def: ComponentDefinition,
	locationHistory: Array<LocationHistory>,
	pageExtractor: PageStoreExtractor,
): Array<string> {
	const { otpLength } = makePropertiesObject(
		[propertiesDefinition.find(e => e.name == 'otpLength')!],
		def.properties?.otpLength,
		locationHistory,
		pageExtractor ? [pageExtractor] : [],
	);

	if (value.includes(' ') || (otpLength && value.length != otpLength))
		return [validation.message];
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
		MANDATORY,
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
					<path
						d="M8.78571 7.1875C8.78571 5.28828 10.2241 3.75 12 3.75C13.2817 3.75 14.3866 4.54922 14.9049 5.71367C15.2103 6.40117 15.9777 6.69336 16.6165 6.3668C17.2554 6.04023 17.5326 5.21953 17.2272 4.53633C16.2991 2.44805 14.3103 1 12 1C8.8058 1 6.21429 3.77148 6.21429 7.1875V9.25H5.57143C4.15313 9.25 3 10.4832 3 12V20.25C3 21.7668 4.15313 23 5.57143 23H18.4286C19.8469 23 21 21.7668 21 20.25V12C21 10.4832 19.8469 9.25 18.4286 9.25H8.78571V7.1875Z"
						fill="#96A1B4"
					/>
					<rect x="5" y="16" width="4" height="2" rx="1" fill="#F5F6F8" />
					<rect x="10" y="16" width="4" height="2" rx="1" fill="#F5F6F8" />
					<rect x="15" y="16" width="4" height="2" rx="1" fill="#F5F6F8" />
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
