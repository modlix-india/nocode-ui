import { isNullValue } from '@fincity/kirun-js';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import CommonInputText from '../../commonComponents/CommonInputText';
import {
	addListenerAndCallImmediately,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
	UrlDetailsExtractor,
} from '../../context/StoreContext';
import { ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { validate } from '../../util/validationProcessor';
import { SubHelperComponent } from '../HelperComponents/SubHelperComponent';
import { runEvent } from '../util/runEvent';
import useDefinition from '../util/useDefinition';
import { flattenUUID } from '../util/uuid';
import { propertiesDefinition, stylePropertiesDefinition } from './colorPickerProperties';
import { CommonColorPicker } from '../../commonComponents/CommonColorPicker';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import {
	HEXRGBHSL_any,
	HSLA_RGBA_TO_HSLAString,
	HSLA_RGBA_TO_RGBAString,
	RGBA,
} from '../util/colorUtil';

function getEmptyValue(emptyValue: string | undefined): string | null | undefined {
	if (emptyValue === 'ENMPTYSTRING') return '';
	if (emptyValue === 'NULL') return null;
	return undefined;
}

function convertToFormat(
	color: string | undefined | null,
	format: string | undefined,
): string | undefined | null {
	if (!format || !color) return color;

	if (format === 'rgba') {
		if (color.startsWith('rgb')) return color;
		return HSLA_RGBA_TO_RGBAString(HEXRGBHSL_any(color, 'rgba') as RGBA);
	} else if (format === 'hsla') {
		if (color.startsWith('hsl')) return color;
		return HSLA_RGBA_TO_HSLAString(HEXRGBHSL_any(color, 'hsla') as RGBA);
	} else {
		if (color.startsWith('#')) return color;
		return HEXRGBHSL_any(color, 'hex') as string;
	}
}

export default function ColorPickerComponent(props: Readonly<ComponentProps>) {
	const [showDropdown, setShowDropdown] = useState(false);
	const [focus, setFocus] = useState(false);
	const [validationMessages, setValidationMessages] = React.useState<Array<string>>([]);
	const inputRef = useRef<HTMLInputElement>(null);
	const pageExtractor = PageStoreExtractor.getForContext(props.context.pageName);
	const urlExtractor = UrlDetailsExtractor.getForContext(props.context.pageName);
	const {
		definition: { bindingPath },
		locationHistory,
		context,
		definition,
		pageDefinition: { translations },
	} = props;
	const {
		key,
		properties: {
			onChange,
			placeholder,
			readOnly,
			label,
			closeOnMouseLeave,
			noFloat,
			validation,
			clearSearchTextOnClose,
			designType,
			colorScheme,
			leftIcon,
			rightIcon,
			rightIconOpen,
			showMandatoryAsterisk,
			updateStoreImmediately,
			removeKeyWhenEmpty,
			emptyValue,
			autoFocus,
			autoComplete,
			noAlpha,
			format,
			supportingText,
		} = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
		urlExtractor,
	);
	const changeEvent = onChange ? props.pageDefinition.eventFunctions?.[onChange] : undefined;
	const bindingPathPath = getPathFromLocation(bindingPath!, locationHistory, pageExtractor);

	const [color, setColor] = useState<string | undefined | null>(undefined);

	useEffect(() => {
		if (!bindingPathPath) return;
		addListenerAndCallImmediately(
			props.context.pageName,
			(_, value) => {
				setColor(value);
			},
			bindingPathPath,
		);
	}, [bindingPathPath]);

	const [mouseIsInside, setMouseIsInside] = useState(false);

	const handleClose = useCallback(() => {
		if (!showDropdown) return;
		setShowDropdown(false);
		setFocus(false);
		inputRef?.current?.blur();
	}, [showDropdown, setShowDropdown, setFocus, inputRef, clearSearchTextOnClose]);

	const computedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{ focus, disabled: readOnly },
		stylePropertiesWithPseudoStates,
	);

	useEffect(() => {
		if (!validation?.length) return;

		const msgs = validate(
			props.definition,
			props.pageDefinition,
			validation,
			color,
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
	}, [color, validation]);

	useEffect(() => {
		if (!showDropdown || closeOnMouseLeave || mouseIsInside) return;
		window.addEventListener('mousedown', handleClose);
		return () => window.removeEventListener('mousedown', handleClose);
	}, [showDropdown, color, handleClose, closeOnMouseLeave, mouseIsInside]);

	let dropdownBody = undefined;

	if (showDropdown) {
		dropdownBody = (
			<div
				className="_dropdownContainer _colorPickerBody"
				style={computedStyles.dropDownContainer ?? {}}
				onMouseLeave={() => {
					if (closeOnMouseLeave) handleClose();
					else setMouseIsInside(false);
				}}
			>
				<SubHelperComponent
					definition={props.definition}
					subComponentName="dropDownContainer"
				/>
				<CommonColorPicker
					color={color ?? undefined}
					showAlpha={!noAlpha}
					showGradient={false}
					variableSelection={false}
					onChange={vobj => {
						const v = vobj.value;
						if (readOnly || !bindingPathPath) return;
						setData(bindingPathPath, convertToFormat(v, format), context.pageName);
						if (!changeEvent) return;
						(async () =>
							await runEvent(
								changeEvent,
								key,
								context.pageName,
								locationHistory,
								props.pageDefinition,
							))();
					}}
				/>
			</div>
		);
	}

	if (designType.startsWith('_box')) {
		return (
			<div
				className={`comp compColorPicker ${designType} ${colorScheme}`}
				onClick={() => setShowDropdown(true)}
				style={{ ...(computedStyles.comp ?? {}), background: color }}
				onMouseEnter={() => {
					setMouseIsInside(true);
				}}
				onMouseLeave={() => {
					setMouseIsInside(false);
					if (closeOnMouseLeave) handleClose();
				}}
			>
				<HelperComponent definition={props.definition} context={props.context} />
				{dropdownBody}
			</div>
		);
	}

	return (
		<CommonInputText
			id={key}
			cssPrefix="comp compColorPicker"
			noFloat={noFloat}
			readOnly={readOnly}
			value={color ?? ''}
			handleChange={e => {
				if (readOnly || !bindingPathPath) return;
				let v: string | undefined | null = e.target.value;
				if (v?.trim() === '' || isNullValue(v))
					v = removeKeyWhenEmpty ? undefined : getEmptyValue(emptyValue);

				if (!updateStoreImmediately) {
					setColor(v);
				} else {
					setData(bindingPathPath, convertToFormat(v, format), context.pageName);
					if (!changeEvent) return;
					(async () =>
						await runEvent(
							changeEvent,
							key,
							context.pageName,
							locationHistory,
							props.pageDefinition,
						))();
				}
			}}
			label={label}
			translations={translations}
			rightIcon={
				showDropdown
					? (rightIconOpen ?? 'fa-solid fa-angle-up')
					: (rightIcon ?? 'fa-solid fa-angle-down')
			}
			valueType="text"
			isPassword={false}
			placeholder={placeholder}
			hasFocusStyles={stylePropertiesWithPseudoStates?.focus}
			validationMessages={validationMessages}
			context={context}
			hideClearContentIcon={true}
			blurHandler={async () => {
				if (mouseIsInside) return;

				if (!readOnly && bindingPathPath && !updateStoreImmediately) {
					let v: string | undefined | null = color;
					if (v?.trim() === '' || isNullValue(v))
						v = removeKeyWhenEmpty ? undefined : getEmptyValue(emptyValue);
					setData(bindingPathPath, convertToFormat(v, format), context.pageName);
					if (changeEvent) {
						(async () =>
							await runEvent(
								changeEvent,
								key,
								context.pageName,
								locationHistory,
								props.pageDefinition,
							))();
					}
				}

				setFocus(false);
				setShowDropdown(false);
			}}
			focusHandler={() => {
				setFocus(true);
				setShowDropdown(true);
			}}
			styles={computedStyles}
			inputRef={inputRef}
			definition={props.definition}
			designType={designType}
			colorScheme={colorScheme}
			leftIcon={leftIcon}
			showDropdown={showDropdown}
			supportingText={supportingText}
			onMouseEnter={() => {
				setMouseIsInside(true);
			}}
			onMouseLeave={() => {
				setMouseIsInside(false);
				if (closeOnMouseLeave) handleClose();
			}}
			showMandatoryAsterisk={
				(validation ?? []).find(
					(e: any) => e.type === undefined || e.type === 'MANDATORY',
				) && showMandatoryAsterisk
					? true
					: false
			}
			autoFocus={autoFocus}
			autoComplete={autoComplete}
		>
			{dropdownBody}
		</CommonInputText>
	);
}
