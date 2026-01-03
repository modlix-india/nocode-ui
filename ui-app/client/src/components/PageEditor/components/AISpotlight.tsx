/**
 * AI Spotlight Component
 *
 * A spotlight-style input overlay for AI-assisted component modifications.
 * Features an animated swirling border and support for visual feedback via screenshots.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { PageDefinition, LocationHistory } from '../../../types/common';
import { streamAIRequest, AIEvent, AIResponse, DeviceScreenshots } from '../util/aiService';
import { captureComponent, captureViewport, preloadHtml2Canvas } from '../util/captureComponent';
import {
	PageStoreExtractor,
	getDataFromPath,
	addListenerAndCallImmediately,
} from '../../../context/StoreContext';

interface AISpotlightProps {
	/** Component key that was right-clicked */
	componentKey: string;
	/** Component type for display */
	componentType?: string;
	/** Current page definition */
	pageDefinition: PageDefinition;
	/** App code (sitezump or appbuilder) */
	appCode: string;
	/** Reference to the desktop preview iframe */
	desktopIframe: React.RefObject<HTMLIFrameElement>;
	/** Reference to the tablet preview iframe (optional) */
	tabletIframe?: React.RefObject<HTMLIFrameElement>;
	/** Reference to the mobile preview iframe (optional) */
	mobileIframe?: React.RefObject<HTMLIFrameElement>;
	/** Callback when AI applies changes to the page */
	onApply: (newPage: PageDefinition) => void;
	/** Callback to close the spotlight */
	onClose: () => void;
	/** Path to app definition in store */
	appPath?: string;
	/** Path to theme in store */
	themePath?: string;
	/** Page store extractor */
	pageExtractor: PageStoreExtractor;
	/** Location history for path resolution */
	locationHistory: Array<LocationHistory>;
}

type SpotlightState = 'input' | 'generating' | 'complete' | 'error';

interface AgentProgress {
	name: string;
	status: 'pending' | 'working' | 'done' | 'error';
	message?: string;
}

