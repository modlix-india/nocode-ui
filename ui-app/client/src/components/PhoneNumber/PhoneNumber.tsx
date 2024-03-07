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
import { duplicate, isNullValue } from '@fincity/kirun-js';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { STORE_PATH_FUNCTION_EXECUTION } from '../../constants';
import { flattenUUID } from '../util/uuid';
import { runEvent } from '../util/runEvent';
import { validate } from '../../util/validationProcessor';
import CommonInputText from '../../commonComponents/CommonInputText';
import { styleDefaults } from './phoneNumberStyleProperties';
import { IconHelper } from '../util/IconHelper';
import { Dropdown, DropdownOption, DropdownOptions } from './components/Dropdown';
import { COUNTRY_LIST } from './components/listOfCountries';
import { SubHelperComponent } from '../HelperComponents/SubHelperComponent';

interface mapType {
	[key: string]: any;
}

function PhoneNumber(props: ComponentProps) {
	const [focus, setFocus] = React.useState(false);
	const [dropdownOpen, setDropdownOpen] = React.useState(false);
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
	const [value, setValue] = React.useState<string>('');

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

	const computedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{ focus, disabled: isLoading || readOnly },
		stylePropertiesWithPseudoStates,
	);

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
			...(validationMessages.filter(e => e === VALIDATION_MSG) ?? []),
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
	const enterEvent = onEnter ? props.pageDefinition.eventFunctions?.[onEnter] : undefined;
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
	const handleFocusOnDropdownOpen = () => {
		setDropdownOpen(true);
		handleInputFocus();
	};
	const handleBlurOnDropdownClose = () => {
		setDropdownOpen(false);
		setFocus(false);
		callBlurEvent();
	};

	const handleKeyUp = async (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		if (!enterEvent || isLoading || e.key !== 'Enter') return;
		if (!updateStoreImmediately) {
			handleBlur(e as unknown as React.FocusEvent<HTMLInputElement>);
		}
		await runEvent(
			enterEvent,
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
		return duplicate(COUNTRY_LIST).sort((a: any, b: any) => {
			if (orderBy === 'countrycode') return a.C <= b.C ? -1 : 1;
			else if (orderBy === 'dialcode') return parseInt(a.D.slice(1)) - parseInt(b.D.slice(1));
			else return a.N <= b.N ? -1 : 1;
		});
	}, [orderBy]);

	const [countryList, setCountryList] = useState<DropdownOptions>(SORTED_COUNTRY_LIST);
	const [selected, setSelected] = useState<DropdownOption>(SORTED_COUNTRY_LIST[0]);
	const [phoneNumber, setPhoneNumber] = useState<string>('');
	const VALIDATION_MSG = 'Dial code is not valid or not available in option list';

	const getDialCode = (value: string) => {
		let dc = '';
		if (value !== '' && value.startsWith('+')) {
			dc = value.length > 8 ? value.substring(0, 8) : value;
			while (dc.length > 0) {
				if (!countryList.find(e => e.D === dc)) {
					dc = dc.slice(0, dc.length - 1);
				} else break;
			}
		}
		return dc;
	};

	const getSelectedCountry = (value: string) => {
		let dc = getDialCode(value);
		let temp = countryList.filter(e => e.D === dc);
		if (!temp.length) return undefined;
		else if (temp.length == 1) return temp[0];
		let text = value.slice(dc.length);
		for (let i = 0; i < temp.length; i++) {
			let areaCodes = temp[i]?.A ?? [];
			for (let j = 0; j < areaCodes.length; j++) {
				if (text.startsWith(`${areaCodes[j]}`)) {
					return temp[i];
				}
			}
		}
		return temp[0];
	};
	const getUnformattedNumber = (text: string | undefined) => {
		if (!text) return '';
		return text.replace(/[^+\d]/g, '');
	};

	const getFormattedNumber = (text: string, dc: string) => {
		let format = SORTED_COUNTRY_LIST.find(e => e.D == dc)?.F ?? [];
		if (format.length == 0) format = [5, 5];
		let formatLength = format.reduce((acc, e) => acc + e, 0);
		text = getUnformattedNumber(text);
		if (text.length > formatLength) return text;
		let formattedText = '';
		let startInd = 0;
		for (let i = 0; i < format.length; i++) {
			let endInd = startInd + format[i];
			let stext = text.slice(startInd, endInd);
			if (stext.length < text.slice(startInd, endInd + 1).length) {
				formattedText += stext + seperator;
			} else {
				formattedText += stext;
			}
			startInd = endInd;
		}
		return formattedText;
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
		} else if (Array.isArray(countries)) {
			tempList = SORTED_COUNTRY_LIST.filter(e => countries.includes(e.C));
		} else {
			tempList = SORTED_COUNTRY_LIST;
		}
		setCountryList(tempList);
	}, [countries, topCountries, SORTED_COUNTRY_LIST]);

	useEffect(() => {
		let unformattedText = getUnformattedNumber(value);
		let selectedCountry = getSelectedCountry(unformattedText);
		if (selectedCountry) setSelected(selectedCountry);
		else setSelected(countryList[0]);
		let dc = selectedCountry ? selectedCountry.D ?? '' : '';
		if (format) setPhoneNumber(getFormattedNumber(unformattedText.slice(dc.length), dc));
		else setPhoneNumber(unformattedText.slice(dc.length));
	}, [value, countryList, seperator]);

	const extractDCAndPhone = (text: string) => {
		let phone = text;
		let dc = getDialCode(phone);
		if (dc) {
			phone = phone.slice(dc.length);
			setValidationMessages([]);
		} else {
			dc = selected.D;
			if (
				(validationMessages.length > 0 && validationMessages[0] !== VALIDATION_MSG) ||
				validationMessages.length === 0
			)
				setValidationMessages([VALIDATION_MSG]);
		}
		return { dc, phone };
	};

	const updateBindingPathData = (text: string | undefined | null | 0, removeKey?: boolean) => {
		if (bindingPathPath && removeKey) {
			setValidationMessages([]);
			setData(bindingPathPath, text, context?.pageName, true);
			callChangeEvent();
		} else if (bindingPathPath) {
			setValidationMessages([]);
			setData(bindingPathPath, text, context?.pageName);
			callChangeEvent();
		}
	};

	const handleBlur = (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		let text =
			phoneNumber === '' && emptyValue
				? mapValue[emptyValue]
				: getUnformattedNumber(phoneNumber);
		if (event?.target.value === '' && removeKeyWhenEmpty) {
			updateBindingPathData(undefined, true);
		} else if (!text && !updateStoreImmediately) {
			updateBindingPathData(text);
		} else if (text && text.startsWith('+')) {
			let { dc, phone } = extractDCAndPhone(text);
			let temp =
				format && text !== phone
					? dc + (storeFormatted ? seperator + getFormattedNumber(phone, dc) : phone)
					: dc + phone;
			bindingPathPath && setData(bindingPathPath, temp, context?.pageName);
			callChangeEvent();
		} else if (!updateStoreImmediately) {
			let temp = format
				? selected.D +
				  (storeFormatted ? seperator + getFormattedNumber(text, selected.D) : text)
				: selected.D + text;
			updateBindingPathData(temp);
		}
		callBlurEvent();
		setFocus(false);
	};
	const handleNumberChange = async (
		event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		let text = event.target.value;
		if (removeKeyWhenEmpty && text === '') {
			updateBindingPathData(undefined, true);
			return;
		}
		text = text === '' && emptyValue ? mapValue[emptyValue] : getUnformattedNumber(text);
		let formattedText = getFormattedNumber(text, selected.D);

		if (!text && updateStoreImmediately) {
			updateBindingPathData(text);
		} else if (!text && !updateStoreImmediately) {
			setPhoneNumber('');
		} else if (!text.startsWith('+') && updateStoreImmediately) {
			let temp = format
				? selected.D + (storeFormatted ? seperator + formattedText : text)
				: selected.D + text;
			updateBindingPathData(temp);
		} else if (!text.startsWith('+') && !updateStoreImmediately) {
			let temp = format ? formattedText : text;
			setPhoneNumber(temp);
		} else {
			setPhoneNumber(text);
		}
	};

	const leftChildren = (
		<Dropdown
			value={selected}
			onChange={v => setSelected(v)}
			options={countryList}
			isSearchable={isSearchable}
			searchLabel={searchLabel}
			clearSearchTextOnClose={clearSearchTextOnClose}
			computedStyles={computedStyles}
			definition={definition}
			handleFocusOnDropdownOpen={handleFocusOnDropdownOpen}
			handleBlurOnDropdownClose={handleBlurOnDropdownClose}
			showDialCode={noCodeForFirstCountry && selected.C === countryList[0].C ? false : true}
		/>
	);
	const finKey: string = 't_' + key;
	const x = noCodeForFirstCountry && selected.C === countryList[0].C ? 1 : selected.D.length ?? 1;

	return (
		<CommonInputText
			cssPrefix={`comp compPhoneNumber _dialCodeLength${x}`}
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
			showDropdown={dropdownOpen}
			leftChildren={leftChildren}
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
	sections: [{ name: 'Phone Number', pageName: '' }],
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
			name: 'dropdownSelect',
			displayName: 'Dropdown Select',
			description: 'Dropdown Select',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'selectedOption',
			displayName: 'Selected Option',
			description: 'Selected Option',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'arrowIcon',
			displayName: 'Arrow Icon',
			description: 'Arrow Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'dialCodeLabel',
			displayName: 'Dial Code Label',
			description: 'Dial Code Label',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'dropdownBody',
			displayName: 'Dropdown Body',
			description: 'Dropdown Body',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'dropdownSearchBox',
			displayName: 'Dropdown Search Box',
			description: 'Dropdown Search Box',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'dropdownOptionList',
			displayName: 'Dropdown Option List',
			description: 'Dropdown Option List',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'dropdownOption',
			displayName: 'Dropdown Option',
			description: 'Dropdown Option',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'inputBox',
			displayName: 'Input Box',
			description: 'Input Box',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'rightIcon',
			displayName: 'Right Icon',
			description: 'Right Icon',
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
