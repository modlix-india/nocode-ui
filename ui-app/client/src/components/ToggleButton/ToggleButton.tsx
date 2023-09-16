import React, { useCallback } from 'react';
import {
	addListenerAndCallImmediately,
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
import { styleDefaults } from './toggleButtonStyleProperties';

function ToggleButton(props: ComponentProps) {
	const {
		definition: { bindingPath },
		pageDefinition: { translations },
		definition,
		locationHistory,
		context,
	} = props;
	const [isToggled, setIsToggled] = React.useState(false);
	const [hover, setHover] = React.useState(false);
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const {
		key,
		properties: {
			label: onLabel,
			offLabel,
			designType,
			toggleButtonLabelAlignment,
			colorScheme,
		} = {},
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
		{ hover },
		stylePropertiesWithPseudoStates,
	);
	const bindingPathPath = bindingPath
		? getPathFromLocation(bindingPath, locationHistory, pageExtractor)
		: undefined;
	React.useEffect(() => {
		if (!bindingPathPath) return;

		return addListenerAndCallImmediately(
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

	const label = isToggled ? onLabel : offLabel ?? onLabel;

	const labelComp = label ? (
		<span
			style={resolvedStyles.label ?? {}}
			className={`_toggleButtonLabel ${toggleButtonLabelAlignment}`}
		>
			<SubHelperComponent definition={props.definition} subComponentName="label" />
			{getTranslations(label, translations)}
		</span>
	) : null;
	return (
		<label
			className={`comp compToggleButton ${designType} ${colorScheme} ${
				isToggled ? '_on' : '_off'
			}`}
			style={resolvedStyles.comp ?? {}}
			onMouseEnter={() => setHover(true)}
			onMouseLeave={() => setHover(false)}
		>
			<HelperComponent definition={definition} />

			<div
				className={`_knob ${
					toggleButtonLabelAlignment === '_onknob' && label?.length ? '_withText' : ''
				}`}
				style={resolvedStyles.knob ?? {}}
			>
				<SubHelperComponent definition={props.definition} subComponentName="knob" />
				{toggleButtonLabelAlignment === '_onknob' ? labelComp : null}
			</div>
			<input
				style={resolvedStyles.input ?? {}}
				type="checkbox"
				id={key}
				onChange={handleChange}
				checked={!!isToggled}
			/>
			{toggleButtonLabelAlignment === '_ontrack' ? labelComp : null}
		</label>
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
	styleDefaults: styleDefaults,
	styleProperties: stylePropertiesDefinition,
	bindingPaths: {
		bindingPath: { name: 'Data Binding' },
	},
	defaultTemplate: {
		key: '',
		type: 'ToggleButton',
		name: 'ToggleButton',
		properties: {
			label: { value: '' },
		},
	},
	stylePseudoStates: ['hover'],
	sections: [{ name: 'Toggle Buttons', pageName: 'togglebuttons' }],
};

export default component;
