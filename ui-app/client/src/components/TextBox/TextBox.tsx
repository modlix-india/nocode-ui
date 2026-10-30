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
import { useComponentShortcut } from '../../shortcuts/useComponentShortcut';
import { runEvent } from '../util/runEvent';
import useDefinition from '../util/useDefinition';
import { flattenUUID } from '../util/uuid';
import { propertiesDefinition, stylePropertiesDefinition } from './textBoxProperties';
import TextBoxStyle from './TextBoxStyle';
import { styleDefaults, stylePropertiesForTheme } from './textBoxStyleProperties';
import { makeTempPath } from '../../context/TempStore';

// A whole number in plain form. A DECIMAL may lead with the point (".5") and, from a
// type="number" box, carry an exponent ("1e5"). Anything else is still being typed: "-", "12.",
// "-0.".
const REGEX_DECIMAL = /^-?(\d+|\d*\.\d+)(e[-+]?\d+)?$/i;
const REGEX_INTEGER = /^-?\d+$/;

// No debounced write is waiting. A plain undefined cannot say that: it is a value to store
// (emptyValue UNDEFINED).
const NO_PENDING = Symbol('noPendingWrite');

function numberFormatter(numberFormat: string): Intl.NumberFormat {
	const locale = numberFormat.toLowerCase() === 'system' ? navigator.language : numberFormat;
	try {
		return new Intl.NumberFormat(locale, { style: 'decimal' });
	} catch (e) {
		// A locale the browser does not know: format the way the browser would by default.
		return new Intl.NumberFormat(undefined, { style: 'decimal' });
	}
}

