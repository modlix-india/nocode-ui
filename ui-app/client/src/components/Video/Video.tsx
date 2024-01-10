import React, { useEffect, useRef, useState } from 'react';
import { PageStoreExtractor } from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './videoProperties';
import VideoStyle from './VideoStyle';
import { HelperComponent } from '../HelperComponent';

import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { SubHelperComponent } from '../SubHelperComponent';
import { styleDefaults } from './videoStyleProperties';
import { IconHelper } from '../util/IconHelper';
import getSrcUrl from '../util/getSrcUrl';

function Video(props: ComponentProps) {
	const { definition, locationHistory, context, pageDefinition } = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const {
		properties: {
			src,
			type,
			poster,
			playsInline,
			muted: mutedProperty,
			autoPlay,
			loop,
			showPipButton,
			showFullScreenButton,
			showAudioControls,
			showSeekBar,
			showPlaypause,
			showTime,
			colorScheme,
			videoDesign,
			autoUnMuteAfterPlaying,
		} = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);

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
	const [muted, setMuted] = useState<boolean>(mutedProperty);
	const [fullScreenState, setFullScreenState] = useState<String>('expand');
	const [isFirstTimePlay, setFirstTimePlay] = useState<boolean>(true);

	//videoRef
	const video = useRef<any>();
	//InputProgressBarRef
	const progressBarRef = useRef<any>();
	//VolumeInput ref
	const [volume, setVolume] = useState<string>('1');
	//
	const volumeButton = useRef<any>();
	//fullScreen
	const fullScreen = useRef<any>();
	//containerRef
	const videoContainer = useRef<any>();
	//Pip ref
	const pipRef = useRef<any>();

	const resolvedStyles = processComponentStylePseudoClasses(
		pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);

	useEffect(() => {
		if (!video.current) return;
		// checking wheather browser supports html5 video or not.
		if (typeof video.current.canPlayType === 'function') {
			setVideoControl(false);
		}
	}, [video.current]);

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
			console.error(error);
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
	const playIcon1 = (
		<div
			className="_playIcon _playIconIcon"
			onClick={handlePlayPause}
			style={resolvedStyles.playPauseButton ?? {}}
		>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
				<path
					d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"
					fill="currentColor"
				/>
			</svg>
		</div>
	);

	const playIcon2 = (
		<div
			className="_playIcon _playIconIcon"
			onClick={handlePlayPause}
			style={resolvedStyles.playPauseButton ?? {}}
		>
			<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512">
				<path
					d="M0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zM188.3 147.1c-7.6 4.2-12.3 12.3-12.3 20.9V344c0 8.7 4.7 16.7 12.3 20.9s16.8 4.1 24.3-.5l144-88c7.1-4.4 11.5-12.1 11.5-20.5s-4.4-16.1-11.5-20.5l-144-88c-7.4-4.5-16.7-4.7-24.3-.5z"
					fill="currentColor"
				/>
			</svg>
		</div>
	);

	const playIconBig = (
		<div
			className="_playIcon _playIconIcon"
			onClick={handlePlayPause}
			style={resolvedStyles.playPauseButton ?? {}}
		>
			<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512">
				<path
					d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"
					fill="currentColor"
				/>
			</svg>
		</div>
	);

	const pauseIcon1 = (
		<div
			className="_pauseIcon _pauseIconIcon"
			onClick={handlePlayPause}
			style={resolvedStyles.playPauseButton ?? {}}
		>
			<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 320 512">
				<path
					d="M48 64C21.5 64 0 85.5 0 112V400c0 26.5 21.5 48 48 48H80c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zm192 0c-26.5 0-48 21.5-48 48V400c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H240z"
					fill="currentColor"
				/>
			</svg>
		</div>
	);

	const pauseIcon2 = (
		<div
			className="_pauseIcon _pauseIconIcon"
			onClick={handlePlayPause}
			style={resolvedStyles.playPauseButton ?? {}}
		>
			<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512">
				<path
					d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM224 192V320c0 17.7-14.3 32-32 32s-32-14.3-32-32V192c0-17.7 14.3-32 32-32s32 14.3 32 32zm128 0V320c0 17.7-14.3 32-32 32s-32-14.3-32-32V192c0-17.7 14.3-32 32-32s32 14.3 32 32z"
					fill="currentColor"
				/>
			</svg>
		</div>
	);

	const volumeHighIcon1 = (
		<div
			className="_volumeButton _volumeHighIcon"
			onClick={volumeIconHandle}
			id="volume-button"
			ref={volumeButton}
		>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512 ">
				<path
					d="M533.6 32.5C598.5 85.3 640 165.8 640 256s-41.5 170.8-106.4 223.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C557.5 398.2 592 331.2 592 256s-34.5-142.2-88.7-186.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM473.1 107c43.2 35.2 70.9 88.9 70.9 149s-27.7 113.8-70.9 149c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C475.3 341.3 496 301.1 496 256s-20.7-85.3-53.2-111.8c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zm-60.5 74.5C434.1 199.1 448 225.9 448 256s-13.9 56.9-35.4 74.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C393.1 284.4 400 271 400 256s-6.9-28.4-17.7-37.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM301.1 34.8C312.6 40 320 51.4 320 64V448c0 12.6-7.4 24-18.9 29.2s-25 3.1-34.4-5.3L131.8 352H64c-35.3 0-64-28.7-64-64V224c0-35.3 28.7-64 64-64h67.8L266.7 40.1c9.4-8.4 22.9-10.4 34.4-5.3z"
					fill="currentColor"
				/>
			</svg>
		</div>
	);

	const volumeMuteIcon1 = (
		<div
			className="_volumeButton _volumeMuteIcon"
			onClick={volumeIconHandle}
			id="volume-button"
			ref={volumeButton}
		>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
				<path
					d="M301.1 34.8C312.6 40 320 51.4 320 64V448c0 12.6-7.4 24-18.9 29.2s-25 3.1-34.4-5.3L131.8 352H64c-35.3 0-64-28.7-64-64V224c0-35.3 28.7-64 64-64h67.8L266.7 40.1c9.4-8.4 22.9-10.4 34.4-5.3zM425 167l55 55 55-55c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-55 55 55 55c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-55-55-55 55c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l55-55-55-55c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0z"
					fill="currentColor"
				/>
			</svg>
		</div>
	);

	const pipIcon1 = (
		<button
			className="_pip _pipIcon "
			onClick={handlePictureInPicture}
			ref={pipRef}
			style={resolvedStyles.pipButton ?? {}}
		>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
				<path
					d="M432 64H208c-8.8 0-16 7.2-16 16V96H128V80c0-44.2 35.8-80 80-80H432c44.2 0 80 35.8 80 80V304c0 44.2-35.8 80-80 80H416V320h16c8.8 0 16-7.2 16-16V80c0-8.8-7.2-16-16-16zM0 192c0-35.3 28.7-64 64-64H320c35.3 0 64 28.7 64 64V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V192zm64 32c0 17.7 14.3 32 32 32H288c17.7 0 32-14.3 32-32s-14.3-32-32-32H96c-17.7 0-32 14.3-32 32z"
					fill="currentColor"
				/>
			</svg>
		</button>
	);

	const pipIcon2 = (
		<button
			className="_pip _pipIcon "
			onClick={handlePictureInPicture}
			ref={pipRef}
			style={resolvedStyles.pipButton ?? {}}
		>
			<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 640 512">
				<path
					d="M256 0H576c35.3 0 64 28.7 64 64V288c0 35.3-28.7 64-64 64H256c-35.3 0-64-28.7-64-64V64c0-35.3 28.7-64 64-64zM476 106.7C471.5 100 464 96 456 96s-15.5 4-20 10.7l-56 84L362.7 169c-4.6-5.7-11.5-9-18.7-9s-14.2 3.3-18.7 9l-64 80c-5.8 7.2-6.9 17.1-2.9 25.4s12.4 13.6 21.6 13.6h80 48H552c8.9 0 17-4.9 21.2-12.7s3.7-17.3-1.2-24.6l-96-144zM336 96a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zM64 128h96V384v32c0 17.7 14.3 32 32 32H320c17.7 0 32-14.3 32-32V384H512v64c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V192c0-35.3 28.7-64 64-64zm8 64c-8.8 0-16 7.2-16 16v16c0 8.8 7.2 16 16 16H88c8.8 0 16-7.2 16-16V208c0-8.8-7.2-16-16-16H72zm0 104c-8.8 0-16 7.2-16 16v16c0 8.8 7.2 16 16 16H88c8.8 0 16-7.2 16-16V312c0-8.8-7.2-16-16-16H72zm0 104c-8.8 0-16 7.2-16 16v16c0 8.8 7.2 16 16 16H88c8.8 0 16-7.2 16-16V416c0-8.8-7.2-16-16-16H72zm336 16v16c0 8.8 7.2 16 16 16h16c8.8 0 16-7.2 16-16V416c0-8.8-7.2-16-16-16H424c-8.8 0-16 7.2-16 16z"
					fill="currentColor"
				/>
			</svg>
		</button>
	);

	const fullScreenIcon1 = (
		<div
			className="_fullScreen _fullScreenIcon"
			ref={fullScreen}
			id="fullscreen-button"
			onClick={handleFullScreen}
			style={resolvedStyles.fullScreenButton ?? {}}
		>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
				<path
					d="M32 32C14.3 32 0 46.3 0 64v96c0 17.7 14.3 32 32 32s32-14.3 32-32V96h64c17.7 0 32-14.3 32-32s-14.3-32-32-32H32zM64 352c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7 14.3 32 32 32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H64V352zM320 32c-17.7 0-32 14.3-32 32s14.3 32 32 32h64v64c0 17.7 14.3 32 32 32s32-14.3 32-32V64c0-17.7-14.3-32-32-32H320zM448 352c0-17.7-14.3-32-32-32s-32 14.3-32 32v64H320c-17.7 0-32 14.3-32 32s14.3 32 32 32h96c17.7 0 32-14.3 32-32V352z"
					fill="currentColor"
				/>
			</svg>
		</div>
	);

	const fullScreenIcon2 = (
		<div
			className="_fullScreen _fullScreenIcon"
			ref={fullScreen}
			id="fullscreen-button"
			onClick={handleFullScreen}
			style={resolvedStyles.fullScreenButton ?? {}}
		>
			<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512">
				<path
					d="M344 0H488c13.3 0 24 10.7 24 24V168c0 9.7-5.8 18.5-14.8 22.2s-19.3 1.7-26.2-5.2l-39-39-87 87c-9.4 9.4-24.6 9.4-33.9 0l-32-32c-9.4-9.4-9.4-24.6 0-33.9l87-87L327 41c-6.9-6.9-8.9-17.2-5.2-26.2S334.3 0 344 0zM168 512H24c-13.3 0-24-10.7-24-24V344c0-9.7 5.8-18.5 14.8-22.2s19.3-1.7 26.2 5.2l39 39 87-87c9.4-9.4 24.6-9.4 33.9 0l32 32c9.4 9.4 9.4 24.6 0 33.9l-87 87 39 39c6.9 6.9 8.9 17.2 5.2 26.2s-12.5 14.8-22.2 14.8z"
					fill="currentColor"
				/>
			</svg>
		</div>
	);

	const playIcon: { [key: string]: React.JSX.Element } = {
		_videoDesign1: playIcon1,
		_videoDesign2: playIcon2,
		_videoDesign3: playIconBig,
	};
	const pauseIcon: { [key: string]: React.JSX.Element } = {
		_videoDesign1: pauseIcon1,
		_videoDesign2: pauseIcon2,
		_videoDesign3: pauseIcon2,
	};

	const pipIcons: {
		[key: string]: React.JSX.Element;
	} = {
		_videoDesign1: pipIcon1,
		_videoDesign2: pipIcon2,
		_videoDesign3: pipIcon2,
	};

	const fullScreenIcon: {
		[key: string]: React.JSX.Element;
	} = {
		_videoDesign1: fullScreenIcon1,
		_videoDesign2: fullScreenIcon2,
		_videoDesign3: fullScreenIcon2,
	};

	const volumeIcon: { [key: string]: React.JSX.Element } = {
		_videoDesign1: volumeHighIcon1,
		_videoDesign2: volumeHighIcon1,
		_videoDesign3: volumeHighIcon1,
	};

	const muteIcon: {
		[key: string]: React.JSX.Element;
	} = {
		_videoDesign1: volumeMuteIcon1,
		_videoDesign2: volumeMuteIcon1,
		_videoDesign3: volumeMuteIcon1,
	};

	return (
		<div
			className={`comp compVideo ${videoDesign} ${colorScheme}`}
			ref={videoContainer}
			onMouseEnter={handleMouseEnterVideo}
			onMouseLeave={handleMouseLeaveVideo}
			style={resolvedStyles.comp ?? {}}
		>
			<HelperComponent definition={definition} />
			{controlsOnHover && videoDesign === '_videoDesign3' ? (
				<div className="_playAndVolumeGridDesign3">
					{showPlaypause &&
						(playPauseEnd === 'play' ? playIcon[videoDesign] : pauseIcon[videoDesign])}

					{showAudioControls && (
						<div className="_volumeControls">
							{volume == '0' || muted
								? muteIcon[videoDesign]
								: volumeIcon[videoDesign]}
							<input
								id="volume"
								value={volume}
								max={'1'}
								min={'0'}
								step={'0.01'}
								type="range"
								onChange={updateVolume}
								style={resolvedStyles.volumeSlider ?? {}}
							/>
						</div>
					)}
				</div>
			) : null}
			<video
				controls={videoControls}
				poster={poster}
				playsInline={playsInline}
				preload="metadata"
				ref={video}
				muted={muted}
				loop={loop}
				autoPlay={autoPlay}
				onLoadedMetadata={initializeVideo}
				onTimeUpdate={updateTimeElapsed}
				data-seek
				onChange={volumeIconHandle}
				onClick={handlePlayPause}
				style={resolvedStyles.player ?? {}}
				onPlay={() => {
					if (!isFirstTimePlay || !autoPlay || !autoUnMuteAfterPlaying) return;
					setMuted(false);
					setFirstTimePlay(false);
				}}
			>
				<source src={getSrcUrl(src)} type={type} />
				Your browser does not support HTML5 video.
			</video>
			<SubHelperComponent
				definition={props.definition}
				subComponentName="_player"
				style={resolvedStyles.player ?? {}}
			/>

			{controlsOnHover && (
				<div className={`_videoControlsContainer ${videoControls ? '_hidden' : ''} `}>
					{showSeekBar && (
						<div
							className="_progressBarContainer"
							onMouseEnter={handleMouseEnterInput}
							onMouseLeave={handleMouseLeaveInput}
						>
							<input
								className="_progressBar _progress"
								id="seek"
								value={manualSeek === undefined ? progressbarCurr : manualSeek}
								min="0"
								type="range"
								step="1"
								max={progressbarMax}
								onMouseMove={updateSeek}
								onMouseDown={() => setManualSeek(progressbarCurr)}
								onMouseUp={() => {
									let value =
										Number.parseInt(progressBarRef.current?.value ?? '') ?? 0;
									skipAhead(value);
									setProgressBarCurr(value);
									setManualSeek(undefined);
								}}
								ref={progressBarRef}
								onChange={ev => {
									if (manualSeek) setManualSeek(parseInt(ev.target.value));
								}}
								style={resolvedStyles.seekSlider ?? {}}
							/>
							<SubHelperComponent
								definition={props.definition}
								subComponentName="_seekSlider"
							/>
							{controlsOnHover && (
								<div
									style={{
										left: `${toolTipX}px`,
										...(resolvedStyles.seekTimeTextOnHover ?? {}),
									}}
									className="_toolTip"
								>{`${seekToolTip.hours != '00' ? seekToolTip.hours + ':' : ''}${
									seekToolTip.minutes
								}:${seekToolTip.seconds}`}</div>
							)}
						</div>
					)}
					<div className="_playAndFullscreenGrid">
						{showTime && videoDesign === '_videoDesign3' && (
							<div className="_time">
								<time
									className="_timeElapsed"
									id="time-elapsed"
									dateTime={`${timElapsed.hours != '00' ? timElapsed.hours : ''}${
										timElapsed.minutes != '00' ? timElapsed.minutes : ''
									}${timElapsed.seconds}`}
									style={resolvedStyles.timeText ?? {}}
								>{`${timElapsed.hours != '00' ? timElapsed.hours + ':' : ''}${
									timElapsed.minutes
								}:${timElapsed.seconds}`}</time>
								<span className="_timeSplitter">/</span>
								<time
									className="_duration"
									id="duration"
									dateTime={`${duration.hours != '00' ? duration.hours : ''}:${
										duration.minutes != '00' ? duration.minutes : ''
									}:${duration.seconds}`}
									style={resolvedStyles.timeText ?? {}}
								>{`${duration.hours != '00' ? duration.hours + ':' : ''}${
									duration.minutes
								}:${duration.seconds}`}</time>
							</div>
						)}
						{videoDesign != '_videoDesign3' ? (
							<div className="_playAndVolumeGrid">
								{showPlaypause &&
									(playPauseEnd === 'play'
										? playIcon[videoDesign]
										: pauseIcon[videoDesign])}
								{showTime && (
									<div className="_time">
										<time
											className="_timeElapsed"
											id="time-elapsed"
											dateTime={`${
												timElapsed.hours != '00' ? timElapsed.hours : ''
											}${
												timElapsed.minutes != '00' ? timElapsed.minutes : ''
											}${timElapsed.seconds}`}
											style={resolvedStyles.timeText ?? {}}
										>{`${
											timElapsed.hours != '00' ? timElapsed.hours + ':' : ''
										}${timElapsed.minutes}:${timElapsed.seconds}`}</time>
										<span className="_timeSplitter">/</span>
										<time
											className="_duration"
											id="duration"
											dateTime={`${
												duration.hours != '00' ? duration.hours : ''
											}:${duration.minutes != '00' ? duration.minutes : ''}:${
												duration.seconds
											}`}
											style={resolvedStyles.timeText ?? {}}
										>{`${duration.hours != '00' ? duration.hours + ':' : ''}${
											duration.minutes
										}:${duration.seconds}`}</time>
									</div>
								)}
								{showAudioControls && (
									<div className="_volumeControls">
										{volume == '0' || muted
											? muteIcon[videoDesign]
											: volumeIcon[videoDesign]}
										<input
											id="volume"
											value={volume}
											max={'1'}
											min={'0'}
											step={'0.01'}
											type="range"
											onChange={updateVolume}
											style={resolvedStyles.volumeSlider ?? {}}
										/>
									</div>
								)}
							</div>
						) : null}
						<div className="_pipAndFullScreenGrid">
							{showPipButton ? pipIcons[videoDesign] : null}
							{showFullScreenButton ? fullScreenIcon[videoDesign] : null}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

const component: Component = {
	name: 'Video',
	displayName: 'Video',
	description: 'Video component',
	component: Video,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	styleComponent: VideoStyle,
	styleDefaults: styleDefaults,
	allowedChildrenType: new Map<string, number>([['', -1]]),
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			mainComponent: true,
			description: 'Component',
			icon: (
				<IconHelper viewBox="0 0 24 24">
					<path
						d="M21.23 10.7446C22.2567 11.3373 22.2567 12.8192 21.23 13.4119L5.06 22.7477C4.03333 23.3404 2.75 22.5995 2.75 21.414L2.75 2.74249C2.75 1.557 4.03333 0.816067 5.06 1.40881L21.23 10.7446Z"
						fill="currentColor"
						fillOpacity="0.2"
					/>
					<path
						d="M21.23 10.7446C22.2567 11.3373 22.2567 12.8192 21.23 13.4119L5.06 22.7477C4.03333 23.3404 2.75 22.5995 2.75 21.414L2.75 2.74249C2.75 1.557 4.03333 0.816067 5.06 1.40881L21.23 10.7446Z"
						fill="currentColor"
						fillOpacity="0.2"
					/>
					<path
						d="M13.5508 11.6455C13.8841 11.8379 13.8841 12.3191 13.5508 12.5115L8.12078 15.6465C7.78745 15.839 7.37078 15.5984 7.37078 15.2135L7.37078 8.94348C7.37078 8.55858 7.78745 8.31802 8.12078 8.51047L13.5508 11.6455Z"
						fill="currentColor"
					/>
				</IconHelper>
			),
		},
		{
			name: 'player',
			displayName: 'Player',
			description: 'Player',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'volumeSlider',
			displayName: 'Volume Slider',
			description: 'Volume Slider',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'seekSlider',
			displayName: 'Seek Slider',
			description: 'Seek Slider',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'playPauseButton',
			displayName: 'Play Pause Button',
			description: 'Play Pause Button',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'pipButton',
			displayName: 'Pip Button',
			description: 'Pip Button',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'fullScreenButton',
			displayName: 'Full Screen Button',
			description: 'Full Screen Button',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'timeText',
			displayName: 'Time Text',
			description: 'Time Text',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'seekTimeTextOnHover',
			displayName: 'Seek Time Text On Hover',
			description: 'Seek Time Text On Hover',
			icon: 'fa fa-solid fa-box',
		},
	],
};

export default component;
