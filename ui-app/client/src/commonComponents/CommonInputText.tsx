import React, { ChangeEvent } from 'react';
import { getTranslations } from '../components/util/getTranslations';
import { ComponentDefinition, RenderContext, Translations } from '../types/common';
import { SubHelperComponent } from '../components/SubHelperComponent';

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
	) : messageDisplay === '_fixedMessages' ? (
		<div className={`_validationMessages ${messageDisplay}`}></div>
	) : null;

	const supportText =
		supportingText && !hasErrorMessages ? (
			<span
				style={computedStyles.supportText ?? {}}
				className={`supportText ${readOnly ? 'disabled' : ''}`}
			>
				<SubHelperComponent definition={definition} subComponentName="supportText" />
				{supportingText}
			</span>
		) : null;

	return (
		<div className="commonInputBox" style={computedStyles.inputBox ?? {}}>
			{noFloat && label && (
				<label
					style={computedStyles.noFloatLabel ?? {}}
					htmlFor={id}
					className={`noFloatTextBoxLabel ${readOnly ? 'disabled' : ''}${
						value?.length ? `hasText` : ``
					}`}
				>
					<SubHelperComponent
						definition={definition}
						subComponentName="noFloatLabel"
					></SubHelperComponent>
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
				<SubHelperComponent
					definition={definition}
					subComponentName="textBoxContainer"
				></SubHelperComponent>
				{leftIcon && (
					<i style={computedStyles.leftIcon ?? {}} className={`leftIcon ${leftIcon}`}>
						<SubHelperComponent
							definition={definition}
							subComponentName="leftIcon"
						></SubHelperComponent>
					</i>
				)}

				<div className={`inputContainer`}>
					<input
						style={computedStyles.inputBox ?? {}}
						className={`textbox ${noFloat ? '' : 'float'} ${
							valueType === 'NUMBER' ? 'remove-spin-button' : ''
						}`}
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
						ref={inputRef}
						autoComplete={autoComplete}
					/>
					<SubHelperComponent
						style={computedStyles.inputBox ?? {}}
						className={`textbox ${noFloat ? '' : 'float'} ${
							valueType === 'NUMBER' ? 'remove-spin-button' : ''
						}`}
						definition={definition}
						subComponentName="inputBox"
					></SubHelperComponent>
					{!noFloat && (
						<label
							style={computedStyles.floatingLabel ?? {}}
							htmlFor={id}
							className={`textBoxLabel ${readOnly ? 'disabled' : ''}${
								value?.length ? `hasText` : ``
							}`}
						>
							<SubHelperComponent
								definition={definition}
								subComponentName="floatingLabel"
							></SubHelperComponent>
							{getTranslations(label, translations)}
						</label>
					)}
				</div>

				{rightIcon && !isPassword && (
					<i style={computedStyles.rightIcon ?? {}} className={`rightIcon ${rightIcon}`}>
						<SubHelperComponent
							definition={definition}
							subComponentName="rightIcon"
						></SubHelperComponent>
					</i>
				)}
				{isPassword && !readOnly && (
					<i
						style={computedStyles.rightIcon ?? {}}
						className={`passwordIcon rightIcon ${
							showPassword ? `fa fa-regular fa-eye` : `fa fa-regular fa-eye-slash`
						}`}
						onClick={() => setShowPassowrd(!showPassword)}
					>
						<SubHelperComponent definition={definition} subComponentName="rightIcon" />{' '}
					</i>
				)}
				{hasErrorMessages ? (
					<i
						style={computedStyles.rightIcon ?? {}}
						className={`errorIcon rightIcon ${
							value?.length ? `hasText` : ``
						} fa fa-solid fa-circle-exclamation`}
					>
						<SubHelperComponent definition={definition} subComponentName="rightIcon" />
					</i>
				) : !hideClearContentIcon && value?.length && !readOnly && !isPassword ? (
					<i
						style={computedStyles.rightIcon ?? {}}
						onClick={clearContentHandler}
						className="clearText rightIcon fa fa-regular fa-circle-xmark fa-fw"
					>
						<SubHelperComponent definition={definition} subComponentName="rightIcon" />
					</i>
				) : null}
			</div>

			{validationMessagesComp}
			{supportText}
		</div>
	);
}

export default CommonInputText;
