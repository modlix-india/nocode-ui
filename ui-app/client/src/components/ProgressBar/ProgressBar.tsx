import React, { useEffect, useState } from 'react';
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
import { SubHelperComponent } from '../SubHelperComponent';

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
			showProgressValue,
			progressValue = 0,
			progressValueUnit,
			showProgressLabel,
			noProgressLabel = '',
			progressLabel = '',
			completedProgressLabel = '',
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
	const [relativeToProgressBar, setRelativeToProgressBar] = useState(false);
	const [relativeToCurrentProgress, setRelativeToCurrentProgress] = useState(false);
	const designMap: Map<string, boolean> = new Map([
		['_progressBarDesignOne', true],
		['_progressBarDesignTwo', false],
		['_progressBarDesignThree', true],
	]);

	useEffect(() => {
		if (designMap.get(progressBarDesignSelection)) setRelativeToCurrentProgress(true);
		else setRelativeToProgressBar(true);
	}, [progressBarDesignSelection]);

	const getEffectiveLabel = () => {
		if (progressValue <= 0) return noProgressLabel;
		else if (progressValue == 100) return completedProgressLabel;
		else return progressLabel;
	};

	const effectiveProgressLabel = showProgressLabel ? (
		<span className="_progressLabel" style={resolvedStyles.progressLabel ?? {}}>
			{getEffectiveLabel()}
			<SubHelperComponent definition={props.definition} subComponentName="progressLabel" />
		</span>
	) : null;
	const effectiveProgressValue = showProgressValue ? (
		<span className="_progressValue" style={resolvedStyles.progressValue ?? {}}>
			{`${progressValue}${progressValueUnit ? progressValueUnit : ''}`}
			<SubHelperComponent definition={props.definition} subComponentName="progressValue" />
		</span>
	) : null;

	const progressLabelAndValueContainer = (
		<span
			className={`_labelAndValueContainer _${labelAndValueContainerPosition}`}
			style={resolvedStyles.labelAndValueContainer ?? {}}
		>
			{progressLabelPosition === 'Right'
				? [effectiveProgressValue, effectiveProgressLabel]
				: [effectiveProgressLabel, effectiveProgressValue]}
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
						width: `${progressValue}%`,
						...(resolvedStyles.currentProgress ?? {}),
					}}
					className="_currentProgress"
				>
					<SubHelperComponent
						definition={props.definition}
						subComponentName="currentProgress"
					/>
					{relativeToCurrentProgress ? progressLabelAndValueContainer : null}
				</span>
				{relativeToProgressBar ? progressLabelAndValueContainer : null}
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
