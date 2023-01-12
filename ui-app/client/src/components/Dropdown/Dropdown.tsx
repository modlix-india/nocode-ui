import { deepEqual } from '@fincity/kirun-js';
import React, { useEffect, useMemo, useState } from 'react';
import {
	addListener,
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
			dataBinding,
			placeholder,
			readOnly,
			label,
			closeOnMouseLeave,
			isMultiSelect,
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
				dataBinding,
				datatype,
				uniqueKeyType,
				uniqueKey,
				selectionType,
				selectionKey,
				labelKeyType,
				labelKey,
			),
		[
			dataBinding,
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
						selected.filter(e => !deepEqual(e, each.value)),
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
	};

	const handleBubbling = (event: any) => {
		event.stopPropagation();
	};

	const getLabel = () => {
		const label =
			!selected ||
			!selectedDataKey ||
			(Array.isArray(selectedDataKey) && !selectedDataKey.length)
				? placeholder
				: !Array.isArray(selectedDataKey)
				? dropdownData?.find((each: any) => each?.key === selectedDataKey)?.label
				: `${selectedDataKey.length} item${
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
			{label ? (
				<label className={`label ${readOnly ? 'disabled' : ''}`}>
					{getTranslations(label, translations)}
				</label>
			) : null}
			<div
				onMouseLeave={() => closeOnMouseLeave && handleClose()}
				className={`container ${showDropdown && !readOnly ? 'focus' : ''} ${
					readOnly ? 'disabled' : ''
				} `}
			>
				<div
					className={`labelContainer`}
					onClick={() => !readOnly && setShowDropdown(!showDropdown)}
				>
					<input
						className="inputbox"
						type="text"
						value={getTranslations(getLabel(), translations)}
						key={key}
					/>
					<label
						htmlFor="key"
						className={`placeholder ${selected ? 'selected' : 'notSelected'}`}
					>
						{getTranslations(getLabel(), translations)}
					</label>
					<i className="fa-solid fa-angle-down placeholderIcon"></i>
				</div>
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
