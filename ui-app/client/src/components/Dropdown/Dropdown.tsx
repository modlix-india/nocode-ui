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
			label,
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

	const selectedDataKey = React.useMemo(
		() => getSelectedKeys(dropdownData, selected),
		[selected],
	);

	const handleClick = async (each: { key: any; label: any; value: any } | undefined) => {
		if (each) setData(bindingPathPath, each.value, context?.pageName);
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
			{label ? (
				<label className={`label ${readOnly ? 'disabled' : ''}`}>
					{getTranslations(label, translations)}
				</label>
			) : null}
			<div
				className={`container ${showDropdown && !readOnly ? 'focus' : ''} ${
					readOnly ? 'disabled' : ''
				} `}
			>
				<div
					className={`labelContainer`}
					onClick={() => !readOnly && setShowDropdown(!showDropdown)}
				>
					<label className={`placeholder ${selected ? 'selected' : 'notSelected'}`}>
						{getTranslations(
							selected === undefined
								? placeholder
								: dropdownData?.find((each: any) => each?.key === selectedDataKey)
										?.label,
							translations,
						)}
					</label>
					<i className="fa-solid fa-angle-down placeholderIcon"></i>
				</div>
				{showDropdown && (
					<div
						className="dropdownContainer"
						onMouseLeave={() => closeOnMouseLeave && handleClose()}
					>
						{dropdownData?.map(each => (
							<div
								onClick={() => handleClick(each!)}
								className="dropdownItem"
								key={each?.key}
							>
								<label className="dropdownItemLabel">{each?.label}</label>
								{each?.key === selectedDataKey && (
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
