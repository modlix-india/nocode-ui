import React from 'react';
import { getTranslations } from '../components/util/getTranslations';
import { PageDefinition, RenderContext } from '../types/common';

type CommonInputType = {
	isReadOnly?: boolean;
	styles?: any;
	focusHandler?: () => void;
	blurHandler?: () => void;
	keyUpHandler?: () => void;
	showPasswordHandler?: () => void;
	clearContentHandler?: () => void;
	id: string;
	noFloat: boolean;
	readOnly: boolean;
	value: string;
	label: string;
	pageDefinition: PageDefinition;
	focus: boolean;
	leftIcon: any;
	rightIcon: any;
	updateStoreImmediately: any;
	removeKeyWhenEmpty: any;
	valueType: any;
	emptyValue: any;
	supportingText: any;
	defaultValue: any;
	numberType: any;
	isPassword: any;
	onEnter: any;
	validation: any;
	placeholder: any;
	showPassword: boolean;
	handleChange?: (event: any) => void;
	hasFocusStyles: boolean;
	validationMessages: Array<string>;
	isDirty: boolean;
	context: RenderContext;
};

function CommonInputText(props: CommonInputType) {
	const {
		styles: computedStyles,
		id,
		noFloat,
		readOnly,
		value,
		label,
		pageDefinition,
		focus,
		leftIcon,
		rightIcon,
		valueType,
		isPassword,
		placeholder,
		showPassword,
		handleChange,
		hasFocusStyles,
		focusHandler,
		blurHandler,
		keyUpHandler,
		showPasswordHandler,
		clearContentHandler,
		validationMessages,
		isDirty,
		context,
	} = props;
	const { translations } = pageDefinition;
	const hasErrorMessages =
		validationMessages?.length && (value || isDirty || context.showValidationMessages);
	const validationMessagesComp = hasErrorMessages ? (
		<div className="_validationMessages">
			{validationMessages.map(msg => (
				<div key={msg}>{msg}</div>
			))}
		</div>
	) : undefined;
	return (
		<>
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
				} ${
					leftIcon || rightIcon
						? rightIcon
							? 'textBoxwithRightIconContainer'
							: 'textBoxwithIconContainer'
						: 'textBoxContainer'
				}`}
			>
				{leftIcon && (
					<i style={computedStyles.leftIcon ?? {}} className={`leftIcon ${leftIcon}`} />
				)}
				<div className={`inputContainer`}>
					<input
						style={computedStyles.inputBox ?? {}}
						className={`textbox ${valueType === 'NUMBER' ? 'remove-spin-button' : ''}`}
						type={isPassword && !showPassword ? 'password' : valueType}
						value={value}
						onChange={handleChange}
						placeholder={getTranslations(placeholder, translations)}
						onFocus={hasFocusStyles ? focusHandler : undefined}
						onBlur={blurHandler}
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
						className={`passwordIcon ${
							showPassword ? `fa fa-regular fa-eye` : `fa fa-regular fa-eye-slash`
						}`}
						onClick={showPasswordHandler}
					/>
				)}
				{hasErrorMessages ? (
					<i
						style={computedStyles.errorText ?? {}}
						className={`errorIcon ${
							value?.length ? `hasText` : ``
						} fa fa-solid fa-circle-exclamation`}
					/>
				) : value?.length && !rightIcon && !readOnly && !isPassword ? (
					<i
						style={computedStyles.supportText ?? {}}
						onClick={clearContentHandler}
						className="clearText fa fa-regular fa-circle-xmark fa-fw"
					/>
				) : null}
			</div>
			{validationMessagesComp}
		</>
	);
}

export default CommonInputText;
