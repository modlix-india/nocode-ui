import React, { ChangeEvent } from 'react';
import { getTranslations } from '../components/util/getTranslations';
import { ComponentDefinition, RenderContext, Translations } from '../types/common';
import { SubHelperComponent } from '../components/SubHelperComponent';
import { HelperComponent } from '../components/HelperComponent';

type CommonInputType = {
	styles?: any;
	focusHandler?: (event: React.FocusEvent<HTMLInputElement>) => void;
	blurHandler?: (event: React.FocusEvent<HTMLInputElement>) => void;
	keyUpHandler?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
	clearContentHandler?: () => void;
	id: string;
	noFloat?: boolean;
	readOnly: boolean;
	value: string;
	label?: string;
	translations: Translations;
	leftIcon?: any;
	rightIcon?: any;
	valueType?: any;
	isPassword?: any;
	placeholder?: any;
	handleChange?: (event: ChangeEvent<HTMLInputElement>) => void;
	hasFocusStyles?: boolean;
	validationMessages?: Array<string>;
	context: RenderContext;
	supportingText?: string;
	messageDisplay?: string;
	hideClearContentIcon?: boolean;
	inputRef?: React.RefObject<HTMLInputElement>;
	autoComplete?: string;
	definition: ComponentDefinition;
	autoFocus?: boolean;
	hasValidationCheck?: boolean;
	designType: string;
	colorScheme: string;
	cssPrefix: string;
	children?: React.ReactNode;
	onMouseLeave?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
	updDownHandler?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
};

function CommonInputText(props: CommonInputType) {
	const {
		styles: computedStyles = {},
		id,
		noFloat,
		readOnly,
		value,
		label,
		translations,
		leftIcon,
		rightIcon,
		valueType,
		isPassword,
		placeholder,
		handleChange,
		hasFocusStyles,
		focusHandler,
		blurHandler,
		keyUpHandler,
		clearContentHandler,
		validationMessages,
		supportingText,
		context,
		messageDisplay = '_floatingMessages',
		hideClearContentIcon,
		inputRef,
		autoComplete,
		definition,
		autoFocus = false,
		hasValidationCheck = false,
		designType,
		colorScheme,
		cssPrefix,
		children,
		onMouseLeave,
		updDownHandler,
	} = props;
	const [focus, setFocus] = React.useState(false);
	const [showPassword, setShowPassowrd] = React.useState(false);
	const [isDirty, setIsDirty] = React.useState(false);
	const handleBlurEvent = (event: React.FocusEvent<HTMLInputElement>) => {
		setFocus(false);
		setIsDirty(true);
		if (blurHandler) blurHandler(event);
	};
	const handleFocusEvent = (event: React.FocusEvent<HTMLInputElement>) => {
		setFocus(true);
		if (focusHandler) focusHandler(event);
	};

	const handleChangeEvent = (event: React.ChangeEvent<HTMLInputElement>) => {
		setIsDirty(true);
		if (handleChange) handleChange(event);
	};

	const hasErrorMessages =
		validationMessages?.length && (value || isDirty || context.showValidationMessages);

	let validationsOrSupportText = undefined;
	if (hasErrorMessages)
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

	if (!validationsOrSupportText && supportingText && !hasErrorMessages)
		validationsOrSupportText = (
			<span
				style={computedStyles.supportText ?? {}}
				className={`_supportText ${readOnly ? 'disabled' : ''}`}
			>
				<SubHelperComponent definition={definition} subComponentName="supportText" />
				{supportingText}
			</span>
		);

	let inputStyle = computedStyles.inputBox ?? {};
	if (!handleChange) inputStyle = { ...inputStyle, caretColor: 'transparent' };

	return (
		<div
			className={`${cssPrefix} ${
				focus || value?.length ? '_isActive' : ''
			} ${designType} ${colorScheme} ${leftIcon ? '_hasLeftIcon' : ''} ${
				value?.length ? '_hasValue' : ''
			} ${hasErrorMessages ? '_hasError' : ''}`}
			style={computedStyles.comp ?? {}}
			onMouseLeave={onMouseLeave}
			onKeyUp={updDownHandler}
		>
			<HelperComponent definition={definition} />
			{leftIcon ? (
				<i style={computedStyles.leftIcon ?? {}} className={`_leftIcon ${leftIcon}`}>
					<SubHelperComponent
						definition={definition}
						subComponentName="leftIcon"
					></SubHelperComponent>
				</i>
			) : undefined}
			<input
				style={inputStyle}
				className={`_inputBox ${noFloat ? '' : 'float'} ${
					valueType === 'NUMBER' ? 'remove-spin-button' : ''
				}`}
				type={isPassword && !showPassword ? 'password' : valueType ? valueType : 'text'}
				value={value}
				onChange={event => handleChangeEvent(event)}
				placeholder={getTranslations(placeholder, translations)}
				onFocus={handleFocusEvent}
				onBlur={event => handleBlurEvent(event)}
				onKeyUp={keyUpHandler}
				name={id}
				id={id}
				disabled={readOnly}
				ref={inputRef}
				autoFocus={autoFocus}
				autoComplete={autoComplete}
			/>
			{!hideClearContentIcon && value?.length && !readOnly && !isPassword ? (
				<i
					style={computedStyles.rightIcon ?? {}}
					onClick={clearContentHandler}
					className="_clearText _rightIcon fa fa-regular fa-circle-xmark fa-fw"
				>
					<SubHelperComponent definition={definition} subComponentName="rightIcon" />
				</i>
			) : undefined}
			{rightIcon ? (
				<i style={computedStyles.rightIcon ?? {}} className={`_rightIcon ${rightIcon}`}>
					<SubHelperComponent
						definition={definition}
						subComponentName="rightIcon"
					></SubHelperComponent>
				</i>
			) : undefined}
			{isPassword && !readOnly ? (
				<i
					style={computedStyles.rightIcon ?? {}}
					className={`_passwordIcon _rightIcon ${
						showPassword ? `fa fa-regular fa-eye` : `fa fa-regular fa-eye-slash`
					}`}
					onClick={() => setShowPassowrd(!showPassword)}
				>
					<SubHelperComponent definition={definition} subComponentName="rightIcon" />
				</i>
			) : undefined}
			{hasErrorMessages ? (
				<i
					style={computedStyles.rightIcon ?? {}}
					className={`_errorIcon _rightIcon ${
						value?.length ? `hasText` : ``
					} fa fa-solid fa-circle-exclamation`}
				>
					<SubHelperComponent definition={definition} subComponentName="rightIcon" />
				</i>
			) : undefined}
			{!hasErrorMessages && hasValidationCheck && isDirty ? (
				<i
					style={computedStyles.rightIcon ?? {}}
					className={`_successIcon _rightIcon ${
						value?.length ? `hasText` : ``
					} fa fa-solid fa-circle-check`}
				>
					<SubHelperComponent definition={definition} subComponentName="rightIcon" />
				</i>
			) : undefined}
			<label
				style={computedStyles.label ?? {}}
				htmlFor={id}
				className={`_label ${noFloat || value?.length ? '_noFloat' : ''} ${
					readOnly ? 'disabled' : ''
				}${value?.length ? `hasText` : ``}`}
			>
				<SubHelperComponent
					definition={definition}
					subComponentName="label"
				></SubHelperComponent>
				{getTranslations(label, translations)}
			</label>
			{validationsOrSupportText}
			{children}
		</div>
	);
}

export default CommonInputText;
