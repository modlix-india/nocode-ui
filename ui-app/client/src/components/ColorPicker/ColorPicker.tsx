import { deepEqual, isNullValue } from '@fincity/kirun-js';
import React, { ChangeEvent, UIEvent, useCallback, useEffect, useRef, useState } from 'react';
import CommonInputText from '../../commonComponents/CommonInputText';
import {
	PageStoreExtractor,
	addListenerAndCallImmediately,
	getPathFromLocation,
	setData,
} from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { validate } from '../../util/validationProcessor';
import { SubHelperComponent } from '../HelperComponents/SubHelperComponent';
import { runEvent } from '../util/runEvent';
import useDefinition from '../util/useDefinition';
import { flattenUUID } from '../util/uuid';
import ColorPickerStyle from './ColorPickerStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './colorPickerProperties';
import { styleDefaults } from './colorPickerStyleProperties';
import { IconHelper } from '../util/IconHelper';
import { CommonColorPicker } from '../../commonComponents/CommonColorPicker';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import {
	HEXRGBHSL_any,
	HSLA_RGBA_TO_HSLAString,
	HSLA_RGBA_TO_RGBAString,
	RGBA,
	RGBA_HEX,
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

function ColorPickerComponent(props: ComponentProps) {
	const [showDropdown, setShowDropdown] = useState(false);
	const [focus, setFocus] = useState(false);
	const [validationMessages, setValidationMessages] = React.useState<Array<string>>([]);
	const inputRef = useRef<HTMLInputElement>(null);
	const pageExtractor = PageStoreExtractor.getForContext(props.context.pageName);
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
		} = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);
	const changeEvent = onChange ? props.pageDefinition.eventFunctions?.[onChange] : undefined;
	const bindingPathPath = getPathFromLocation(bindingPath!, locationHistory, pageExtractor);

	const [color, setColor] = useState<string | undefined | null>(undefined);

	useEffect(() => {
		if (!bindingPathPath) return;
		addListenerAndCallImmediately(
			(_, value) => {
				setColor(value);
			},
			pageExtractor,
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
					? rightIconOpen ?? 'fa-solid fa-angle-up'
					: rightIcon ?? 'fa-solid fa-angle-down'
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

const component: Component = {
	name: 'ColorPicker',
	displayName: 'Color Picker',
	description: 'ColorPicker component',
	component: ColorPickerComponent,
	styleComponent: ColorPickerStyle,
	styleDefaults: styleDefaults,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	stylePseudoStates: ['hover', 'disabled', 'focus'],
	styleProperties: stylePropertiesDefinition,
	bindingPaths: {
		bindingPath: { name: 'Data Binding' },
	},
	defaultTemplate: {
		key: '',
		name: 'ColorPicker',
		type: 'ColorPicker',
		properties: {},
	},
	sections: [{ name: 'ColorPicker', pageName: 'colorPicker' }],
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			icon: (
				<IconHelper viewBox="0 0 22.526 22">
					<g id="Group_134" data-name="Group 134" transform="translate(-1203 -629)">
						<rect
							id="Rectangle_73"
							data-name="Rectangle 73"
							width="22"
							height="22"
							rx="1"
							transform="translate(1203 629)"
							fill="currentColor"
							fillOpacity="0.2"
						/>
						<path
							id="Subtraction_12"
							data-name="Subtraction 12"
							d="M-120.013,211.7h0a8.926,8.926,0,0,1-5.075-2.107l2.547-3.082a4.95,4.95,0,0,0,2.907,1.207l-.379,3.981Zm1.482,0h0l-.379-3.981A4.952,4.952,0,0,0-116,206.509l2.547,3.082a8.925,8.925,0,0,1-5.073,2.106Zm6.121-3.153h0L-115.492,206a4.953,4.953,0,0,0,1.206-2.9l3.983.368a8.926,8.926,0,0,1-2.106,5.073Zm-13.726,0h0a8.926,8.926,0,0,1-2.106-5.074l3.984-.372a4.953,4.953,0,0,0,1.206,2.9l-3.082,2.547Zm1.877-6.186h0l-3.983-.372a8.924,8.924,0,0,1,2.106-5.074l3.083,2.547a4.951,4.951,0,0,0-1.206,2.9Zm9.972,0h0a4.952,4.952,0,0,0-1.206-2.893l3.083-2.547a8.925,8.925,0,0,1,2.106,5.074l-3.982.368Zm-8.255-3.405h0l-2.547-3.082a8.926,8.926,0,0,1,5.076-2.107l.376,3.984a4.951,4.951,0,0,0-2.9,1.206Zm6.538,0h0a4.954,4.954,0,0,0-2.9-1.205l.377-3.983a8.927,8.927,0,0,1,5.074,2.107L-116,198.947Z"
							transform="translate(1333.272 438.188)"
							fill="currentColor"
						/>
						<g
							id="Group_133"
							data-name="Group 133"
							transform="translate(1555.346 1976.277) rotate(-131)"
						>
							<path
								id="Path_367"
								data-name="Path 367"
								d="M1.558-.142a.442.442,0,0,1,.823,0l.454,1.176L3.252,2.1c.146.338,0,8.648,0,8.648H.641S.495,2.443.641,2.1L1.1,1.034Z"
								transform="translate(1229.877 618.157)"
								fill="currentColor"
							/>
							<rect
								id="Rectangle_74"
								data-name="Rectangle 74"
								width="5.478"
								height="1.524"
								transform="translate(1229 628.537)"
								fill="currentColor"
							/>
							<ellipse
								id="Ellipse_41"
								data-name="Ellipse 41"
								cx="1.383"
								cy="2.032"
								rx="1.383"
								ry="2.032"
								transform="translate(1230.453 628.537)"
								fill="currentColor"
							/>
						</g>
					</g>
				</IconHelper>
			),
			mainComponent: true,
		},
		{
			name: 'dropDownContainer',
			displayName: 'Dropdown Container',
			description: 'Dropdown Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'leftIcon',
			displayName: 'Left Icon',
			description: 'Left Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'rightIcon',
			displayName: 'Right Icon',
			description: 'Right Icon',
			icon: 'fa-solid fa-box',
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
			name: 'asterisk',
			displayName: 'Asterisk',
			description: 'Asterisk',
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
