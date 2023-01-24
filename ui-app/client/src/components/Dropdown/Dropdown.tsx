import { deepEqual } from '@fincity/kirun-js';
import React, { useEffect, useState } from 'react';
import {
	addListenerAndCallImmediately,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
} from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { HelperComponent } from '../HelperComponent';
import { getRenderData } from '../util/getRenderData';
import { getSelectedKeys } from '../util/getSelectedKeys';
import { getTranslations } from '../util/getTranslations';
import { runEvent } from '../util/runEvent';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './dropdownProperties';
import DropdownStyle from './DropdownStyle';

function DropdownComponent(props: ComponentProps) {
	const [showDropdown, setShowDropdown] = useState(false);
	const [selected, setSelected] = useState<any>();
	const [searchText, setSearchText] = useState('');
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
		} = {},
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);
	if (!bindingPath) throw new Error('Definition requires binding path');
	const bindingPathPath = getPathFromLocation(bindingPath, locationHistory, pageExtractor);
	useEffect(() => {
		addListenerAndCallImmediately(
			(_, value) => {
				setSelected(value);
			},
			pageExtractor,
			bindingPathPath,
		);
	}, []);

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
	const clickEvent = onClick ? props.pageDefinition.eventFunctions[onClick] : undefined;

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
		let newSelection;
		if (each) {
			if (isMultiSelect && Array.isArray(selected)) {
				newSelection = selected.find((e: any) => deepEqual(e, each.value));
				if (newSelection) {
					setData(
						bindingPathPath,
						selected.filter(e => !deepEqual(e, each.value)).length > 0
							? selected.filter(e => !deepEqual(e, each.value))
							: undefined,
						context.pageName,
					);
					return;
				}
			}
			setData(
				bindingPathPath,
				isMultiSelect ? (selected ? [...selected, each.value] : [each.value]) : each.value,
				context?.pageName,
			);
		}

		handleClose();

		if (clickEvent) {
			await runEvent(clickEvent, key, context.pageName);
		}
	};

	const handleClose = () => {
		setShowDropdown(false);
		setSearchText('');
	};

	const handleBubbling = (event: any) => {
		event.stopPropagation();
	};

	const getLabel = () => {
		const label =
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
	};

	useEffect(() => {
		if (showDropdown) {
			document.addEventListener('click', handleClose);
		}
		return () => document.removeEventListener('click', handleClose);
	}, [showDropdown]);

	return (
		<div className="comp compDropdown" onClick={handleBubbling}>
			<HelperComponent definition={props.definition} />
			{noFloat && (
				<label htmlFor="key" className={`label ${readOnly ? 'disabled' : ''}`}>
					{getTranslations(label || placeholder, translations)}
				</label>
			)}
			<div
				onMouseLeave={() => closeOnMouseLeave && handleClose()}
				className={`container ${showDropdown && !readOnly ? 'focus' : ''} ${
					readOnly ? 'disabled' : ''
				} `}
			>
				{isSearchable ? (
					showDropdown ? (
						<div className={`searchContainer`}>
							<input
								className="searchBox"
								type={'text'}
								value={searchText}
								key={key}
								onChange={(event: any) => {
									setSearchText(event.target.value);
								}}
								autoFocus
							/>
							<i
								className="fa-solid fa-angle-down placeholderIcon"
								onClick={() => !readOnly && setShowDropdown(!showDropdown)}
							></i>
						</div>
					) : (
						<div
							className={`placeholderContainer`}
							onClick={() => !readOnly && setShowDropdown(!showDropdown)}
						>
							<label
								htmlFor="key"
								className={`placeholder ${selected ? 'selected' : ''}`}
							>
								{getTranslations(getLabel(), translations)}
							</label>
							<i className="fa-solid fa-angle-down placeholderIcon"></i>
						</div>
					)
				) : (
					<div
						className={`placeholderContainer`}
						onClick={() => !readOnly && setShowDropdown(!showDropdown)}
					>
						<label
							htmlFor="key"
							className={`placeholder ${selected ? 'selected' : ''}`}
						>
							{getTranslations(getLabel(), translations)}
						</label>
						<i className="fa-solid fa-angle-down placeholderIcon"></i>
					</div>
				)}
				{!noFloat && (
					<label
						htmlFor="key"
						className={`labelFloat ${showDropdown && !selected ? 'float' : ''} ${
							selected ? 'float' : ''
						}  `}
						onClick={() => !readOnly && !selected && setShowDropdown(true)}
					>
						{getTranslations(placeholder, translations)}
					</label>
				)}
				{showDropdown && (
					<div className="dropdownContainer">
						{dropdownData?.map(each => (
							<div
								onClick={() => handleClick(each!)}
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
		</div>
	);
}

const component: Component = {
	name: 'Dropdown',
	displayName: 'Dropdown',
	description: 'Dropdown component',
	component: DropdownComponent,
	styleComponent: DropdownStyle,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	stylePseudoStates: ['hover', 'focus', 'disabled'],
};

export default component;
