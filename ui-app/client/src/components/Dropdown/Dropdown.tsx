import React, { useEffect, useState } from 'react';
import { PageStoreExtractor } from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { HelperComponent } from '../HelperComponent';
import { getRenderData } from '../util/getRenderData';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition } from './dropdownProperties';
import DropdownStyle from './DropdownStyle';

function DropdownComponent(props: ComponentProps) {
	const pageExtractor = PageStoreExtractor.getForContext(props.context.pageName);
	const {
		definition: { bindingPath },
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
			onChange,
			onClick,
			datatype,
			dataBinding,
		} = {},
		styleProperties,
	} = useDefinition(props.definition, propertiesDefinition, props.locationHistory, pageExtractor);
	console.log('Himashu', datatype, dataBinding, uniqueKeyType, selectionType);
	const renderData = getRenderData(
		dataBinding,
		datatype,
		uniqueKeyType,
		uniqueKey,
		selectionType,
		selectionKey,
		labelKeyType,
		labelKey,
	);
	console.log('renderdata', renderData);
	return (
		<div className="comp compDropdown">
			<HelperComponent definition={props.definition} />
			<div className="container">
				<label>Select</label>
				<div className="dropdowncontainer">
					{renderData?.map(e => (
						<div className="dropdownItem">{e?.label}</div>
					))}
				</div>
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
