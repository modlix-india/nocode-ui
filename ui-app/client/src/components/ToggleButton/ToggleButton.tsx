import React, { useCallback } from 'react';
import {
	addListenerAndCallImmediately,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
	UrlDetailsExtractor,
} from '../../context/StoreContext';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { getTranslations } from '../util/getTranslations';
import { Component } from '../../types/common';
import { propertiesDefinition, stylePropertiesDefinition } from './toggleButtonProperties';
import ToggleButtonStyle from './ToggleButtonStyle';
import useDefinition from '../util/useDefinition';
import { SubHelperComponent } from '../HelperComponents/SubHelperComponent';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './toggleButtonStyleProperties';
import { IconHelper } from '../util/IconHelper';
import { runEvent } from '../util/runEvent';

function ToggleButton(props: Readonly<ComponentProps>) {
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
	const urlExtractor = UrlDetailsExtractor.getForContext(context.pageName);
	const {
		key,
		properties: {
			label: onLabel,
			offLabel,
			designType,
			toggleButtonLabelAlignment,
			colorScheme,
			onClick,
			readOnly,
			onIcon,
			offIcon,
			onImage,
			offImage,
		} = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
		urlExtractor,
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
			pageExtractor.getPageName(),
			(_, value) => {
				setIsToggled(value);
			},
			bindingPathPath,
		);
	}, [bindingPathPath]);

	const handleChange = useCallback(
		(event: any) => {
			if (readOnly || !bindingPathPath) return;
			setData(bindingPathPath, event.target.checked, context.pageName);
			if (!onClick || !props.pageDefinition.eventFunctions?.[onClick]) return;
			const eventFunction = props.pageDefinition.eventFunctions[onClick];

			(async () => {
				await runEvent(
					eventFunction,
					onClick,
					props.context.pageName,
					props.locationHistory,
					props.pageDefinition,
				);
			})();
		},
		[onClick, bindingPathPath, props.pageDefinition.eventFunctions?.[onClick], readOnly],
	);

	const label = isToggled ? onLabel : (offLabel ?? onLabel);

	const icon = isToggled ? (
		onImage ? (
			<img src={onImage} className="_toggleIcon" alt="on" style={resolvedStyles.icon} />
		) : onIcon ? (
			<i className={`${onIcon} _toggleIcon`} style={resolvedStyles.icon} />
		) : null
	) : offImage ? (
		<img src={offImage} className="_toggleIcon" alt="off" style={resolvedStyles.icon} />
	) : offIcon ? (
		<i className={`${offIcon} _toggleIcon`} style={resolvedStyles.icon} />
	) : null;

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
			} ${readOnly ? '_disabled' : ''}`}
			style={resolvedStyles.comp ?? {}}
			onMouseEnter={() => setHover(true)}
			onMouseLeave={() => setHover(false)}
		>
			<HelperComponent context={props.context} definition={definition} />

			<div
				className={`_knob ${
					toggleButtonLabelAlignment === '_onknob' && label?.length ? '_withText' : ''
				}`}
				style={resolvedStyles.knob ?? {}}
			>
				<SubHelperComponent definition={props.definition} subComponentName="knob" />
				{toggleButtonLabelAlignment === '_onknob' ? labelComp : null}
				{icon}
			</div>
			<input
				style={resolvedStyles.input ?? {}}
				type="checkbox"
				id={key}
				onChange={handleChange}
				checked={!!isToggled}
				disabled={readOnly}
			/>
			{toggleButtonLabelAlignment === '_ontrack' ? labelComp : null}
		</label>
	);
}

const component: Component = {
	name: 'ToggleButton',
	displayName: 'Toggle Button',
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
		stylePropertiesForTheme: styleProperties,
};

export default component;
