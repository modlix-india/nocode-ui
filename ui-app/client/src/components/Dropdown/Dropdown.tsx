import { deepEqual, isNullValue } from '@fincity/kirun-js';
import React, { ChangeEvent, UIEvent, useCallback, useEffect, useRef, useState } from 'react';
import CommonInputText from '../../commonComponents/CommonInputText';
import {
	addListenerAndCallImmediately,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
} from '../../context/StoreContext';
import { Component, ComponentProps } from '../../types/common';
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

function DropdownComponent(props: Readonly<ComponentProps>) {
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
	const [isChanged, setIsChanged] = useState(false);
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
			runEventOnDropDownClose,
			onScrollReachedEnd,
			designType,
			colorScheme,
			leftIcon,
			clearOnSelectingSameValue,
			rightIcon,
			rightIconOpen,
			showMandatoryAsterisk,
			supportingText,
			showMultipleSelectedValues,
			removeKeyWhenEmpty,
			multiSelectNoSelectionValue,
			searchIcon,
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
			setIsChanged(true);
			let aValue =
				newSelectionIndex === -1
					? [...(selected ?? []), each.value]
					: selected.filter((_: any, i: number) => i !== newSelectionIndex);
			if (!aValue?.length && multiSelectNoSelectionValue !== 'EMPTY_ARRAY') {
				if (multiSelectNoSelectionValue === 'UNDEFINED') aValue = undefined;
				else if (multiSelectNoSelectionValue === 'NULL') aValue = null;
			}
			setData(bindingPathPath, aValue, context.pageName, removeKeyWhenEmpty);

			if (!runEventOnDropDownClose && clickEvent) {
				await runEvent(
					clickEvent,
					key,
					context.pageName,
					props.locationHistory,
					props.pageDefinition,
				);
			}
		} else {
			setData(
				bindingPathPath,
				deepEqual(selected, each.value) && clearOnSelectingSameValue
					? undefined
					: each.value,
				context?.pageName,
				removeKeyWhenEmpty,
			);
			if (clickEvent) {
				await runEvent(
					clickEvent,
					key,
					context.pageName,
					props.locationHistory,
					props.pageDefinition,
				);
			}
			handleClose();
		}
	};

	const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
		if (!searchBindingPath) return;
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

		if (clickEvent && runEventOnDropDownClose && isMultiSelect && isChanged) {
			(async () => {
				await runEvent(
					clickEvent,
					key,
					context.pageName,
					props.locationHistory,
					props.pageDefinition,
				);
			})();
		}
		setShowDropdown(false);
		setFocus(false);
		inputRef?.current?.blur();
		clearSearchTextOnClose && setSearchText('');
		setIsChanged(false);
	}, [
		showDropdown,
		isChanged,
		setShowDropdown,
		setFocus,
		inputRef,
		clearSearchTextOnClose,
		setSearchText,
		clickEvent,
		runEventOnDropDownClose,
	]);

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

		if (showMultipleSelectedValues) {
			const vals = [];
			for (const each of selectedDataKey ?? []) {
				vals.push(dropdownData?.find((e: any) => e?.key === each)?.label);
			}
			return vals.join(', ');
		}

		return `${selectedDataKey?.length} Item${
			(selectedDataKey?.length ?? 0) > 1 ? 's' : ''
		}  selected`;
	}, [selected, selectedDataKey, dropdownData, isMultiSelect, showMultipleSelectedValues]);
	const computedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{ focus, disabled: readOnly },
		stylePropertiesWithPseudoStates,
	);

	useEffect(() => {
		if (!validation?.length) return;

		const validationMessages = validate(
			props.definition,
			props.pageDefinition,
			validation,
			selected,
			locationHistory,
			pageExtractor,
		);
		setValidationMessages(validationMessages);

		setData(
			`Store.validations.${context.pageName}.${flattenUUID(definition.key)}`,
			validationMessages.length ? validationMessages : undefined,
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
		const closeFunction = () => {
			if (mouseIsInside) return;
			handleClose();
		};
		window.addEventListener('mousedown', closeFunction);
		return () => window.removeEventListener('mousedown', closeFunction);
	}, [mouseIsInside, showDropdown, searchText, handleClose, closeOnMouseLeave]);

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

	const [isAtBottom, setIsAtBottom] = useState(false);

	let dropdownContainer = null;
	if (showDropdown) {
		dropdownContainer = (
			<div
				className={`_dropdownContainer ${isAtBottom ? '_atBottom' : ''}`}
				style={computedStyles.dropDownContainer ?? {}}
				onScroll={scrollEndEvent}
				ref={element => {
					if (!element || searchText) return;
					const rect = element.getBoundingClientRect();
					const parentRect = element.parentElement?.getBoundingClientRect();
					if (!parentRect) return;
					setIsAtBottom(parentRect.bottom + rect.height > window.innerHeight);
				}}
			>
				<SubHelperComponent
					definition={props.definition}
					subComponentName="dropDownContainer"
				/>
				{isSearchable && (
					<div
						className="_dropdownSearchBoxContainer"
						style={computedStyles.dropdownSearchBoxContainer ?? {}}
					>
						<SubHelperComponent
							definition={props.definition}
							subComponentName="dropdownSearchBoxContainer"
						/>
						{searchIcon ? (
							<i
								className={`_dropdownSearchIcon ${searchIcon}`}
								style={computedStyles.dropDownSearchIcon ?? {}}
							/>
						) : undefined}
						<input
							className="_dropdownSearchBox"
							style={computedStyles.dropdownSearchBox ?? {}}
							value={searchText}
							placeholder={searchLabel}
							onChange={handleSearch}
							onMouseDown={e => {
								e.stopPropagation();
							}}
						/>
					</div>
				)}
				{(searchDropdownData?.length || (searchText && !onSearch)
					? searchDropdownData
					: dropdownData
				)?.map(each => {
					const isOptionSelected = getIsSelected(each?.key);
					return (
						<div
							className={`_dropdownItem ${
								isOptionSelected ? '_selected' : ''
							} ${each.key === hoverKey ? '_hover' : ''}`} // because of default className the background-color is not changing on hover to user defined.
							style={computedStyles.dropdownItem ?? {}}
							key={each?.key}
							onMouseEnter={() => setHoverKey(each?.key)}
							onMouseDown={() => handleClick(each)}
							tabIndex={0}
							role="option"
							aria-selected={isOptionSelected}
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
							{isOptionSelected && (
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
					);
				})}
			</div>
		);
	}

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
					? (rightIconOpen ?? 'fa-solid fa-angle-up')
					: (rightIcon ?? 'fa-solid fa-angle-down')
			}
			handleRightIcon={() => {
				if (!showDropdown) {
					inputRef.current?.focus();
				} else {
					setFocus(false);
					setShowDropdown(false);
				}
			}}
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
				!!(
					(validation ?? []).find(
						(e: any) => e.type === undefined || e.type === 'MANDATORY',
					) && showMandatoryAsterisk
				)
			}
			supportingText={supportingText}
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
					handleClick(dropdownData.find(e => e.key === hoverKey)).then();
				} else if (e.key === 'Escape') {
					setHoverKey(undefined);
					setShowDropdown(false);
				}
			}}
		>
			{dropdownContainer}
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
	propertyValidation: (): Array<string> => [],
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
				<IconHelper viewBox="0 0 30 20">
					<path
						className="_dropdownlines"
						d="M26 14L26 12C26 11.4477 25.5523 11 25 11L1 11C0.447716 11 -1.95702e-08 11.4477 -4.37114e-08 12L-1.31134e-07 14C-1.55275e-07 14.5523 0.447716 15 1 15L25 15C25.5523 15 26 14.5523 26 14Z"
						fill="#EC255A40"
					/>
					<path
						className="_dropdownlines"
						d="M19 20L19 18C19 17.4477 18.5523 17 18 17L1 17C0.447716 17 -1.95702e-08 17.4477 -4.37114e-08 18L-1.31134e-07 20C-1.55275e-07 20.5523 0.447716 21 1 21L18 21C18.5523 21 19 20.5523 19 20Z"
						fill="#EC255A40"
					/>
					<path
						d="M30 8L30 1C30 0.447715 29.5523 -1.95703e-08 29 -4.37114e-08L1 -1.26763e-06C0.447716 -1.29177e-06 1.88778e-06 0.447714 1.86364e-06 0.999999L1.55766e-06 8C1.53352e-06 8.55228 0.447717 9 1 9L29 9C29.5523 9 30 8.55229 30 8Z"
						fill="#EC255A"
					/>
					<path
						d="M24.433 5.75C24.2406 6.08333 23.7594 6.08333 23.567 5.75L22.701 4.25C22.5085 3.91667 22.7491 3.5 23.134 3.5L24.866 3.5C25.2509 3.5 25.4915 3.91667 25.299 4.25L24.433 5.75Z"
						fill="white"
					/>
					<path
						d="M25.0657 3.5H22.9343C22.5349 3.5 22.2967 3.94507 22.5182 4.27735L23.584 5.87596C23.7819 6.17283 24.2181 6.17283 24.416 5.87596L25.4818 4.27735C25.7033 3.94507 25.4651 3.5 25.0657 3.5Z"
						fill="white"
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
		{
			name: 'dropdownSearchBoxContainer',
			displayName: 'Dropdown Search Box Container',
			description: 'Dropdown Search Box Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'dropDownSearchIcon',
			displayName: 'Dropdown Search Icon',
			description: 'Dropdown Search Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'dropdownSearchBox',
			displayName: 'Dropdown Search Box',
			description: 'Dropdown Search Box',
			icon: 'fa-solid fa-box',
		},
	],
};

export default component;
