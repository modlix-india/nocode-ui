import React, { createRef, useEffect, useRef, useState } from 'react';
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
	const [playPauseEnd, setPlayPauseEnd] = useState<string>('play');
	const [progressbarMax, setProgressbarMax] = useState<number>(0);
	const [progressbarCurr, setProgressBarCurr] = useState<number>(0);
	const [skipTo, setSkipTo] = useState<number>(0);
	const [updatedSeekToolTip, setUpdatedSeekToolTip] = useState<number>(0);
	const [seekToolTip, setSeekToolTip] = useState<{
		hours: string;
		minutes: string;
		seconds: string;
	}>({ hours: '00', minutes: '00', seconds: '00' });
	const [duration, setDuration] = useState<{ hours: string; minutes: string; seconds: string }>({
		hours: '00',
		minutes: '00',
		seconds: '00',
	});

	const [timElapsed, settimeElapsed] = useState<{
		hours: string;
		minutes: string;
		seconds: string;
	}>({
		hours: '00',
		minutes: '00',
		seconds: '00',
	});

	const video = createRef<HTMLVideoElement>();
	const progressBarRef = createRef<HTMLInputElement>();

	let videoDuration;

	useEffect(() => {
		if (!video.current) return;

		videoDuration = Math.round(video.current.duration);

		// checking wheather browser supports html5 video or not.
		if (video.current.canPlayType) setVideoControl(false);
	}, []);

	const handlePlayPause = () => {
		if (video.current.paused || video.current.ended) {
			video.current.play();
			setPlayPauseEnd('pause');
		} else {
			video.current.pause();
			setPlayPauseEnd('play');
		}
	};

	const formatTime = timeInSeconds => {
		const result = new Date(timeInSeconds * 1000).toISOString().substring(11, 19);

		return {
			hours: result.substring(0, 2),
			minutes: result.substring(3, 5),
			seconds: result.substring(6, 8),
		};
	};

	const updateTimeElapsed = () => {
		const time = formatTime(Math.round(video.current.currentTime));
		setProgressBarCurr(Math.floor(video.current.currentTime));
		settimeElapsed(time);
	};

	const initializeVideo = () => {
		const videoDuration = Math.round(video.current.duration);
		setProgressbarMax(videoDuration);

		const time = formatTime(videoDuration);
		setDuration(time);
	};
	const updateSeek = (event: any) => {
		const skipTo = Math.round(
			((event.clientX - progressBarRef.current.getBoundingClientRect().left) /
				event.target.clientWidth) *
				progressbarMax,
		);

		const t = formatTime(skipTo);
		setSeekToolTip(t);
		console.log(t);

		const rect = video.current.getBoundingClientRect();
		setUpdatedSeekToolTip(event.pageX - rect.left);
	};

	const handleChangeInput = (event: any) => {
		console.log(event.target.dataset.seek, event.target.value, 'seek');
		const skipTo = event.target.dataset.seek ? event.target.dataset.seek : event.target.value;
		console.log(skipTo, 'skipTo');
		setProgressBarCurr(skipTo);
	};
	return (
		<div className="comp compVideo">
			<div className={`video-controls ${videoControls ? 'hidden' : ''}`}>
				<i
					className={`playBackIcon  fa-solid fa-${playPauseEnd}`}
					onClick={handlePlayPause}
				></i>
				<div className="time">
					<time
						id="time-elapsed"
						dateTime={`${timElapsed.hours}:${timElapsed.minutes}:${timElapsed.seconds}`}
					>{`${timElapsed.hours}:${timElapsed.minutes}:${timElapsed.seconds}`}</time>
					<span>/</span>
					<time
						id="duration"
						dateTime={`${duration.hours}:${duration.minutes}:${duration.seconds}`}
					>{`${duration.hours}:${duration.minutes}:${duration.seconds}`}</time>
				</div>
				<div className="progressbar">
					<progress max={progressbarMax} value={progressbarCurr}></progress>
					<input
						id="seek"
						value={progressbarCurr}
						min="0"
						type="range"
						step="1"
						max={progressbarMax}
						data-seek={skipTo}
						style={{ left: updatedSeekToolTip }}
						onMouseMove={updateSeek}
						ref={progressBarRef}
						onChange={handleChangeInput}
					/>
					<div>{`${seekToolTip.hours}:${seekToolTip.minutes}:${seekToolTip.seconds}`}</div>
				</div>
			</div>

			<video
				width={width}
				height={height}
				controls={videoControls}
				poster={poster}
				preload="metadata"
				ref={video}
				onLoadedMetadata={initializeVideo}
				onTimeUpdate={updateTimeElapsed}
			>
				<source src={src} type="video/mp4" />
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
