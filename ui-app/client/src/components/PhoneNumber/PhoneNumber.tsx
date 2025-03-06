import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

interface mapType {
	[key: string]: any;
}

function PhoneNumber(props: Readonly<ComponentProps>) {
	const [focus, setFocus] = React.useState(false);
	const [dropdownOpen, setDropdownOpen] = React.useState(false);
	const [validationMessages, setValidationMessages] = React.useState<Array<string>>([]);
	const mapValue: mapType = {
		UNDEFINED: undefined,
		NULL: null,
		ENMPTYSTRING: '',
		ZERO: 0,
	};
	const countryMap = useRef(new Map<string, DropdownOption>());
	const lastSelectedCountry = useRef<DropdownOption | null>(null);
	const isFirstRender = useRef(true);

	const {
		definition: { bindingPath, bindingPath2 },
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
			showMandatoryAsterisk,
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
	const [countryCode, setCountryCode] = React.useState<string>('');

	const bindingPathPath = bindingPath
		? getPathFromLocation(bindingPath, locationHistory, pageExtractor)
		: undefined;

	const bindingPathPath2 = bindingPath2
		? getPathFromLocation(bindingPath2, locationHistory, pageExtractor)
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

	React.useEffect(() => {
		if (!bindingPathPath2) return;
		return addListenerAndCallImmediately(
			(_, value) => {
				if (isNullValue(value)) {
					setCountryCode('');
					return;
				}
				setCountryCode(value);
				// Find and set the country based on country code
				const country = SORTED_COUNTRY_LIST.find(c => c.C === value);
				if (country) {
					setSelected(country);
					lastSelectedCountry.current = country;
				}
			},
			pageExtractor,
			bindingPathPath2,
		);
	}, [bindingPathPath2]);

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
		if (countryMap.current.has(dc)) return countryMap.current.get(dc);
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
			tempList = duplicate(SORTED_COUNTRY_LIST).filter((e: DropdownOption) =>
				topCountries.includes(e.C),
			);
			tempList[tempList.length - 1].nextSeperator = true;
			tempList = [
				...tempList,
				...duplicate(SORTED_COUNTRY_LIST).filter((e: DropdownOption) =>
					countries.includes(e.C),
				),
			];
		} else if (Array.isArray(topCountries)) {
			tempList = duplicate(SORTED_COUNTRY_LIST).filter((e: DropdownOption) =>
				topCountries.includes(e.C),
			);
			tempList[tempList.length - 1].nextSeperator = true;
			tempList = [
				...tempList,
				...duplicate(SORTED_COUNTRY_LIST).filter(
					(e: DropdownOption) => !topCountries.includes(e.C),
				),
			];
		} else if (Array.isArray(countries)) {
			tempList = duplicate(SORTED_COUNTRY_LIST).filter((e: DropdownOption) =>
				countries.includes(e.C),
			);
		} else {
			tempList = duplicate(SORTED_COUNTRY_LIST);
		}
		setCountryList(tempList);

		if (isFirstRender.current && tempList.length > 0) {
			setSelected(tempList[0]);
			lastSelectedCountry.current = tempList[0];
			if (bindingPathPath2) {
				setData(bindingPathPath2, tempList[0].C, context?.pageName);
			}
			isFirstRender.current = false;
		}
	}, [countries, topCountries, SORTED_COUNTRY_LIST]);

	useEffect(() => {
		let unformattedText = getUnformattedNumber(value);
		let selectedCountry = getSelectedCountry(unformattedText);

		if (selectedCountry) {
			setSelected(selectedCountry);
			lastSelectedCountry.current = selectedCountry;
		} else if (lastSelectedCountry.current) {
			setSelected(lastSelectedCountry.current);
		} else {
			setSelected(countryList[0]);
			lastSelectedCountry.current = countryList[0];
		}

		let dc = selectedCountry ? (selectedCountry.D ?? '') : '';
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
			if (lastSelectedCountry.current) setSelected(lastSelectedCountry.current);
			updateBindingPathData(undefined, true);
		} else if (!text && !updateStoreImmediately) {
			if (lastSelectedCountry.current) setSelected(lastSelectedCountry.current);
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
	const handleChange = async (
		event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		let text = event.target.value;
		if (removeKeyWhenEmpty && text === '') {
			if (lastSelectedCountry.current) setSelected(lastSelectedCountry.current);
			updateBindingPathData(undefined, true);
			return;
		}
		text = text === '' && emptyValue ? mapValue[emptyValue] : getUnformattedNumber(text);
		let formattedText = getFormattedNumber(text, selected.D);

		if (!text && updateStoreImmediately) {
			if (lastSelectedCountry.current) setSelected(lastSelectedCountry.current);
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
	const handleCountryChange = (v: DropdownOption) => {
		setSelected(v);
		lastSelectedCountry.current = v;
		countryMap.current.clear();
		countryMap.current.set(v.D, v);

		if (bindingPathPath) {
			const formattedPhone = format
				? storeFormatted
					? seperator + getFormattedNumber(phoneNumber, v.D)
					: phoneNumber
				: phoneNumber;
			const newValue = phoneNumber ? v.D + formattedPhone : '';
			setData(bindingPathPath, newValue, context?.pageName);
		}

		if (bindingPathPath2) {
			setData(bindingPathPath2, v.C, context?.pageName);
			callChangeEvent();
		}
	};

	const leftChildren = (
		<Dropdown
			value={selected}
			onChange={handleCountryChange}
			options={countryList}
			isSearchable={isSearchable}
			readOnly={readOnly}
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
	const x =
		noCodeForFirstCountry && selected.C === countryList[0].C ? 1 : (selected.D.length ?? 1);

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
			handleChange={handleChange}
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
			showMandatoryAsterisk={
				showMandatoryAsterisk &&
				(validation ?? []).find((e: any) => e.type === undefined || e.type === 'MANDATORY')
					? true
					: false
			}
		/>
	);
}

const component: Component = {
	order: 16,
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
		bindingPath: { name: 'Phone Number Binding' },
		bindingPath2: { name: 'Country Code Binding' },
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
				<IconHelper viewBox="0 0 30 30">
					<circle cx="15" cy="15" r="15" fill="#0FBDA0" />
					<path
						className="_phonenumber"
						d="M11.9787 6.81636C11.7197 6.19876 11.049 5.87337 10.4048 6.04603L7.48284 6.84292C6.89845 7.0023 6.5 7.52693 6.5 8.1246C6.5 16.3393 13.1607 23 21.3754 23C21.9731 23 22.4977 22.6015 22.6571 22.0238L23.454 19.1018C23.6266 18.4577 23.3012 17.7803 22.6836 17.528L19.4961 16.1998C18.9515 15.974 18.3273 16.1334 17.9554 16.585L16.6139 18.2186C14.2764 17.1162 12.3838 15.2236 11.2814 12.8861L12.9217 11.5446C13.3732 11.1727 13.5326 10.5485 13.3068 10.0039L11.9787 6.81636Z"
						fill="white"
					/>
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
			name: 'dropdownBody',
			displayName: 'Dropdown Body',
			description: 'Dropdown Body',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'searchBoxContainer',
			displayName: 'Dropdown Search Box Container',
			description: 'Dropdown Search Box Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'searchIcon',
			displayName: 'Dropdown Search Icon',
			description: 'Dropdown Search Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'searchBox',
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
