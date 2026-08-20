import React, { useRef, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import useDefinition from '../util/useDefinition';
import { PageStoreExtractor, UrlDetailsExtractor, getDataFromPath, getPathFromLocation, setData, } from '../../context/StoreContext';
import { LOCAL_STORE_PREFIX } from '../../constants';
import { runEvent } from '../util/runEvent';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { SubHelperComponent } from '../HelperComponents/SubHelperComponent';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { findPropertyDefinitions } from '../util/lazyStylePropertyUtil';
import { propertiesDefinition, stylePropertiesDefinition } from './voiceRecorderProperties';
import VoiceRecorderStyle from './VoiceRecorderStyle';
import { styleProperties, styleDefaults, stylePropertiesForTheme, } from './voiceRecorderStyleProperties';
import getSrcUrl from '../util/getSrcUrl';

function formatDuration(totalSeconds: number): string {
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;
	const hh = String(hours).padStart(2, '0');
	const mm = String(minutes).padStart(2, '0');
	const ss = String(seconds).padStart(2, '0');
	return `${hh}:${mm}:${ss}`;
}

function VoiceRecorderComponent(props: Readonly<ComponentProps>) {
	const {
		definition,
		definition: { bindingPath, bindingPath2 },
		locationHistory,
		context,
		pageDefinition,
	} = props;

	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const urlExtractor = UrlDetailsExtractor.getForContext(context.pageName);
	const bindingPathPath = bindingPath
		? getPathFromLocation(bindingPath, locationHistory, pageExtractor)
		: undefined;
	const durationBindingPathPath = bindingPath2
		? getPathFromLocation(bindingPath2, locationHistory, pageExtractor)
		: undefined;
	const {
		properties: {
			designType = '_voiceRecorderDesign1',
			labelRecord,
			labelPause,
			labelStop,
			iconRecord,
			iconPause,
			iconStop,
			recordImage,
			pauseImage,
			stopImage,
			onSave,
			location,
			colorScheme = '_primary',
			type: audioType = 'audio/webm',
			resourceType = 'static',
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

	const resolvedStyles = processComponentStylePseudoClasses(
		pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);

	const [recording, setRecording] = useState(false);
	const [paused, setPaused] = useState(false);
	const [duration, setDuration] = useState(0);
	const [audioLevel, setAudioLevel] = useState(0);

	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const audioChunksRef = useRef<Blob[]>([]);
	const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const streamRef = useRef<MediaStream | null>(null);

	const audioContextRef = useRef<AudioContext | null>(null);
	const analyserRef = useRef<AnalyserNode | null>(null);
	const animFrameRef = useRef<number | null>(null);

	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const waveHistoryRef = useRef<number[]>([]);
	const frameCounterRef = useRef<number>(0);
	
	const fillColorRef = useRef<string>('#38bdf8');
	useEffect(() => {
		fillColorRef.current = (resolvedStyles.audioLevelSlider as any)?.color || '#38bdf8';
	}, [resolvedStyles.audioLevelSlider]);

	// Canvas drawing function for voice visualization _design2
	const drawCanvasFrame = useCallback(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const canvasCtx = canvas.getContext('2d');
		if (!canvasCtx) return;

		const fillColor = fillColorRef.current;

		const dpr = window.devicePixelRatio || 1;
		if (
			canvas.width !== canvas.clientWidth * dpr ||
			canvas.height !== canvas.clientHeight * dpr
		) {
			canvas.width = canvas.clientWidth * dpr;
			canvas.height = canvas.clientHeight * dpr;
		}

		const width = canvas.width;
		const height = canvas.height;
		const centerY = height / 2;

		canvasCtx.clearRect(0, 0, width, height);

		canvasCtx.globalAlpha = 0.2;
		canvasCtx.strokeStyle = fillColor;
		canvasCtx.lineWidth = 1 * dpr;
		canvasCtx.beginPath();
		canvasCtx.moveTo(0, centerY);
		canvasCtx.lineTo(width, centerY);
		canvasCtx.stroke();
		canvasCtx.globalAlpha = 1.0;

		const barWidth = 2 * dpr;
		const gap = 3 * dpr;
		const totalBarSpace = barWidth + gap;

		canvasCtx.fillStyle = fillColor;

		for (let i = 0; i < waveHistoryRef.current.length; i++) {
			const amp = waveHistoryRef.current[i];
			const minHeight = 4 * dpr;
			const maxHeight = height * 0.82;
			const calculatedHeight = amp * height;
			const barHeight = Math.min(maxHeight, Math.max(minHeight, calculatedHeight));

			const x = i * totalBarSpace + 15 * dpr;
			const y = centerY - barHeight / 2;

			const radius = barWidth / 2;
			canvasCtx.beginPath();
			if (typeof canvasCtx.roundRect === 'function') {
				canvasCtx.roundRect(x, y, barWidth, barHeight, radius);
			} else {
				canvasCtx.rect(x, y, barWidth, barHeight);
			}
			canvasCtx.fill();
		}
	}, []);

	useEffect(() => {
		if (designType === '_voiceRecorderDesign2') {
			drawCanvasFrame();
		}
	}, [designType, drawCanvasFrame]);

	// Shared animation loop used by both start and resume
	const runAnimationLoop = useCallback(
		(analyser: AnalyserNode) => {
			const dataArray = new Uint8Array(analyser.frequencyBinCount);
			const timeDomainArray = new Uint8Array(analyser.frequencyBinCount);

			const tick = () => {
				if (!analyserRef.current) return;

				analyser.getByteFrequencyData(dataArray);
				let sum = 0;
				for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
				setAudioLevel(Math.min(100, Math.round((sum / dataArray.length / 100) * 100)));

				analyser.getByteTimeDomainData(timeDomainArray);
				let timeSum = 0;
				for (let i = 0; i < timeDomainArray.length; i++)
					timeSum += Math.abs((timeDomainArray[i] - 128) / 128);
				const boostedVolume = Math.pow((timeSum / timeDomainArray.length) * 4.5, 0.85);

				frameCounterRef.current++;
				if (frameCounterRef.current >= 4) {
					let maxBars = 55;
					if (canvasRef.current) {
						maxBars = Math.max(10, Math.floor((canvasRef.current.clientWidth - 30) / 5));
					}
					waveHistoryRef.current.push(boostedVolume);
					while (waveHistoryRef.current.length > maxBars) {
						waveHistoryRef.current.shift();
					}
					frameCounterRef.current = 0;
				}

				drawCanvasFrame();
				animFrameRef.current = requestAnimationFrame(tick);
			};
			animFrameRef.current = requestAnimationFrame(tick);
		},
		[drawCanvasFrame],
	);

	const cancelAnimLoop = useCallback(() => {
		if (animFrameRef.current) {
			cancelAnimationFrame(animFrameRef.current);
			animFrameRef.current = null;
		}
	}, []);

	const startAudioLevelMonitor = useCallback(
		(stream: MediaStream) => {
			try {
				const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext; 
				const audioContext = new AudioContextClass();
				const analyser = audioContext.createAnalyser();
				analyser.fftSize = 128;
				analyser.smoothingTimeConstant = 0.5;
				audioContext.createMediaStreamSource(stream).connect(analyser);
				audioContextRef.current = audioContext;
				analyserRef.current = analyser;
				runAnimationLoop(analyser);
			} catch (err) {
				console.error('Audio level monitor error:', err);
			}
		},
		[runAnimationLoop],
	);

	const stopAudioLevelMonitor = useCallback(() => {
		cancelAnimLoop();
		audioContextRef.current?.close().catch(() => {});
		audioContextRef.current = null;
		analyserRef.current = null;
		setAudioLevel(0);
		waveHistoryRef.current = [];
		drawCanvasFrame();
	}, [cancelAnimLoop, drawCanvasFrame]);

	const startDurationInterval = useCallback(() => {
		durationIntervalRef.current = setInterval(() => {
			setDuration(prev => {
				const next = prev + 1;
				if (durationBindingPathPath) {
					setData(durationBindingPathPath, next, context.pageName, true);
				}
				return next;
			});
		}, 1000);
	}, [durationBindingPathPath, context.pageName]);

	const clearDurationInterval = useCallback(() => {
		if (durationIntervalRef.current) {
			clearInterval(durationIntervalRef.current);
			durationIntervalRef.current = null;
		}
	}, []);

	const startRecording = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			streamRef.current = stream;

			setDuration(0);
			if (durationBindingPathPath) {
				setData(durationBindingPathPath, 0, context.pageName, true);
			}
			waveHistoryRef.current = [];
			frameCounterRef.current = 0;
			startDurationInterval();
			startAudioLevelMonitor(stream);

			let targetMime = audioType
				? audioType.includes('/')
					? audioType
					: `audio/${audioType}`
				: '';
			
			let options: MediaRecorderOptions | undefined = targetMime ? { mimeType: targetMime } : undefined;

			if (targetMime && !MediaRecorder.isTypeSupported(targetMime)) {
				options = undefined;
			}

			const recorder = new MediaRecorder(stream, options);

			recorder.ondataavailable = e => {
				if (e.data && e.data.size > 0) {
					audioChunksRef.current.push(e.data);
				}
			};

			recorder.onstop = async () => {
				const actualMimeType = recorder.mimeType || 'audio/webm';
				const blob = new Blob(audioChunksRef.current, { type: actualMimeType });
				audioChunksRef.current = [];

				let uploadResponse: any = null;
				try {
					const formData = new FormData();
					
					// Force the file extension to match the user's requested type if provided
					let requestedExt = audioType ? (audioType.includes('/') ? audioType.split('/')[1] : audioType) : null;
					
					let fileExt = requestedExt || actualMimeType.split('/')[1]?.split(';')[0] || 'webm';
					
					// Some browsers might return extensions with a 'x-matroska' or similar
					if (fileExt === 'x-matroska') fileExt = 'mkv';
					const filename = `recording_${Date.now()}.${fileExt}`;
					formData.append('file', blob, filename);

					const targetLocation = location ? location.replace(/^\/+/, '') : '';
					const url = `/api/files/${resourceType}/${targetLocation}/`.replaceAll('//', '/');

					const response = await axios.post(url, formData, {
						headers: {
							'Content-Type': 'multipart/form-data',
							Authorization: getDataFromPath(`${LOCAL_STORE_PREFIX}.AuthToken`, []),
						},
					});
					uploadResponse = response.data;
				} catch (err) {
					console.error('Failed to upload recorded audio:', err);
				}

				if (bindingPathPath && uploadResponse) {
					setData(bindingPathPath, uploadResponse, context.pageName, true);
				}

				if (onSave && pageDefinition?.eventFunctions?.[onSave]) {
					await runEvent(
						pageDefinition.eventFunctions[onSave],
						onSave,
						context.pageName,
						locationHistory,
						pageDefinition,
					);
				}

				stream.getTracks().forEach(t => t.stop());
			};

			recorder.start();
			mediaRecorderRef.current = recorder;
			setRecording(true);
			setPaused(false);
		} catch (err) {
			console.error('Failed to start recording:', err);
		}
	};

	const pauseRecording = () => {
		if (mediaRecorderRef.current?.state === 'recording') {
			mediaRecorderRef.current.pause();
			setPaused(true);
			clearDurationInterval();
			cancelAnimLoop();
			setAudioLevel(0);
		}
	};

	const resumeRecording = () => {
		if (mediaRecorderRef.current?.state === 'paused' && analyserRef.current) {
			mediaRecorderRef.current.resume();
			setPaused(false);
			startDurationInterval();
			runAnimationLoop(analyserRef.current);
		}
	};

	const stopRecording = () => {
		if (mediaRecorderRef.current) {
			mediaRecorderRef.current.stop();
			setDuration(0);
			if (durationBindingPathPath) {
				setData(durationBindingPathPath, 0, context.pageName, true);
			}
			setRecording(false);
			setPaused(false);
			clearDurationInterval();
			stopAudioLevelMonitor();
			streamRef.current = null;
		}
	};

	useEffect(() => {
		return () => {
			clearDurationInterval();
			stopAudioLevelMonitor();
			if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
				mediaRecorderRef.current.stop();
			}
			streamRef.current?.getTracks().forEach(t => t.stop());
		};
	}, [clearDurationInterval, stopAudioLevelMonitor]);

	const recordIconFinal = recordImage ? (
		<span className="_recordImageWrapper" style={{ position: 'relative', display: 'flex' }}>
			<img
				src={getSrcUrl(recordImage)}
				alt="Record Icon"
				className="_recordImage"
				style={(resolvedStyles.recordImage as any) ?? {}}
			/>
			<SubHelperComponent definition={definition} subComponentName="recordImage" />
		</span>
	) : iconRecord ? (
		<i className={`${iconRecord} _recordIcon`} style={(resolvedStyles.recordIcon as any) ?? {}}>
			<SubHelperComponent definition={definition} subComponentName="recordIcon" />
		</i>
	) : (
		<span className="_recordIcon" style={(resolvedStyles.recordIcon as any) ?? {}}>
			<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512" fill="currentColor">
				<path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z" />
			</svg>
			<SubHelperComponent definition={definition} subComponentName="recordIcon" />
		</span>
	);

	const pauseIconFinal = pauseImage ? (
		<span className="_pauseImageWrapper" style={{ position: 'relative', display: 'flex' }}>
			<img
				src={getSrcUrl(pauseImage)}
				alt="Pause Icon"
				className="_pauseImage"
				style={(resolvedStyles.pauseImage as any) ?? {}}
			/>
			<SubHelperComponent definition={definition} subComponentName="pauseImage" />
		</span>
	) : iconPause ? (
		<i className={`${iconPause} _pauseIcon`} style={(resolvedStyles.pauseIcon as any) ?? {}}>
			<SubHelperComponent definition={definition} subComponentName="pauseIcon" />
		</i>
	) : (
		<span className="_pauseIcon" style={(resolvedStyles.pauseIcon as any) ?? {}}>
			<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 320 512" fill="currentColor">
				<path d="M48 64C21.5 64 0 85.5 0 112V400c0 26.5 21.5 48 48 48H80c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zm192 0c-26.5 0-48 21.5-48 48V400c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H240z" />
			</svg>
			<SubHelperComponent definition={definition} subComponentName="pauseIcon" />
		</span>
	);

	const stopIconFinal = stopImage ? (
		<span className="_stopImageWrapper" style={{ position: 'relative', display: 'flex' }}>
			<img
				src={getSrcUrl(stopImage)}
				alt="Stop Icon"
				className="_stopImage"
				style={(resolvedStyles.stopImage as any) ?? {}}
			/>
			<SubHelperComponent definition={definition} subComponentName="stopImage" />
		</span>
	) : iconStop ? (
		<i className={`${iconStop} _stopIcon`} style={(resolvedStyles.stopIcon as any) ?? {}}>
			<SubHelperComponent definition={definition} subComponentName="stopIcon" />
		</i>
	) : (
		<span className="_stopIcon" style={(resolvedStyles.stopIcon as any) ?? {}}>
			<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512" fill="currentColor">
				<path d="M0 128C0 92.7 28.7 64 64 64H320c35.3 0 64 28.7 64 64V384c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V128z" />
			</svg>
			<SubHelperComponent definition={definition} subComponentName="stopIcon" />
		</span>
	);

	return (
		<div
			className={`comp compVoiceRecorder ${designType} ${colorScheme}`}
			style={resolvedStyles.comp ?? {}}
		>
			<HelperComponent context={context} definition={definition} />
			<div className="_recordContainer" style={resolvedStyles.recordContainer ?? {}}>
				
				{designType === '_voiceRecorderDesign2' && (<div
					className="_durationText _recordingDuration"
					style={resolvedStyles.recordingDuration ?? {}}
				>
					<time className="_timeElapsed">{formatDuration(duration)}</time>
					<SubHelperComponent definition={definition} subComponentName="recordingDuration" />
				</div>)}

				{designType === '_voiceRecorderDesign2' ? (
					<div
						className="_visualizerContainer"
						style={resolvedStyles.audioLevelSlider ?? {}}
					>
						<canvas
							ref={canvasRef}
							className="_visualizer"
							style={resolvedStyles.audioLevelSlider ?? {}}
						/>
						<SubHelperComponent definition={definition} subComponentName="audioLevelSlider" />
					</div>
				) : (
					<div
						className="_progressBarContainer"
						style={resolvedStyles.audioLevelSlider ?? {}}
					>
						<input
							className="_progressBar _progress _audioLevelSlider"
							type="range"
							min="0"
							max="100"
							value={recording && !paused ? audioLevel : 0}
							readOnly
							style={resolvedStyles.audioLevelSlider ?? {}}
						/>
						<SubHelperComponent definition={definition} subComponentName="audioLevelSlider" />
					</div>
				)}

				{ designType !== '_voiceRecorderDesign2' && (<div
					className="_timeText _recordingDuration"
					style={resolvedStyles.recordingDuration ?? {}}
				>
					<time className="_timeElapsed">{formatDuration(duration)}</time>
					<SubHelperComponent definition={definition} subComponentName="recordingDuration" />
				</div>)}

				{!recording && (
					<div
						onClick={startRecording}
						className="_playPauseContainer _startContainer"
						style={resolvedStyles.startContainer ?? {}}
					>
						{recordIconFinal}
						{labelRecord && (
							<span className="_recordText" style={resolvedStyles.recordText ?? {}}>
								{labelRecord}
								<SubHelperComponent definition={definition} subComponentName="recordText" />
							</span>
						)}
						<SubHelperComponent definition={definition} subComponentName="startContainer" />
					</div>
				)}
				{recording && !paused && (
					<div
						onClick={pauseRecording}
						className="_playPauseContainer _pauseContainer"
						style={resolvedStyles.pauseContainer ?? {}}
					>
						{pauseIconFinal}
						{labelPause && (
							<span className="_pauseText" style={resolvedStyles.pauseText ?? {}}>
								{labelPause}
								<SubHelperComponent definition={definition} subComponentName="pauseText" />
							</span>
						)}
						<SubHelperComponent definition={definition} subComponentName="pauseContainer" />
					</div>
				)}
				{recording && paused && (
					<div
						onClick={resumeRecording}
						className="_playPauseContainer _startContainer"
						style={resolvedStyles.startContainer ?? {}}
					>
						{recordIconFinal}
						{labelRecord && (
							<span className="_recordText" style={resolvedStyles.recordText ?? {}}>
								{labelRecord}
								<SubHelperComponent definition={definition} subComponentName="recordText" />
							</span>
						)}
						<SubHelperComponent definition={definition} subComponentName="startContainer" />
					</div>
				)}
				{recording && (
					<div
						onClick={stopRecording}
						className="_playPauseContainer _stopContainer"
						style={resolvedStyles.stopContainer ?? {}}
					>
						{stopIconFinal}
						{labelStop && (
							<span className="_stopText" style={resolvedStyles.stopText ?? {}}>
								{labelStop}
								<SubHelperComponent definition={definition} subComponentName="stopText" />
							</span>
						)}
						<SubHelperComponent definition={definition} subComponentName="stopContainer" />
					</div>
				)}
				<SubHelperComponent definition={definition} subComponentName="recordContainer" />
			</div>
		</div>
	);
}

const { designType, colorScheme } = findPropertyDefinitions(
	propertiesDefinition,
	'designType',
	'colorScheme',
);

const component: Component = {
	order: 20,
	name: 'VoiceRecorder',
	displayName: 'Voice Recorder',
	description: 'Voice Recorder component for capturing and uploading audio.',
	component: VoiceRecorderComponent,
	propertyValidation: (_props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	styleComponent: VoiceRecorderStyle,
	styleDefaults: styleDefaults,
	allowedChildrenType: new Map<string, number>([['', -1]]),
	propertiesForTheme: [designType, colorScheme],
	stylePropertiesForTheme: stylePropertiesForTheme,
	externalStylePropsForThemeJson: true,
	defaultTemplate: {
		key: '',
		type: 'VoiceRecorder',
		name: 'Voice Recorder',
		properties: {},
	},
	bindingPaths: {
		bindingPath: { name: 'Selected Audio URL Binding' },
		bindingPath2: { name: 'Duration Binding' },
	},
};

export default component;