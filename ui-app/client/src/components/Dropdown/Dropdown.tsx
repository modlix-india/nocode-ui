import { deepEqual, isNullValue } from '@fincity/kirun-js';
import React, {
	ChangeEvent,
	UIEvent,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import CommonCheckbox from '../../commonComponents/CommonCheckbox';
import CommonInputText from '../../commonComponents/CommonInputText';
import {
	addListenerAndCallImmediately,
	getDataFromPath,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
	UrlDetailsExtractor,
} from '../../context/StoreContext';
import { makeTempPath } from '../../context/TempStore';
import { Component, ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { validate } from '../../util/validationProcessor';
import { SubHelperComponent } from '../HelperComponents/SubHelperComponent';
import { IconHelper } from '../util/IconHelper';
import { getRenderData } from '../util/getRenderData';
import { getSelectedKeys } from '../util/getSelectedKeys';
import { findPropertyDefinitions } from '../util/lazyStylePropertyUtil';
import { runEvent } from '../util/runEvent';
import useDefinition from '../util/useDefinition';
import { flattenUUID } from '../util/uuid';
import DropdownStyle from './DropdownStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './dropdownProperties';
import { styleDefaults, stylePropertiesForTheme } from './dropdownStyleProperties';

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
	const urlExtractor = UrlDetailsExtractor.getForContext(props.context.pageName);
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
			moveSelectedToTop,
			selectedOptionTickPlace,
			selectionOptionTickType,
			editRequestIcon,
			editConfirmIcon,
			editCancelIcon,
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
	const clickEvent = onClick ? props.pageDefinition.eventFunctions?.[onClick] : undefined;
	const searchEvent = onSearch ? props.pageDefinition.eventFunctions?.[onSearch] : undefined;
	let bindingPathPath = getPathFromLocation(bindingPath!, locationHistory, pageExtractor);
	const searchBindingPath = getPathFromLocation(bindingPath2!, locationHistory, pageExtractor);

	const editOn = designType === '_editOnReq';

	const callClickEvent = useCallback(
		(force: boolean = false) => {
			if (!clickEvent || (editOn && !force)) return;
			(async () => {
				await runEvent(
					clickEvent,
					key,
					context.pageName,
					props.locationHistory,
					props.pageDefinition,
				);
			})();
		},
		[clickEvent, editOn, key, context.pageName, props.locationHistory],
	);

	const originalBindingPathPath = bindingPathPath;

	if (editOn && bindingPathPath) {
		bindingPathPath = makeTempPath(bindingPathPath, context.pageName);
	}

	useEffect(() => {
		if (!originalBindingPathPath) return;
		addListenerAndCallImmediately(
			props.context.pageName,
			(_, value) => {
				setSelected(value);
			},
			originalBindingPathPath,
		);
	}, [originalBindingPathPath]);

	useEffect(() => {
		if (!searchBindingPath) return;
		addListenerAndCallImmediately(
			props.context.pageName,
			(_, value) => {
				setSearchText(value ?? '');
			},
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
			if (editOn) setSelected(aValue);

			if (!runEventOnDropDownClose) {
				callClickEvent();
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
			if (editOn) setSelected(each.value);
			callClickEvent();
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

		if (runEventOnDropDownClose && isMultiSelect && isChanged) {
			callClickEvent();
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
		callClickEvent,
		runEventOnDropDownClose,
	]);

	const getLabel = useCallback(() => {
		let label = '';
		if (selected == undefined || (Array.isArray(selected) && !selected.length)) {
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
	const sortOrder = useMemo(() => {
		if (!moveSelectedToTop) return undefined;
		return Array.isArray(selectedDataKey) ? [...selectedDataKey] : [selectedDataKey];
	}, [moveSelectedToTop, showDropdown]);

	let dropdownContainer = null;
	if (showDropdown) {
		let options =
			searchDropdownData?.length || (searchText && !onSearch)
				? searchDropdownData
				: dropdownData;

		if (sortOrder && options?.length) {
			options = [...options].sort((a, b) => {
				let aIndex = sortOrder.indexOf(a.key);
				let bIndex = sortOrder.indexOf(b.key);
				if (aIndex === -1) aIndex = options!.length;
				if (bIndex === -1) bIndex = options!.length;
				return aIndex - bIndex;
			});
		}

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
				{options?.map(each => {
					const isOptionSelected = getIsSelected(each?.key);
					let tick = undefined;

					if (selectionOptionTickType === 'TICK' && isOptionSelected) {
						tick = (
							<i
								className="_dropdownCheckIcon"
								style={computedStyles.dropdownCheckIcon ?? {}}
							>
								<SubHelperComponent
									definition={props.definition}
									subComponentName="dropdownCheckIcon"
								/>
							</i>
						);
					} else if (
						selectionOptionTickType === 'CHECKBOX' ||
						selectionOptionTickType === 'RADIO'
					) {
						tick = (
							<CommonCheckbox
								isChecked={isOptionSelected}
								showAsRadio={selectionOptionTickType === 'RADIO'}
								styles={computedStyles.checkbox ?? {}}
								thumbStyles={computedStyles.thumb ?? {}}
							/>
						);
					}

					return (
						<div
							className={`_dropdownItem ${
								isOptionSelected ? '_selected' : ''
							} ${each.key === hoverKey ? '_hover' : ''} ${selectedOptionTickPlace}`} // because of default className the background-color is not changing on hover to user defined.
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
							{tick}
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
			label={editOn ? '' : label}
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
			showEditRequest={editOn}
			editRequestIcon={editRequestIcon}
			editConfirmIcon={editConfirmIcon}
			editCancelIcon={editCancelIcon}
			onEditRequest={(editMode, canceled) => {
				if (editMode || !originalBindingPathPath) return;
				if (canceled) {
					setSelected(
						getDataFromPath(originalBindingPathPath, locationHistory, pageExtractor),
					);
				} else {
					setData(originalBindingPathPath, selected, context?.pageName);
					callClickEvent(true);
				}
			}}
		>
			{dropdownContainer}
		</CommonInputText>
	);
}

const { designType, colorScheme } = findPropertyDefinitions(
	propertiesDefinition,
	'designType',
	'colorScheme',
);

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
		propertiesForTheme: [designType, colorScheme],
	stylePropertiesForTheme: stylePropertiesForTheme,
	externalStylePropsForThemeJson: true,
};

export default component;
