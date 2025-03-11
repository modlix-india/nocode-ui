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
			showTime,
			autoUnMuteAfterPlaying,
			showAudioControls,
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
	const [playPauseEnd, setPlayPauseEnd] = useState<string>('play');
	const [progressbarCurr, setProgressbarCurr] = useState<number>(0);
	const [progressbarMax, setProgressbarMax] = useState<number>(0);
	const [muted, setMuted] = useState<boolean>(mutedProperty);
	const [toogleToolTip, setToggleToolTip] = useState<boolean>(false);
	const [isFirstTimePlay, setIsFirstTimePlay] = useState<boolean>(true);
	const [audioControls, setAudioControls] = useState<boolean>(true);

	const progressBarRef = useRef<any>();
	const [volume, setVolume] = useState<string>('1');

	useEffect(() => {
		if (!audio.current) return;
		// checking wheather browser supports html5 video or not.
		if (typeof audio.current.canPlayType === 'function') {
			setAudioControls(false);
		}
	}, [audio.current]);

	const volumeIconHandle = (event: any) => {
		if (!audio.current) return;
		audio.current.muted = !audio.current.muted;
		setMuted(!muted);
		if (muted === false) {
			setVolume('0');
		} else {
			setVolume(`${vol}`);
		}
	};

	const [toolTipX, setToolTipX] = useState<number>(0);

	//To show seek time while hovering on input.
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

	//To format time in hours min sec
	const formatTime = (time: number) => {
		const result = new Date(time * 1000).toISOString().substring(11, 19);
		return {
			hours: result.substring(0, 2),
			minutes: result.substring(3, 5),
			seconds: result.substring(6, 8),
		};
	};

	//By this we can get the current time of the audio
	const updateTimeElapsed = () => {
		if (!audio.current) return;
		const time = formatTime(Math.round(audio.current.currentTime));
		setProgressbarCurr(Math.floor(audio.current.currentTime));
		//to show in the time tag of time Elapsed
		setTimeElapsed(time);
	};

	//By this we can get the audioDuration after initilizing
	const initializeAudio = () => {
		if (!audio.current) return;
		const audioDuration = Math.round(audio.current.duration);
		setProgressbarMax(audioDuration);
		// we are calculating this to show In the time TAG
		const time = formatTime(audioDuration);
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
		if (!audio.current) return;
		audio.current.currentTime = value;
	};

	const [manualSeek, setManualSeek] = useState<number | undefined>(undefined);

	//volumeControl
	let vol: number;
	const updateVolume = (event: any) => {
		if (!audio.current) return;
		if (audio.current.muted) audio.current.muted = false;
		setVolume(event.target.value);
		vol = parseFloat(event.target.value);
		if (isNaN(vol)) return;
		audio.current.volume = vol;
		setMuted(false);
	};

	const handleMouseEnterInput = (event: any) => {
		setToggleToolTip(true);
	};
	const handleMouseLeaveInput = (event: any) => {
		setToggleToolTip(false);
	};

	const pauseIcon = (
		<svg
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path d="M6 5h4v14H6V5zm8 0h4v14h-4V5z" fill="currentColor" />
		</svg>
	);
	const playIcon = (
		<svg
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path d="M8 5v14l11-7z" fill="currentColor" />
		</svg>
	);

	const handlePlayPause = () => {
		if (!audio.current) return;
		if (audio.current.paused || audio.current.ended) {
			audio.current.play();
			setPlayPauseEnd('pause');
		} else {
			audio.current.pause();
			setPlayPauseEnd('play');
		}
	};

	const muteIcon = (
		<svg
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path d="M3 9V15H7L12 20V4L7 9H3Z" fill="currentColor" />
			<path d="M16 10L22 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
			<path d="M22 10L16 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
		</svg>
	);

	const volumeIcon = (
		<svg
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path d="M3 9V15H7L12 20V4L7 9H3Z" fill="currentColor" />
			<path
				d="M16 8C17.6569 9.65685 17.6569 14.3431 16 16"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
			/>
			<path
				d="M19 5C21.7614 7.76142 21.7614 16.2386 19 19"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
			/>
		</svg>
	);

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
				onLoadedMetadata={initializeAudio}
				onTimeUpdate={updateTimeElapsed}
				style={resolvedStyles.player ?? {}}
				onPlay={() => {
					if (!isFirstTimePlay || !autoPlay || !autoUnMuteAfterPlaying) return;
					setTimeout(() => {
						setMuted(false);
						setIsFirstTimePlay(false);
					}, 500);
				}}
			>
				<source src={getSrcUrl(src)} type={type} />
				Your browser does not support HTML5 audio.
			</audio>
			<div
				className="playPause"
				onClick={handlePlayPause}
				style={resolvedStyles.playPauseButton}
			>
				{playPauseEnd === 'play' ? playIcon : pauseIcon}
			</div>
			{showTime && (
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
						let value = Number.parseInt(progressBarRef.current?.value ?? '') ?? 0;
						skipAhead(value);
						setProgressbarCurr(value);
						setManualSeek(undefined);
					}}
					ref={progressBarRef}
					onChange={ev => {
						if (manualSeek) setManualSeek(parseInt(ev.target.value));
					}}
					style={resolvedStyles.seekSlider ?? {}}
				/>
				<SubHelperComponent definition={props.definition} subComponentName="seekSlider" />
				<div
					style={{
						left: `${toolTipX}px`,
						...(resolvedStyles.seekTimeTextOnHover ?? {}),
					}}
					className="_toolTip"
				>{`${seekToolTip.hours != '00' ? seekToolTip.hours + ':' : ''}${
					seekToolTip.minutes
				}:${seekToolTip.seconds}`}</div>
			</div>
			{showAudioControls && (
				<div className="_volumeControls">
					{volume == '0' || muted ? muteIcon : volumeIcon}
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
						className="_audioPlayStart"
						d="M19.8932 13.2644C20.4594 13.5913 20.4594 14.4087 19.8932 14.7356L10.9743 19.8849C10.408 20.2119 9.70016 19.8032 9.70016 19.1493L9.70016 8.85068C9.70016 8.1968 10.408 7.78813 10.9743 8.11507L19.8932 13.2644Z"
						fill="white"
					/>
					<rect
						className="_audioPlayPause"
						x="9"
						y="8"
						width="4"
						height="12"
						rx="1"
						fill="white"
						opacity={0}
					/>
					<rect
						className="_audioPlayPause"
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
		{
			name: 'timeText',
			displayName: 'Time Text',
			description: 'Time Text',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'seekSlider',
			displayName: 'Seek Slider',
			description: 'Seek Slider',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'volumeSlider',
			displayName: 'Volume Slider',
			description: 'Volume Slider',
			icon: 'fa fa-solid fa-box',
		},
	],
};

export default component;
