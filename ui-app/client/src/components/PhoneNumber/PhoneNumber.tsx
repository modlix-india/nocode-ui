import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
	addListener,
	addListenerAndCallImmediately,
	getDataFromPath,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
	UrlDetailsExtractor,
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
import {
	styleProperties,
	styleDefaults,
	stylePropertiesForTheme,
} from './phoneNumberStyleProperties';
import { IconHelper } from '../util/IconHelper';
import { Dropdown, DropdownOption, DropdownOptions } from './components/Dropdown';
import { COUNTRY_LIST } from './components/listOfCountries';
import { findPropertyDefinitions } from '../util/lazyStylePropertyUtil';
import { makeTempPath } from '../../context/TempStore';

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
		definition: { bindingPath, bindingPath2, bindingPath3 },
		definition,
		pageDefinition: { translations },
		locationHistory,
		context,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const urlExtractor = UrlDetailsExtractor.getForContext(context.pageName);
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
			storeDialCodeWithNumber,
			editRequestIcon,
			editConfirmIcon,
			editCancelIcon,
		} = {},
		stylePropertiesWithPseudoStates,
		key,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
		urlExtractor,
	);
	const [value, setValue] = React.useState<string>('');
	const [countryCode, setCountryCode] = React.useState<string>('');

	const editOn = designType === '_editOnReq';

	let bindingPathPath = bindingPath
		? getPathFromLocation(bindingPath, locationHistory, pageExtractor)
		: undefined;

	const originalBindingPathPath = bindingPathPath;

	let bindingPathPath2 = bindingPath2
		? getPathFromLocation(bindingPath2, locationHistory, pageExtractor)
		: undefined;

	const originalBindingPathPath2 = bindingPathPath2;

	let bindingPathPath3 = bindingPath3
		? getPathFromLocation(bindingPath3, locationHistory, pageExtractor)
		: undefined;

	const originalBindingPathPath3 = bindingPathPath3;

	if (editOn) {
		bindingPathPath = bindingPathPath
			? makeTempPath(bindingPathPath, context.pageName)
			: undefined;
		bindingPathPath2 = bindingPathPath2
			? makeTempPath(bindingPathPath2, context.pageName)
			: undefined;
		bindingPathPath3 = bindingPathPath3
			? makeTempPath(bindingPathPath3, context.pageName)
			: undefined;
	}

	React.useEffect(() => {
		if (!originalBindingPathPath) return;
		return addListenerAndCallImmediately(
			props.context.pageName,
			(_, value) => {
				if (isNullValue(value)) {
					setValue('');
					return;
				}
				setValue(value);
			},
			originalBindingPathPath,
		);
	}, [originalBindingPathPath]);

	React.useEffect(() => {
		if (!originalBindingPathPath2) return;
		return addListenerAndCallImmediately(
			props.context.pageName,
			(_, value) => {
				if (isNullValue(value)) {
					setCountryCode('');
					return;
				}
				setCountryCode(value);
				const country = SORTED_COUNTRY_LIST.find(c => c.C === value);
				if (country) {
					setSelected(country);
					lastSelectedCountry.current = country;
				}
			},
			originalBindingPathPath2,
		);
	}, [originalBindingPathPath2]);

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
		return addListener(props.context.pageName, (_, value) => setIsLoading(value), ...paths);
	}, []);

	const computedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{ focus, disabled: isLoading || readOnly },
		stylePropertiesWithPseudoStates,
	);

	const changeEvent = onChange ? props.pageDefinition.eventFunctions?.[onChange] : undefined;
	const blurEvent = onBlur ? props.pageDefinition.eventFunctions?.[onBlur] : undefined;
	const focusEvent = onFocus ? props.pageDefinition.eventFunctions?.[onFocus] : undefined;
	const enterEvent = onEnter ? props.pageDefinition.eventFunctions?.[onEnter] : undefined;
	const clearEvent = onClear ? props.pageDefinition.eventFunctions?.[onClear] : undefined;

	const updateStoreImmediately = editOn ? false : upStoreImm || autoComplete === 'on';

	const callChangeEvent = useCallback(
		(force: boolean = false) => {
			if (!changeEvent || (editOn && !force)) return;
			(async () =>
				await runEvent(
					changeEvent,
					onChange,
					props.context.pageName,
					props.locationHistory,
					props.pageDefinition,
				))();
		},
		[changeEvent, editOn],
	);

	const callBlurEvent = useCallback(
		(force: boolean = false) => {
			if (!blurEvent || (editOn && !force)) return;
			(async () =>
				await runEvent(
					blurEvent,
					onBlur,
					props.context.pageName,
					props.locationHistory,
					props.pageDefinition,
				))();
		},
		[blurEvent, editOn],
	);

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
	const [editMode, setEditMode] = useState(false);
	const [editModeSelectedCountry, setEditModeSelectedCountry] =
		useState<DropdownOption>(selected);
	const VALIDATION_MSG = 'Dial code is not valid or not available in option list';

	useEffect(() => {
		let tempList = [];
		if (Array.isArray(countries) && Array.isArray(topCountries)) {
			tempList = duplicate(SORTED_COUNTRY_LIST).filter((e: DropdownOption) =>
				topCountries.includes(e.C),
			);

			if (tempList.length > 0) {
				tempList[tempList.length - 1].nextSeperator = true;
			}

			tempList = [
				...tempList,
				...duplicate(SORTED_COUNTRY_LIST).filter(
					(e: DropdownOption) => countries.includes(e.C) && !topCountries.includes(e.C),
				),
			];
		} else if (Array.isArray(topCountries)) {
			tempList = duplicate(SORTED_COUNTRY_LIST).filter((e: DropdownOption) =>
				topCountries.includes(e.C),
			);

			if (tempList.length > 0) {
				tempList[tempList.length - 1].nextSeperator = true;
			}

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

		const existingCountryCode = bindingPathPath2
			? getDataFromPath(bindingPathPath2, locationHistory, pageExtractor)
			: undefined;

		if ((isFirstRender.current || !selected) && tempList.length > 0 && !existingCountryCode) {
			let defaultCountry;

			if (tempList.length === 1) {
				defaultCountry = tempList[0];
			} else if (Array.isArray(topCountries) && topCountries.length > 0) {
				defaultCountry = tempList.find(
					(country: DropdownOption) => country.C === topCountries[0],
				);
			} else {
				defaultCountry = tempList[0];
			}

			if (defaultCountry) {
				setSelected(defaultCountry);
				lastSelectedCountry.current = defaultCountry;
				if (bindingPathPath2) {
					setData(bindingPathPath2, defaultCountry.C, context?.pageName);
				}
			}
			isFirstRender.current = false;
		}
	}, [countries, topCountries, SORTED_COUNTRY_LIST]);

	useEffect(() => {
		if (!validation?.length) return;
		let text =
			phoneNumber === '' && emptyValue
				? mapValue[emptyValue]
				: (getUnformattedNumber(phoneNumber) ?? '');
		let formattedText =
			getFormattedNumber(SORTED_COUNTRY_LIST, seperator, text, selected.D) ?? '';

		let temp = format
			? selected.D + ((storeFormatted ? seperator + formattedText : text) ?? '')
			: selected.D + text;

		const msgs = validate(
			props.definition,
			props.pageDefinition,
			validation,
			storeFormatted ? temp : text,
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
	}, [selected.D, phoneNumber, validation, storeFormatted, seperator]);

	useEffect(() => {
		let unformattedText = getUnformattedNumber(value);
		let selectedCountry = getSelectedCountry(countryList, countryMap.current, unformattedText);

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
		if (format)
			setPhoneNumber(
				getFormattedNumber(
					SORTED_COUNTRY_LIST,
					seperator,
					unformattedText.slice(dc.length),
					dc,
				),
			);
		else setPhoneNumber(unformattedText.slice(dc.length));
	}, [value, countryList, seperator]);

	const extractDCAndPhone = (text: string) => {
		let phone = text;
		let dc = getDialCode(countryList, phone);
		if (dc) {
			phone = phone.slice(dc.length);
			setValidationMessages(validationMessages.filter(e => e !== VALIDATION_MSG));
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
			setValidationMessages(validationMessages.filter(e => e !== VALIDATION_MSG));
			setData(bindingPathPath, text, context?.pageName, true);
			callChangeEvent();
		} else if (bindingPathPath) {
			setValidationMessages(validationMessages.filter(e => e !== VALIDATION_MSG));
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
					? dc +
						(storeFormatted
							? seperator +
								getFormattedNumber(SORTED_COUNTRY_LIST, seperator, phone, dc)
							: phone)
					: dc + phone;
			bindingPathPath &&
				setData(bindingPathPath, storeDialCodeWithNumber ? temp : phone, context?.pageName);
			callChangeEvent();
		} else if (!updateStoreImmediately) {
			let temp = format
				? selected.D +
					(storeFormatted
						? seperator +
							getFormattedNumber(SORTED_COUNTRY_LIST, seperator, text, selected.D)
						: text)
				: selected.D + text;
			updateBindingPathData(storeDialCodeWithNumber ? temp : text);
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

		if (text && !text.startsWith('+')) {
			const format = selected.F;
			let maxLen = 0;
			if (format && format.length > 0) {
				maxLen = format.reduce((acc: number, val: number) => acc + val, 0);
			} else if (maxChars) {
				maxLen = maxChars;
			}
			if (maxLen > 0 && text.length > maxLen) {
				text = text.substring(0, maxLen);
			}
		}
		let formattedText = getFormattedNumber(SORTED_COUNTRY_LIST, seperator, text, selected.D);

		if (!text && updateStoreImmediately) {
			if (lastSelectedCountry.current) setSelected(lastSelectedCountry.current);
			updateBindingPathData(text);
		} else if (!text && !updateStoreImmediately) {
			setPhoneNumber('');
		} else if (!text.startsWith('+') && updateStoreImmediately) {
			let temp = format
				? selected.D + (storeFormatted ? seperator + formattedText : text)
				: selected.D + text;
			updateBindingPathData(storeDialCodeWithNumber ? temp : text);
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
					? seperator +
						getFormattedNumber(SORTED_COUNTRY_LIST, seperator, phoneNumber, v.D)
					: phoneNumber
				: phoneNumber;
			const newValue = phoneNumber
				? (storeDialCodeWithNumber ? v.D : '') + formattedPhone
				: '';
			setData(bindingPathPath, newValue, context?.pageName);
		}

		if (bindingPathPath2) {
			setData(bindingPathPath2, v.C, context?.pageName);
			callChangeEvent();
		}

		if (bindingPathPath3) {
			setData(bindingPathPath3, v.D, context?.pageName);
			callChangeEvent();
		}
	};

	const leftChildren = (
		<Dropdown
			value={selected}
			onChange={handleCountryChange}
			options={countryList}
			isSearchable={isSearchable}
			readOnly={editOn ? !editMode : readOnly}
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
			label={editOn ? '' : label}
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
			hideClearContentIcon={editOn ? true : hideClearButton}
			maxChars={selected.F && selected.F.length > 0 ? undefined : maxChars}
			showDropdown={dropdownOpen}
			leftChildren={leftChildren}
			showMandatoryAsterisk={
				showMandatoryAsterisk &&
				(validation ?? []).find((e: any) => e.type === undefined || e.type === 'MANDATORY')
					? true
					: false
			}
			showEditRequest={editOn}
			editRequestIcon={editRequestIcon}
			editConfirmIcon={editConfirmIcon}
			editCancelIcon={editCancelIcon}
			onEditRequest={(editMode, canceled) => {
				setEditMode(editMode);
				if (editMode) {
					setEditModeSelectedCountry(selected);
				} else if (canceled) {
					setSelected(editModeSelectedCountry);
					let originalValue = getDataFromPath(
						originalBindingPathPath,
						locationHistory,
						pageExtractor,
					);
					let unformattedText = getUnformattedNumber(originalValue);
					let selectedCountry = getSelectedCountry(
						countryList,
						countryMap.current,
						unformattedText,
					);

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
					if (format)
						setPhoneNumber(
							getFormattedNumber(
								SORTED_COUNTRY_LIST,
								seperator,
								unformattedText.slice(dc.length),
								dc,
							),
						);
					else setPhoneNumber(unformattedText.slice(dc.length));
				} else {
					let dataChanged = false;
					if (originalBindingPathPath) {
						setData(
							originalBindingPathPath,
							getDataFromPath(bindingPathPath, locationHistory, pageExtractor),
							context?.pageName,
						);
						dataChanged = true;
					}
					if (originalBindingPathPath2) {
						setData(
							originalBindingPathPath2,
							getDataFromPath(bindingPathPath2, locationHistory, pageExtractor),
							context?.pageName,
						);
						dataChanged = true;
					}
					if (originalBindingPathPath3) {
						setData(
							originalBindingPathPath3,
							getDataFromPath(bindingPathPath3, locationHistory, pageExtractor),
							context?.pageName,
						);
						dataChanged = true;
					}
					if (dataChanged) {
						callChangeEvent(true);
						callBlurEvent(true);
					}
				}
			}}
		/>
	);
}

const { designType, colorScheme } = findPropertyDefinitions(
	propertiesDefinition,
	'designType',
	'colorScheme',
);

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
		bindingPath3: { name: 'Dail Code Binding' },
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
		{
			name: 'editRequestIcon',
			displayName: 'Edit Request Icon',
			description: 'Edit Request Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'editConfirmIcon',
			displayName: 'Edit Confirm Icon',
			description: 'Edit Confirm Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'editCancelIcon',
			displayName: 'Edit Cancel Icon',
			description: 'Edit Cancel Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'editConfirmCancelContainer',
			displayName: 'Edit Confirm Cancel Container',
			description: 'Edit Confirm Cancel Container',
			icon: 'fa-solid fa-box',
		},
	],
	propertiesForTheme: [designType, colorScheme],
	stylePropertiesForTheme: stylePropertiesForTheme,
	externalStylePropsForThemeJson: true,
};

export default component;

function getDialCode(countryList: DropdownOptions, value: string) {
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
}

function getSelectedCountry(
	countryList: DropdownOptions,
	countryMap: Map<string, DropdownOption>,
	value: string,
) {
	let dc = getDialCode(countryList, value);
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
	if (countryMap.has(dc)) return countryMap.get(dc);
	return temp[0];
}

function getUnformattedNumber(text: string | undefined) {
	if (!text) return '';
	return text.replace(/[^+\d]/g, '');
}

function getFormattedNumber(
	sortedCountryList: DropdownOptions,
	seperator: string,
	text: string,
	dc: string,
) {
	let format = sortedCountryList.find(e => e.D == dc)?.F ?? [];
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
}
