import React, { useEffect, useRef, useState } from 'react';
import { PageStoreExtractor, UrlDetailsExtractor } from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './videoProperties';
import VideoStyle from './VideoStyle';
import { HelperComponent } from '../HelperComponents/HelperComponent';

import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { SubHelperComponent } from '../HelperComponents/SubHelperComponent';
import { styleProperties, styleDefaults, stylePropertiesForTheme } from './videoStyleProperties';
import { IconHelper } from '../util/IconHelper';
import getSrcUrl from '../util/getSrcUrl';
import { findPropertyDefinitions } from '../util/lazyStylePropertyUtil';

function Video(props: Readonly<ComponentProps>) {
	const { definition, locationHistory, context, pageDefinition } = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const urlExtractor = UrlDetailsExtractor.getForContext(context.pageName);
	const {
		properties: {
			src,
			type,
			poster,
			playsInline,
			muted: mutedProperty,
			playInViewport,
			autoPlay,
			loop,
			showPipButton,
			showFullScreenButton,
			showAudioControls,
			showSeekBar,
			showPlaypause,
			showTime,
			colorScheme,
			designType: videoDesign,
			autoUnMuteAfterPlaying,
		} = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
		urlExtractor,
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
	const [videoControls, setVideoControls] = useState<boolean>(true);
	//playPauseButton
	const [playPauseEnd, setPlayPauseEnd] = useState<string>('play');
	//VIDEODURATION
	const [progressbarMax, setProgressbarMax] = useState<number>(0);

	//current duration of the video(timeElapsed)
	const [progressbarCurr, setProgressbarCurr] = useState<number>(0);

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
	const [timElapsed, setTimeElapsed] = useState<{
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
	const [fullScreenState, setFullScreenState] = useState<string>('expand');
	const [isFirstTimePlay, setIsFirstTimePlay] = useState<boolean>(true);

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
			setVideoControls(false);
		}
		let observer: IntersectionObserver | null = null;

		if (playInViewport) {
			observer = new IntersectionObserver(
				([entry]) => {
					if (entry.isIntersecting) {
						video.current?.play().catch(() => {});
					} else {
						video.current?.pause();
					}
				},
				{ threshold: 0.5 },
			);

			observer.observe(video.current);
		}

		return () => {
			if (observer && video.current) {
				observer.unobserve(video.current);
				observer.disconnect();
			}
		};
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
		setProgressbarCurr(Math.floor(video.current.currentTime));
		//to show in the time tag of time Elapsed
		setTimeElapsed(time);
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
			<svg viewBox="0 0 21 26">
				<path
					d="M3.99219 1.13279C3.18281 0.635136 2.16563 0.61873 1.33984 1.08357C0.514062 1.54842 0 2.42342 0 3.37498V22.625C0 23.5765 0.514062 24.4515 1.33984 24.9164C2.16563 25.3812 3.18281 25.3594 3.99219 24.8672L19.7422 15.2422C20.5242 14.7664 21 13.9187 21 13C21 12.0812 20.5242 11.239 19.7422 10.7578L3.99219 1.13279Z"
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
			<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
				<path
					d="M0 10C0 7.34784 1.05357 4.8043 2.92893 2.92893C4.8043 1.05357 7.34784 0 10 0C12.6522 0 15.1957 1.05357 17.0711 2.92893C18.9464 4.8043 20 7.34784 20 10C20 12.6522 18.9464 15.1957 17.0711 17.0711C15.1957 18.9464 12.6522 20 10 20C7.34784 20 4.8043 18.9464 2.92893 17.0711C1.05357 15.1957 0 12.6522 0 10ZM7.35547 5.74609C7.05859 5.91016 6.875 6.22656 6.875 6.5625V13.4375C6.875 13.7773 7.05859 14.0898 7.35547 14.2539C7.65234 14.418 8.01172 14.4141 8.30469 14.2344L13.9297 10.7969C14.207 10.625 14.3789 10.3242 14.3789 9.99609C14.3789 9.66797 14.207 9.36719 13.9297 9.19531L8.30469 5.75781C8.01563 5.58203 7.65234 5.57422 7.35547 5.73828V5.74609Z"
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
			<svg viewBox="0 0 20 26" xmlns="http://www.w3.org/2000/svg">
				<path
					d="M3.80208 1.98047C3.03125 1.51836 2.0625 1.50312 1.27604 1.93476C0.489583 2.36641 0 3.17891 0 4.0625V21.9375C0 22.8211 0.489583 23.6336 1.27604 24.0652C2.0625 24.4969 3.03125 24.4766 3.80208 24.0195L18.8021 15.082C19.5469 14.6402 20 13.8531 20 13C20 12.1469 19.5469 11.3648 18.8021 10.918L3.80208 1.98047Z"
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
			<svg viewBox="0 0 12 20" xmlns="http://www.w3.org/2000/svg">
				<path
					d="M1.8 2.5C0.80625 2.5 0 3.33984 0 4.375V15.625C0 16.6602 0.80625 17.5 1.8 17.5H3C3.99375 17.5 4.8 16.6602 4.8 15.625V4.375C4.8 3.33984 3.99375 2.5 3 2.5H1.8ZM9 2.5C8.00625 2.5 7.2 3.33984 7.2 4.375V15.625C7.2 16.6602 8.00625 17.5 9 17.5H10.2C11.1938 17.5 12 16.6602 12 15.625V4.375C12 3.33984 11.1938 2.5 10.2 2.5H9Z"
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
			<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
				<g clip-path="url(#clip0_1_19)">
					<path
						d="M12 24C15.1826 24 18.2348 22.7357 20.4853 20.4853C22.7357 18.2348 24 15.1826 24 12C24 8.8174 22.7357 5.76516 20.4853 3.51472C18.2348 1.26428 15.1826 0 12 0C8.8174 0 5.76516 1.26428 3.51472 3.51472C1.26428 5.76516 0 8.8174 0 12C0 15.1826 1.26428 18.2348 3.51472 20.4853C5.76516 22.7357 8.8174 24 12 24ZM10.5 9V15C10.5 15.8297 9.82969 16.5 9 16.5C8.17031 16.5 7.5 15.8297 7.5 15V9C7.5 8.17031 8.17031 7.5 9 7.5C9.82969 7.5 10.5 8.17031 10.5 9ZM16.5 9V15C16.5 15.8297 15.8297 16.5 15 16.5C14.1703 16.5 13.5 15.8297 13.5 15V9C13.5 8.17031 14.1703 7.5 15 7.5C15.8297 7.5 16.5 8.17031 16.5 9Z"
						fill="currentColor"
					/>
				</g>
				<defs>
					<clipPath id="clip0_1_19">
						<rect width="24" height="24" fill="white" />
					</clipPath>
				</defs>
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
			<svg viewBox="0 0 24 20" xmlns="http://www.w3.org/2000/svg">
				<path
					d="M20.01 1.26956C22.4438 3.33206 24 6.47659 24 10C24 13.5235 22.4438 16.6719 20.01 18.7305C19.6237 19.0586 19.0575 18.9961 18.7425 18.5938C18.4275 18.1914 18.4875 17.6016 18.8738 17.2735C20.9063 15.5547 22.2 12.9375 22.2 10C22.2 7.06253 20.9063 4.44534 18.8738 2.72268C18.4875 2.39456 18.4313 1.80472 18.7425 1.40237C19.0538 1.00003 19.6237 0.941434 20.01 1.26565V1.26956ZM17.7413 4.17972C19.3613 5.55472 20.4 7.65237 20.4 10C20.4 12.3477 19.3613 14.4453 17.7413 15.8203C17.355 16.1485 16.7888 16.086 16.4738 15.6836C16.1588 15.2813 16.2188 14.6914 16.605 14.3633C17.8238 13.3321 18.6 11.7617 18.6 10C18.6 8.23831 17.8238 6.668 16.605 5.63284C16.2188 5.30471 16.1625 4.71487 16.4738 4.31253C16.785 3.91018 17.355 3.85159 17.7413 4.17581V4.17972ZM15.4725 7.08987C16.2788 7.77737 16.8 8.82425 16.8 10C16.8 11.1758 16.2788 12.2227 15.4725 12.9102C15.0863 13.2383 14.52 13.1758 14.205 12.7735C13.89 12.3711 13.95 11.7813 14.3363 11.4532C14.7413 11.1094 15 10.586 15 10C15 9.41409 14.7413 8.89065 14.3363 8.543C13.95 8.21487 13.8938 7.62503 14.205 7.22268C14.5163 6.82034 15.0863 6.76175 15.4725 7.08596V7.08987ZM11.2913 1.3594C11.7225 1.56253 12 2.00784 12 2.50003V17.5C12 17.9922 11.7225 18.4375 11.2913 18.6407C10.86 18.8438 10.3538 18.7617 10.0013 18.4336L4.9425 13.75H2.4C1.07625 13.75 0 12.6289 0 11.25V8.75003C0 7.37112 1.07625 6.25003 2.4 6.25003H4.9425L10.0013 1.56643C10.3538 1.23831 10.86 1.16018 11.2913 1.3594Z"
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
			<svg viewBox="0 0 24 22" xmlns="http://www.w3.org/2000/svg">
				<path
					d="M12.5458 1.49531C13.025 1.71875 13.3333 2.2086 13.3333 2.75V19.25C13.3333 19.7914 13.025 20.2813 12.5458 20.5047C12.0667 20.7281 11.5042 20.6379 11.1125 20.277L5.49167 15.125H2.66667C1.19583 15.125 0 13.8918 0 12.375V9.625C0 8.1082 1.19583 6.875 2.66667 6.875H5.49167L11.1125 1.72305C11.5042 1.36211 12.0667 1.27617 12.5458 1.49531ZM17.7083 7.17578L20 9.53906L22.2917 7.17578C22.6833 6.77188 23.3167 6.77188 23.7042 7.17578C24.0917 7.57969 24.0958 8.23281 23.7042 8.63242L21.4125 10.9957L23.7042 13.359C24.0958 13.7629 24.0958 14.416 23.7042 14.8156C23.3125 15.2152 22.6792 15.2195 22.2917 14.8156L20 12.4523L17.7083 14.8156C17.3167 15.2195 16.6833 15.2195 16.2958 14.8156C15.9083 14.4117 15.9042 13.7586 16.2958 13.359L18.5875 10.9957L16.2958 8.63242C15.9042 8.22852 15.9042 7.57539 16.2958 7.17578C16.6875 6.77617 17.3208 6.77188 17.7083 7.17578Z"
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
			<svg viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
				<g clip-path="url(#clip0_1_28)">
					<path
						d="M3.4375 2.75H13.0625C13.4406 2.75 13.75 3.05937 13.75 3.4375V4.125H16.5V3.4375C16.5 1.53828 14.9617 0 13.0625 0H3.4375C1.53828 0 0 1.53828 0 3.4375V13.0625C0 14.9617 1.53828 16.5 3.4375 16.5H4.125V13.75H3.4375C3.05937 13.75 2.75 13.4406 2.75 13.0625V3.4375C2.75 3.05937 3.05937 2.75 3.4375 2.75ZM22 8.25C22 6.7332 20.7668 5.5 19.25 5.5H8.25C6.7332 5.5 5.5 6.7332 5.5 8.25V19.25C5.5 20.7668 6.7332 22 8.25 22H19.25C20.7668 22 22 20.7668 22 19.25V8.25ZM19.25 9.625C19.25 10.3855 18.6355 11 17.875 11H9.625C8.86445 11 8.25 10.3855 8.25 9.625C8.25 8.86445 8.86445 8.25 9.625 8.25H17.875C18.6355 8.25 19.25 8.86445 19.25 9.625Z"
						fill="currentColor"
					/>
				</g>
				<defs>
					<clipPath id="clip0_1_28">
						<rect
							width="22"
							height="22"
							fill="white"
							transform="matrix(-1 0 0 1 22 0)"
						/>
					</clipPath>
				</defs>
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
			<svg viewBox="0 0 25 20" fill="none" xmlns="http://www.w3.org/2000/svg">
				<g clip-path="url(#clip0_1_31)">
					<path
						d="M10 0H22.5C23.8789 0 25 1.12109 25 2.5V11.25C25 12.6289 23.8789 13.75 22.5 13.75H10C8.62109 13.75 7.5 12.6289 7.5 11.25V2.5C7.5 1.12109 8.62109 0 10 0ZM18.5938 4.16797C18.418 3.90625 18.125 3.75 17.8125 3.75C17.5 3.75 17.207 3.90625 17.0312 4.16797L14.8438 7.44922L14.168 6.60156C13.9883 6.37891 13.7187 6.25 13.4375 6.25C13.1563 6.25 12.8828 6.37891 12.707 6.60156L10.207 9.72656C9.98047 10.0078 9.9375 10.3945 10.0937 10.7187C10.25 11.043 10.5781 11.25 10.9375 11.25H14.0625H15.9375H21.5625C21.9102 11.25 22.2266 11.0586 22.3906 10.7539C22.5547 10.4492 22.5352 10.0781 22.3438 9.79297L18.5938 4.16797ZM13.125 3.75C13.125 3.41848 12.9933 3.10054 12.7589 2.86612C12.5245 2.6317 12.2065 2.5 11.875 2.5C11.5435 2.5 11.2255 2.6317 10.9911 2.86612C10.7567 3.10054 10.625 3.41848 10.625 3.75C10.625 4.08152 10.7567 4.39946 10.9911 4.63388C11.2255 4.8683 11.5435 5 11.875 5C12.2065 5 12.5245 4.8683 12.7589 4.63388C12.9933 4.39946 13.125 4.08152 13.125 3.75ZM2.5 5H6.25V15V16.25C6.25 16.9414 6.80859 17.5 7.5 17.5H12.5C13.1914 17.5 13.75 16.9414 13.75 16.25V15H20V17.5C20 18.8789 18.8789 20 17.5 20H2.5C1.12109 20 0 18.8789 0 17.5V7.5C0 6.12109 1.12109 5 2.5 5ZM2.8125 7.5C2.46875 7.5 2.1875 7.78125 2.1875 8.125V8.75C2.1875 9.09375 2.46875 9.375 2.8125 9.375H3.4375C3.78125 9.375 4.0625 9.09375 4.0625 8.75V8.125C4.0625 7.78125 3.78125 7.5 3.4375 7.5H2.8125ZM2.8125 11.5625C2.46875 11.5625 2.1875 11.8437 2.1875 12.1875V12.8125C2.1875 13.1563 2.46875 13.4375 2.8125 13.4375H3.4375C3.78125 13.4375 4.0625 13.1563 4.0625 12.8125V12.1875C4.0625 11.8437 3.78125 11.5625 3.4375 11.5625H2.8125ZM2.8125 15.625C2.46875 15.625 2.1875 15.9062 2.1875 16.25V16.875C2.1875 17.2188 2.46875 17.5 2.8125 17.5H3.4375C3.78125 17.5 4.0625 17.2188 4.0625 16.875V16.25C4.0625 15.9062 3.78125 15.625 3.4375 15.625H2.8125ZM15.9375 16.25V16.875C15.9375 17.2188 16.2187 17.5 16.5625 17.5H17.1875C17.5313 17.5 17.8125 17.2188 17.8125 16.875V16.25C17.8125 15.9062 17.5313 15.625 17.1875 15.625H16.5625C16.2187 15.625 15.9375 15.9062 15.9375 16.25Z"
						fill="currentColor"
					/>
				</g>
				<defs>
					<clipPath id="clip0_1_31">
						<rect width="25" height="20" fill="white" />
					</clipPath>
				</defs>
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
			<svg viewBox="0 0 18 20" xmlns="http://www.w3.org/2000/svg">
				<path
					d="M1.28571 1.25C0.574554 1.25 0 1.80859 0 2.5V6.25C0 6.94141 0.574554 7.5 1.28571 7.5C1.99688 7.5 2.57143 6.94141 2.57143 6.25V3.75H5.14286C5.85402 3.75 6.42857 3.19141 6.42857 2.5C6.42857 1.80859 5.85402 1.25 5.14286 1.25H1.28571ZM2.57143 13.75C2.57143 13.0586 1.99688 12.5 1.28571 12.5C0.574554 12.5 0 13.0586 0 13.75V17.5C0 18.1914 0.574554 18.75 1.28571 18.75H5.14286C5.85402 18.75 6.42857 18.1914 6.42857 17.5C6.42857 16.8086 5.85402 16.25 5.14286 16.25H2.57143V13.75ZM12.8571 1.25C12.146 1.25 11.5714 1.80859 11.5714 2.5C11.5714 3.19141 12.146 3.75 12.8571 3.75H15.4286V6.25C15.4286 6.94141 16.0031 7.5 16.7143 7.5C17.4254 7.5 18 6.94141 18 6.25V2.5C18 1.80859 17.4254 1.25 16.7143 1.25H12.8571ZM18 13.75C18 13.0586 17.4254 12.5 16.7143 12.5C16.0031 12.5 15.4286 13.0586 15.4286 13.75V16.25H12.8571C12.146 16.25 11.5714 16.8086 11.5714 17.5C11.5714 18.1914 12.146 18.75 12.8571 18.75H16.7143C17.4254 18.75 18 18.1914 18 17.5V13.75Z"
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
			<svg viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
				<path
					d="M14.7812 0H20.9688C21.5402 0 22 0.459766 22 1.03125V7.21875C22 7.63555 21.7508 8.01367 21.3641 8.17266C20.9773 8.33164 20.5348 8.2457 20.2383 7.94922L18.5625 6.27344L14.8242 10.0117C14.4203 10.4156 13.7672 10.4156 13.3676 10.0117L11.9926 8.63672C11.5887 8.23281 11.5887 7.57969 11.9926 7.18008L15.7309 3.4418L14.0508 1.76172C13.7543 1.46523 13.6684 1.02266 13.8273 0.635938C13.9863 0.249219 14.3645 0 14.7812 0ZM7.21875 22H1.03125C0.459766 22 0 21.5402 0 20.9688V14.7812C0 14.3645 0.249219 13.9863 0.635938 13.8273C1.02266 13.6684 1.46523 13.7543 1.76172 14.0508L3.4375 15.7266L7.17578 11.9883C7.57969 11.5844 8.23281 11.5844 8.63242 11.9883L10.0074 13.3633C10.4113 13.7672 10.4113 14.4203 10.0074 14.8199L6.26914 18.5582L7.94492 20.234C8.24141 20.5305 8.32734 20.973 8.16836 21.3598C8.00938 21.7465 7.63125 21.9957 7.21445 21.9957L7.21875 22Z"
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
			<HelperComponent context={props.context} definition={definition} />
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
				poster={getSrcUrl(poster)}
				playsInline={playsInline}
				preload="metadata"
				ref={video}
				key={getSrcUrl(src)}
				muted={muted}
				loop={loop}
				autoPlay={autoPlay}
				onLoadedMetadata={initializeVideo}
				onTimeUpdate={updateTimeElapsed}
				data-seek
				onChange={volumeIconHandle}
				onClick={handlePlayPause}
				style={resolvedStyles.player ?? {}}
				onPause={() => setPlayPauseEnd('play')}
				onPlay={() => {
					setPlayPauseEnd('pause');
					if (!isFirstTimePlay || !autoPlay || !autoUnMuteAfterPlaying) return;
					setTimeout(() => {
						setMuted(false);
						setIsFirstTimePlay(false);
					}, 500);
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
									setProgressbarCurr(value);
									setManualSeek(undefined);
								}}
								ref={progressBarRef}
								onChange={ev => {
									const value = parseInt(ev.target.value);
									setManualSeek(value);
									setProgressbarCurr(value);
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

const { designType, colorScheme } = findPropertyDefinitions(
	propertiesDefinition,
	'designType',
	'colorScheme',
);

const component: Component = {
	order: 19,
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
		propertiesForTheme: [designType, colorScheme],
	stylePropertiesForTheme: stylePropertiesForTheme,
	externalStylePropsForThemeJson: true,
};

export default component;
