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
import { SubHelperComponent } from '../SubHelperComponent';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';

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
	const resolvedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
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
			<label style={resolvedStyles.label ?? {}} className="toggleButton">
				<SubHelperComponent definition={props.definition} subComponentName="label" />
				<input
					style={resolvedStyles.input ?? {}}
					type="checkbox"
					id={key}
					onChange={handleChange}
					checked={isToggled}
				/>
				<SubHelperComponent
					style={resolvedStyles.input ?? {}}
					definition={props.definition}
					subComponentName="input"
				/>
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