export default function AISpotlight({
	componentKey,
	componentType,
	pageDefinition,
	appCode,
	desktopIframe,
	tabletIframe,
	mobileIframe,
	onApply,
	onClose,
	appPath,
	themePath,
	pageExtractor,
	locationHistory,
}: Readonly<AISpotlightProps>) {
	const [state, setState] = useState<SpotlightState>('input');
	const [instruction, setInstruction] = useState('');
	const [statusMessage, setStatusMessage] = useState('');
	const [agentProgress, setAgentProgress] = useState<AgentProgress[]>([]);
	const [screenshot, setScreenshot] = useState<string | null>(null);
	const [deviceScreenshots, setDeviceScreenshots] = useState<DeviceScreenshots>({});
	const [showFullScreenshot, setShowFullScreenshot] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const [pendingResult, setPendingResult] = useState<PageDefinition | null>(null);
	const [uploadedFile, setUploadedFile] = useState<File | null>(null);
	const [filePreview, setFilePreview] = useState<string | null>(null);

	const inputRef = useRef<HTMLTextAreaElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const abortControllerRef = useRef<AbortController | null>(null);

	// State for iconPacks and fontPacks
	const [iconPacks, setIconPacks] = useState<string[]>([]);
	const [fontPacks, setFontPacks] = useState<Array<{ name: string; code: string }>>([]);

	// Extract iconPacks and fontPacks from app definition with listener for changes
	useEffect(() => {
		if (!appPath) {
			setIconPacks([]);
			setFontPacks([]);
			return;
		}

		return addListenerAndCallImmediately(
			pageExtractor.getPageName(),
			(_, appDefinition: any) => {
				if (!appDefinition) {
					setIconPacks([]);
					setFontPacks([]);
					return;
				}

				// Extract iconPacks
				const extractedIconPacks: string[] = [];
				if (appDefinition.iconPacks && typeof appDefinition.iconPacks === 'object') {
					// iconPacks is an object with UUID keys, each value has a 'name' property
					Object.values(appDefinition.iconPacks).forEach((pack: any) => {
						if (pack?.name && typeof pack.name === 'string') {
							extractedIconPacks.push(pack.name);
						}
					});
				}
				setIconPacks(extractedIconPacks);

				// Extract fontPacks
				const extractedFontPacks: Array<{ name: string; code: string }> = [];
				if (appDefinition.fontPacks && typeof appDefinition.fontPacks === 'object') {
					// fontPacks is an object with UUID keys, each value has 'name' and 'code' properties
					Object.values(appDefinition.fontPacks).forEach((pack: any) => {
						if (pack?.name && typeof pack.name === 'string') {
							extractedFontPacks.push({
								name: pack.name,
								code: pack.code || '', // Include the link tag code for font loading
							});
						}
					});
				}
				setFontPacks(extractedFontPacks);
			},
			appPath,
		);
	}, [appPath, locationHistory, pageExtractor]);

	// Focus input on mount, preload html2canvas, and auto-capture page screenshots from all devices
	useEffect(() => {
		inputRef.current?.focus();

		const initCapture = async () => {
			const screenshots: DeviceScreenshots = {};

			// Capture desktop viewport
			if (desktopIframe?.current) {
				try {
					await preloadHtml2Canvas(desktopIframe.current);
					setStatusMessage('Capturing desktop view...');
					screenshots.desktop = await captureViewport(desktopIframe.current);
					console.log(
						'[AI] Desktop screenshot captured, length:',
						screenshots.desktop.length,
					);
				} catch (e: any) {
					console.warn('Failed to capture desktop screenshot:', e.message);
				}
			}

			// Capture tablet viewport if available
			if (tabletIframe?.current) {
				try {
					await preloadHtml2Canvas(tabletIframe.current);
					setStatusMessage('Capturing tablet view...');
					screenshots.tablet = await captureViewport(tabletIframe.current);
					console.log(
						'[AI] Tablet screenshot captured, length:',
						screenshots.tablet.length,
					);
				} catch (e: any) {
					console.warn('Failed to capture tablet screenshot:', e.message);
				}
			}

			// Capture mobile viewport if available
			if (mobileIframe?.current) {
				try {
					await preloadHtml2Canvas(mobileIframe.current);
					setStatusMessage('Capturing mobile view...');
					screenshots.mobile = await captureViewport(mobileIframe.current);
					console.log(
						'[AI] Mobile screenshot captured, length:',
						screenshots.mobile.length,
					);
				} catch (e: any) {
					console.warn('Failed to capture mobile screenshot:', e.message);
				}
			}

			setDeviceScreenshots(screenshots);
			setStatusMessage('');
		};

		initCapture();

		return () => {
			// Cleanup: abort any pending request
			abortControllerRef.current?.abort();
		};
	}, [desktopIframe, tabletIframe, mobileIframe]);

	// Cleanup file preview URL on unmount
	useEffect(() => {
		return () => {
			if (filePreview) {
				URL.revokeObjectURL(filePreview);
			}
		};
	}, [filePreview]);

	// Handle keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				if (state === 'generating') {
					abortControllerRef.current?.abort();
				}
				onClose();
			}
		};

		globalThis.addEventListener('keydown', handleKeyDown);
		return () => globalThis.removeEventListener('keydown', handleKeyDown);
	}, [state, onClose]);

	// Convert file to base64
	const fileToBase64 = useCallback((file: File): Promise<string> => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => {
				const result = reader.result as string;
				// Remove data URL prefix (e.g., "data:image/png;base64,")
				const base64 = result.split(',')[1] || result;
				resolve(base64);
			};
			reader.onerror = reject;
			reader.readAsDataURL(file);
		});
	}, []);

	// Handle paste event
	const handlePaste = useCallback(
		async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
			const items = e.clipboardData.items;

			for (let i = 0; i < items.length; i++) {
				const item = items[i];

				// Check if it's an image
				if (item.type.startsWith('image/')) {
					e.preventDefault();
					const file = item.getAsFile();
					if (file) {
						try {
							setStatusMessage('Processing pasted image...');
							const base64 = await fileToBase64(file);
							setScreenshot(base64);
							setUploadedFile(file);
							setFilePreview(URL.createObjectURL(file));
							setStatusMessage(
								'Image pasted successfully. Click thumbnail to preview.',
							);
							console.log('[AI] Image pasted, length:', base64.length);
						} catch (error: any) {
							console.error('Failed to process pasted image:', error);
							setErrorMessage(`Failed to process image: ${error.message}`);
						}
					}
					return;
				}

				// Check if it's a file (non-image)
				if (item.kind === 'file' && !item.type.startsWith('image/')) {
					e.preventDefault();
					const file = item.getAsFile();
					if (file) {
						setUploadedFile(file);
						setStatusMessage(
							`File ready: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
						);
						console.log('[AI] File pasted:', file.name, file.type, file.size);
					}
					return;
				}
			}
		},
		[fileToBase64],
	);

	// Handle file input change
	const handleFileInput = useCallback(
		async (e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (!file) return;

			// If it's an image, convert to base64 and set as screenshot
			if (file.type.startsWith('image/')) {
				try {
					setStatusMessage('Processing uploaded image...');
					const base64 = await fileToBase64(file);
					setScreenshot(base64);
					setUploadedFile(file);
					setFilePreview(URL.createObjectURL(file));
					setStatusMessage('Image uploaded successfully. Click thumbnail to preview.');
					console.log('[AI] Image uploaded, length:', base64.length);
				} catch (error: any) {
					console.error('Failed to process uploaded image:', error);
					setErrorMessage(`Failed to process image: ${error.message}`);
				}
			} else {
				// Non-image file
				setUploadedFile(file);
				setStatusMessage(`File ready: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
				console.log('[AI] File uploaded:', file.name, file.type, file.size);
			}
		},
		[fileToBase64],
	);

	// Handle file upload button click
	const handleUploadClick = useCallback(() => {
		fileInputRef.current?.click();
	}, []);

	// Handle AI event updates
	const handleEvent = useCallback((event: AIEvent) => {
		console.log('[AI Event]', event.event, event.data); // Debug logging

		// Always update status message for any event with a message
		const msg = event.data.message || event.data.data?.message;

		switch (event.event) {
			case 'status':
				setStatusMessage(msg || 'Processing...');
				break;

			case 'phase':
				setStatusMessage(
					event.data.data?.phase
						? `Phase: ${event.data.data.phase}`
						: msg || 'Starting phase...',
				);
				break;

			case 'agent_start':
				setStatusMessage(msg || `Starting ${event.data.agent}...`);
				setAgentProgress(prev => {
					const existing = prev.find(a => a.name === event.data.agent);
					if (existing) {
						return prev.map(a =>
							a.name === event.data.agent
								? { ...a, status: 'working', message: msg }
								: a,
						);
					}
					return [
						...prev,
						{
							name: event.data.agent || 'Unknown',
							status: 'working',
							message: msg,
						},
					];
				});
				break;

			case 'agent_thinking':
				setStatusMessage(msg || `${event.data.agent} thinking...`);
				setAgentProgress(prev =>
					prev.map(a => (a.name === event.data.agent ? { ...a, message: msg } : a)),
				);
				break;

			case 'agent_complete':
				setStatusMessage(msg || `${event.data.agent} completed`);
				setAgentProgress(prev =>
					prev.map(a =>
						a.name === event.data.agent
							? {
									...a,
									status:
										(event.data.data?.success ?? event.data.success)
											? 'done'
											: 'error',
									message: msg,
								}
							: a,
					),
				);
				break;

			case 'merging':
				setStatusMessage(msg || 'Merging agent outputs...');
				break;

			case 'keepalive':
				// Update status to show we're still connected
				setStatusMessage(msg || 'Working...');
				break;

			default:
				// For any unhandled event, show its message if available
				if (msg) {
					setStatusMessage(msg);
				}
				break;
		}
	}, []);

	// Log changes between original and new page
	const logPageChanges = useCallback((original: PageDefinition, modified: PageDefinition) => {
		console.group('[AI Changes] Page modifications:');

		// Compare componentDefinition for style changes
		const origDef = original.componentDefinition || {};
		const modDef = modified.componentDefinition || {};

		// Use Set to avoid duplicate entries
		const changedComponents = new Set<string>();

		for (const key of Object.keys(modDef)) {
			const origComp = origDef[key];
			const modComp = modDef[key];

			if (!origComp) {
				console.log(`  + NEW component: ${key}`);
				changedComponents.add(key);
				continue;
			}

			// Check styleProperties changes
			const origStyles = JSON.stringify(origComp.styleProperties || {});
			const modStyles = JSON.stringify(modComp.styleProperties || {});
			if (origStyles !== modStyles) {
				console.log(`  ~ STYLES changed: ${key}`);
				console.log('    Before:', origComp.styleProperties);
				console.log('    After:', modComp.styleProperties);
				changedComponents.add(key);
			}

			// Check properties changes
			const origProps = JSON.stringify(origComp.properties || {});
			const modProps = JSON.stringify(modComp.properties || {});
			if (origProps !== modProps) {
				console.log(`  ~ PROPERTIES changed: ${key}`);
				changedComponents.add(key);
			}
		}

		// Check for removed components
		for (const key of Object.keys(origDef)) {
			if (!modDef[key]) {
				console.log(`  - REMOVED component: ${key}`);
				changedComponents.add(key);
			}
		}

		// Check eventFunctions changes
		const origEvents = Object.keys(original.eventFunctions || {});
		const modEvents = Object.keys(modified.eventFunctions || {});
		const newEvents = modEvents.filter(e => !origEvents.includes(e));
		const removedEvents = origEvents.filter(e => !modEvents.includes(e));

		if (newEvents.length > 0) {
			console.log(`  + NEW events: ${newEvents.join(', ')}`);
		}
		if (removedEvents.length > 0) {
			console.log(`  - REMOVED events: ${removedEvents.join(', ')}`);
		}

		const changedArray = Array.from(changedComponents);
		console.log(`Total: ${changedArray.length} components modified`);
		console.groupEnd();

		return changedArray;
	}, []);

	// Handle AI completion
	const handleComplete = useCallback(
		(response: AIResponse) => {
			console.log('[AI Complete]', response); // Debug logging
			if (response.success && response.page) {
				// Log what changed
				const changes = logPageChanges(pageDefinition, response.page);
				console.log('[AI Complete] Changed components:', changes);

				setPendingResult(response.page);
				setStatusMessage(`Ready to apply changes (${changes.length} components modified)`);
				setState('complete');
			} else {
				console.warn('[AI Complete] Missing page or failed:', response);
				setErrorMessage('AI generation failed - no page returned');
				setState('error');
			}
		},
		[logPageChanges, pageDefinition],
	);

	// Handle AI error
	const handleError = useCallback((error: string) => {
		console.error('[AI Error]', error); // Debug logging
		setErrorMessage(error);
		setState('error');
	}, []);

	// Submit instruction to AI
	const handleSubmit = useCallback(async () => {
		if (!instruction.trim()) return;

		setState('generating');
		setStatusMessage('Starting AI generation...');
		setAgentProgress([]);
		setErrorMessage('');

		abortControllerRef.current = new AbortController();

		// Use pendingResult for refinement, otherwise use original pageDefinition
		const pageToModify = pendingResult || pageDefinition;

		// Only include device screenshots that have content
		const screenshotsToSend: DeviceScreenshots = {};
		if (deviceScreenshots.desktop) screenshotsToSend.desktop = deviceScreenshots.desktop;
		if (deviceScreenshots.tablet) screenshotsToSend.tablet = deviceScreenshots.tablet;
		if (deviceScreenshots.mobile) screenshotsToSend.mobile = deviceScreenshots.mobile;

		// Prepare file data if uploaded
		// Note: Images are sent as componentScreenshot, non-image files are sent as file
		let fileData: { name: string; type: string; content: string } | undefined;
		if (uploadedFile && !uploadedFile.type.startsWith('image/')) {
			// For non-image files, convert to base64
			try {
				const base64 = await fileToBase64(uploadedFile);
				fileData = {
					name: uploadedFile.name,
					type: uploadedFile.type,
					content: base64,
				};
			} catch (error: any) {
				console.error('Failed to convert file to base64:', error);
				setErrorMessage(`Failed to process file: ${error.message}`);
				return;
			}
		}

		// If an image was pasted/uploaded, use it as componentScreenshot (replaces captured screenshot)
		const screenshotToSend = screenshot || undefined;

		// Debug: log what we're sending
		console.log('[AI Submit] Sending request:', {
			instruction: instruction.trim(),
			selectedComponentKey: componentKey,
			hasComponentScreenshot: !!screenshot,
			componentScreenshotLength: screenshot?.length || 0,
			hasFile: !!fileData,
			fileName: fileData?.name,
			deviceScreenshots: {
				desktop: screenshotsToSend.desktop
					? `${screenshotsToSend.desktop.length} bytes`
					: 'none',
				tablet: screenshotsToSend.tablet
					? `${screenshotsToSend.tablet.length} bytes`
					: 'none',
				mobile: screenshotsToSend.mobile
					? `${screenshotsToSend.mobile.length} bytes`
					: 'none',
			},
		});

		await streamAIRequest(
			{
				instruction: instruction.trim(),
				page: pageToModify,
				selectedComponentKey: componentKey,
				componentScreenshot: screenshotToSend,
				deviceScreenshots:
					Object.keys(screenshotsToSend).length > 0 ? screenshotsToSend : undefined,
				file: fileData,
				theme: getDataFromPath(themePath, []),
				iconPacks: iconPacks.length > 0 ? iconPacks : undefined,
				fontPacks: fontPacks.length > 0 ? fontPacks : undefined,
				options: { mode: 'modify' },
			},
			appCode,
			handleEvent,
			handleComplete,
			handleError,
			abortControllerRef.current.signal,
		);
	}, [
		instruction,
		pageDefinition,
		pendingResult,
		componentKey,
		screenshot,
		deviceScreenshots,
		uploadedFile,
		fileToBase64,
		appCode,
		handleEvent,
		handleComplete,
		handleError,
	]);

	// Capture screenshot for visual feedback
	const handleCapture = useCallback(async () => {
		if (!desktopIframe.current) return;

		try {
			setStatusMessage('Capturing component...');
			const base64 = await captureComponent(desktopIframe.current, componentKey);
			setScreenshot(base64);
			// Clear uploaded file if it was an image (since we're using captured screenshot now)
			if (uploadedFile?.type.startsWith('image/')) {
				setUploadedFile(null);
				if (filePreview) {
					URL.revokeObjectURL(filePreview);
					setFilePreview(null);
				}
			}
			console.log('[AI Capture] Screenshot captured, length:', base64.length);
			setStatusMessage('Screenshot captured. Click thumbnail to preview.');
		} catch (e: any) {
			console.error('Capture failed:', e);
			setErrorMessage(`Capture failed: ${e.message}`);
		}
	}, [desktopIframe, componentKey, uploadedFile, filePreview]);

	// Apply the AI result to the page
	const handleApply = useCallback(() => {
		if (pendingResult) {
			onApply(pendingResult);
			onClose();
		}
	}, [pendingResult, onApply, onClose]);

	// Refine with new instruction (clears prompt)
	const handleRefine = useCallback(() => {
		setInstruction('');
		setState('input');
		setErrorMessage('');
		setAgentProgress([]);
		setScreenshot(null);
		setUploadedFile(null);
		if (filePreview) {
			URL.revokeObjectURL(filePreview);
			setFilePreview(null);
		}
		inputRef.current?.focus();
	}, [filePreview]);

	// Retry with same instruction
	const handleRetry = useCallback(() => {
		setErrorMessage('');
		setAgentProgress([]);
		setState('input');
		// Use setTimeout to let state update, then submit
		setTimeout(() => {
			handleSubmit();
		}, 0);
	}, [handleSubmit]);

	// Cancel and close
	const handleCancel = useCallback(() => {
		abortControllerRef.current?.abort();
		onClose();
	}, [onClose]);

	return (
		<div
			className="_aiSpotlightOverlay"
			onKeyDown={e => e.key === 'Escape' && handleCancel()}
			role="dialog"
			aria-modal="true"
			aria-label="AI Assist"
		>
			<div
				className="_aiSpotlightContainer"
				onClick={e => e.stopPropagation()}
				onKeyDown={e => e.stopPropagation()}
				role="document"
			>
				{/* Header with component info */}
				<div className="_aiSpotlightHeader">
					<span className="_aiSpotlightIcon _claudeLogo">
						{/* AI Logo */}
						<svg
							width="24"
							height="15"
							viewBox="0 0 136 83"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M76.0314 17.1742V7.37459L68.0056 0L59.9801 7.37459V17.1742C26.667 21.1066 0.384999 49.1784 0 83H0.0111617C5.5023 81.0767 10.9934 79.1525 16.4846 77.2283C19.3292 54.5598 37.2044 36.4823 59.9764 32.9995V60.7251L68.0093 55.1126L76.0237 60.7251V32.9995C98.7957 36.4823 116.674 54.5598 119.516 77.2283C125.006 79.1525 130.498 81.0767 135.989 83H136C135.615 49.1784 109.333 21.1066 76.0203 17.1742H76.0314Z"
								fill="#D97757"
							/>
						</svg>
					</span>
					<span className="_aiSpotlightTitle">
						AI Assist {componentType && `• ${componentType}`}
					</span>
					<button className="_aiSpotlightClose" onClick={handleCancel}>
						×
					</button>
				</div>

				{/* Screenshot thumbnail - click to expand */}
				{(screenshot || filePreview) && (
					<div
						className="_aiScreenshotPreview"
						onClick={() => setShowFullScreenshot(true)}
						title="Click to view full size"
						style={{ cursor: 'pointer' }}
					>
						{filePreview ? (
							<img src={filePreview} alt="Uploaded preview" />
						) : (
							<img
								src={`data:image/png;base64,${screenshot}`}
								alt="Component preview"
							/>
						)}
					</div>
				)}

				{/* File info display for non-image files */}
				{uploadedFile && !uploadedFile.type.startsWith('image/') && (
					<div
						className="_aiFileInfo"
						style={{
							padding: '8px 12px',
							margin: '8px 0',
							backgroundColor: 'rgba(255, 255, 255, 0.05)',
							borderRadius: '4px',
							fontSize: '12px',
							color: '#ccc',
						}}
					>
						📎 {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(1)} KB)
						<button
							onClick={() => {
								setUploadedFile(null);
								setScreenshot(null);
								if (filePreview) {
									URL.revokeObjectURL(filePreview);
									setFilePreview(null);
								}
							}}
							style={{
								marginLeft: '8px',
								background: 'none',
								border: 'none',
								color: '#ff6b6b',
								cursor: 'pointer',
								fontSize: '12px',
							}}
						>
							× Remove
						</button>
					</div>
				)}

				{/* Full screenshot modal */}
				{showFullScreenshot && (screenshot || filePreview) && (
					<div
						className="_aiScreenshotModal"
						onClick={() => setShowFullScreenshot(false)}
						style={{
							position: 'fixed',
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							backgroundColor: 'rgba(0,0,0,0.8)',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							zIndex: 10001,
							cursor: 'pointer',
						}}
					>
						{filePreview ? (
							<img
								src={filePreview}
								alt="Uploaded preview full"
								style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }}
							/>
						) : (
							<img
								src={`data:image/png;base64,${screenshot}`}
								alt="Component preview full"
								style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }}
							/>
						)}
					</div>
				)}

				{/* Input area with swirling border */}
				<div className="_aiInputWrapper">
					<div className="_aiInputBorder" />
					<textarea
						ref={inputRef}
						className="_aiInput"
						placeholder="What would you like to do with this component? (Paste image/file or type instruction)"
						value={instruction}
						onChange={e => setInstruction(e.target.value)}
						onPaste={handlePaste}
						onKeyDown={e => {
							// Ctrl+Enter or Cmd+Enter to submit
							if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
								e.preventDefault();
								handleSubmit();
							}
						}}
						disabled={state === 'generating'}
						rows={3}
					/>
					{/* Hidden file input */}
					<input
						ref={fileInputRef}
						type="file"
						style={{ display: 'none' }}
						onChange={handleFileInput}
						accept="*/*"
					/>
				</div>

				{/* Status and progress */}
				{(statusMessage || agentProgress.length > 0) && (
					<div className="_aiProgress">
						{statusMessage && <div className="_aiStatusMessage">{statusMessage}</div>}
						{agentProgress.length > 0 && (
							<div className="_aiAgentList">
								{agentProgress.map(agent => (
									<div
										key={agent.name}
										className={`_aiAgentItem _${agent.status}`}
									>
										<span className="_aiAgentStatus">
											{agent.status === 'working' && '⏳'}
											{agent.status === 'done' && '✓'}
											{agent.status === 'error' && '✗'}
											{agent.status === 'pending' && '○'}
										</span>
										<span className="_aiAgentName">{agent.name}</span>
										{agent.message && (
											<span className="_aiAgentMessage">{agent.message}</span>
										)}
									</div>
								))}
							</div>
						)}
					</div>
				)}

				{/* Error message */}
				{errorMessage && <div className="_aiError">{errorMessage}</div>}

				{/* Actions */}
				<div className="_aiActions">
					{state === 'input' && (
						<>
							<button
								className="_aiActionSecondary"
								onClick={handleCapture}
								title="Capture screenshot for visual feedback"
							>
								📷 Capture
							</button>
							<button
								className="_aiActionSecondary"
								onClick={handleUploadClick}
								title="Upload image or file"
							>
								📁 Upload
							</button>
							<button
								className="_aiActionPrimary"
								onClick={handleSubmit}
								disabled={!instruction.trim()}
							>
								Generate
							</button>
						</>
					)}

					{state === 'generating' && (
						<button className="_aiActionSecondary" onClick={handleCancel}>
							Cancel
						</button>
					)}

					{state === 'complete' && (
						<button
							className="_aiActionPrimary"
							onClick={handleApply}
							disabled={!pendingResult}
						>
							Apply Changes
						</button>
					)}

					{state === 'error' && (
						<>
							<button className="_aiActionPrimary" onClick={handleRetry}>
								Try Again
							</button>
							<button className="_aiActionSecondary" onClick={handleRefine}>
								New Prompt
							</button>
							<button className="_aiActionSecondary" onClick={handleCancel}>
								Close
							</button>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
