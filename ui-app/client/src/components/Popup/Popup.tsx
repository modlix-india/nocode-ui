import React, { useState } from 'react';
import {
	addListener,
	getData,
	getPathFromLocation,
	PageStoreExtractor,
} from '../../context/StoreContext';
import {
	ComponentProperty,
	RenderContext,
	DataLocation,
	ComponentProps,
	ComponentPropertyDefinition,
} from '../../types/common';
import { Component } from '../../types/common';
import useDefinition from '../util/useDefinition';
import PopupStyles from './PopupStyles';
import { propertiesDefinition, stylePropertiesDefinition } from './popupProperties';
import Portal from '../Portal';
import { HelperComponent } from '../HelperComponent';
import { renderChildren } from '../util/renderChildren';

function Popup(props: ComponentProps) {
	const [isActive, setIsActive] = React.useState(false);
	const {
		definition: { bindingPath },
	} = props;
	React.useEffect(() => {
		if (bindingPath)
			addListener((_, value) => {
				setIsActive(!!value);
			}, getPathFromLocation(bindingPath, props.locationHistory));
	}, []);
	const pageExtractor = PageStoreExtractor.getForContext(props.context.pageName);
	let {
		key,
		properties: { showClose = true, closeOnEscape = true } = {},
		styleProperties,
	} = useDefinition(props.definition, propertiesDefinition, props.locationHistory, pageExtractor);

	if (!isActive) return null;

	return (
		<Portal>
			<div className="comp compPopup">
				<HelperComponent definition={props.definition} />
				<div className="backdrop">
					<div className="modal">
						{renderChildren(
							props.pageDefinition,
							props.definition.children,
							props.context,
							props.locationHistory,
						)}
					</div>
				</div>
			</div>
		</Portal>
	);
}

const component: Component = {
	name: 'Popup',
	displayName: 'Popup',
	description: 'Popup component',
	component: Popup,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: PopupStyles,
};

export default component;