// Text typed into a box with a numberFormat ("-1,234.50" in en-US, "-1.234,50" in de-DE) in
// plain form ("-1234.50"), or undefined when it holds a character the locale does not use there.
// The minus, group and decimal characters come from the formatter itself, so locales that group
// with a space or write a different minus work too. A separator must follow a digit, and an
// INTEGER takes no decimal separator.
function toPlainNumber(
	text: string,
	formatter: Intl.NumberFormat,
	integer: boolean,
): string | undefined {
	const parts = formatter.formatToParts(-12345678.5);
	const minus = parts.find(e => e.type === 'minusSign')?.value ?? '-';
	const group = parts.find(e => e.type === 'group')?.value;
	const decimal = parts.find(e => e.type === 'decimal')?.value ?? '.';
	const spaceGroup = group !== undefined && /\s/.test(group);
	let plain = '';
	for (let i = 0; i < text.length; i++) {
		const c = text[i];
		const afterDigit = i > 0 && text[i - 1] >= '0' && text[i - 1] <= '9';
		if (c >= '0' && c <= '9') plain += c;
		else if (i === 0 && (c === '-' || c === minus)) plain += '-';
		else if (c === decimal && !integer && afterDigit && !plain.includes('.')) plain += '.';
		else if (afterDigit && (c === group || (spaceGroup && /\s/.test(c)))) continue;
		else return undefined;
	}
	return plain;
}

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
			debounceTime,
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
			analyticsLabel,
			shortcutKey,
			shortcutScope,
			shortcutPriority,
			shortcutAction,
			onShortcut,
			shortcutGroup,
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
	const [value, setValueState] = React.useState(defaultValue ?? '');

	// What the box holds and whether it has focus, for the store listener: a value it gets while
	// the user types must not overwrite the text (see storedMatchesText).
	const textRef = React.useRef<any>(value);
	const focusRef = React.useRef(false);
	const setValue = (v: any) => {
		textRef.current = v;
		setValueState(v);
	};

	const integer = numberType !== 'DECIMAL';
	const formatter = React.useMemo(
		() => (valueType === 'number' && numberFormat ? numberFormatter(numberFormat) : undefined),
		[valueType, numberFormat],
	);
	const emptyStoreValue = () => (emptyValue ? mapValue[emptyValue] : '');

	// The box's text in plain number form ("-1234.50"); undefined when it is not number text.
	const plainNumberText = (text: any): string | undefined => {
		const t = isNullValue(text) ? '' : String(text).trim();
		return formatter ? toPlainNumber(t, formatter, integer) : t;
	};

	// The number the text stands for, read leniently ("12." is 12); NaN when there is none.
	const textToNumber = (text: any): number => {
		const plain = plainNumberText(text);
		if (!plain) return NaN;
		const n = integer ? parseInt(plain) : parseFloat(plain);
		return n === 0 ? 0 : n; // -0 is 0
	};

	// The number a COMPLETE text stands for; undefined when the text is empty or still being
	// typed ("-", "12.", "-0.").
	const completeNumber = (text: any): number | undefined => {
		const plain = plainNumberText(text);
		if (!plain || !(integer ? REGEX_INTEGER : REGEX_DECIMAL).test(plain)) return undefined;
		return textToNumber(text);
	};

	const displayNumber = (n: number) => (formatter ? formatter.format(n) : n.toString());

	const displayFromStore = (v: any) => {
		if (isNullValue(v)) return '';
		// As a string: React compares a type="number" box's text to a NUMBER value loosely
		// ("12.30" == 12.3), so a stored 12.3 would leave "12.30" on screen after blur.
		if (!formatter && valueType === 'number' && typeof v === 'number') return v.toString();
		if (!formatter || v === '') return v;
		return formatter.format(integer ? parseInt(v) : parseFloat(v));
	};

	// True when the stored value is what the text already says, which is the store echoing the
	// number just typed. Writing it back would rewrite the text: "12.30" to "12.3" before the next
	// digit, "0.0" to "0", a lone "-" or "12." wiped.
	const storedMatchesText = (stored: any): boolean => {
		const n = textToNumber(textRef.current);
		if (isNaN(n)) return isNullValue(stored) || stored === '' || stored === emptyStoreValue();
		return !isNullValue(stored) && stored !== '' && Number(stored) === n;
	};

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
				if (valueType === 'number' && focusRef.current && storedMatchesText(value)) return;
				setValue(displayFromStore(value));
			},
			originalBindingPathPath,
		);
	}, [originalBindingPathPath, valueType, numberFormat, numberType, emptyValue]);

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

	// Also re-validate when the page asks for the messages: a rule's condition can read other store
	// values (walkInForm's Page.isInvalidOtp) that change while the field's value does not.
	useEffect(() => {
		if (!validation?.length) return;

		// A number box validates the number as it used to show while typing ("12.3" for "12.30",
		// "1,234" for "1234" with an en-US numberFormat), not the raw text.
		let validationValue = value;
		if (valueType === 'number') {
			const n = textToNumber(value);
			validationValue = isNaN(n) ? '' : displayNumber(n);
		}

		const msgs = validate(
			props.definition,
			props.pageDefinition,
			validation,
			validationValue,
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
	}, [value, validation, context.showValidationMessages]);
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

	const debounceTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
	const pendingDebouncedValueRef = React.useRef<any>(NO_PENDING);

	React.useEffect(() => {
		return () => {
			if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
		};
	}, []);

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

	const flushDebouncedChange = useCallback(() => {
		if (debounceTimerRef.current) {
			clearTimeout(debounceTimerRef.current);
			debounceTimerRef.current = null;
		}
		if (pendingDebouncedValueRef.current === NO_PENDING || !bindingPathPath) return;
		setData(bindingPathPath, pendingDebouncedValueRef.current, context?.pageName);
		pendingDebouncedValueRef.current = NO_PENDING;
		callChangeEvent();
	}, [bindingPathPath, context?.pageName, callChangeEvent]);

	const cancelDebouncedChange = () => {
		if (debounceTimerRef.current) {
			clearTimeout(debounceTimerRef.current);
			debounceTimerRef.current = null;
		}
		pendingDebouncedValueRef.current = NO_PENDING;
	};

	// Stores a value typed with updateStoreImmediately, after debounceTime when there is one.
	const storeWhileTyping = (temp: any) => {
		if (!bindingPathPath) return;
		if (debounceTime && debounceTime > 0) {
			pendingDebouncedValueRef.current = temp;
			if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
			debounceTimerRef.current = setTimeout(() => {
				debounceTimerRef.current = null;
				flushDebouncedChange();
			}, debounceTime);
		} else {
			setData(bindingPathPath, temp, context?.pageName);
			callChangeEvent();
		}
	};

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
		// handleKeyUp runs this on Enter while the box keeps its focus.
		if (event?.type !== 'keyup') focusRef.current = false;
		let temp = value === '' && emptyValue ? mapValue[emptyValue] : value;
		let isEmpty = event?.target.value === '';
		if (valueType === 'number') {
			// Typing never rewrote the text; now it shows the number it stands for.
			const n = textToNumber(value);
			isEmpty = isNaN(n);
			temp = isEmpty ? emptyStoreValue() : n;
			setValue(typeof temp === 'number' ? displayNumber(temp) : '');
			// A type="number" box keeps a lone "-" on screen while reporting ''. It is not a
			// number and nothing was stored for it: clear it.
			const input = event?.target as HTMLInputElement | undefined;
			if (isEmpty && input?.validity?.badInput) input.value = '';
		}
		if (!updateStoreImmediately && bindingPathPath) {
			if (isEmpty && removeKeyWhenEmpty) {
				setData(bindingPathPath, undefined, context?.pageName, true);
			} else {
				setData(bindingPathPath, temp, context?.pageName);
			}
			callChangeEvent();
		} else if (updateStoreImmediately && valueType === 'number' && bindingPathPath) {
			// The store has the last complete number typed, but the text can have moved on to a
			// state that was never stored (a lone "-"). Store what the box shows now when it
			// differs, in place of any write still waiting for its debounce.
			cancelDebouncedChange();
			const stored = getDataFromPath(bindingPathPath, locationHistory, pageExtractor);
			if (isEmpty && removeKeyWhenEmpty) {
				if (stored !== undefined) {
					setData(bindingPathPath, undefined, context?.pageName, true);
					callChangeEvent();
				}
			} else if (stored !== temp) {
				setData(bindingPathPath, temp, context?.pageName);
				callChangeEvent();
			}
		} else if (updateStoreImmediately && debounceTimerRef.current) {
			flushDebouncedChange();
		}
		callBlurEvent();
		setFocus(false);
	};

	const handleInputFocus = () => {
		focusRef.current = true;
		setFocus(true);
		callFocusEvent();
	};

	const handleTextChange = (text: string) => {
		if (removeKeyWhenEmpty && text === '' && bindingPathPath) {
			cancelDebouncedChange();
			setData(bindingPathPath, undefined, context?.pageName, true);
			callChangeEvent();
			return;
		}
		let temp = text === '' && emptyValue ? mapValue[emptyValue] : text;
		if (updateStoreImmediately && bindingPathPath) {
			if (debounceTime && debounceTime > 0) setValue(text);
			storeWhileTyping(temp);
		}
		if (!updateStoreImmediately) {
			setValue(text);
			// A change while the field is not focused is the browser filling it (autofill, a
			// password manager). No blur follows to store it, so a sign-in form would post
			// without the password: store it now.
			if (!focus && bindingPathPath) {
				setData(bindingPathPath, temp, context?.pageName);
				callChangeEvent();
			}
		}
	};

	// The box keeps the text exactly as typed while it has focus ("12.30", "0.0", "-", "12.");
	// the store gets the number once the text is a complete one, and handleBlur shows the number.
	const handleNumberChange = (
		event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		const text = event.target.value;

		// A type="number" box reports '' with validity.badInput while its text is not a number
		// yet ("-", "1e", "12." in some browsers). That is the user typing, not clearing: mirror
		// the '' so React does not put the previous text back, and leave the store alone.
		if (text === '' && (event.target as HTMLInputElement).validity?.badInput) {
			setValue('');
			return;
		}

		if (text === '') {
			setValue('');
			if (removeKeyWhenEmpty && bindingPathPath) {
				cancelDebouncedChange();
				setData(bindingPathPath, undefined, context?.pageName, true);
				callChangeEvent();
			} else if (updateStoreImmediately && bindingPathPath) {
				storeWhileTyping(emptyStoreValue());
			}
			return;
		}

		const plain = plainNumberText(text);
		// A character the numberFormat does not take, or a decimal point in an INTEGER (pasted;
		// the keys are refused in integerKeyDown): leaving the value as it was makes React put
		// the previous text back.
		if (plain === undefined || (integer && !formatter && /[.,e]/i.test(plain))) return;

		setValue(text);

		// Still being typed ("-", "12.", "-0."): the store keeps the last complete number.
		const n = completeNumber(text);
		if (n === undefined || !updateStoreImmediately) return;
		storeWhileTyping(n);
	};

	// A type="number" box takes '.', ',' and 'e' and can report '' for them, too late to refuse
	// there. An INTEGER box refuses those keys before they land.
	const integerKeyDown =
		valueType === 'number' && integer && !formatter
			? (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
					if (e.ctrlKey || e.metaKey || e.altKey) return;
					if (['.', ',', 'e', 'E'].includes(e.key)) e.preventDefault();
				}
			: undefined;

	const handleChange = async (
		event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		if (valueType === 'text') handleTextChange(event.target.value);
		else handleNumberChange(event);
	};

	const handleClickClose = async () => {
		let temp = mapValue[emptyValue];
		// A write still waiting for its debounce would put the cleared value back.
		cancelDebouncedChange();
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
		} else if (debounceTimerRef.current) {
			flushDebouncedChange();
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

	const inputRef = React.useRef<HTMLInputElement>(null);

	const finKey: string = 't_' + key;

	const {
		aria: shortcutAria,
		titleSuffix: shortcutTooltip,
		hint: shortcutHint,
	} = useComponentShortcut({
		props,
		componentKey: key,
		shortcutKey,
		shortcutScope,
		shortcutPriority,
		shortcutAction,
		onShortcut,
		shortcutGroup,
		label,
		fallbackLabel: placeholder,
		disabled: readOnly,
		elementRef: inputRef,
	});

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
				keyDownHandler={integerKeyDown}
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
				analyticsLabel={analyticsLabel}
				inputRef={inputRef}
				ariaKeyShortcuts={shortcutAria}
				shortcutTooltip={shortcutTooltip}
				shortcutHint={shortcutHint?.(computedStyles.shortcutHint)}
				onEditRequest={(editMode, cancel) => {
					if (editMode || !originalBindingPathPath) return;
					if (cancel) {
						setValue(
							displayFromStore(
								getDataFromPath(
									originalBindingPathPath,
									locationHistory,
									pageExtractor,
								),
							),
						);
					} else if (valueType === 'number') {
						// Enter confirms without a blur, so the text can still be as typed.
						const n = textToNumber(value);
						setData(
							originalBindingPathPath,
							isNaN(n) ? emptyStoreValue() : n,
							context?.pageName,
						);
						callChangeEvent(true);
						callBlurEvent(true);
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
