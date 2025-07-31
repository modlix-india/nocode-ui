import React, { ChangeEvent, KeyboardEvent, useRef, useState } from 'react';
import { getTranslations } from '../components/util/getTranslations';
import { ComponentDefinition, RenderContext, Translations } from '../types/common';
import { SubHelperComponent } from '../components/HelperComponents/SubHelperComponent';
import { HelperComponent } from '../components/HelperComponents/HelperComponent';

type CommonInputType = {
	styles?: any;
	focusHandler?: (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
	blurHandler?: (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
	keyUpHandler?: (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
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
	handleChange?: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
	hasFocusStyles?: boolean;
	validationMessages?: Array<string>;
	context: RenderContext;
	supportingText?: string;
	messageDisplay?: string;
	hideClearContentIcon?: boolean;
	inputRef?: React.RefObject<any>;
	autoComplete?: string;
	definition: ComponentDefinition;
	autoFocus?: boolean;
	hasValidationCheck?: boolean;
	designType: string;
	colorScheme: string;
	cssPrefix: string;
	children?: React.ReactNode;
	onMouseLeave?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
	onMouseEnter?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
	updDownHandler?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
	inputType?: string;
	maxChars?: number;
	showDropdown?: boolean;
	leftChildren?: React.ReactNode;
	handleLeftIcon?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
	handleRightIcon?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
	showMandatoryAsterisk?: boolean;
	rows?: number;
	title?: string;
	showEditRequest?: boolean;
	editRequestIcon?: any;
	editConfirmIcon?: any;
	editCancelIcon?: any;
	onEditRequest?: (editMode: boolean, canceled: boolean) => void;
	editOnValueStoredInParent?: boolean;
};

function CommonInputText(props: CommonInputType) {
	const {
		styles: computedStyles = {},
		id,
		noFloat,
		readOnly,
		value = '',
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
		inputType = 'Text',
		maxChars,
		showDropdown,
		leftChildren,
		handleLeftIcon,
		handleRightIcon,
		showMandatoryAsterisk,
		onMouseEnter,
		rows,
		title,
		showEditRequest,
		editRequestIcon,
		editConfirmIcon,
		editCancelIcon,
		onEditRequest,
		editOnValueStoredInParent,
	} = props;
	const [focus, setFocus] = React.useState(false);
	const [showPassword, setShowPassowrd] = React.useState(false);
	const [isDirty, setIsDirty] = React.useState(false);
	const handleBlurEvent = (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		setFocus(false);
		setIsDirty(true);
		if (blurHandler) blurHandler(event);
	};
	const handleFocusEvent = (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		setFocus(true);
		if (focusHandler) focusHandler(event);
	};

	const handleChangeEvent = (
		event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
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

	const keyDownEvent = maxChars
		? (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
				if (e.currentTarget.value.length < maxChars) return;
				if (e.metaKey || e.shiftKey || e.ctrlKey || e.key.length > 2) return;
				e.preventDefault();
			}
		: undefined;

	const [editModeOriginal, setEditModeOriginal] = useState(!showEditRequest);
	const setEditMode = (editMode: boolean, canceled: boolean) => {
		setEditModeOriginal(editMode);
		onEditRequest?.(editMode, canceled);
	};
	const [editModeValue, setEditModeValue] = useState(value);
	const disabled = readOnly || (showEditRequest && !editModeOriginal);

	const internalRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

	const inputControl =
		inputType === 'Text' ? (
			<input
				style={inputStyle}
				className={`_inputBox ${noFloat ? '' : 'float'} ${
					valueType === 'NUMBER' ? 'remove-spin-button' : ''
				}`}
				type={isPassword && !showPassword ? 'password' : valueType ? valueType : 'text'}
				value={
					showEditRequest && editModeOriginal && !editOnValueStoredInParent
						? editModeValue
						: value
				}
				onChange={
					showEditRequest && editModeOriginal
						? event => setEditModeValue(event.target.value)
						: handleChangeEvent
				}
				placeholder={getTranslations(placeholder, translations)}
				onFocus={handleFocusEvent}
				onBlur={showEditRequest ? undefined : event => handleBlurEvent(event)}
				onKeyUp={
					showEditRequest
						? event => {
								if (event.key === 'Enter') {
									setEditMode(false, false);
									handleChangeEvent({
										target: {
											value: editModeValue,
										},
									} as any);
								} else if (event.key === 'Escape') {
									setEditMode(false, true);
									setEditModeValue(value);
								}
							}
						: keyUpHandler
				}
				name={id}
				id={id}
				disabled={disabled}
				ref={inputRef ?? internalRef}
				autoFocus={autoFocus}
				autoComplete={autoComplete}
				onKeyDown={keyDownEvent}
			/>
		) : (
			<textarea
				style={inputStyle}
				className={`_inputBox ${noFloat ? '' : 'float'} ${
					valueType === 'NUMBER' ? 'remove-spin-button' : ''
				}`}
				value={
					showEditRequest && editModeOriginal && !editOnValueStoredInParent
						? editModeValue
						: value
				}
				onChange={
					showEditRequest && editModeOriginal
						? event => setEditModeValue(event.target.value)
						: handleChangeEvent
				}
				placeholder={getTranslations(placeholder, translations)}
				onFocus={handleFocusEvent}
				onBlur={showEditRequest ? undefined : event => handleBlurEvent(event)}
				onKeyUp={
					showEditRequest
						? event => {
								if (event.key === 'Escape') {
									setEditMode(false, true);
									setEditModeValue(value);
								}
							}
						: keyUpHandler
				}
				name={id}
				id={id}
				disabled={disabled}
				ref={inputRef ?? internalRef}
				autoFocus={autoFocus}
				autoComplete={autoComplete}
				onKeyDown={keyDownEvent}
				rows={rows}
			/>
		);

	let controlButtons = undefined;

	if (showEditRequest && !readOnly) {
		let internalButtons = undefined;
		if (editModeOriginal) {
			internalButtons = (
				<>
					<i
						style={computedStyles.editConfirmIcon ?? {}}
						className={`_editConfirmIcon _leftIcon ${editConfirmIcon} ${handleLeftIcon ? '_pointer' : ''}`}
						onClick={() => {
							setEditMode(false, false);
							handleChangeEvent?.({
								target: {
									value: editModeValue,
								},
							} as any);
						}}
					>
						<SubHelperComponent
							definition={definition}
							subComponentName="editConfirmIcon"
						/>
					</i>
					<i
						style={computedStyles.editCancelIcon ?? {}}
						className={`_editCancelIcon _leftIcon ${editCancelIcon} ${handleLeftIcon ? '_pointer' : ''}`}
						onClick={() => {
							setEditMode(false, true);
							setEditModeValue(value);
						}}
					>
						<SubHelperComponent
							definition={definition}
							subComponentName="editCancelIcon"
						/>
					</i>
				</>
			);
		} else {
			internalButtons = (
				<i
					style={computedStyles.editRequestIcon ?? {}}
					className={`_editRequestIcon _leftIcon ${editRequestIcon} ${handleLeftIcon ? '_pointer' : ''}`}
					onClick={() => {
						setEditMode(true, false);
						setEditModeValue(value);
						setTimeout(() => {
							inputRef?.current?.focus();
							internalRef.current?.focus();
						}, 100);
					}}
				>
					<SubHelperComponent
						definition={definition}
						subComponentName="editRequestIcon"
					/>
				</i>
			);
		}
		controlButtons = (
			<div
				className="_controlButtons"
				style={computedStyles.editConfirmCancelContainer ?? {}}
			>
				{internalButtons}
			</div>
		);
	}

	return (
		<div
			className={`${cssPrefix} ${
				focus || showDropdown ? '_isActive' : ''
			} ${designType} ${colorScheme} ${leftIcon ? '_hasLeftIcon' : ''} ${
				!focus && value?.toString()?.length ? '_hasValue' : ''
			} ${!hasErrorMessages && hasValidationCheck && isDirty ? '_validationSuccess' : ''} ${
				hasErrorMessages ? '_hasError' : ''
			} ${readOnly ? '_readOnly' : ''} ${showEditRequest && editModeOriginal ? '_editMode' : ''}`}
			style={computedStyles.comp ?? {}}
			onMouseLeave={onMouseLeave}
			onMouseEnter={onMouseEnter}
			onKeyUp={updDownHandler}
			title={title ?? value}
		>
			<HelperComponent context={props.context} definition={definition} />
			{leftChildren}
			{leftIcon ? (
				<i
					style={computedStyles.leftIcon ?? {}}
					className={`_leftIcon ${leftIcon} ${handleLeftIcon ? '_pointer' : ''}`}
					onClick={handleLeftIcon}
				>
					<SubHelperComponent
						definition={definition}
						subComponentName="leftIcon"
					></SubHelperComponent>
				</i>
			) : undefined}
			{inputControl}
			{!hideClearContentIcon && value?.toString()?.length && !readOnly && !isPassword ? (
				<i
					style={computedStyles.rightIcon ?? {}}
					onClick={clearContentHandler}
					className="_clearText _rightIcon fa fa-regular fa-circle-xmark fa-fw"
				>
					<SubHelperComponent definition={definition} subComponentName="rightIcon" />
				</i>
			) : undefined}
			{rightIcon ? (
				<i
					style={computedStyles.rightIcon ?? {}}
					className={`_rightIcon ${rightIcon} ${handleRightIcon ? '_pointer' : ''}`}
					onClick={handleRightIcon}
				>
					<SubHelperComponent
						definition={definition}
						subComponentName="rightIcon"
					></SubHelperComponent>
				</i>
			) : undefined}
			{controlButtons}
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
						value?.toString()?.length ? `hasText` : ``
					} fa fa-solid fa-circle-exclamation`}
				>
					<SubHelperComponent definition={definition} subComponentName="rightIcon" />
				</i>
			) : undefined}
			{!hasErrorMessages && hasValidationCheck && isDirty ? (
				<i
					style={computedStyles.rightIcon ?? {}}
					className={`_successIcon _rightIcon ${
						value?.toString()?.length ? `hasText` : ``
					} fa fa-solid fa-circle-check`}
				>
					<SubHelperComponent definition={definition} subComponentName="rightIcon" />
				</i>
			) : undefined}
			<label
				style={computedStyles.label ?? {}}
				htmlFor={id}
				className={`_label ${noFloat || value?.toString()?.length ? '_noFloat' : ''} ${
					readOnly ? 'disabled' : ''
				}${value?.toString()?.length ? `hasText` : ``}`}
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
					{showMandatoryAsterisk ? '*' : ''}
				</span>
			</label>
			{validationsOrSupportText}
			{children}
		</div>
	);
}

export default CommonInputText;
