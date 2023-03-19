import React, { ChangeEvent } from 'react';
import { getTranslations } from '../components/util/getTranslations';
import { RenderContext, Translations } from '../types/common';

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
	label: string;
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
		if (hasFocusStyles) setFocus(true);
		if (focusHandler) focusHandler(event);
	};

	const handleChangeEvent = (event: React.ChangeEvent<HTMLInputElement>) => {
		setIsDirty(true);
		if (handleChange) handleChange(event);
	};

	const hasErrorMessages =
		validationMessages?.length && (value || isDirty || context.showValidationMessages);
	const validationMessagesComp = hasErrorMessages ? (
		<div className={`_validationMessages ${messageDisplay}`}>
			{validationMessages.map(msg => (
				<div key={msg}>{msg}</div>
			))}
		</div>
	) : messageDisplay === '_fixedMessages' ? (
		<div className={`_validationMessages ${messageDisplay}`}></div>
	) : null;

	const supportText =
		supportingText && !hasErrorMessages ? (
			<span className={`supportText ${readOnly ? 'disabled' : ''}`}>{supportingText}</span>
		) : null;

	return (
		<div className="commonInputBox">
			{noFloat && (
				<label
					style={computedStyles.noFloatLabel ?? {}}
					htmlFor={id}
					className={`noFloatTextBoxLabel ${readOnly ? 'disabled' : ''}${
						value?.length ? `hasText` : ``
					}`}
				>
					{getTranslations(label, translations)}
				</label>
			)}
			<div
				style={computedStyles.textBoxContainer ?? {}}
				className={`textBoxDiv ${hasErrorMessages ? 'error' : ''} ${
					focus && !value?.length ? 'focussed' : ''
				} ${value?.length && !readOnly ? 'hasText' : ''} ${
					readOnly && !hasErrorMessages ? 'disabled' : ''
				}`}
			>
				{leftIcon && (
					<i style={computedStyles.leftIcon ?? {}} className={`leftIcon ${leftIcon}`} />
				)}
				<div className={`inputContainer`}>
					<input
						style={computedStyles.inputBox ?? {}}
						className={`textbox ${valueType === 'NUMBER' ? 'remove-spin-button' : ''}`}
						type={
							isPassword && !showPassword
								? 'password'
								: valueType
								? valueType
								: 'text'
						}
						value={value}
						onChange={event => handleChangeEvent(event)}
						placeholder={getTranslations(placeholder, translations)}
						onFocus={handleFocusEvent}
						onBlur={event => handleBlurEvent(event)}
						onKeyUp={keyUpHandler}
						name={id}
						id={id}
						disabled={readOnly}
					/>
					{!noFloat && (
						<label
							style={computedStyles.floatingLabel ?? {}}
							htmlFor={id}
							className={`textBoxLabel ${readOnly ? 'disabled' : ''}${
								value?.length ? `hasText` : ``
							}`}
						>
							{getTranslations(label, translations)}
						</label>
					)}
				</div>
				{rightIcon && !isPassword && (
					<i
						style={computedStyles.rightIcon ?? {}}
						className={`rightIcon ${rightIcon}`}
					/>
				)}
				{isPassword && !readOnly && (
					<i
						style={computedStyles.passwordIcon ?? {}}
						className={`passwordIcon rightIcon ${
							showPassword ? `fa fa-regular fa-eye` : `fa fa-regular fa-eye-slash`
						}`}
						onClick={() => setShowPassowrd(!showPassword)}
					/>
				)}
				{hasErrorMessages ? (
					<i
						style={computedStyles.errorText ?? {}}
						className={`errorIcon rightIcon ${
							value?.length ? `hasText` : ``
						} fa fa-solid fa-circle-exclamation`}
					/>
				) : value?.length && !rightIcon && !readOnly && !isPassword ? (
					<i
						style={computedStyles.supportText ?? {}}
						onClick={clearContentHandler}
						className="clearText rightIcon fa fa-regular fa-circle-xmark fa-fw"
					/>
				) : null}
			</div>
			{validationMessagesComp}
			{supportText}
		</div>
	);
}

export default CommonInputText;
