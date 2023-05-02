import React, { createRef, useEffect, useRef, useState } from 'react';
import { PageStoreExtractor } from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './videoProperties';
import VideoStyle from './VideoStyle';
import { HelperComponent } from '../HelperComponent';
import { isNullValue } from '@fincity/kirun-js';

function Video(props: ComponentProps) {
	const { definition, locationHistory, context } = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const { properties: { width, height, src, type, poster } = {} } = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);

	//to check wheater browser supports html5 video
	const [videoControls, setVideoControl] = useState<boolean>(true);
	//playPauseButton
	const [playPauseEnd, setPlayPauseEnd] = useState<string>('play');
	//VIDEODURATION
	const [progressbarMax, setProgressbarMax] = useState<number>(0);

	//current duration of the video(timeElapsed)
	const [progressbarCurr, setProgressBarCurr] = useState<number>(0);

	const [toolTipX, setToolTipX] = useState<number>(0);

	//To show seek time while hovering on input.
	const [seekToolTip, setSeekToolTip] = useState<{
		hours: string;
		minutes: string;
		seconds: string;
	}>({ hours: '00', minutes: '00', seconds: '00' });

	//TO SHOW VALUE IN THE TIME TAG
	const [duration, setDuration] = useState<{ hours: string; minutes: string; seconds: string }>({
		hours: '00',
		minutes: '00',
		seconds: '00',
	});
	//To show timeElapsed in time tag
	const [timElapsed, settimeElapsed] = useState<{
		hours: string;
		minutes: string;
		seconds: string;
	}>({
		hours: '00',
		minutes: '00',
		seconds: '00',
	});

	//To toggle tool tip
	const [toogleToolTip, setToggleToolTip] = useState<boolean>(false);
	const [controlsOnHover, setControlsOnHover] = useState<boolean>(false);
	const [muted, setMuted] = useState<boolean>(false);
	const [fullScreenState, setFullScreenState] = useState<String>('expand');

	//videoRef
	const video = createRef<HTMLVideoElement>();
	//InputProgressBarRef
	const progressBarRef = createRef<HTMLInputElement>();
	//VolumeInput ref
	const [volume, setVolume] = useState<string>('1');
	//
	const volumeButton = createRef<HTMLButtonElement>();
	//fullScreen
	const fullScreen = createRef<HTMLButtonElement>();
	//containerRef
	const videoContainer = createRef<HTMLDivElement>();
	//Pip ref
	const pipRef = createRef<HTMLButtonElement>();

	useEffect(() => {
		if (!video.current) return;
		// checking wheather browser supports html5 video or not.
		if (typeof video.current.canPlayType === 'function') {
			setVideoControl(false);
		}
	}, []);

	const handlePlayPause = () => {
		if (!video.current) return;
		if (video.current.paused || video.current.ended) {
			video.current.play();
			setPlayPauseEnd('pause');
		} else {
			video.current.pause();
			setPlayPauseEnd('play');
		}
	};

	//To format time in hours min sec
	const formatTime = (time: number) => {
		const result = new Date(time * 1000).toISOString().substring(11, 19);
		return {
			hours: result.substring(0, 2),
			minutes: result.substring(3, 5),
			seconds: result.substring(6, 8),
		};
	};

	//By this we can get the current time of the video
	const updateTimeElapsed = () => {
		if (!video.current) return;
		const time = formatTime(Math.round(video.current.currentTime));
		setProgressBarCurr(Math.floor(video.current.currentTime));
		//to show in the time tag of time Elapsed
		settimeElapsed(time);
	};

	//By this we can get the videoDuration after initilizing
	const initializeVideo = () => {
		if (!video.current) return;
		const videoDuration = Math.round(video.current.duration);
		setProgressbarMax(videoDuration);
		// we are calculating this to show In the time TAG
		const time = formatTime(videoDuration);
		setDuration(time);
	};

	//to show time in toolTip on hover of input or progressBar
	const updateSeek = (event: any) => {
		if (!progressBarRef.current) return;
		const toolTipX = event.clientX - (progressBarRef.current.getBoundingClientRect().left - 1);
		const clientWidth = event.target.clientWidth;
		const skipTo = Math.round((toolTipX / clientWidth) * progressbarMax);
		const t = formatTime(skipTo);
		setSeekToolTip(t);
		if (clientWidth - toolTipX < 30) {
			setToolTipX(toolTipX - 32);
		} else {
			setToolTipX(toolTipX);
		}
	};

	const skipAhead = (value: number) => {
		if (!video.current) return;
		video.current.currentTime = value;
	};

	const [manualSeek, setManualSeek] = useState<number | undefined>(undefined);

	//volumeControl
	let vol: number;
	const updateVolume = (event: any) => {
		if (!video.current) return;
		if (video.current.muted) video.current.muted = false;
		setVolume(event.target.value);
		vol = parseFloat(event.target.value);
		if (isNaN(vol)) return;
		video.current.volume = vol;
		setMuted(false);
	};
	const volumeIconHandle = (event: any) => {
		if (!video.current) return;
		video.current.muted = !video.current.muted;
		setMuted(!muted);
		if (muted === false) {
			setVolume('0');
		} else {
			setVolume(`${vol}`);
		}
	};

	const handleFullScreen = (event: any) => {
		if (!videoContainer.current) return;
		if (document.fullscreenElement) {
			document.exitFullscreen();
			setFullScreenState('compress-wide');
		} else {
			videoContainer.current.requestFullscreen();
			setFullScreenState('expand');
		}
	};
	//Picture in picture
	const handlePictureInPicture = async () => {
		if (!video.current || !pipRef.current) return;
		try {
			if (video.current !== document.pictureInPictureElement) {
				pipRef.current.disabled = true;
				await video.current.requestPictureInPicture();
			} else {
				await document.exitPictureInPicture();
			}
		} catch (error) {
			console.log(error);
		} finally {
			pipRef.current.disabled = false;
		}
	};
	const handleMouseLeaveVideo = (event: any) => {
		setControlsOnHover(false);
	};
	const handleMouseEnterVideo = (event: any) => {
		setControlsOnHover(true);
	};
	const handleMouseEnterInput = (event: any) => {
		setToggleToolTip(true);
	};
	const handleMouseLeaveInput = (event: any) => {
		setToggleToolTip(false);
	};
	return (
		<div
			className="comp compVideo"
			ref={videoContainer}
			onMouseEnter={handleMouseEnterVideo}
			onMouseLeave={handleMouseLeaveVideo}
		>
			<HelperComponent definition={definition} />
			<video
				width={width}
				height={height}
				controls={videoControls}
				poster={poster}
				preload="metadata"
				ref={video}
				onLoadedMetadata={initializeVideo}
				onTimeUpdate={updateTimeElapsed}
				data-seek
				onChange={volumeIconHandle}
				onClick={handlePlayPause}
			>
				<source src={src} type={type} />
				Your browser does not support HTML5 video.
			</video>
			{
				<div className={`videoControlsContainer ${videoControls ? 'hidden' : ''} `}>
					<div
						className="progressBarContainer"
						onMouseEnter={handleMouseEnterInput}
						onMouseLeave={handleMouseLeaveInput}
					>
						<input
							className="progressBar progress"
							id="seek"
							value={manualSeek === undefined ? progressbarCurr : manualSeek}
							min="0"
							type="range"
							step="1"
							max={progressbarMax}
							onMouseMove={updateSeek}
							onMouseDown={() => setManualSeek(progressbarCurr)}
							onMouseUp={ev => {
								let value = Number.parseInt(ev.target.value ?? '') ?? 0;
								skipAhead(value);
								setProgressBarCurr(value);
								setManualSeek(undefined);
							}}
							ref={progressBarRef}
							onChange={ev => {
								if (manualSeek) setManualSeek(parseInt(ev.target.value));
							}}
						/>
						{toogleToolTip && (
							<div style={{ left: `${toolTipX}px` }} className="toolTip">{`${
								seekToolTip.hours != '00' ? seekToolTip.hours + ':' : ''
							}${seekToolTip.minutes}:${seekToolTip.seconds}`}</div>
						)}
					</div>
					<div className="playAndFullscreenGrid">
						<div className="playAndVolumeGrid">
							<i
								className={`playBackIcon  fa-solid fa-${playPauseEnd}`}
								onClick={handlePlayPause}
							></i>
							<div className="time">
								<time
									className="timeElapsed"
									id="time-elapsed"
									dateTime={`${timElapsed.hours != '00' ? timElapsed.hours : ''}${
										timElapsed.minutes != '00' ? timElapsed.minutes : ''
									}${timElapsed.seconds}`}
								>{`${timElapsed.hours != '00' ? timElapsed.hours + ':' : ''}${
									timElapsed.minutes
								}:${timElapsed.seconds}`}</time>
								<span className="timeSplitter">/</span>
								<time
									className="duration"
									id="duration"
									dateTime={`${duration.hours != '00' ? duration.hours : ''}:${
										duration.minutes != '00' ? duration.minutes : ''
									}:${duration.seconds}`}
								>{`${duration.hours != '00' ? duration.hours + ':' : ''}${
									duration.minutes
								}:${duration.seconds}`}</time>
							</div>
							<div className="volumeControls">
								<i
									id="volume-button"
									ref={volumeButton}
									className={`volumeButton fa-solid fa-volume-${
										volume == '0' || muted ? 'xmark' : 'high'
									}`}
									onClick={volumeIconHandle}
								></i>
								<input
									id="volume"
									value={volume}
									max={'1'}
									min={'0'}
									step={'0.01'}
									type="range"
									onChange={updateVolume}
								/>
							</div>
						</div>
						<div className="pipAndFullScreenGrid">
							<i
								className="fa-solid fa-window-restore pip"
								onClick={handlePictureInPicture}
								ref={pipRef}
							></i>
							<i
								className="fa-solid fa-expand fullScreen"
								ref={fullScreen}
								id="fullscreen-button"
								onClick={handleFullScreen}
							></i>
						</div>
					</div>
				</div>
			}
		</div>
	);
}

const component: Component = {
	icon: 'fa fa-solid fa-film',
	name: 'Video',
	displayName: 'Video',
	description: 'Video component',
	component: Video,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	styleComponent: VideoStyle,
	allowedChildrenType: new Map<string, number>([['', -1]]),
};

export default component;
