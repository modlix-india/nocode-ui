import { isNullValue } from '@fincity/kirun-js';
import React, { useCallback, useEffect } from 'react';
import {
	PageStoreExtractor,
	addListenerAndCallImmediately,
	getDataFromPath,
	getPathFromLocation,
	setData,
	UrlDetailsExtractor,
} from '../../context/StoreContext';
import {
	ComponentDefinition,
	ComponentProps,
	LocationHistory,
} from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { validate } from '../../util/validationProcessor';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { SubHelperComponent } from '../HelperComponents/SubHelperComponent';
import { makePropertiesObject } from '../util/make';
import useDefinition from '../util/useDefinition';
import { flattenUUID } from '../util/uuid';
import { propertiesDefinition, stylePropertiesDefinition } from './otpProperties';
import { STORE_PATH_FUNCTION_EXECUTION } from '../../constants';
import { runEvent } from '../util/runEvent';
import { getTranslations } from '../util/getTranslations';

export default function Otp(props: Readonly<ComponentProps>) {
	const [focusBoxIndex, setFocusBoxIndex] = React.useState(0);
	const [validationMessages, setValidationMessages] = React.useState<Array<string>>([]);
	const [showValue, setShowValue] = React.useState(false);
	const [isVisibilityButtonPressed, setIsVisibilityButtonPressed] = React.useState(false);

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
			readOnly,
			validation,
			autoFocus,
			messageDisplay,
			designType,
			colorScheme,
			otpLength,
			valueType,
			supportingText,
			maskValue,
			maskStyle,
			showVisibilityToggle,
			hideIcon,
			showIcon,
			temporaryVisibility,
			label,
			noFloat,
			showMandatoryAsterisk,
			placeholder,
			autoComplete,
			hideClearButton,
			onEnter,
			onChange,
			onBlur,
			onFocus,
			onClear,
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
			pageExtractor.getPageName(),
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

	// Event handlers setup
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

	const [isLoading, setIsLoading] = React.useState(
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
		return addListenerAndCallImmediately(
			pageExtractor.getPageName(),
			(_, value) => setIsLoading(value),
			...paths,
		);
	}, []);

	const changeEvent = onChange ? props.pageDefinition.eventFunctions?.[onChange] : undefined;
	const blurEvent = onBlur ? props.pageDefinition.eventFunctions?.[onBlur] : undefined;
	const focusEvent = onFocus ? props.pageDefinition.eventFunctions?.[onFocus] : undefined;

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

	const handleVisibilityToggleMouseDown = () => {
		if (temporaryVisibility) {
			setIsVisibilityButtonPressed(true);
			setShowValue(true);
		} else {
			setShowValue(!showValue);
		}
	};

	const handleVisibilityToggleMouseUp = () => {
		if (temporaryVisibility && isVisibilityButtonPressed) {
			setIsVisibilityButtonPressed(false);
			setShowValue(false);
		}
	};

	const handleVisibilityToggleMouseLeave = () => {
		if (temporaryVisibility && isVisibilityButtonPressed) {
			setIsVisibilityButtonPressed(false);
			setShowValue(false);
		}
	};

	const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
		e.preventDefault();
		const pastedData = e.clipboardData.getData('text');
		if (!isValidInputValue(pastedData, valueType)) return;
		let newValueArray = value?.split('');
		for (let i = 0; i < Math.min(pastedData.length, otpLength - index); i++) {
			newValueArray[index + i] = pastedData[i];
		}
		const newValue = newValueArray.join('');
		if (bindingPathPath !== undefined) {
			setData(bindingPathPath, newValue, context?.pageName);
			callChangeEvent();
		} else {
			setValue(newValue);
		}
		if (index + pastedData.length < otpLength) {
			const target = e.target as HTMLInputElement;
			if (target.nextSibling instanceof HTMLInputElement)
				(target.nextSibling as HTMLInputElement).focus();
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: any) => {
		setIsDirty(true);

		let target = e.target;
		let inputValue = target.value;
		if (isValidInputValue(inputValue, valueType)) {
			let newValueArray = value?.split('');
			newValueArray[index] = inputValue === '' ? ' ' : inputValue;
			const allCleared = newValueArray.every(e => e === ' ');
			const valueSet = allCleared ? '' : newValueArray.join('');
			if (bindingPathPath !== undefined) {
				setData(bindingPathPath, valueSet, context?.pageName);
				callChangeEvent();
			} else {
				setValue(newValueArray.join(''));
			}
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
		callBlurEvent();
	};

	const handleFocus = (index: number) => {
		setFocusBoxIndex(index);
		callFocusEvent();
	};

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
			} else if (e.key === 'Backspace') {
				let newValueArray = value?.split('');
				const currentValue = newValueArray[index];
				const isEmpty = currentValue === ' ';

				if (!isEmpty) {
					newValueArray[index] = ' ';
					const allEmpty = newValueArray.every(char => char === ' ');
					const newValue = allEmpty ? '' : newValueArray.join('');

					if (bindingPathPath !== undefined) {
						setData(bindingPathPath, newValue, context?.pageName);
						callChangeEvent();
					} else {
						setValue(newValue);
					}
				} else if (index > 0) {
					e.preventDefault();
					if (target.previousSibling instanceof HTMLInputElement) {
						newValueArray[index - 1] = ' ';
						const allEmpty = newValueArray.every(char => char === ' ');
						const newValue = allEmpty ? '' : newValueArray.join('');

						if (bindingPathPath !== undefined) {
							setData(bindingPathPath, newValue, context?.pageName);
							callChangeEvent();
						} else {
							setValue(newValue);
						}

						target.previousSibling.focus();
					}
				}
			} else if (e.key === 'Enter' && onEnter) {
				const clickEvent = props.pageDefinition.eventFunctions?.[onEnter];
				if (!clickEvent || isLoading) return;
				(async () => {
					await runEvent(
						clickEvent,
						onEnter,
						props.context.pageName,
						props.locationHistory,
						props.pageDefinition,
					);
				})();
			}
		};
	};

	const handleClear = async () => {
		const emptyValue = Array.from({ length: otpLength }, () => ' ').join('');
		if (bindingPathPath !== undefined) {
			setData(bindingPathPath, '', context?.pageName);
			callChangeEvent();
		} else {
			setValue(emptyValue);
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
					focusBoxIndex != 0 ? '_supportTextActive' : ''
				}`}
			>
				<SubHelperComponent definition={definition} subComponentName="supportText" />
				{supportingText}
			</span>
		);
	}

	let activeStyles = computedStyles.activeInputBox ?? {};
	let hasValue = value.trim().length > 0;
	let showClearButton = !hideClearButton && hasValue && !readOnly;

	return (
		<div
			className={`comp compOtp ${designType} ${colorScheme} ${
				focusBoxIndex !== -1 ? '_isActive' : ''
			} ${readOnly ? '_disabled' : ''} ${hasErrorMessages ? '_hasError' : ''} ${
				hasValue ? '_hasValue' : ''
			}`}
			style={computedStyles.comp ?? {}}
		>
			<HelperComponent context={props.context} definition={definition} />
			{label && (
				<label
					style={computedStyles.label ?? {}}
					className={`_label ${noFloat || hasValue ? '_noFloat' : ''} ${
						readOnly ? 'disabled' : ''
					}${hasValue ? `hasText` : ``}`}
				>
					<SubHelperComponent
						definition={definition}
						subComponentName="label"
					></SubHelperComponent>
					{getTranslations(label, translations)}
					<span style={computedStyles.asterisk ?? {}} className="_asterisk">
						<SubHelperComponent
							definition={definition}
							subComponentName="asterisk"
						></SubHelperComponent>
						{showMandatoryAsterisk &&
						validation?.find((e: any) => e.type === 'MANDATORY')
							? '*'
							: ''}
					</span>
				</label>
			)}

			{Array.from({ length: otpLength }).map((_, index) => (
				<input
					autoFocus={autoFocus === true && index === 0}
					type={valueType == 'NUMERIC' ? 'tel' : 'text'}
					name="otp"
					inputMode={valueType == 'NUMERIC' ? 'numeric' : undefined}
					maxLength={1}
					key={index}
					disabled={readOnly}
					value={
						index < value.length
							? value[index] == ' '
								? ''
								: maskValue && !showValue
									? maskStyle === 'DOT'
										? '•'
										: '*'
									: value[index]
							: ''
					}
					placeholder={
						placeholder
							? index < (getTranslations(placeholder, translations)?.length ?? 0)
								? getTranslations(placeholder, translations)?.charAt(index)
								: ''
							: ''
					}
					autoComplete={autoComplete}
					onChange={e => handleChange(e, index)}
					onFocus={() => handleFocus(index)}
					onBlur={handleBlur}
					onKeyDown={handleKeyDown(index)}
					onPaste={e => handlePaste(e, index)}
					style={focusBoxIndex === index ? activeStyles : inputStyle}
					className={`_inputBox ${
						focusBoxIndex === index && focusBoxIndex != -1 ? '_isActive' : ''
					}${
						!(focusBoxIndex === index) && value[index]?.trim()?.length
							? '_hasValue'
							: ''
					}`}
				/>
			))}

			{maskValue && showVisibilityToggle && !readOnly && (
				<i
					style={computedStyles.visibilityToggle ?? {}}
					onMouseDown={handleVisibilityToggleMouseDown}
					onMouseUp={handleVisibilityToggleMouseUp}
					onMouseLeave={handleVisibilityToggleMouseLeave}
					className={`_visibilityToggle ${showValue ? showIcon : hideIcon}`}
				>
					<SubHelperComponent
						definition={definition}
						subComponentName="visibilityToggle"
					/>
				</i>
			)}

			{showClearButton && (
				<i
					style={computedStyles.rightIcon ?? {}}
					onClick={handleClear}
					className="_clearText fa fa-regular fa-circle-xmark fa-fw"
				>
					<SubHelperComponent definition={definition} subComponentName="rightIcon" />
				</i>
			)}

			{validationsOrSupportText}
		</div>
	);
}

export function MANDATORY(
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
