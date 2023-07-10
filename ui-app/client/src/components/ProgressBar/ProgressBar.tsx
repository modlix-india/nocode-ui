import React from 'react';
import { PageStoreExtractor } from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponent';
import { getTranslations } from '../util/getTranslations';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './progressBarProperties';
import ProgressBarStyles from './ProgressBarStyles';
import { SubHelperComponent } from '../SubHelperComponent';

const designMap: Map<string, boolean> = new Map([
	['_progressBarDesignOne', true],
	['_progressBarDesignTwo', false],
	['_progressBarDesignThree', true],
]);

function ProgressBar(props: ComponentProps) {
	const pageExtractor = PageStoreExtractor.getForContext(props.context.pageName);
	const [hover, setHover] = React.useState(false);

	const { definition, locationHistory, pageDefinition } = props;

	const {
		properties: {
			showProgressValue,
			progressValue,
			progressValueUnit,
			showProgressLabel,
			noProgressLabel,
			progressLabel,
			completedProgressLabel,
			progressLabelPosition,
			labelAndValueContainerPosition,
			progressBarDesignSelection,
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

	const getEffectiveLabel = () => {
		if (progressValue <= 0)
			return getTranslations(noProgressLabel, pageDefinition.translations);
		else if (progressValue === 100)
			return getTranslations(completedProgressLabel, pageDefinition.translations);
		else return getTranslations(progressLabel, pageDefinition.translations);
	};
	const getEffectiveLabelColorClass = () => {
		if (progressValue <= 0) return '_noProgress';
		else if (progressValue === 100) return '_completedProgress';
		else return '_progress';
	};

	const effectiveProgressLabel = showProgressLabel ? (
		<span
			className={`_progressLabel ${getEffectiveLabelColorClass()}`}
			style={resolvedStyles.progressLabel ?? {}}
		>
			{getEffectiveLabel()}
			<SubHelperComponent definition={props.definition} subComponentName="progressLabel" />
		</span>
	) : null;
	const effectiveProgressValue = showProgressValue ? (
		<span
			className={`_progressValue ${getEffectiveLabelColorClass()}`}
			style={resolvedStyles.progressValue ?? {}}
		>
			{`${progressValue}${progressValueUnit ? progressValueUnit : ''}`}
			<SubHelperComponent definition={props.definition} subComponentName="progressValue" />
		</span>
	) : null;

	const progressLabelAndValueContainer = (
		<span
			className={`_labelAndValueContainer _${labelAndValueContainerPosition}`}
			style={resolvedStyles.labelAndValueContainer ?? {}}
		>
			{progressLabelPosition === 'Right' ? (
				<>
					{effectiveProgressValue} {effectiveProgressLabel}
				</>
			) : (
				<>
					{effectiveProgressLabel} {effectiveProgressValue}
				</>
			)}
			<SubHelperComponent
				definition={props.definition}
				subComponentName="labelAndValueContainer"
			/>
		</span>
	);

	return (
		<div
			className={`comp compProgressBar ${progressBarDesignSelection}`}
			style={resolvedStyles.comp ?? {}}
		>
			<HelperComponent definition={props.definition} />
			<span
				className="_progressBar"
				style={resolvedStyles.progressBar ?? {}}
				onMouseEnter={
					stylePropertiesWithPseudoStates?.hover ? () => setHover(true) : undefined
				}
				onMouseLeave={
					stylePropertiesWithPseudoStates?.hover ? () => setHover(false) : undefined
				}
			>
				<SubHelperComponent definition={props.definition} subComponentName="progressBar" />
				<span
					style={{
						...(resolvedStyles.currentProgress ?? {}),
						width: `${progressValue}%`,
					}}
					className="_currentProgress"
				>
					<SubHelperComponent
						definition={props.definition}
						subComponentName="currentProgress"
					/>
					{designMap.get(progressBarDesignSelection)
						? progressLabelAndValueContainer
						: null}
				</span>
				{!designMap.get(progressBarDesignSelection) ? progressLabelAndValueContainer : null}
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
	sections: [{ name: 'Default Progress Bar', pageName: 'progressBar' }],
};

export default component;
