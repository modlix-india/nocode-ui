import React, { useCallback } from 'react';
import {
	addListener,
	getData,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
} from '../../context/StoreContext';
import { HelperComponent } from '../HelperComponent';
import { ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { getTranslations } from '../util/getTranslations';
import { Component } from '../../types/common';
import { propertiesDefinition, stylePropertiesDefinition } from './toggleButtonProperties';
import ToggleButtonStyle from './ToggleButtonStyle';
import useDefinition from '../util/useDefinition';

function ToggleButton(props: ComponentProps) {
	const {
		definition: { bindingPath },
		pageDefinition: { translations },
		definition,
		locationHistory,
		context,
	} = props;
	const [isToggled, setIsToggled] = React.useState(false);
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const {
		key,
		properties: { label } = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);
	const bindingPathPath = bindingPath
		? getPathFromLocation(bindingPath, locationHistory, pageExtractor)
		: undefined;
	React.useEffect(() => {
		if (!bindingPathPath) return;

		return addListener(
			(_, value) => {
				setIsToggled(value);
			},
			pageExtractor,
			bindingPathPath,
		);
	}, [bindingPathPath]);

	const handleChange = useCallback(
		(event: any) => {
			if (!bindingPathPath) return;
			setData(bindingPathPath, event.target.checked, context.pageName);
		},
		[bindingPathPath],
	);
	return (
		<div className="comp compToggleButton">
			<HelperComponent definition={definition} />
			<label className="toggleButton">
				<input type="checkbox" id={key} onChange={handleChange} checked={isToggled} />
				{getTranslations(label, translations)}
			</label>
		</div>
	);
}

const component: Component = {
	icon: 'fa-solid fa-toggle-off',
	name: 'ToggleButton',
	displayName: 'ToggleButton',
	description: 'ToggleButton component',
	component: ToggleButton,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: ToggleButtonStyle,
	styleProperties: stylePropertiesDefinition,
	bindingPaths: {
		bindingPath: { name: 'Data Binding' },
	},
	defaultTemplate: {
		key: '',
		type: 'ToggleButton',
		name: 'ToggleButton',
		properties: {
			label: { value: 'ToggleButton' },
		},
	},
};

export default component;
