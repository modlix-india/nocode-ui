import { useEffect, useRef, useState } from 'react';
import { PageStoreExtractor } from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './audioProperties';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import getSrcUrl from '../util/getSrcUrl';
import { SubHelperComponent } from '../HelperComponents/SubHelperComponent';
import { IconHelper } from '../util/IconHelper';
import AudioStyle from './AudioStyle';
import { styleProperties, styleDefaults } from './audioStyleProperties';

function Audio(props: Readonly<ComponentProps>) {
	const { definition, locationHistory, context, pageDefinition } = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const {
		properties: {
			src,
			type,
			designType: audioDesign,
			colorScheme,
			autoPlay,
			loop,
			muted: mutedProperty,
			showTime,
			showVolumeControls,
			showSeekBar,
			showPlayBackSpeed,
			onHoverVolumeControl,
			showPlayPause,
			showRewindAndFastForward,
			volumeSliderPosition,
			seekTimeTextOnHover,
			playIcon,
			playIconImage,
			pauseIcon,
			pauseIconImage,
			volumeIcon,
			volumeMuteIconImage,
			volumeIconImage,
			volumeMuteIcon,
			forwardIcon,
			forwardIconImage,
			rewindIcon,
			rewindIconImage,
			playBackSpeedType,
		} = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);

	const [audioControls, setAudioControls] = useState<boolean>(true);
	const [playPauseEnd, setPlayPauseEnd] = useState<string>('play');
	const [progressbarMax, setProgressbarMax] = useState<number>(0);
	const [progressbarCurr, setProgressbarCurr] = useState<number>(0);
	const [toolTipX, setToolTipX] = useState<number>(0);

	const volumeButton = useRef<any>();
	const audioContainer = useRef<any>();
	const audio = useRef<any>();

	const [timeState, setTimeState] = useState({
		duration: { hours: '00', minutes: '00', seconds: '00' },
		timeElapsed: { hours: '00', minutes: '00', seconds: '00' },
		seekToolTip: { hours: '00', minutes: '00', seconds: '00' },
	});

	const [toogleToolTip, setToggleToolTip] = useState<boolean>(false);
	const [muted, setMuted] = useState<boolean>(mutedProperty);
	const [isFirstTimePlay, setIsFirstTimePlay] = useState<boolean>(true);

	const progressBarRef = useRef<any>();
	const [volume, setVolume] = useState<string>('1');
	const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
	const [manualSeek, setManualSeek] = useState<number | undefined>(undefined);
	const playbackOptions = [0.5, 1, 1.5, 2];



	const changePlaybackSpeed = (event: React.ChangeEvent<HTMLSelectElement>) => {
		const speed = parseFloat(event.target.value);
		if (audio.current) {
			audio.current.playbackRate = speed;
			setPlaybackSpeed(speed);
		}
	};

	const resolvedStyles = processComponentStylePseudoClasses(
		pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);

	useEffect(() => {
		if (!audio.current) return;
		if (typeof audio.current.canPlayType === 'function') {
			setAudioControls(false);
		}
	}, []);

	const volumeIconHandle = () => {
		if (!audio.current) return;
		setMuted(prevMuted => {
			audio.current.muted = !prevMuted;
			setVolume(audio.current.muted ? '0' : '${vol}');
			return !prevMuted;
		});
	};

	const handlePlayPause = () => {
		if (!audio.current && src) return;
		if (audio.current.paused || audio.current.ended) {
			if (isFirstTimePlay) {
				setIsFirstTimePlay(false);
			}
			audio.current.play();
			setPlayPauseEnd('pause');
		} else {
			audio.current.pause();
			setPlayPauseEnd('play');
		}
	};

	const formatTime = (time: number) => {
		const date = new Date(time * 1000);
		return {
			hours: date.getUTCHours().toString().padStart(2, '0'),
			minutes: date.getUTCMinutes().toString().padStart(2, '0'),
			seconds: date.getUTCSeconds().toString().padStart(2, '0'),
		};
	};

	const updateTimeElapsed = () => {
		if (!audio.current) return;
		setProgressbarCurr(Math.floor(audio.current.currentTime));
		setTimeState(prev => ({ ...prev, timeElapsed: formatTime(audio.current.currentTime) }));
	};

	const initializeAudio = () => {
		if (!audio.current) return;
		const audioDuration = Math.round(audio.current.duration);
		setProgressbarMax(audioDuration);
		setTimeState(prev => ({ ...prev, duration: formatTime(audioDuration) }));
	};

	const updateSeek = (event: React.MouseEvent<HTMLInputElement>) => {
		if (!progressBarRef.current) return;

		const progressBarRect = progressBarRef.current.getBoundingClientRect();
		const toolTipX = event.clientX - (progressBarRect.left - 1);
		const clientWidth = event.currentTarget.clientWidth;
		const skipTo = Math.round((toolTipX / clientWidth) * progressbarMax);
		const formattedTime = formatTime(skipTo);

		setTimeState(prevState => ({
			...prevState,
			seekToolTip: {
				hours: formattedTime.hours,
				minutes: formattedTime.minutes,
				seconds: formattedTime.seconds,
			},
		}));

		setToolTipX(clientWidth - toolTipX < 30 ? toolTipX - 32 : toolTipX);
	};

	const skipAhead = (value: number) => {
		if (!audio.current) return;
		audio.current.currentTime = value;
	};

	const updateVolume = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (!audio.current) return;
		const newVolume = parseFloat(event.target.value);
		if (isNaN(newVolume)) return;
		setVolume(event.target.value);
		audio.current.volume = newVolume;
		setMuted(newVolume === 0);
	};

	const handleMouseEnterInput = (event: any) => {
		setToggleToolTip(true);
	};
	const handleMouseLeaveInput = (event: any) => {
		setToggleToolTip(false);
	};

	const handleRewind = () => {
		if (!audio.current) return;
		audio.current.currentTime = Math.max(0, audio.current.currentTime - 5);
	};

	const handleFastForward = () => {
		if (!audio.current) return;

		audio.current.currentTime = Math.min(audio.current.duration, audio.current.currentTime + 5);
	};

	const fileName = (
		<div className="_fileName"
			style={resolvedStyles.fileName}>
			<span>{src?.substring(src.lastIndexOf('/') + 1)}</span>
		</div>
	);

	const forwardFinalIcon = (
		<div className="_fastForward" onClick={handleFastForward}>
			{forwardIconImage ? (
				<img
					src={forwardIconImage}
					alt="Forward Icon"
					className="_forwardIcon"
					style={resolvedStyles.forwardIcon}
				/>
			) : forwardIcon ? (
				<i style={resolvedStyles.forwardIcon ?? {}} className={forwardIcon}>
					<SubHelperComponent definition={definition} subComponentName="forwardIcon" />
				</i>
			) : (
				<svg
					height="1.5em"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					style={resolvedStyles.forwardIcon ?? {}}
				>
					<path d="M13 12L3 18V6L13 12ZM21 12L11 18V6L21 12Z" fill="currentColor" />
				</svg>
			)}
		</div>
	);

	const rewindFinalIcon = (
		<div className="_rewind" onClick={handleRewind}>
			{rewindIconImage ? (
				<img
					src={rewindIconImage}
					alt="Rewind Icon"
					className="_rewindIcon"
					style={resolvedStyles.rewindIcon}
				/>
			) : rewindIcon ? (
				<i style={resolvedStyles.rewindIcon ?? {}} className={rewindIcon}>
					<SubHelperComponent definition={definition} subComponentName="rewindIcon" />
				</i>
			) : (
				<svg
					height="1.5em"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					style={resolvedStyles.rewindIcon ?? {}}
				>
					<path d="M11 12L21 18V6L11 12ZM3 12L13 18V6L3 12Z" fill="currentColor" />
				</svg>
			)}
		</div>
	);

	const playIconFinal = (
		<div className="_playPauseContainer" onClick={handlePlayPause}>
			{playIconImage ? (
				<img
					src={playIconImage}
					alt="Play Icon"
					className="playIcon"
					style={resolvedStyles.playIcon}
				/>
			) : playIcon ? (
				<i style={resolvedStyles.playIcon ?? {}} className={playIcon}></i>
			) : (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					height="1em"
					viewBox="0 0 384 512"
					style={resolvedStyles.playIcon ?? {}}
				>
					<path
						d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"
						fill="currentColor"
					/>
				</svg>
			)}
		</div>
	);

	const pauseIconFinal = (
		<div className="_playPauseContainer" onClick={handlePlayPause}>
			{pauseIconImage ? (
				<img
					src={pauseIconImage}
					alt="Play Icon"
					className="pauseIcon"
					style={resolvedStyles.pauseIcon}
				/>
			) : pauseIcon ? (
				<i style={resolvedStyles.pauseIcon} className={pauseIcon}></i>
			) : (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					height="1em"
					viewBox="0 0 320 512"
					style={resolvedStyles.pauseIcon}
				>
					<path
						d="M48 64C21.5 64 0 85.5 0 112V400c0 26.5 21.5 48 48 48H80c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zm192 0c-26.5 0-48 21.5-48 48V400c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H240z"
						fill="currentColor"
					/>
				</svg>
			)}
		</div>
	);

	const volumeIconFinal = (
		<div
			className="_volumeButton "
			onClick={volumeIconHandle}
			id="volume-button"
			ref={volumeButton}
			style={resolvedStyles.volumeButton ?? {}}
		>
			{volumeIconImage ? (
				<img
					src={volumeIconImage}
					alt="Play Icon"
					className="volumeIcon"
					style={resolvedStyles.volumeIcon ?? {}}
				/>
			) : volumeIcon ? (
				<i style={resolvedStyles.volumeIcon ?? {}} className={volumeIcon}>
					<SubHelperComponent definition={definition} subComponentName="volumeIcon" />
				</i>
			) : (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					height="1em"
					viewBox="0 0 640 512 "
					style={resolvedStyles.volumeIcon ?? {}}
				>
					<path
						d="M533.6 32.5C598.5 85.3 640 165.8 640 256s-41.5 170.8-106.4 223.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C557.5 398.2 592 331.2 592 256s-34.5-142.2-88.7-186.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM473.1 107c43.2 35.2 70.9 88.9 70.9 149s-27.7 113.8-70.9 149c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C475.3 341.3 496 301.1 496 256s-20.7-85.3-53.2-111.8c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zm-60.5 74.5C434.1 199.1 448 225.9 448 256s-13.9 56.9-35.4 74.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C393.1 284.4 400 271 400 256s-6.9-28.4-17.7-37.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM301.1 34.8C312.6 40 320 51.4 320 64V448c0 12.6-7.4 24-18.9 29.2s-25 3.1-34.4-5.3L131.8 352H64c-35.3 0-64-28.7-64-64V224c0-35.3 28.7-64 64-64h67.8L266.7 40.1c9.4-8.4 22.9-10.4 34.4-5.3z"
						fill="currentColor"
					/>
				</svg>
			)}
		</div>
	);

	const volumeMuteIconFinal = (
		<div
			className="_volumeButton"
			onClick={volumeIconHandle}
			id="volume-button"
			ref={volumeButton}
		>
			{volumeMuteIconImage ? (
				<img
					src={volumeMuteIconImage}
					alt="Mute Icon"
					className="volumeMuteIcon"
					style={resolvedStyles.volumeMuteIcon ?? {}}
				/>
			) : volumeMuteIcon ? (
				<i style={resolvedStyles.volumeMuteIcon} className={volumeMuteIcon}>
					<SubHelperComponent definition={definition} subComponentName="volumeMuteIcon" />
				</i>
			) : (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					height="1em"
					viewBox="0 0 576 512"
					style={resolvedStyles.volumeMuteIcon ?? {}}
				>
					<path
						d="M301.1 34.8C312.6 40 320 51.4 320 64V448c0 12.6-7.4 24-18.9 29.2s-25 3.1-34.4-5.3L131.8 352H64c-35.3 0-64-28.7-64-64V224c0-35.3 28.7-64 64-64h67.8L266.7 40.1c9.4-8.4 22.9-10.4 34.4-5.3zM425 167l55 55 55-55c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-55 55 55 55c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-55-55-55 55c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l55-55-55-55c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0z"
						fill="currentColor"
					/>
				</svg>
			)}
		</div>
	);

	const timeTextAudioDesign1 = showTime && (
		<div className="_timeText" style={resolvedStyles.timeText ?? {}}>
			{audioDesign === '_audioDesign1' && (
				<>
					<time
						className="_timeElapsed"
						id="time-elapsed"
						dateTime={`${timeState.timeElapsed.hours !== '00' ? timeState.timeElapsed.hours : ''}${timeState.timeElapsed.minutes !== '00' ? timeState.timeElapsed.minutes : ''}${timeState.timeElapsed.seconds}`}
					>
						{`${timeState.timeElapsed.hours !== '00' ? timeState.timeElapsed.hours + ':' : ''}${timeState.timeElapsed.minutes}:${timeState.timeElapsed.seconds}`}
					</time>
				</>
			)}
		</div>
	);

	const timeText = showTime && (
		<div className="_timeText" style={resolvedStyles.timeText ?? {}}>
			{audioDesign !== '_audioDesign1' && (
				<>
					<time
						className="_timeElapsed"
						id="time-elapsed"
						dateTime={`${timeState.timeElapsed.hours !== '00' ? timeState.timeElapsed.hours : ''}${timeState.timeElapsed.minutes !== '00' ? timeState.timeElapsed.minutes : ''}${timeState.timeElapsed.seconds}`}
					>
						{`${timeState.timeElapsed.hours !== '00' ? timeState.timeElapsed.hours + ':' : ''}${timeState.timeElapsed.minutes}:${timeState.timeElapsed.seconds}`}
					</time>
					<span className="_timeSplitter">/</span>
				</>
			)}
			<time
				className="_duration"
				id="duration"
				dateTime={`${timeState.duration.hours !== '00' ? timeState.duration.hours : ''}${timeState.duration.minutes !== '00' ? timeState.duration.minutes : ''}${timeState.duration.seconds}`}
			>
				{`${timeState.duration.hours !== '00' ? timeState.duration.hours + ':' : ''}${timeState.duration.minutes}:${timeState.duration.seconds}`}
			</time>
		</div>
	);

	const seekBar = showSeekBar && (
		<div
			className="_progressBarContainer"
			onMouseEnter={handleMouseEnterInput}
			onMouseLeave={handleMouseLeaveInput}
			style={resolvedStyles.seekSlider ?? {}}
		>
			<input
				className="_progressBar _progress _seekSlider"
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
					const value = parseInt(ev.target.value);
					setManualSeek(value);
					setProgressbarCurr(value);
				}}
				style={resolvedStyles.seekSlider ?? {}}
			/>
			<SubHelperComponent definition={props.definition} subComponentName="seekSlider" />
			{seekTimeTextOnHover && toogleToolTip && (
				<div
					style={{
						left: `${toolTipX}px`,
						...(resolvedStyles.seekTimeTextOnHover ?? {}),
					}}
					className="_seekTimeTextOnHover"
				>
					{`${timeState.seekToolTip.hours !== '00' ? timeState.seekToolTip.hours + ':' : ''}${timeState.seekToolTip.minutes}:${timeState.seekToolTip.seconds}`}
				</div>
			)}
		</div>
	);

	const volumeControls = showVolumeControls && (
		<div
			className={`_volumeControls ${volumeSliderPosition}`}
			style={resolvedStyles.volumeContainer ?? {}}

		>
			<div
				className={`_volumeSliderContainer ${volumeSliderPosition} ${onHoverVolumeControl ? '_onHoverVolumeControl' : ''}`}
				style={resolvedStyles.volumeSliderContainer ?? {}}
			>
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
				<SubHelperComponent
					definition={definition}
					subComponentName="volumeContainer"
				></SubHelperComponent>
			</div>
			{volume == '0' || muted ? volumeMuteIconFinal : volumeIconFinal}
			<SubHelperComponent
				definition={definition}
				subComponentName="volumeContainer"
			></SubHelperComponent>
		</div>
	);

	const playBackSpeed = showPlayBackSpeed && (
		<div className="_playBackSpeed">
			{playBackSpeedType === 'DROPDOWN' ? (
				<select
					id="speedSelect"
					value={playbackSpeed}
					onChange={e => changePlaybackSpeed(e)}
					className="_playBackSpeedDropdown"
					style={resolvedStyles.playBackSpeedDropdown ?? {}}
				>
					{playbackOptions.map(speed => (
						<option
							key={speed}
							value={speed}
							className="_playBackSpeedDropdownOption"
							style={resolvedStyles.playBackSpeedDropdownOption ?? {}}
						>
							{speed}x
						</option>
					))}
				</select>
			) : playBackSpeedType === 'GRID' ? (
				<div className="_playBackSpeedGrid" style={resolvedStyles.playBackSpeedGrid ?? {}}>
					{playbackOptions.map(speed => (
						<span
							key={speed}
							className={`_speedOption ${speed === playbackSpeed ? '_active' : ''}`}
							onClick={() =>
								changePlaybackSpeed({
									target: { value: String(speed) },
								} as React.ChangeEvent<HTMLSelectElement>)
							}
						>
							{speed}x
						</span>
					))}
				</div>
			) : (
				<span
					className="_singleSelect"
					style={resolvedStyles.playBackSpeedGrid ?? {}}
					onClick={() => {
						const speeds = [0.5, 1, 1.5, 2];
						const currentIndex = speeds.indexOf(playbackSpeed);
						const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
						changePlaybackSpeed({
							target: { value: String(nextSpeed) },
						} as React.ChangeEvent<HTMLSelectElement>);
					}}
				>
					{playbackSpeed}x
				</span>
			)}
		</div>
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
				muted={muted}
				loop={loop}
				ref={audio}
				key={getSrcUrl(src)}
				data-seek
				onLoadedMetadata={initializeAudio}
				onTimeUpdate={updateTimeElapsed}
				style={resolvedStyles.player ?? {}}
				onChange={volumeIconHandle}
				onClick={handlePlayPause}
				onPause={() => setPlayPauseEnd('play')}
				onPlay={() => {
					setPlayPauseEnd('pause');
				}}
			>
				<source src={getSrcUrl(src)} type={type} />
				Your browser does not support HTML5 audio.
			</audio>
			{audioDesign === '_audioDesign4' ? fileName : null}
			<div
				className="_audioWithoutProgressBar"
				ref={audioContainer}
				style={resolvedStyles.compAudioSub ?? {}}
			>
				{showRewindAndFastForward && audioDesign !== '_audioDesign2' && rewindFinalIcon}
				{showPlayPause && playPauseEnd === 'play' ? playIconFinal : pauseIconFinal}
				{showRewindAndFastForward && audioDesign !== '_audioDesign2' && forwardFinalIcon}
				{audioDesign === '_audioDesign2' ? fileName : null}
				{timeTextAudioDesign1}
				{audioDesign !== '_audioDesign2' ? seekBar : null}
				{timeText}
				{volumeControls}
				{playBackSpeed}
			</div>
			{audioDesign === '_audioDesign2' ? seekBar : null}
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
				<IconHelper viewBox="0 0 37 37">
					<path
						className="_audioWave1"
						d="M28.5422 13.184C30.9658 15.1483 32.5198 18.1449 32.5198 21.4987C32.5198 24.8524 30.9658 27.849 28.5422 29.8133C27.9643 30.282 27.1172 30.1928 26.6459 29.618C26.1747 29.0432 26.2644 28.2006 26.8423 27.7318C28.6656 26.2587 29.8269 24.0154 29.8269 21.4987C29.8269 18.982 28.6656 16.7387 26.8423 15.2599C26.2644 14.7912 26.1803 13.9485 26.6459 13.3738C27.1116 12.799 27.9643 12.7153 28.5422 13.1785V13.184Z"
						fill="#EDEAEA"
					/>
					<path
						className="_audioWave2"
						d="M25.148 17.3414C26.3542 18.3235 27.134 19.819 27.134 21.4987C27.134 23.1783 26.3542 24.6739 25.148 25.656C24.5701 26.1247 23.723 26.0354 23.2517 25.4607C22.7805 24.8859 22.8703 24.0433 23.4481 23.5745C24.054 23.0835 24.4411 22.3357 24.4411 21.4987C24.4411 20.6616 24.054 19.9139 23.4481 19.4172C22.8703 18.9485 22.7861 18.1059 23.2517 17.5311C23.7174 16.9563 24.5701 16.8726 25.148 17.3358V17.3414Z"
						fill="#EDEAEA"
					/>
					<path
						d="M19.9526 10.7846C19.9526 10.0815 19.5375 9.44535 18.8923 9.15518C18.2471 8.87059 17.4898 8.98219 16.9624 9.45093L9.39424 16.1417H5.59053C3.61013 16.1417 2 17.7432 2 19.7131V23.2845C2 25.2543 3.61013 26.8558 5.59053 26.8558H9.39424L16.9624 33.5466C17.4898 34.0153 18.2471 34.1325 18.8923 33.8424C19.5375 33.5522 19.9526 32.916 19.9526 32.2129V10.7846Z"
						fill="#54a2fc"
					/>
				</IconHelper>
			),
		},
		{
			name: 'playIcon',
			displayName: 'Play Icon',
			description: 'Play Icon',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'pauseIcon',
			displayName: 'Pause Icon',
			description: 'Pause Icon',
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
		{
			name: 'rewindIcon',
			displayName: 'Rewind Icon',
			description: 'Rewind Icon',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'forwardIcon',
			displayName: 'Forward Icon',
			description: 'Forward Icon',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'volumeIcon',
			displayName: 'Volume Icon',
			description: 'Volume Icon',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'volumeMuteIcon',
			displayName: 'Volume Mute Icon',
			description: 'Volume Mute Icon',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'volumeSliderContainer',
			displayName: 'Volume Slider Container',
			description: 'Volume Slider Container',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'volumeButton',
			displayName: 'Volume Container',
			description: 'Volume Container',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'playBackSpeedGrid',
			displayName: 'PlayBackSpeed Grid',
			description: 'PlayBackSpeed Grid',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'playBackSpeedDropdown',
			displayName: 'PlayBackSpeed Dropdown',
			description: 'PlayBackSpeed Dropdown',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'playBackSpeedDropdownOption',
			displayName: 'PlayBackSpeed Dropdown Option',
			description: 'PlayBackSpeed Dropdown Option',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'fileName',
			displayName: 'File Name Container',
			description: 'File Name Container',
			icon: 'fa fa-solid fa-box',
		},
	],
	stylePropertiesForTheme: styleProperties,
};

export default component;