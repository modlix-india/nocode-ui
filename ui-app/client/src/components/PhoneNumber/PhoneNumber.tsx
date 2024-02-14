import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
	addListener,
	addListenerAndCallImmediately,
	getDataFromPath,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
} from '../../context/StoreContext';
import { ComponentENUM, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
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
			isSearchable,
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
		console.log('key up handler');
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

	const handleBlur = (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		console.log('hadleblur value:', event.target.value);
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
	};

	const handleNumberChange = async (
		event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		let text = event.target.value;
		if (removeKeyWhenEmpty && text === '' && bindingPathPath) {
			setData(bindingPathPath, undefined, context?.pageName, true);
			callChangeEvent();
			return;
		}
		let temp = text === '' && emptyValue ? mapValue[emptyValue] : selectedCode + text;
		if (updateStoreImmediately && bindingPathPath) {
			setData(bindingPathPath, temp, context?.pageName);
			callChangeEvent();
		}
		console.log('selectedCode', selectedCode);

		if (!updateStoreImmediately) setValue(selectedCode + text);
	};

	const SORTED_COUNTRY_LIST = useMemo<DropdownOptions>(() => {
		return COUNTRY_LIST.sort((a, b) => {
			if (orderBy === 'countrycode') return a.C <= b.C ? -1 : 1;
			else if (orderBy === 'dialcode') return parseInt(a.D.slice(1)) - parseInt(b.D.slice(1));
			else return a.N <= b.N ? -1 : 1;
		});
	}, [orderBy]);

	const finKey: string = 't_' + key;
	const [countryList, setCountryList] = useState<DropdownOptions>(SORTED_COUNTRY_LIST);
	const [selectedCode, setSelectedCode] = useState<string>(SORTED_COUNTRY_LIST[0].D);
	const [phoneNumber, setPhoneNumber] = useState<string>('');

	useEffect(() => {
		if (Array.isArray(countries)) {
			let tempList = SORTED_COUNTRY_LIST.filter(e => countries.includes(e.C));
			setCountryList(tempList);
		} else if (Array.isArray(topCountries)) {
			let tempList = [
				...SORTED_COUNTRY_LIST.filter(e => topCountries.includes(e.C)),
				...SORTED_COUNTRY_LIST.filter(e => !topCountries.includes(e.C)),
			];
			setCountryList(tempList);
		} else {
			setCountryList(SORTED_COUNTRY_LIST);
		}
	}, [countries, topCountries]);

	useEffect(() => {
		let dc = '';
		if (value !== '' && value.startsWith('+')) {
			// console.log('value', value);
			dc = value.length > 5 ? value.substring(0, 5) : value;
			while (dc.length > 0) {
				// console.log(dc);
				if (!countryList.find(e => e.D === dc)) {
					dc = dc.slice(0, dc.length - 1);
				} else break;
			}
			// console.log('dc', dc);
		}
		if (dc) setSelectedCode(dc);
		else setSelectedCode(countryList[0].D);
		setPhoneNumber(value.slice(dc.length));
	}, [value, countryList]);

	// console.log('selectedCode', selectedCode);
	// console.log('countryList', countryList);
	const leftChildren = (
		<>
			<Dropdown
				value={selectedCode}
				onChange={(v: string) => {
					setSelectedCode(v);
				}}
				options={countryList}
			/>
			<span className="_dialCodeLabel">{selectedCode}</span>
		</>
	);

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
			dialCodeLength={selectedCode.length ?? 0}
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
					<rect width="24" height="24" fill="#D9D9D9" fillOpacity="0.1" />
					<path
						d="M15.832 7.73047V10.2393H15.5859C15.4401 9.66048 15.2783 9.24577 15.1006 8.99512C14.9229 8.73991 14.679 8.53711 14.3691 8.38672C14.196 8.30469 13.8929 8.26367 13.46 8.26367H12.7695V15.4141C12.7695 15.888 12.7946 16.1842 12.8447 16.3027C12.8994 16.4212 13.002 16.526 13.1523 16.6172C13.3073 16.7038 13.5169 16.7471 13.7812 16.7471H14.0889V17H9.23535V16.7471H9.54297C9.81185 16.7471 10.0283 16.6992 10.1924 16.6035C10.3109 16.5397 10.4043 16.4303 10.4727 16.2754C10.5228 16.166 10.5479 15.8789 10.5479 15.4141V8.26367H9.87793C9.25358 8.26367 8.80013 8.39583 8.51758 8.66016C8.12109 9.0293 7.87044 9.55566 7.76562 10.2393H7.50586V7.73047H15.832Z"
						fill="currentColor"
					/>
					<mask id="path-3-inside-1_433_993" fill="white">
						<rect x="1" y="1" width="22" height="22" rx="1" />
					</mask>
					<rect
						x="1"
						y="1"
						width="22"
						height="22"
						rx="1"
						stroke="currentColor"
						strokeWidth="3"
						mask="url(#path-3-inside-1_433_993)"
						fill="transparent"
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
