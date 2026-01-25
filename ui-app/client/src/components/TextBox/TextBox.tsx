import { isNullValue } from '@fincity/kirun-js';
import React, { useCallback, useEffect, useState } from 'react';
import CommonInputText from '../../commonComponents/CommonInputText';
import { STORE_PATH_FUNCTION_EXECUTION } from '../../constants';
import {
	addListener,
	addListenerAndCallImmediately,
	getDataFromPath,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
	UrlDetailsExtractor,
} from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { validate } from '../../util/validationProcessor';
import { IconHelper } from '../util/IconHelper';
import { findPropertyDefinitions } from '../util/lazyStylePropertyUtil';
import { runEvent } from '../util/runEvent';
import useDefinition from '../util/useDefinition';
import { flattenUUID } from '../util/uuid';
import { propertiesDefinition, stylePropertiesDefinition } from './textBoxProperties';
import TextBoxStyle from './TextBoxStyle';
import { styleDefaults, stylePropertiesForTheme } from './textBoxStyleProperties';
import { makeTempPath } from '../../context/TempStore';

const REGEX_NUMBER = /^(?![.,])[0-9.,]+$/;

interface mapType {
	[key: string]: any;
}

function TextBox(props: Readonly<ComponentProps>) {
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
	const urlExtractor = UrlDetailsExtractor.getForContext(context.pageName);
	const {
		properties: {
			updateStoreImmediately: upStoreImm,
			removeKeyWhenEmpty,
			valueType,
			emptyValue,
			supportingText,
			readOnly,
			defaultValue,
			rightIcon,
			leftIcon,
			label,
			noFloat,
			numberType,
			isPassword,
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
			showNumberSpinners,
			hideClearButton,
			maxChars,
			onFocus,
			onBlur,
			onLeftIconClick,
			onRightIconClick,
			showMandatoryAsterisk,
			numberFormat,
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
	const [value, setValue] = React.useState(defaultValue ?? '');

	let bindingPathPath = bindingPath
		? getPathFromLocation(bindingPath, locationHistory, pageExtractor)
		: undefined;
	const originalBindingPathPath = bindingPathPath;

	const editOn = designType === '_editOnReq';

	if (editOn && bindingPathPath) {
		bindingPathPath = makeTempPath(bindingPathPath, context.pageName);
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
				if (valueType === 'number' && numberFormat) {
					const formatter = new Intl.NumberFormat(
						numberFormat.toLowerCase() === 'system' ? navigator.language : numberFormat,
						{ style: 'decimal' },
					);
					value = numberType === 'DECIMAL' ? parseFloat(value) : parseInt(value);
					setValue(formatter.format(value));
				} else {
					setValue(value);
				}
			},
			originalBindingPathPath,
		);
	}, [originalBindingPathPath, valueType, numberFormat, numberType]);

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

	const spinnerPath4 = onLeftIconClick
		? `${STORE_PATH_FUNCTION_EXECUTION}.${props.context.pageName}.${flattenUUID(
				onLeftIconClick,
			)}.isRunning`
		: undefined;

	const [isLoading, setIsLoading] = useState(
		(getDataFromPath(spinnerPath1, props.locationHistory, pageExtractor) ||
			getDataFromPath(spinnerPath2, props.locationHistory, pageExtractor) ||
			getDataFromPath(spinnerPath3, props.locationHistory, pageExtractor) ||
			getDataFromPath(spinnerPath4, props.locationHistory, pageExtractor)) ??
			false,
	);

	useEffect(() => {
		let paths = [];
		if (spinnerPath1) paths.push(spinnerPath1);
		if (spinnerPath2) paths.push(spinnerPath2);
		if (spinnerPath3) paths.push(spinnerPath3);
		if (spinnerPath4) paths.push(spinnerPath4);

		if (!paths.length) return;
		return addListener(props.context.pageName, (_, value) => setIsLoading(value), ...paths);
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
	const onLeftIconEvent = onLeftIconClick
		? props.pageDefinition.eventFunctions?.[onLeftIconClick]
		: undefined;
	const onRightIconEvent = onRightIconClick
		? props.pageDefinition.eventFunctions?.[onRightIconClick]
		: undefined;

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

	const handleBlur = (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		let temp = value === '' && emptyValue ? mapValue[emptyValue] : value;
		if (valueType === 'number') {
			if (temp === mapValue[emptyValue]) {
				setValue(mapValue[emptyValue]);
				return;
			}
			if (numberFormat) {
				const formatter = new Intl.NumberFormat(
					numberFormat.toLowerCase() === 'system' ? navigator.language : numberFormat,
					{ style: 'decimal' },
				);
				const commaDot = formatter.format(1234.56) === '1,234.56';
				temp = temp?.toString() ?? '';
				const tempNumber = commaDot
					? temp.replace(/,/g, '')
					: temp.replace(/\./g, '').replace(/,/g, '.');
				temp = numberType === 'DECIMAL' ? parseFloat(tempNumber) : parseInt(tempNumber);
			} else {
				const tempNumber =
					value !== ''
						? numberType === 'DECIMAL'
							? parseFloat(value)
							: parseInt(value)
						: temp;
				temp = isNaN(tempNumber) ? temp : tempNumber;
			}
		}
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

	const handleInputFocus = () => {
		setFocus(true);
		callFocusEvent();
	};

	const handleTextChange = (text: string) => {
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

	const handleNumberChange = (text: string) => {
		if (removeKeyWhenEmpty && text === '' && bindingPathPath) {
			setData(bindingPathPath, undefined, context?.pageName, true);
			callChangeEvent();
			return;
		}

		let temp = text === '' && emptyValue ? mapValue[emptyValue] : text;

		let tempNumber;
		if (temp === mapValue[emptyValue]) {
			setValue(mapValue[emptyValue]);
		}
		if (numberFormat) {
			if (!REGEX_NUMBER.test(temp)) return;

			const formatter = new Intl.NumberFormat(
				numberFormat.toLowerCase() === 'system' ? navigator.language : numberFormat,
				{ style: 'decimal' },
			);
			const commaDot = formatter.format(1234.56) === '1,234.56';
			temp = temp?.toString();
			tempNumber = commaDot
				? temp.replace(/,/g, '')
				: temp.replace(/\./g, '').replace(/,/g, '.');
			tempNumber = numberType === 'DECIMAL' ? parseFloat(tempNumber) : parseInt(tempNumber);
			temp = formatter.format(tempNumber);
			if (text[text.length - 1] === ',' || text[text.length - 1] === '.')
				temp += text[text.length - 1];
			if (updateStoreImmediately && bindingPathPath) {
				if (text[text.length - 1] === ',' || text[text.length - 1] === '.') {
					setValue(temp);
				} else {
					setData(bindingPathPath, tempNumber, context?.pageName);
					callChangeEvent();
				}
			}
		} else {
			tempNumber = numberType === 'DECIMAL' ? parseFloat(temp) : parseInt(temp);
			temp = !isNaN(tempNumber) ? tempNumber : temp;
			if (updateStoreImmediately && bindingPathPath) {
				setData(bindingPathPath, temp, context?.pageName);
				callChangeEvent();
			}
		}

		if (!updateStoreImmediately) setValue(!isNaN(tempNumber) ? temp?.toString() : '');
	};

	const handleChange = async (
		event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		if (valueType === 'text') handleTextChange(event.target.value);
		else handleNumberChange(event.target.value);
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
	const clickEvent = onEnter ? props.pageDefinition.eventFunctions?.[onEnter] : undefined;

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

	const handleLeftIcon = onLeftIconEvent
		? async () =>
				await runEvent(
					onLeftIconEvent,
					onLeftIconClick,
					props.context.pageName,
					props.locationHistory,
					props.pageDefinition,
				)
		: undefined;

	const handleRightIcon = onRightIconEvent
		? async () => {
				await runEvent(
					onRightIconEvent,
					onRightIconClick,
					props.context.pageName,
					props.locationHistory,
					props.pageDefinition,
				);
			}
		: undefined;

	const finKey: string = 't_' + key;

	let style = undefined;
	if (valueType === 'number' && !showNumberSpinners) {
		style = (
			<style>{`.comp.compTextBox #${finKey}::-webkit-inner-spin-button, .comp.compTextBox #${finKey}::-webkit-outer-spin-button {-webkit-appearance: none;margin: 0;}`}</style>
		);
	}

	return (
		<>
			{style}
			<CommonInputText
				cssPrefix="comp compTextBox"
				id={finKey}
				noFloat={noFloat}
				readOnly={readOnly}
				value={value}
				label={editOn ? '' : label}
				translations={translations}
				leftIcon={leftIcon}
				rightIcon={rightIcon}
				valueType={numberFormat ? 'text' : valueType}
				isPassword={isPassword}
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
				maxChars={maxChars}
				handleLeftIcon={handleLeftIcon}
				handleRightIcon={handleRightIcon}
				showMandatoryAsterisk={
					showMandatoryAsterisk &&
					(validation ?? []).find(
						(e: any) => e.type === undefined || e.type === 'MANDATORY',
					)
						? true
						: false
				}
				showEditRequest={editOn}
				editRequestIcon={editRequestIcon}
				editConfirmIcon={editConfirmIcon}
				editCancelIcon={editCancelIcon}
				onEditRequest={(editMode, cancel) => {
					if (editMode || !originalBindingPathPath) return;
					if (cancel) {
						setValue(
							getDataFromPath(
								originalBindingPathPath,
								locationHistory,
								pageExtractor,
							),
						);
					} else {
						setData(originalBindingPathPath, value, context?.pageName);
						callChangeEvent(true);
						callBlurEvent(true);
					}
				}}
			/>
		</>
	);
}

const { designType, colorScheme } = findPropertyDefinitions(
	propertiesDefinition,
	'designType',
	'colorScheme',
);

const component: Component = {
	order: 5,
	name: 'TextBox',
	displayName: 'Text Box',
	description: 'TextBox component',
	component: TextBox,
	styleComponent: TextBoxStyle,
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
		type: 'TextBox',
		name: 'TextBox',
		properties: {
			label: { value: 'TextBox' },
		},
	},
	sections: [{ name: 'Text Box', pageName: 'textBox' }],
		propertiesForTheme: [designType, colorScheme],
	stylePropertiesForTheme: stylePropertiesForTheme,
	externalStylePropsForThemeJson: true,
};

export default component;
