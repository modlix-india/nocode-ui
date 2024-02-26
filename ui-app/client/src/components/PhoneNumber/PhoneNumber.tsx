import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
	addListener,
	addListenerAndCallImmediately,
	getDataFromPath,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
} from '../../context/StoreContext';
import { ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { Component } from '../../types/common';
import { propertiesDefinition, stylePropertiesDefinition } from './phoneNumberProperties';
import PhoneNumberStyle from './PhoneNumberStyle';
import useDefinition from '../util/useDefinition';
import { isNullValue } from '@fincity/kirun-js';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { STORE_PATH_FUNCTION_EXECUTION } from '../../constants';
import { flattenUUID } from '../util/uuid';
import { runEvent } from '../util/runEvent';
import { validate } from '../../util/validationProcessor';
import CommonInputText from '../../commonComponents/CommonInputText';
import { styleDefaults } from './phoneNumberStyleProperties';
import { IconHelper } from '../util/IconHelper';
import { Dropdown, DropdownOptions } from './components/Dropdown';
import { COUNTRY_LIST } from './components/listOfCountries';

interface mapType {
	[key: string]: any;
}

function PhoneNumber(props: ComponentProps) {
	const [focus, setFocus] = React.useState(false);
	const [validationMessages, setValidationMessages] = React.useState<Array<string>>([]);
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
			onEnter,
			validation,
			placeholder,
			messageDisplay,
			autoComplete,
			onClear,
			onChange,
			autoFocus,
			designType,
			colorScheme,
			hideClearButton,
			maxChars,
			onFocus,
			onBlur,
			countries,
			topCountries,
			orderBy,
			format,
			storeFormatted,
			seperator,
			isSearchable,
			searchLabel,
			clearSearchTextOnClose,
			noCodeForFirstCountry,
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
	const [value, setValue] = React.useState<string>(defaultValue ?? '');

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

	const spinnerPath1 = onEnter
		? `${STORE_PATH_FUNCTION_EXECUTION}.${props.context.pageName}.${flattenUUID(
				onEnter,
		  )}.isRunning`
		: undefined;

	const spinnerPath2 = onClear
		? `${STORE_PATH_FUNCTION_EXECUTION}.${props.context.pageName}.${flattenUUID(
				onClear,
		  )}.isRunning`
		: undefined;

	const spinnerPath3 = onChange
		? `${STORE_PATH_FUNCTION_EXECUTION}.${props.context.pageName}.${flattenUUID(
				onChange,
		  )}.isRunning`
		: undefined;

	const [isLoading, setIsLoading] = useState(
		(getDataFromPath(spinnerPath1, props.locationHistory, pageExtractor) ||
			getDataFromPath(spinnerPath2, props.locationHistory, pageExtractor) ||
			getDataFromPath(spinnerPath3, props.locationHistory, pageExtractor)) ??
			false,
	);

	useEffect(() => {
		let paths = [];
		if (spinnerPath1) paths.push(spinnerPath1);
		if (spinnerPath2) paths.push(spinnerPath2);
		if (spinnerPath3) paths.push(spinnerPath3);

		if (!paths.length) return;
		return addListener((_, value) => setIsLoading(value), pageExtractor, ...paths);
	}, []);

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
		setValidationMessages([
			...(validationMessages.filter(e => e === dialCodeValidationMessage) ?? []),
			...msgs,
		]);

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

	const changeEvent = onChange ? props.pageDefinition.eventFunctions?.[onChange] : undefined;
	const blurEvent = onBlur ? props.pageDefinition.eventFunctions?.[onBlur] : undefined;
	const focusEvent = onFocus ? props.pageDefinition.eventFunctions?.[onFocus] : undefined;
	const clickEvent = onEnter ? props.pageDefinition.eventFunctions?.[onEnter] : undefined;
	const clearEvent = onClear ? props.pageDefinition.eventFunctions?.[onClear] : undefined;
	const updateStoreImmediately = upStoreImm || autoComplete === 'on';

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

	const handleInputFocus = () => {
		setFocus(true);
		callFocusEvent();
	};

	const handleKeyUp = async (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		if (!clickEvent || isLoading || e.key !== 'Enter') return;
		if (!updateStoreImmediately) {
			handleBlur(e as unknown as React.FocusEvent<HTMLInputElement>);
		}
		await runEvent(
			clickEvent,
			onEnter,
			props.context.pageName,
			props.locationHistory,
			props.pageDefinition,
		);
	};

	const handleClickClose = async () => {
		let temp = mapValue[emptyValue];
		if (removeKeyWhenEmpty && bindingPathPath) {
			setData(bindingPathPath, undefined, context?.pageName, true);
			callChangeEvent();
		} else if (bindingPathPath) {
			setData(bindingPathPath, temp, context?.pageName);
			callChangeEvent();
		}
		if (!clearEvent) return;
		await runEvent(
			clearEvent,
			onClear,
			props.context.pageName,
			props.locationHistory,
			props.pageDefinition,
		);
	};

	const SORTED_COUNTRY_LIST = useMemo<DropdownOptions>(() => {
		return COUNTRY_LIST.sort((a, b) => {
			if (orderBy === 'countrycode') return a.C <= b.C ? -1 : 1;
			else if (orderBy === 'dialcode') return parseInt(a.D.slice(1)) - parseInt(b.D.slice(1));
			else return a.N <= b.N ? -1 : 1;
		});
	}, [orderBy]);

	const [countryList, setCountryList] = useState<DropdownOptions>(SORTED_COUNTRY_LIST);
	const [selectedCode, setSelectedCode] = useState<string>(SORTED_COUNTRY_LIST[0].D);
	const [phoneNumber, setPhoneNumber] = useState<string>('');
	const dialCodeValidationMessage = 'dial code is not valid or not available in option list';

	const getDialCode = (value: string) => {
		let dc = '';
		if (value !== '' && value.startsWith('+')) {
			dc = value.length > 5 ? value.substring(0, 5) : value;
			while (dc.length > 0) {
				if (!countryList.find(e => e.D === dc)) {
					dc = dc.slice(0, dc.length - 1);
				} else break;
			}
		}
		return dc;
	};

	useEffect(() => {
		let tempList = [];
		if (Array.isArray(countries) && Array.isArray(topCountries)) {
			tempList = SORTED_COUNTRY_LIST.filter(e => topCountries.includes(e.C));
			tempList[tempList.length - 1].nextSeperator = true;
			tempList = [...tempList, ...SORTED_COUNTRY_LIST.filter(e => countries.includes(e.C))];
		} else if (Array.isArray(topCountries)) {
			tempList = SORTED_COUNTRY_LIST.filter(e => topCountries.includes(e.C));
			tempList[tempList.length - 1].nextSeperator = true;
			tempList = [
				...tempList,
				...SORTED_COUNTRY_LIST.filter(e => !topCountries.includes(e.C)),
			];
		} else {
			tempList = SORTED_COUNTRY_LIST;
		}
		setCountryList(tempList);
	}, [countries, topCountries]);

	useEffect(() => {
		if (format) {
			let unformattedText = getUnformattedNumber(value);
			let dc = getDialCode(unformattedText);
			if (dc) {
				setSelectedCode(dc);
				setPhoneNumber(getFormattedNumber(unformattedText.slice(dc.length)));
			} else {
				setSelectedCode(countryList[0].D);
				setPhoneNumber(getFormattedNumber(unformattedText));
			}
		} else {
			let dc = getDialCode(value);
			if (dc) setSelectedCode(dc);
			else setSelectedCode(countryList[0].D);
			setPhoneNumber(value.slice(dc.length));
		}
	}, [value, countryList]);

	const handleBlur = (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		let text = phoneNumber === '' && emptyValue ? mapValue[emptyValue] : phoneNumber;
		if (format) {
			//code for  format
			if (text && text.startsWith('+')) {
				let phone = text;
				let dc = getDialCode(phone);
				if (dc) {
					phone = phone.slice(dc.length);
					setValidationMessages([]);
				} else {
					dc = selectedCode;
					if (
						(validationMessages.length > 0 &&
							validationMessages[0] !== dialCodeValidationMessage) ||
						validationMessages.length === 0
					)
						setValidationMessages([dialCodeValidationMessage]);
				}
				let temp = '';
				if (text === phone) {
					temp = dc + text;
				} else {
					let unformattedText = getUnformattedNumber(phone);
					let formattedText = getFormattedNumber(unformattedText);
					temp = dc + (storeFormatted ? seperator + formattedText : unformattedText);
				}
				console.log('temp', temp);
				if (bindingPathPath) {
					setData(bindingPathPath, temp, context?.pageName);
					callChangeEvent();
				}
			} else if (!updateStoreImmediately && bindingPathPath) {
				setValidationMessages([]);
				if (event?.target.value === '' && removeKeyWhenEmpty) {
					setData(bindingPathPath, undefined, context?.pageName, true);
				} else {
					console.log('format blur');
					let unformattedText = getUnformattedNumber(text);
					let formattedText = getFormattedNumber(unformattedText);
					let temp = text
						? selectedCode +
						  (storeFormatted ? seperator + formattedText : unformattedText)
						: text;
					// console.log(unformattedText, '-', formattedText);
					// console.log('temp', temp);
					setData(bindingPathPath, temp, context?.pageName);
				}
				callChangeEvent();
			}
		} else {
			if (text && text.startsWith('+')) {
				let dc = getDialCode(text);
				if (dc) {
					text = text.slice(dc.length);
					setValidationMessages([]);
				} else {
					dc = selectedCode;
					if (
						(validationMessages.length > 0 &&
							validationMessages[0] !== dialCodeValidationMessage) ||
						validationMessages.length === 0
					)
						setValidationMessages([dialCodeValidationMessage]);
				}
				let temp = dc + text;
				if (bindingPathPath) {
					setData(bindingPathPath, temp, context?.pageName);
					callChangeEvent();
				}
			} else if (!updateStoreImmediately && bindingPathPath) {
				setValidationMessages([]);
				if (event?.target.value === '' && removeKeyWhenEmpty) {
					setData(bindingPathPath, undefined, context?.pageName, true);
				} else {
					let temp = text ? selectedCode + text : text;
					console.log('temp', temp);
					setData(bindingPathPath, temp, context?.pageName);
				}
				callChangeEvent();
			}
		}
		callBlurEvent();
		setFocus(false);
	};
	// console.log('storeFormatted', storeFormatted);
	const handleNumberChange = async (
		event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		let text = event.target.value;
		if (removeKeyWhenEmpty && text === '' && bindingPathPath) {
			setData(bindingPathPath, undefined, context?.pageName, true);
			callChangeEvent();
			return;
		}
		if (format) {
			if (!text.startsWith('+')) {
				let unformattedText = getUnformattedNumber(text);
				let formattedtext = getFormattedNumber(unformattedText);
				if (updateStoreImmediately && bindingPathPath) {
					let temp =
						text === '' && emptyValue
							? mapValue[emptyValue]
							: selectedCode +
							  (storeFormatted ? seperator + formattedtext : unformattedText);
					setValidationMessages([]);
					setData(bindingPathPath, temp, context?.pageName);
					callChangeEvent();
				} else {
					console.log('formattedtext', formattedtext);
					setPhoneNumber(formattedtext);
				}
			} else setPhoneNumber(text);
		} else {
			let temp = text === '' && emptyValue ? mapValue[emptyValue] : selectedCode + text;
			if (!text.startsWith('+') && updateStoreImmediately && bindingPathPath) {
				setValidationMessages([]);
				setData(bindingPathPath, temp, context?.pageName);
				callChangeEvent();
			} else setPhoneNumber(text);
		}
	};

	const getFormattedNumber = (text: string) => {
		let format = SORTED_COUNTRY_LIST.find(e => e.D == selectedCode)?.format ?? [3, 3, 4];
		let formatLength = format.reduce((acc, e) => acc + e, 0);
		text = getUnformattedNumber(text);
		console.log('text', text);
		if (text.length > formatLength) {
			return text;
		}
		let formattedText = '';
		let startInd = 0;
		format.forEach(e => {
			let endInd = startInd + e;
			let stext = text.slice(startInd, endInd);
			if (stext.length < text.slice(startInd, endInd + 1).length) {
				formattedText += stext + seperator;
			} else {
				formattedText += stext;
			}
			startInd = endInd;
			// console.log('formattedText', formattedText);
		});
		return formattedText;
	};
	const getUnformattedNumber = (text: string | undefined) => {
		if (!text) return '';
		return text.replace(/[^+\d]/g, '');
	};

	const handleCountryChange = async (dc: string) => {
		if (bindingPathPath) {
			let unformattedText = getUnformattedNumber(phoneNumber);
			let formattedText = getFormattedNumber(unformattedText);
			let text = format
				? dc + (storeFormatted ? seperator + formattedText : unformattedText)
				: dc + phoneNumber;
			setData(bindingPathPath, text, context?.pageName);
			callChangeEvent();
		}
	};

	const dialCodeLabel =
		noCodeForFirstCountry && selectedCode === countryList[0].D ? undefined : (
			<span className="_dialCodeLabel">{selectedCode}</span>
		);
	const leftChildren = (
		<>
			<Dropdown
				value={selectedCode}
				onChange={handleCountryChange}
				options={countryList}
				isSearchable={isSearchable}
				searchLabel={searchLabel}
				clearSearchTextOnClose={clearSearchTextOnClose}
			/>
			{dialCodeLabel}
		</>
	);
	const finKey: string = 't_' + key;

	return (
		<CommonInputText
			cssPrefix="comp compPhoneNumber"
			id={finKey}
			noFloat={noFloat}
			readOnly={readOnly}
			value={phoneNumber}
			label={label}
			translations={translations}
			valueType={'tel'}
			placeholder={placeholder}
			hasFocusStyles={stylePropertiesWithPseudoStates?.focus}
			validationMessages={validationMessages}
			context={context}
			handleChange={handleNumberChange}
			clearContentHandler={handleClickClose}
			blurHandler={handleBlur}
			keyUpHandler={handleKeyUp}
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
			maxChars={maxChars}
			leftChildren={leftChildren}
			dialCodeLength={
				noCodeForFirstCountry && selectedCode === countryList[0].D
					? 1
					: selectedCode.length ?? 1
			}
		/>
	);
}

const component: Component = {
	name: 'PhoneNumber',
	displayName: 'Phone Number',
	description: 'Phone Number component',
	component: PhoneNumber,
	styleComponent: PhoneNumberStyle,
	styleDefaults: styleDefaults,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	stylePseudoStates: ['focus', 'disabled'],
	styleProperties: stylePropertiesDefinition,
	bindingPaths: {
		bindingPath: { name: 'Phone Binding' },
	},
	defaultTemplate: {
		key: '',
		type: 'PhoneNumber',
		name: 'PhoneNumber',
		properties: {
			label: { value: 'Phone Number' },
		},
	},
	sections: [{ name: 'Text Box', pageName: '' }],
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 24 24">
					<svg
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							opacity="0.4"
							d="M4.14286 1C2.40938 1 1 2.40938 1 4.14286V19.8571C1 21.5906 2.40938 23 4.14286 23H19.8571C21.5906 23 23 21.5906 23 19.8571V4.14286C23 2.40938 21.5906 1 19.8571 1H4.14286ZM8.59687 5.74866C9.07321 5.62098 9.57411 5.86161 9.76071 6.3183L10.7429 8.67545C10.9098 9.07812 10.792 9.53973 10.458 9.81473L9.25 10.8067C10.0652 12.5353 11.4647 13.9348 13.1933 14.75L14.1853 13.5371C14.4603 13.2031 14.9219 13.0853 15.3246 13.2522L17.6817 14.2344C18.1384 14.4259 18.379 14.9219 18.2513 15.3982L17.6621 17.5589C17.5442 17.9911 17.1562 18.2857 16.7143 18.2857C10.6397 18.2857 5.71429 13.3603 5.71429 7.28571C5.71429 6.84375 6.00893 6.4558 6.43616 6.33795L8.59687 5.74866Z"
							fill="#E7E9ED"
						/>
						<path
							d="M9.75107 6.27922C9.55824 5.81938 9.05885 5.5771 8.57923 5.70566L6.40366 6.29899C5.96854 6.41766 5.67188 6.80828 5.67188 7.25328C5.67188 13.3696 10.6312 18.3289 16.7475 18.3289C17.1925 18.3289 17.5831 18.0323 17.7018 17.6021L18.2951 15.4265C18.4237 14.9469 18.1814 14.4426 17.7216 14.2547L15.3482 13.2658C14.9428 13.0977 14.478 13.2163 14.2011 13.5526L13.2023 14.7689C11.4619 13.9481 10.0527 12.5389 9.2319 10.7985L10.4532 9.79969C10.7894 9.5228 10.9081 9.05802 10.74 8.65257L9.75107 6.27922Z"
							fill="#96A1B4"
						/>
					</svg>
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
			name: 'label',
			displayName: 'Label',
			description: 'Label',
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
