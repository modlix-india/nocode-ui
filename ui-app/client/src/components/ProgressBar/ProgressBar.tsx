import React from 'react';
import { PageStoreExtractor } from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { getTranslations } from '../util/getTranslations';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './progressBarProperties';
import ProgressBarStyles from './ProgressBarStyles';
import { SubHelperComponent } from '../HelperComponents/SubHelperComponent';
import { styleDefaults } from './progressBarStyleProperties';
import { IconHelper } from '../util/IconHelper';

function ProgressBar(props: ComponentProps) {
	const pageExtractor = PageStoreExtractor.getForContext(props.context.pageName);
	const [hover, setHover] = React.useState(false);

	const { definition, locationHistory, pageDefinition } = props;

	const {
		key,
		properties: {
			progressValue,
			minprogressValue,
			maxprogressValue,
			progressLabel,
			progressBarDesign,
			progressBarColorScheme,
			progressLabelAlignment,
			circularProgressBarIndicatorWidth,
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
	const progressElapsed = Math.round(
		(((progressValue ?? minprogressValue) - minprogressValue) * 100) /
			(maxprogressValue - minprogressValue),
	);

	const hasProgressLabelInside =
		progressLabel && progressLabelAlignment != '_top' && progressLabelAlignment != '_bottom';

	const hProgressBar = !progressBarDesign.startsWith('_circular')
		? [
				!hasProgressLabelInside && progressLabelAlignment === '_top' ? (
					<span
						className="_top"
						style={{ ...resolvedStyles.label, left: `${progressElapsed}%` }}
						key="_top"
					>
						<SubHelperComponent
							definition={props.definition}
							subComponentName="label"
						/>
						{getTranslations(progressLabel, pageDefinition.translations)}
					</span>
				) : null,
				<div className="_track" key="_track" style={resolvedStyles.track ?? {}}>
					<SubHelperComponent definition={props.definition} subComponentName="track" />
					<span
						className={`_progress ${progressLabelAlignment}`}
						style={{ ...resolvedStyles.progress, width: `${progressElapsed}%` }}
					>
						<SubHelperComponent
							definition={props.definition}
							subComponentName="progress"
						/>
						{hasProgressLabelInside
							? getTranslations(progressLabel, pageDefinition.translations)
							: ''}
					</span>
				</div>,
				!hasProgressLabelInside && progressLabelAlignment === '_bottom' ? (
					<span
						key="_bottom"
						className="_bottom"
						style={{ ...resolvedStyles.label, left: `${progressElapsed}%` }}
					>
						<SubHelperComponent
							definition={props.definition}
							subComponentName="label"
						/>
						{getTranslations(progressLabel, pageDefinition.translations)}
					</span>
				) : null,
			]
		: null;

	const cProgressBar = () => {
		if (!progressBarDesign.startsWith('_circular')) return null;
		const radius = 50 - circularProgressBarIndicatorWidth;
		const strokeDashArray = 2 * 3.14 * radius;

		const strokeDashOffset = (strokeDashArray * (100 - progressElapsed)) / 100;
		return [
			<svg key="svgpart" className="_circular_progress" viewBox="0 0 100 100">
				<circle
					className="_circular_track"
					r={`${radius}px`}
					strokeWidth={`${circularProgressBarIndicatorWidth}px`}
				/>
				<circle
					className="_circular_progress_indicator"
					r={`${radius}px`}
					strokeWidth={`${circularProgressBarIndicatorWidth}px`}
					strokeDasharray={`${strokeDashArray}px`}
					strokeDashoffset={`${strokeDashOffset}px`}
				/>
				{progressBarDesign === '_circular_text_background' ||
				progressBarDesign === '_circular_text_background_outline' ? (
					<circle className="_circular_progres_text_bg" />
				) : null}
			</svg>,
			<span className="_circular_label" key="labelpart" style={resolvedStyles.label}>
				<SubHelperComponent definition={props.definition} subComponentName="label" />
				{getTranslations(progressLabel, pageDefinition.translations)}
			</span>,
		];
	};
	return (
		<div
			className={`comp compProgressBar ${progressBarDesign} ${progressBarColorScheme} ${
				hasProgressLabelInside ? '_hasLabel' : ''
			}`}
			onMouseEnter={stylePropertiesWithPseudoStates?.hover ? () => setHover(true) : undefined}
			onMouseLeave={
				stylePropertiesWithPseudoStates?.hover ? () => setHover(false) : undefined
			}
			style={resolvedStyles.comp ?? {}}
		>
			<HelperComponent context={props.context} definition={props.definition} />
			{hProgressBar}
			{cProgressBar()}
		</div>
	);
}

const component: Component = {
	order: 23,
	name: 'ProgressBar',
	displayName: 'Progress Bar',
	description: 'ProgressBar component',
	component: ProgressBar,
	styleComponent: ProgressBarStyles,
	styleDefaults: styleDefaults,
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
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<rect
						className="_progressBarInner1"
						x="5.625"
						y="8.75761"
						width="12.5"
						height="4.6875"
						rx="0.2"
						transform="rotate(90 5.625 8.75761)"
						fill="url(#paint0_linear_3214_9486)"
					/>
					<rect
						className="_progressBarInner2"
						x="13.438"
						y="8.75761"
						width="12.5"
						height="4.6875"
						rx="0.2"
						transform="rotate(90 13.438 8.75761)"
						fill="url(#paint1_linear_3214_9486)"
					/>
					<rect
						className="_progressBarInner3"
						x="21.2495"
						y="8.75761"
						width="12.5"
						height="4.6875"
						rx="0.2"
						transform="rotate(90 21.2495 8.75761)"
						fill="url(#paint2_linear_3214_9486)"
					/>
					<rect
						className="_progressBarInner4"
						x="29.0625"
						y="8.75761"
						width="12.5"
						height="4.6875"
						rx="0.2"
						transform="rotate(90 29.0625 8.75761)"
						fill="url(#paint3_linear_3214_9486)"
					/>
					<defs>
						<linearGradient
							id="paint0_linear_3214_9486"
							x1="11.875"
							y1="8.75761"
							x2="11.875"
							y2="13.4451"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#B1A5FF" />
							<stop offset="1" stopColor="#7B66FF" />
						</linearGradient>
						<linearGradient
							id="paint1_linear_3214_9486"
							x1="19.688"
							y1="8.75761"
							x2="19.688"
							y2="13.4451"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#B1A5FF" />
							<stop offset="1" stopColor="#7B66FF" />
						</linearGradient>
						<linearGradient
							id="paint2_linear_3214_9486"
							x1="27.4995"
							y1="8.75761"
							x2="27.4995"
							y2="13.4451"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#B1A5FF" />
							<stop offset="1" stopColor="#7B66FF" />
						</linearGradient>
						<linearGradient
							id="paint3_linear_3214_9486"
							x1="35.3125"
							y1="8.75761"
							x2="35.3125"
							y2="13.4451"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#EEEEEE" stopOpacity="0.933333" />
							<stop offset="1" stopColor="#EDEAEA" />
						</linearGradient>
					</defs>
				</IconHelper>
			),
		},
		{
			name: 'track',
			displayName: 'Track',
			description: 'Track',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'progress',
			displayName: 'Progress',
			description: 'Progress',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'label',
			displayName: 'Label',
			description: 'Label',
			icon: 'fa-solid fa-box',
		},
	],
};

export default component;
