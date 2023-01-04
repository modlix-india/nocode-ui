import React from 'react';
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
	const bindingPathPath = getPathFromLocation(bindingPath!, locationHistory, pageExtractor);
	React.useEffect(() => {
		addListener(
			(_, value) => {
				setIsToggled(value);
			},
			pageExtractor,
			bindingPathPath,
		);
	}, []);
	const handleChange = (event: any) => {
		setData(bindingPathPath, event.target.checked);
	};
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
	name: 'ToggleButton',
	displayName: 'ToggleButton',
	description: 'ToggleButton component',
	component: ToggleButton,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: ToggleButtonStyle,
};

export default component;
