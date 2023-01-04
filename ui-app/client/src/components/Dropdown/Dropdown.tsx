import React, { useEffect, useState } from 'react';
import {
	addListener,
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
	const [selected, setSelected] = useState();
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
			headerText,
			closeOnMouseLeave,
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
		addListener(
			(_, value) => {
				setSelected(value);
			},
			pageExtractor,
			bindingPathPath,
		);
	}, []);

	const dropdownData = getRenderData(
		dataBinding,
		datatype,
		uniqueKeyType,
		uniqueKey,
		selectionType,
		selectionKey,
		labelKeyType,
		labelKey,
	);
	const clickEvent = onClick ? props.pageDefinition.eventFunctions[onClick] : undefined;
	const selectedDataKey = getSelectedKeys(dropdownData, selected);


	const handleClick = async (each: { key: any; label: any; value: any }) => {
		setData(bindingPathPath, each.value, context?.pageName);
		handleClose();
		if (clickEvent) {
			await runEvent(clickEvent, key, context.pageName);
		}
	};

	const handleClose = (event?: any) => {
		setShowDropdown(false);
	};

	const handleBubbling = (event: any) => {
		event.stopPropagation();
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
			{headerText !== undefined && (
				<label className={`headerText ${readOnly ? 'disabled' : ''}`}>
					{getTranslations(headerText, translations)}
				</label>
			)}
			<div
				className={`container ${showDropdown && !readOnly ? 'onFocus' : ''} ${
					readOnly ? 'disabled' : ''
				} `}
			>
				<div
					className={`labelcontainer ${readOnly ? 'disabled' : ''}`}
					onClick={() => !readOnly && setShowDropdown(!showDropdown)}
				>
					<label className={`label ${readOnly ? 'disabled' : ''}`}>
						{getTranslations(
							selected === undefined
								? placeholder
								: dropdownData?.find(e => e?.key === selectedDataKey)?.label,
							translations,
						)}
					</label>
					<i className="fa-solid fa-angle-down"></i>
				</div>
				{showDropdown && (
					<div
						className="dropdowncontainer"
						onMouseLeave={() => closeOnMouseLeave && handleClose()}
					>
						{dropdownData?.map(each => (
							<div
								onClick={() => handleClick(each!)}
								className="dropdownItem"
								key={each?.key}
							>
								{each?.label}
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
};

export default component;
