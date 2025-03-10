import { useEffect, useRef, useState } from 'react';
import { PageStoreExtractor } from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './Audioproperties';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import getSrcUrl from '../util/getSrcUrl';
import { SubHelperComponent } from '../HelperComponents/SubHelperComponent';
import { IconHelper } from '../util/IconHelper';
import AudioStyle from './AudioStyle';
import { styleDefaults } from './audioStyleProperties';

function Audio(props: Readonly<ComponentProps>) {
	const { definition, locationHistory, context, pageDefinition } = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const {
		properties: {
			src,
			type,
			audioDesign,
			colorScheme,
			autoPlay,
			loop,
			muted: mutedProperty,
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
		pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);

	const audioContainer = useRef<any>();

	const audio = useRef<any>();
	const [audioControls, setAudioControls] = useState<boolean>(true);
	const [isPlaying, setIsPlaying] = useState(false);

	const togglePlayPause = () => {
		if (!audio.current) return;
		if (isPlaying) {
			audio.current.pause();
		} else {
			audio.current.play();
		}
		setIsPlaying(!isPlaying);
	};

	return (
		<div
			className={`comp compAudio ${audioDesign} ${colorScheme}`}
			ref={audioContainer}
			style={resolvedStyles.comp ?? {}}
		>
			<HelperComponent context={props.context} definition={definition} />
			<audio
				controls={audioControls}
				preload="metadata"
				autoPlay={autoPlay}
				loop={loop}
				ref={audio}
				key={getSrcUrl(src)}
				data-seek
				style={resolvedStyles.player ?? {}}
			>
				<source src={getSrcUrl(src)} type={type} />
				Your browser does not support HTML5 audio.
			</audio>
		</div>
	);
}

const component: Component = {
	order: 19,
	name: 'Audio',
	displayName: 'Audio',
	description: 'Audio component',
	component: Audio,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	styleComponent: AudioStyle,
	styleDefaults: styleDefaults,
	allowedChildrenType: new Map<string, number>([['', -1]]),
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			mainComponent: true,
			description: 'Component',
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<circle cx="14" cy="14" r="14" fill="#000000" />
					<circle
						cx="14"
						cy="14"
						r="13.5"
						stroke=""
						strokeOpacity="0.04"
						fillOpacity={0}
					/>
					<path
						className="_videoPlayStart"
						d="M19.8932 13.2644C20.4594 13.5913 20.4594 14.4087 19.8932 14.7356L10.9743 19.8849C10.408 20.2119 9.70016 19.8032 9.70016 19.1493L9.70016 8.85068C9.70016 8.1968 10.408 7.78813 10.9743 8.11507L19.8932 13.2644Z"
						fill="white"
					/>
					<rect
						className="_videoPlayPause"
						x="9"
						y="8"
						width="4"
						height="12"
						rx="1"
						fill="white"
						opacity={0}
					/>
					<rect
						className="_videoPlayPause"
						x="15"
						y="8"
						width="4"
						height="12"
						rx="1"
						fill="white"
						opacity={0}
					/>
				</IconHelper>
			),
		},
		{
			name: 'playPauseButton',
			displayName: 'Play Pause Button',
			description: 'Play Pause Button',
			icon: 'fa fa-solid fa-box',
		},
	],
};

export default component;
