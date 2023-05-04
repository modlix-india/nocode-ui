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
	const [hover, setHover] = React.useState(false);

	const {
		definition: { bindingPath },
		definition,
		context,
		locationHistory,
		pageDefinition,
	} = props;

	const {
		key,
		properties: {
			label,
			showProgressValue,
			progressNotStartedLabel,
			inProgressLabel,
			progressCompletedLabel,
			appendProgressValue,
			prependProgressValue,
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

	const [value, setValue] = React.useState(0);
	const bindingPathPath =
		bindingPath && getPathFromLocation(bindingPath, locationHistory, pageExtractor);
	React.useEffect(() => {
		if (!bindingPathPath) return;
		return addListenerAndCallImmediately(
			(_, value) => {
				setValue(value ?? 0);
			},
			pageExtractor,
			bindingPathPath,
		);
	}, [bindingPath]);

	return (
		<div className="comp compProgressBar" style={resolvedStyles.comp ?? {}}>
			<HelperComponent definition={props.definition} />
			{label ? (
				<label className="progressBarLabel" style={resolvedStyles.progressBarLabel ?? {}}>
					{getTranslations(label, props.pageDefinition.translations)}
				</label>
			) : null}
			<span
				className="progressBar"
				style={resolvedStyles.progressBar ?? {}}
				onMouseEnter={
					stylePropertiesWithPseudoStates?.hover ? () => setHover(true) : undefined
				}
				onMouseLeave={
					stylePropertiesWithPseudoStates?.hover ? () => setHover(false) : undefined
				}
			>
				<span
					style={{ width: `${value}%`, ...(resolvedStyles.progress ?? {}) }}
					className="progress"
				></span>
				<label className="progressValue" style={resolvedStyles.progressValue ?? {}}>
					{`${prependProgressValue && showProgressValue ? value + '% ' : ''}` +
						`${
							progressNotStartedLabel || inProgressLabel || progressCompletedLabel
								? value <= 0
									? progressNotStartedLabel
									: value === 100
									? progressCompletedLabel
									: inProgressLabel
								: ''
						}` +
						`${appendProgressValue && showProgressValue ? value + '% ' : ''}`}
				</label>
			</span>
		</div>
	);
}

const component: Component = {
	icon: 'fa-solid fa-bars-progress',
	name: 'ProgressBar',
	displayName: 'ProgressBar',
	description: 'ProgressBar component',
	component: ProgressBar,
	styleComponent: ProgressBarStyles,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	stylePseudoStates: ['hover'],
	defaultTemplate: {
		key: '',
		type: 'ProgressBar',
		name: 'ProgressBar',
	},
};

export default component;
