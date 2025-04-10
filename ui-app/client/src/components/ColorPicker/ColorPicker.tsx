import { isNullValue } from '@fincity/kirun-js';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import CommonInputText from '../../commonComponents/CommonInputText';
import {
	addListenerAndCallImmediately,
	getPathFromLocation,
	PageStoreExtractor,
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
import { styleProperties, styleDefaults } from './colorPickerStyleProperties';
import { IconHelper } from '../util/IconHelper';
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

function ColorPickerComponent(props: Readonly<ComponentProps>) {
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
			supportingText,
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
				<IconHelper viewBox="0 0 30 30">
					<path
						d="M7.57739 21.6728C6.10024 20.0256 5.15977 17.8842 5.03225 15.5306H4.50621C4.27508 15.5266 0.0867971 15.5333 0.0374884 15.5306C0.032175 19.1186 1.67668 22.8113 4.04373 25.2063L7.57739 21.6728Z"
						fill="#7743DB"
						className="_colorPickerIcon"
					/>
					<path
						d="M22.423 8.32848C23.9002 9.97566 24.8407 12.1171 24.9682 14.4706H25.4942C25.7253 14.4746 29.9136 14.468 29.9629 14.4706C29.9683 10.8827 28.3237 7.18996 25.9567 4.79492L22.423 8.32848Z"
						fill="#018B8B"
						className="_colorPickerIcon"
					/>
					<path
						d="M15.5314 0.531615C15.53 0.823856 15.5327 4.90206 15.5314 5.03197C17.8852 5.15949 20.0266 6.09996 21.6735 7.57711L22.0455 7.20515C22.2142 7.04176 25.1671 4.07953 25.207 4.04365C22.7761 1.63269 19.2321 0.130243 15.5258 0C15.5311 0.0106269 15.5311 0.0265671 15.5311 0.0371957L15.5314 0.531615Z"
						fill="#EC255A"
						className="_colorPickerIcon"
					/>
					<path
						d="M14.4686 29.4674C14.47 29.1751 14.4673 25.0969 14.4686 24.967C12.1148 24.8395 9.9734 23.899 8.32649 22.4219L7.95453 22.7938C7.78583 22.9572 4.83288 25.9195 4.79303 25.9553C7.22259 28.365 10.7679 29.8701 14.4742 29.999C14.4689 29.9884 14.4689 29.9724 14.4689 29.9618L14.4686 29.4674Z"
						fill="#FFB534"
						className="_colorPickerIcon"
					/>
					<path
						d="M5.14353 4.39432C5.34943 4.60155 8.23597 7.4854 8.32629 7.57708C9.97347 6.09993 12.1149 5.15946 14.4684 5.03194V4.5059C14.4724 4.27476 14.4658 0.0864826 14.4684 0.0371739C10.8393 0.0252188 7.29658 1.67504 4.7713 4.02233L4.79255 4.04359L5.14353 4.39432Z"
						fill="#3F83EA"
						className="_colorPickerIcon"
					/>
					<path
						d="M24.8565 25.6046C24.6506 25.3974 21.7641 22.5136 21.6737 22.4219C20.0266 23.899 17.8851 24.8395 15.5316 24.967V25.4931C15.5276 25.7242 15.5342 29.9125 15.5316 29.9618C19.1607 29.9737 22.7034 28.3239 25.2287 25.9766C25.2234 25.966 25.2128 25.9607 25.2075 25.9554L24.8565 25.6046Z"
						fill="#BDD449"
						className="_colorPickerIcon"
					/>
					<path
						d="M29.4684 15.5309C29.1762 15.5296 25.098 15.5323 24.9681 15.5309C24.8405 17.8848 23.9001 20.0262 22.4229 21.6731L22.7949 22.045C22.9583 22.2137 25.9205 25.1667 25.9564 25.2065C28.3673 22.7757 29.8698 19.2317 30 15.5254C29.9894 15.5307 29.9735 15.5307 29.9628 15.5307L29.4684 15.5309Z"
						fill="#02B694"
						className="_colorPickerIcon"
					/>
					<path
						d="M0.531615 14.4705C0.823856 14.4719 4.90206 14.4692 5.03197 14.4705C5.15949 12.1167 6.09996 9.97529 7.57711 8.32838L7.20515 7.95642C7.04176 7.78772 4.07953 4.83478 4.04365 4.79492C1.63269 7.2258 0.130243 10.7698 0 14.4761C0.0106269 14.4708 0.0265672 14.4708 0.0371958 14.4708L0.531615 14.4705Z"
						fill="black"
						className="_colorPickerIcon"
					/>
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
	stylePropertiesForTheme: styleProperties,
	externalStylePropsForThemeJson: true,
};

export default component;
