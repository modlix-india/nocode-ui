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

function Otp(props: Readonly<ComponentProps>) {
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

	const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
		e.preventDefault();
		const pastedData = e.clipboardData.getData('text');
		if(!isValidInputValue(pastedData, valueType)) return;
		let newValueArray = value?.split('');
		for(let i=0; i< Math.min(pastedData.length, otpLength-index); i++) {
				newValueArray[index+i] = pastedData[i];
		}
		const newValue = newValueArray.join('')
		if(bindingPathPath !== undefined) {
			setData(bindingPathPath, newValue, context?.pageName);
		}
		else {
			setValue(newValue);
		}
		if(index + pastedData.length < otpLength) {
			const target = e.target as HTMLInputElement;
			if (target.nextSibling instanceof HTMLInputElement)
				(target.nextSibling as HTMLInputElement).focus();
	}
	
}

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: any) => {
		setIsDirty(true);

		let target = e.target;
		let inputValue = target.value;
		if (isValidInputValue(inputValue, valueType)) {
			let newValueArray = value?.split('');
			newValueArray[index] = inputValue === '' ? ' ' : inputValue;
			const allCleared = newValueArray.every(e => e === ' ');
			const valueSet = allCleared ? '' : newValueArray.join('');
			bindingPathPath !== undefined
				? setData(bindingPathPath, valueSet, context?.pageName)
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
			}else if (e.key === 'Backspace') {
				let newValueArray = value?.split('');
				newValueArray[index] = ' ';
				const allEmpty = newValueArray.every(char => char === ' ');
				const newValue = allEmpty ? '' : newValueArray.join('');
				
				if (bindingPathPath !== undefined) {
					setData(bindingPathPath, newValue, context?.pageName);
				} else {
					setValue(newValue);
				}
			
				if (index > 0) {
					e.preventDefault();
					if (target.previousSibling instanceof HTMLInputElement) {
						target.previousSibling.focus();
					}
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

	const activeStyles = computedStyles.activeInputBox ?? {};
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
					onPaste={e => handlePaste(e,index)}
					style={focusBoxIndex === index ? activeStyles : inputStyle}
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
				<IconHelper viewBox="0 0 30 30">
					<path
						className="_OtpLockBoxClosed"
						d="M22.6096 10.4048C23.3362 10.5983 23.9952 10.6803 24.5696 10.9439C26.3595 11.7651 27.1696 13.2469 27.1811 15.1597C27.2015 18.5552 27.1926 21.9509 27.1843 25.3465C27.1804 27.0083 26.5587 28.3696 25.1265 29.3025C24.4101 29.7691 23.6113 29.9942 22.7567 29.9949C17.6483 29.9989 12.5398 30.0048 7.43144 29.9933C5.10753 29.9881 3.25934 28.2764 3.04683 25.9728C3.01893 25.6704 3.00237 25.3659 3.00209 25.0624C2.99911 21.7955 3.0001 18.5288 3.00039 15.2619C3.00039 14.1462 3.25736 13.11 3.96597 12.2159C4.79351 11.1717 5.89784 10.6528 7.2127 10.5355C7.30472 10.5273 7.39689 10.5201 7.53097 10.509C7.53097 10.3497 7.52672 10.2013 7.53168 10.0532C7.57373 8.78012 7.49557 7.48863 7.68671 6.23789C8.06374 3.77042 9.42192 1.90477 11.7121 0.836283C14.6998 -0.557505 17.546 -0.210428 20.0859 1.88763C21.6674 3.19388 22.5045 4.94682 22.6 6.99781C22.6538 8.15286 22.6096 9.31268 22.6096 10.4048ZM19.6149 10.5089C19.6149 9.41667 19.6555 8.36195 19.6055 7.31144C19.5265 5.65208 18.7726 4.35511 17.2753 3.56765C14.5876 2.15447 11.0536 3.6025 10.6387 6.83621C10.5054 7.87407 10.5819 8.93849 10.5635 9.99082C10.5605 10.1614 10.5631 10.3323 10.5631 10.5089H19.6149Z"
						fill="#6349D7"
						opacity="0"
					/>
					<path
						className="_OtpLockBoxOpen"
						d="M7.54225 10.491C7.54225 9.25911 7.45796 8.05803 7.55925 6.87269C7.79258 4.1447 9.13021 2.09031 11.5835 0.835227C13.5975 -0.195275 15.6841 -0.253775 17.7886 0.557914C19.0909 1.06023 20.089 1.96346 20.9311 3.05331C21.5542 3.85966 21.9676 4.76725 22.2084 5.75627C22.387 6.48949 21.9595 7.26279 21.2513 7.47865C20.5304 7.69845 19.6597 7.28388 19.4001 6.60551C19.0561 5.70663 18.6605 4.84783 17.9403 4.16186C16.7201 2.99987 14.7784 2.65815 13.2584 3.40445C11.4447 4.29489 10.4749 5.72449 10.5021 7.78409C10.5139 8.67396 10.5041 9.56426 10.5041 10.5097H10.9195C14.7472 10.5097 18.5751 10.5011 22.4027 10.5133C24.2864 10.5193 25.702 11.3374 26.5544 13.0476C26.8891 13.7192 26.9959 14.4485 26.9967 15.1914C27.0004 18.5661 27.0017 21.941 26.9969 25.3157C26.9945 26.9925 26.3827 28.3671 24.9483 29.3068C24.2267 29.7796 23.4214 29.9968 22.5607 29.9971C17.5156 29.9988 12.4704 30.0035 7.42523 29.9954C5.09737 29.9918 3.25964 28.2891 3.04611 25.964C3.01942 25.673 3.00228 25.3801 3.002 25.088C2.99905 21.8071 3.00032 18.526 3.00004 15.245C3.00004 14.0889 3.27678 13.0218 4.02721 12.1152C4.84662 11.1252 5.92029 10.6299 7.18614 10.5214C7.27703 10.5136 7.36777 10.5058 7.54211 10.4908L7.54225 10.491Z"
						fill="#6349D7"
					/>
					<path
						className="_OtpInputstar1"
						d="M7.81534 22.9091L7.93892 21.3324L6.62642 22.2315L6 21.1321L7.4233 20.4545L6 19.777L6.62642 18.6776L7.93892 19.5767L7.81534 18H9.07244L8.94886 19.5767L10.2614 18.6776L10.8878 19.777L9.46449 20.4545L10.8878 21.1321L10.2614 22.2315L8.94886 21.3324L9.07244 22.9091H7.81534Z"
						fill="white"
						opacity="0"
					/>
					<path
						className="_OtpInputstar2"
						d="M14.7415 22.9091L14.8651 21.3324L13.5526 22.2315L12.9261 21.1321L14.3494 20.4545L12.9261 19.777L13.5526 18.6776L14.8651 19.5767L14.7415 18H15.9986L15.875 19.5767L17.1875 18.6776L17.8139 19.777L16.3906 20.4545L17.8139 21.1321L17.1875 22.2315L15.875 21.3324L15.9986 22.9091H14.7415Z"
						fill="white"
						opacity="0"
					/>
					<path
						className="_OtpInputstar3"
						d="M21.7415 22.9091L21.8651 21.3324L20.5526 22.2315L19.9261 21.1321L21.3494 20.4545L19.9261 19.777L20.5526 18.6776L21.8651 19.5767L21.7415 18H22.9986L22.875 19.5767L24.1875 18.6776L24.8139 19.777L23.3906 20.4545L24.8139 21.1321L24.1875 22.2315L22.875 21.3324L22.9986 22.9091H21.7415Z"
						fill="white"
						opacity="0"
					/>

					<rect
						className="_OtpInputBox1"
						x="6"
						y="19"
						width="5.45455"
						height="2.72727"
						rx="1.36364"
						fill="#F5F6F8"
					/>
					<rect
						className="_OtpInputBox2"
						x="12.8181"
						y="19"
						width="5.45455"
						height="2.72727"
						rx="1.36364"
						fill="#F5F6F8"
					/>
					<rect
						className="_OtpInputBox3"
						x="19.6364"
						y="19"
						width="5.45455"
						height="2.72727"
						rx="1.36364"
						fill="#F5F6F8"
					/>
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
			name: 'activeInputBox',
			displayName: 'Active Input Box',
			description: 'Active Input Box',
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
