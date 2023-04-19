import React, { createRef, useEffect, useState } from 'react';
import { PageStoreExtractor } from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './videoProperties';
import VideoStyle from './VideoStyle';

function Video(props: ComponentProps) {
	const { definition, pageDefinition, locationHistory, context } = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const {
		key,
		properties: { width, height, src, type, poster } = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);
	const [videoControls, setVideoControl] = useState<boolean>(true);
	const video = createRef<HTMLVideoElement>();
	const playPauseRef = createRef<HTMLButtonElement>();

	useEffect(() => {
		if (!video) return;
		// checking wheather browser supports html5 video or not.
		if (video.current.canPlayType) setVideoControl(false);
		console.log(video.current, 'current');
	}, []);

	const handlePlayPause = () => {
		if (video.current.paused || video.current.ended) {
			video.current.play();
		} else {
			video.current.pause();
		}
	};

	return (
		<div className="comp compVideo">
			<div className={`video-controls ${videoControls ? 'hidden' : ''}`}>
				<button
					className="playPauseButton"
					ref={playPauseRef}
					onClick={handlePlayPause}
				></button>
			</div>

			<video
				width={width}
				height={height}
				controls={videoControls}
				poster={poster}
				preload="metadata"
				ref={video}
			>
				<source src={src} type={type} />
				Your browser does not support HTML5 video.
			</video>
		</div>
	);
}

const component: Component = {
	icon: '',
	name: 'Video',
	displayName: 'Video',
	description: 'Video component',
	component: Video,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: VideoStyle,
};

export default component;
