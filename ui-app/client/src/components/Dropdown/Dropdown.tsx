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
import { SubHelperComponent } from '../SubHelperComponent';
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
						if (!each?.key) return acc;

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
		{ focus, readOnly },
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
			rightIcon={showDropdown ? 'fa-solid fa-angle-up' : 'fa-solid fa-angle-down'}
			valueType="text"
			isPassword={false}
			placeholder={placeholder}
			hasFocusStyles={stylePropertiesWithPseudoStates?.focus}
			validationMessages={validationMessages}
			context={context}
			hideClearContentIcon={true}
			blurHandler={() => setFocus(false)}
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
			onMouseLeave={closeOnMouseLeave ? handleClose : undefined}
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
							} ${each.key === hoverKey ? '_hover' : ''}`}
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
				<IconHelper viewBox="0 0 24 24">
					<path
						d="M19.5289 1H4.49556C2.56444 1 1 2.56444 1 4.49556V19.5289C1 21.4356 2.56444 23 4.49556 23H19.5289C21.4356 23 23 21.4356 23 19.5289V4.49556C23 2.56444 21.4356 1 19.5289 1ZM18.4044 9.77556L11.2667 16.9133C11.0222 17.1578 10.7044 17.28 10.4111 17.28C10.1178 17.28 9.77556 17.1578 9.55556 16.9133L5.59556 12.9533C5.10667 12.4644 5.10667 17.2067 5.59556 16.7178C6.08444 16.2289 6.84222 16.2289 7.33111 16.7178L10.4356 19.8222L20.25 8.5625C20.7389 8.07361 17.9644 7.55111 18.4533 8.04C18.8933 8.52889 18.8933 9.31111 18.4044 9.77556Z"
						fill="currentColor"
						fillOpacity="0.2"
					/>
					<path
						d="M15.9746 6.13324C16.3155 6.13324 16.5002 6.53232 16.2795 6.79215L12.1219 11.6882C11.9633 11.8751 11.6754 11.8766 11.5148 11.6914L7.2681 6.79534C7.04346 6.53634 7.22743 6.13324 7.57027 6.13324L15.9746 6.13324Z"
						fill="currentColor"
					/>
					<rect
						x="7.10938"
						y="15.5444"
						width="9.77778"
						height="1.22222"
						rx="0.611111"
						fill="currentColor"
					/>
					<rect
						x="4.66797"
						y="18.1113"
						width="14.6667"
						height="1.22222"
						rx="0.611111"
						fill="currentColor"
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
			name: 'dropdownSearchContainer',
			displayName: 'Dropdown Search Container',
			description: 'Dropdown Search Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'textBoxContainer',
			displayName: 'Text Box Container',
			description: 'Text Box Container',
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
			name: 'floatingLabel',
			displayName: 'Floating Label',
			description: 'Floating Label',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'noFloatLabel',
			displayName: 'No Float Label',
			description: 'No Float Label',
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
