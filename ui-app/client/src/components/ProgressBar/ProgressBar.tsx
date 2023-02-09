import React from 'react';
import {
	addListenerAndCallImmediately,
	getPathFromLocation,
	PageStoreExtractor,
} from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponent';
import { getTranslations } from '../util/getTranslations';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './progressBarProperties';
import ProgressBarStyles from './ProgressBarStyles';

function ProgressBar(props: ComponentProps) {
	const pageExtractor = PageStoreExtractor.getForContext(props.context.pageName);

	const {
		definition: { bindingPath },
		definition,
		context,
		locationHistory,
		pageDefinition,
	} = props;

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

	const resolvedStyles = processComponentStylePseudoClasses({}, stylePropertiesWithPseudoStates);

	if (!bindingPath) throw new Error('Definition requires bindigPath');
	const [value, setValue] = React.useState(0);
	const bindingPathPath = getPathFromLocation(bindingPath, locationHistory, pageExtractor);
	React.useEffect(
		() =>
			addListenerAndCallImmediately(
				(_, value) => {
					setValue(value ?? 0);
				},
				pageExtractor,
				bindingPathPath,
			),
		[bindingPath],
	);

	return (
		<div className="comp compProgressBar" style={resolvedStyles.comp ?? {}}>
			<HelperComponent definition={props.definition} />
			<div>{getTranslations(label, props.pageDefinition.translations)}</div>
			<span className="progressBar" style={resolvedStyles.progressBar ?? {}}>
				<span
					style={{ width: `${value}%`, ...(resolvedStyles.progress ?? {}) }}
					className="progress"
				>
					<span className="progressValue" style={resolvedStyles.progressValue ?? {}}>
						{value}%
					</span>
				</span>
			</span>
		</div>
	);
}

const component: Component = {
	name: 'ProgressBar',
	displayName: 'ProgressBar',
	description: 'ProgressBar component',
	component: ProgressBar,
	styleComponent: ProgressBarStyles,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	stylePseudoStates: ['focus', 'hover', 'disabled'],
};

export default component;
