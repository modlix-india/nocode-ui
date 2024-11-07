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
import { getRenderData } from '../util/getRenderData';
import { getSelectedKeys } from '../util/getSelectedKeys';
import { runEvent } from '../util/runEvent';
import useDefinition from '../util/useDefinition';
import { flattenUUID } from '../util/uuid';
import DropdownStyle from './DropdownStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './dropdownProperties';
import { styleDefaults } from './dropdownStyleProperties';
import { IconHelper } from '../util/IconHelper';

function DropdownComponent(props: ComponentProps) {
	const [showDropdown, setShowDropdown] = useState(false);
	const [searchDropdownData, setSearchDropdownData] = useState<
		Array<
			| {
					label: any;
					value: any;
					key: any;
					originalObjectKey: any;
			  }
			| undefined
		>
	>();
	const [selected, setSelected] = useState<any>();
	const [searchText, setSearchText] = useState('');
	const [focus, setFocus] = useState(false);
	const [validationMessages, setValidationMessages] = React.useState<Array<string>>([]);
	const inputRef = useRef<HTMLInputElement>(null);
	const pageExtractor = PageStoreExtractor.getForContext(props.context.pageName);
	const [hoverKey, setHoverKey] = useState<string | undefined>();
	const {
		definition: { bindingPath, bindingPath2 },
		locationHistory,
		context,
		definition,
		pageDefinition: { translations },
	} = props;
	const {
		key,
		properties: {
			labelKey,
			uniqueKey,
			selectionKey,
			labelKeyType,
			selectionType,
			uniqueKeyType,
			onClick,
			datatype,
			data,
			placeholder,
			readOnly,
			label,
			closeOnMouseLeave,
			isMultiSelect,
			isSearchable,
			noFloat,
			validation,
			searchLabel,
			clearSearchTextOnClose,
			onSearch,
			onScrollReachedEnd,
			designType,
			colorScheme,
			leftIcon,
			clearOnSelectingSameValue,
			rightIcon,
			rightIconOpen,
			showMandatoryAsterisk,
		} = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);
	const clickEvent = onClick ? props.pageDefinition.eventFunctions?.[onClick] : undefined;
	const searchEvent = onSearch ? props.pageDefinition.eventFunctions?.[onSearch] : undefined;
	const bindingPathPath = getPathFromLocation(bindingPath!, locationHistory, pageExtractor);
	const searchBindingPath = getPathFromLocation(bindingPath2!, locationHistory, pageExtractor);
	useEffect(() => {
		if (!bindingPathPath) return;
		addListenerAndCallImmediately(
			(_, value) => {
				setSelected(value);
			},
			pageExtractor,
			bindingPathPath,
		);
	}, [bindingPathPath]);

	useEffect(() => {
		if (!searchBindingPath) return;
		addListenerAndCallImmediately(
			(_, value) => {
				setSearchText(value ?? '');
			},
			pageExtractor,
			searchBindingPath,
		);
	}, [searchBindingPath]);

	const dropdownData = React.useMemo(
		() =>
			Array.from(
				getRenderData(
					data,
					datatype,
					uniqueKeyType,
					uniqueKey,
					selectionType,
					selectionKey,
					labelKeyType,
					labelKey,
				)
					.reduce((acc: Map<string, any>, each: any) => {
						if (isNullValue(each?.key)) return acc;

						acc.set(each.key, each);

						return acc;
					}, new Map())
					.values(),
			),
		[
			data,
			datatype,
			uniqueKeyType,
			uniqueKey,
			selectionType,
			selectionKey,
			labelKeyType,
			labelKey,
		],
	);

	const selectedDataKey: Array<any> | string | undefined = React.useMemo(
		() => getSelectedKeys(dropdownData, selected, isMultiSelect),
		[selected, dropdownData, isMultiSelect],
	);

	const getIsSelected = (key: any) => {
		if (!isMultiSelect) return deepEqual(selectedDataKey, key);
		if (Array.isArray(selectedDataKey))
			return !!selectedDataKey.find((e: any) => deepEqual(e, key));
		return false;
	};

	const handleClick = async (each: { key: any; label: any; value: any } | undefined) => {
		if (!each || !bindingPathPath) return;

		if (isMultiSelect) {
			let newSelectionIndex = (selected ?? []).findIndex((e: any) =>
				deepEqual(e, each.value),
			);
			setData(
				bindingPathPath,
				newSelectionIndex === -1
					? [...(selected ?? []), each.value]
					: selected.filter((_: any, i: number) => i !== newSelectionIndex),
				context.pageName,
			);
		} else {
			setData(
				bindingPathPath,
				deepEqual(selected, each.value) && clearOnSelectingSameValue
					? undefined
					: each.value,
				context?.pageName,
			);
		}
		if (clickEvent) {
			await runEvent(
				clickEvent,
				key,
				context.pageName,
				props.locationHistory,
				props.pageDefinition,
			);
		}
		if (!isMultiSelect) handleClose();
	};

	const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
		setData(searchBindingPath, event.target.value, context.pageName);
	};

	React.useEffect(() => {
		if (!onSearch) return;
		(async () =>
			await runEvent(
				searchEvent,
				key,
				context.pageName,
				locationHistory,
				props.pageDefinition,
			))();
	}, [searchText, searchEvent, locationHistory, props.pageDefinition]);

	React.useEffect(() => {
		if (onSearch) return;
		let searchExpression: string | RegExp;
		try {
			searchExpression = new RegExp(searchText, 'i');
		} catch (error) {
			searchExpression = '';
		}
		setSearchDropdownData(
			dropdownData
				.filter(e => !isNullValue(e?.label))
				.filter(e => (e?.label + '').search(searchExpression) !== -1),
		);
	}, [searchText, dropdownData]);

	const [mouseIsInside, setMouseIsInside] = useState(false);

	const handleClose = useCallback(() => {
		if (!showDropdown) return;
		setShowDropdown(false);
		setFocus(false);
		inputRef?.current?.blur();
		clearSearchTextOnClose && setSearchText('');
	}, [showDropdown, setShowDropdown, setFocus, inputRef, clearSearchTextOnClose, setSearchText]);

	const getLabel = useCallback(() => {
		let label = '';
		if (!selected || (Array.isArray(selected) && !selected.length)) {
			return '';
		}
		if (!isMultiSelect) {
			label = dropdownData?.find((each: any) => each?.key === selectedDataKey)?.label;
			if (!label && searchEvent) {
				label = selected?.label;
			}
			return label;
		}

		return `${selectedDataKey?.length} Item${
			(selectedDataKey?.length ?? 0) > 1 ? 's' : ''
		}  selected`;
	}, [selected, selectedDataKey, dropdownData, isMultiSelect]);
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
			selected,
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
	}, [selected, validation]);

	useEffect(() => {
		if (!showDropdown || closeOnMouseLeave) return;
		window.addEventListener('mousedown', handleClose);
		return () => window.removeEventListener('mousedown', handleClose);
	}, [showDropdown, searchText, handleClose, closeOnMouseLeave]);

	const scrollEndEvent =
		onScrollReachedEnd && props.pageDefinition.eventFunctions?.[onScrollReachedEnd]
			? async (e: UIEvent<HTMLDivElement>) => {
					const target = e.target as HTMLDivElement;

					if (Math.abs(target.scrollHeight - target.scrollTop - target.clientHeight) > 2)
						return;

					await runEvent(
						props.pageDefinition.eventFunctions?.[onScrollReachedEnd],
						key,
						context.pageName,
						locationHistory,
						props.pageDefinition,
					);
				}
			: undefined;

	return (
		<CommonInputText
			id={key}
			cssPrefix="comp compDropdown"
			noFloat={noFloat}
			readOnly={readOnly}
			value={getLabel()}
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
			blurHandler={() => {
				if (mouseIsInside) return;
				setFocus(false);
				setShowDropdown(false);
			}}
			focusHandler={() => {
				setFocus(true);
				setShowDropdown(true);
			}}
			autoComplete="off"
			styles={computedStyles}
			inputRef={inputRef}
			definition={props.definition}
			designType={designType}
			colorScheme={colorScheme}
			leftIcon={leftIcon}
			//rightIcon = {rightIcon} 'fa-solid fa-angle-up'
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
			updDownHandler={e => {
				if (e.key.startsWith('Arrow')) {
					if (!showDropdown) setShowDropdown(true);
					const data =
						searchDropdownData?.length || searchText
							? searchDropdownData
							: dropdownData;
					if (!data?.length) {
						setHoverKey(undefined);
						return;
					}
					let index = data?.findIndex(e => e?.key === hoverKey);
					if (index === -1) index = e.key.endsWith('Up') ? data.length - 1 : 0;
					else index = e.key.endsWith('Up') ? index - 1 : index + 1;
					if (index < 0) index = data.length - 1;
					if (index >= data.length) index = 0;
					setHoverKey(data[index]?.key);
				} else if (e.key === 'Enter' && showDropdown && hoverKey) {
					handleClick(dropdownData.find(e => e.key === hoverKey));
				} else if (e.key === 'Escape') {
					setHoverKey(undefined);
					setShowDropdown(false);
				}
			}}
		>
			{showDropdown && (
				<div
					className="_dropdownContainer"
					style={computedStyles.dropDownContainer ?? {}}
					onScroll={scrollEndEvent}
				>
					<SubHelperComponent
						definition={props.definition}
						subComponentName="dropDownContainer"
					/>
					{isSearchable && (
						<input
							className="_dropdownSearchBox"
							value={searchText}
							placeholder={searchLabel}
							onChange={handleSearch}
							onMouseDown={e => {
								e.stopPropagation();
							}}
						/>
					)}
					{(searchDropdownData?.length || (searchText && !onSearch)
						? searchDropdownData
						: dropdownData
					)?.map(each => (
						<div
							className={`_dropdownItem ${
								getIsSelected(each?.key) ? '_selected' : ''
							} ${each.key === hoverKey ? '_hover' : ''}`} // because of default className the background-color is not changing on hover to user defined.
							style={computedStyles.dropdownItem ?? {}}
							key={each?.key}
							onMouseEnter={() => setHoverKey(each?.key)}
							onMouseDown={() => handleClick(each)}
						>
							<SubHelperComponent
								definition={props.definition}
								subComponentName="dropdownItem"
							/>
							<label
								style={computedStyles.dropdownItemLabel ?? {}}
								className="_dropdownItemLabel"
							>
								<SubHelperComponent
									definition={props.definition}
									subComponentName="dropdownItemLabel"
								/>
								{each?.label}
							</label>
							{getIsSelected(each?.key) && (
								<i
									className="_dropdownCheckIcon"
									style={computedStyles.dropdownCheckIcon ?? {}}
								>
									<SubHelperComponent
										definition={props.definition}
										subComponentName="dropdownCheckIcon"
									/>
								</i>
							)}
						</div>
					))}
				</div>
			)}
		</CommonInputText>
	);
}

