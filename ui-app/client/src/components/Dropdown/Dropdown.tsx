import { deepEqual } from '@fincity/kirun-js';
import React, { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
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
import { HelperComponent } from '../HelperComponent';
import { getRenderData } from '../util/getRenderData';
import { getSelectedKeys } from '../util/getSelectedKeys';
import { getTranslations } from '../util/getTranslations';
import { runEvent } from '../util/runEvent';
import useDefinition from '../util/useDefinition';
import { flattenUUID } from '../util/uuid';
import { propertiesDefinition, stylePropertiesDefinition } from './dropdownProperties';
import DropdownStyle from './DropdownStyle';

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
		} = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);
	const clickEvent = onClick ? props.pageDefinition.eventFunctions[onClick] : undefined;
	const searchEvent = onSearch ? props.pageDefinition.eventFunctions[onSearch] : undefined;
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
			getRenderData(
				data,
				datatype,
				uniqueKeyType,
				uniqueKey,
				selectionType,
				selectionKey,
				labelKeyType,
				labelKey,
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
		[selected],
	);

	const getIsSelected = (key: any) => {
		if (!isMultiSelect) return deepEqual(selectedDataKey, key);
		if (Array.isArray(selectedDataKey))
			return !!selectedDataKey.find((e: any) => deepEqual(e, key));
		return false;
	};

	const handleClick = async (each: { key: any; label: any; value: any } | undefined) => {
		if (!each) return;
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
				deepEqual(selected, each.value) ? undefined : each.value,
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
		if (searchEvent) {
			(async () =>
				await runEvent(
					searchEvent,
					key,
					context.pageName,
					locationHistory,
					props.pageDefinition,
				))();
			return;
		}
		let searchExpression: string | RegExp;
		try {
			searchExpression = new RegExp(searchText, 'i');
		} catch (error) {
			searchExpression = '';
		}
		setSearchDropdownData(dropdownData.filter(e => e?.label.search(searchExpression) !== -1));
	}, [searchText]);

	const handleClose = () => {
		setShowDropdown(false);
		setFocus(false);
		inputRef?.current?.blur();
		clearSearchTextOnClose && setSearchText('');
	};

	const handleBubbling = (event: any) => {
		event.stopPropagation();
	};

	const getLabel = useCallback(() => {
		let label = '';
		if (!selected || (Array.isArray(selected) && !selected.length)) {
			return noFloat ? placeholder : '';
		}
		if (!isMultiSelect) {
			label = dropdownData?.find((each: any) => each?.key === selectedDataKey)?.label;
			if (!label && searchEvent) {
				label = selected?.label;
			}
			return label;
		}

		label = `${selectedDataKey?.length} Item${
			(selectedDataKey?.length ?? 0) > 1 ? 's' : ''
		}  selected`;

		label =
			!selected ||
			!selectedDataKey ||
			(Array.isArray(selectedDataKey) && !selectedDataKey.length)
				? noFloat
					? placeholder
					: ''
				: !Array.isArray(selectedDataKey)
				? dropdownData?.find((each: any) => each?.key === selectedDataKey)?.label
				: `${selectedDataKey.length} Item${
						selectedDataKey.length > 1 ? 's' : ''
				  }  selected`;
		return label;
	}, [selected, selectedDataKey, dropdownData, noFloat, placeholder, isMultiSelect]);
	const effectivePlaceholder = noFloat ? (placeholder ? placeholder : label) : label;
	const computedStyles = processComponentStylePseudoClasses(
		{ focus, readOnly },
		stylePropertiesWithPseudoStates,
	);
	useEffect(() => {
		if (showDropdown) {
			document.addEventListener('click', handleClose);
		}
		return () => document.removeEventListener('click', handleClose);
	}, [showDropdown]);

	useEffect(() => {
		if (!validation?.length) return;

		const msgs = validate(props.definition, props.pageDefinition, validation, selected);
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

	return (
		<div
			className="comp compDropdown"
			onClick={handleBubbling}
			onMouseLeave={closeOnMouseLeave ? handleClose : undefined}
		>
			<HelperComponent definition={props.definition} />
			<CommonInputText
				id={key}
				noFloat={noFloat}
				readOnly={readOnly}
				value={getLabel()}
				label={label}
				translations={translations}
				rightIcon={focus ? 'fa-solid fa-angle-up' : 'fa-solid fa-angle-down'}
				valueType="text"
				isPassword={false}
				placeholder={effectivePlaceholder}
				hasFocusStyles={stylePropertiesWithPseudoStates?.focus}
				validationMessages={validationMessages}
				context={context}
				hideClearContentIcon={true}
				blurHandler={() => setFocus(false)}
				focusHandler={() => {
					setFocus(true);
					setShowDropdown(true);
				}}
				styles={computedStyles}
				inputRef={inputRef}
			/>
			{showDropdown && (
				<div className="dropdownContainer" style={computedStyles.dropDownContainer ?? {}}>
					{isSearchable && (
						<div className="dropdownSearchContainer">
							<CommonInputText
								id={key}
								noFloat={false}
								readOnly={readOnly}
								value={searchText}
								label={searchLabel}
								translations={translations}
								rightIcon="fa-solid fa-magnifying-glass"
								valueType="text"
								isPassword={false}
								placeholder={searchLabel}
								hasFocusStyles={stylePropertiesWithPseudoStates?.focus}
								validationMessages={validationMessages}
								context={context}
								handleChange={e => handleSearch(e)}
								clearContentHandler={() => setSearchText('')}
								blurHandler={() => setFocus(false)}
								focusHandler={() => setFocus(true)}
								styles={computedStyles}
							/>
						</div>
					)}
					{(searchDropdownData?.length ? searchDropdownData : dropdownData)?.map(each => (
						<div
							onClick={() => handleClick(each)}
							className="dropdownItem"
							key={each?.key}
						>
							<label className="dropdownItemLabel">{each?.label}</label>
							{getIsSelected(each?.key) && (
								<i className="fa fa-solid fa-check checkedIcon"></i>
							)}
						</div>
					))}
				</div>
			)}
		</div>
	);
}

const component: Component = {
	icon: 'fa-solid fa-square-caret-down',
	name: 'Dropdown',
	displayName: 'Dropdown',
	description: 'Dropdown component',
	component: DropdownComponent,
	styleComponent: DropdownStyle,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	stylePseudoStates: ['hover', 'focus', 'disabled'],
	bindingPaths: {
		bindingPath: { name: 'Selection Binding' },
		bindingPath2: { name: 'Search Binding' },
	},
};

export default component;