const component: Component = {
	order: 7,
	name: 'Dropdown',
	displayName: 'Dropdown',
	description: 'Dropdown component',
	component: DropdownComponent,
	styleComponent: DropdownStyle,
	styleDefaults: styleDefaults,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	stylePseudoStates: ['hover', 'focus', 'disabled'],
	styleProperties: stylePropertiesDefinition,
	bindingPaths: {
		bindingPath: { name: 'Selection Binding' },
		bindingPath2: { name: 'Search Binding' },
	},
	defaultTemplate: {
		key: '',
		name: 'Dropdown',
		type: 'Dropdown',
		properties: {
			label: { value: 'Dropdown' },
		},
	},
	sections: [{ name: 'Dropdown', pageName: 'dropdown' }],
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<path
						d="M25.2667 0H4.76667C2.13333 0 0 2.13333 0 4.76667V25.2667C0 27.8667 2.13333 30 4.76667 30H25.2667C27.8667 30 30 27.8667 30 25.2667V4.76667C30 2.13333 27.8667 0 25.2667 0ZM23.7333 11.9667L14 21.7C13.6667 22.0333 13.2333 22.2 12.8333 22.2C12.4333 22.2 11.9667 22.0333 11.6667 21.7L6.26667 16.3C5.6 15.6333 5.6 22.1 6.26667 21.4333C6.93333 20.7667 7.96667 20.7667 8.63333 21.4333L12.8667 25.6667L26.25 10.3125C26.9167 9.64583 23.1333 8.93333 23.8 9.6C24.4 10.2667 24.4 11.3333 23.7333 11.9667Z"
						fill="url(#paint0_linear_3214_9386)"
					/>
					<path
						className="_dropdownarrow"
						d="M20.7343 6.9998C21.0752 6.9998 21.2598 7.39889 21.0392 7.65872L15.0566 14.704C14.8979 14.8908 14.6101 14.8923 14.4495 14.7072L8.33863 7.6619C8.11398 7.4029 8.29795 6.9998 8.6408 6.9998L20.7343 6.9998Z"
						fill="url(#paint1_linear_3214_9386)"
					/>
					<rect
						className="_dropdownlines"
						x="8.33105"
						y="19.8349"
						width="13.3333"
						height="1.66667"
						rx="0.833333"
						fill="url(#paint2_linear_3214_9386)"
					/>
					<rect
						className="_dropdownlines"
						x="5.00195"
						y="23.3336"
						width="20"
						height="1.66667"
						rx="0.833333"
						fill="url(#paint3_linear_3214_9386)"
					/>
					<defs>
						<linearGradient
							id="paint0_linear_3214_9386"
							x1="15"
							y1="0"
							x2="15"
							y2="30"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#EEEEEE" />
							<stop offset="1" stopColor="#EDEAEA" />
						</linearGradient>
						<linearGradient
							id="paint1_linear_3214_9386"
							x1="20.7589"
							y1="5.54513"
							x2="10.3831"
							y2="11.5356"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#F2B7EB" />
							<stop offset="1" stopColor="#C539B4" />
						</linearGradient>
						<linearGradient
							id="paint2_linear_3214_9386"
							x1="14.9977"
							y1="19.8349"
							x2="14.9977"
							y2="21.5016"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#F2B7EB" />
							<stop offset="1" stopColor="#C539B4" />
						</linearGradient>
						<linearGradient
							id="paint3_linear_3214_9386"
							x1="15.002"
							y1="23.3336"
							x2="15.002"
							y2="25.0002"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#F2B7EB" />
							<stop offset="1" stopColor="#C539B4" />
						</linearGradient>
					</defs>
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
			name: 'dropdownItem',
			displayName: 'Dropdown Item',
			description: 'Dropdown Item',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'dropdownItemLabel',
			displayName: 'Dropdown Item Label',
			description: 'Dropdown Item Label',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'dropdownCheckIcon',
			displayName: 'Dropdown Check Icon',
			description: 'Dropdown Check Icon',
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
