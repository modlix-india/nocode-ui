import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ComponentDefinition } from '../../../types/common';
import { SubHelperComponent } from '../../HelperComponents/SubHelperComponent';

// Matches the textarea's max-height in PromptStyle; past this the box stops
// growing and starts scrolling.
const MAX_INPUT_HEIGHT = 200;

interface Attachment {
	id: string;
	type: 'image' | 'file';
	name: string;
	url: string;
	mimeType: string;
	file?: File;
}

interface InputBarProps {
	placeholder: string;
	disabled: boolean;
	isStreaming: boolean;
	onSend: (message: string, attachments?: Attachment[]) => void;
	onStop: () => void;
	definition: ComponentDefinition;
	styleProperties: any;
	initialText?: string;
	/**
	 * Bumped by the host when it wants `initialText` PUT INTO the box: a session
	 * switch, a send that clears it, a refused send that hands the message back.
	 *
	 * The sync is keyed on this rather than on the text because both components
	 * hold the text, and syncing on the value made the ownership circular:
	 * typing told the host, the host re-rendered, the new prop reset this box.
	 * That converges only while the two agree, and during an agent turn they
	 * did not -- the host was pushing the stored draft while this box held what
	 * the user had typed, so each render flipped the value back and React gave
	 * up with "Maximum update depth exceeded" (a real crash, over the whole
	 * page, in the middle of a turn). A counter makes the loop impossible: the
	 * text alone can never trigger a sync.
	 */
	textRevision?: number;
	onTextChange?: (text: string) => void;
	sendIcon?: string;
	stopIcon?: string;
	addAttachmentIcon?: string;
	removeAttachmentIcon?: string;
	fileIcon?: string;
	enableVoiceInput?: boolean;
	microphoneIcon?: string;
	microphoneActiveIcon?: string;
	/** Lets the Prompt focus this textarea from a keyboard shortcut. */
	textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
	/** W3C aria-keyshortcuts token for the shortcut that focuses this textarea. */
	ariaKeyShortcuts?: string;
	/** The key chip from useComponentShortcut, shown while its modifier is held. */
	shortcutHint?: React.ReactNode;
}

const speechSupported =
	globalThis.window !== undefined &&
	!!((globalThis as any).SpeechRecognition || (globalThis as any).webkitSpeechRecognition);

export function InputBar({
	placeholder,
	disabled,
	isStreaming,
	onSend,
	onStop,
	definition,
	styleProperties,
	initialText,
	textRevision = 0,
	onTextChange,
	sendIcon = 'fa fa-arrow-up',
	stopIcon = 'fa fa-stop',
	addAttachmentIcon = 'fa fa-plus',
	removeAttachmentIcon = 'fa fa-xmark',
	fileIcon = 'fa fa-file',
	enableVoiceInput = true,
	microphoneIcon = 'fa fa-microphone',
	microphoneActiveIcon = 'fa fa-stop',
	textareaRef: externalTextareaRef,
	ariaKeyShortcuts,
	shortcutHint,
}: Readonly<InputBarProps>) {
	const [text, setText] = useState(initialText ?? '');
	const [attachments, setAttachments] = useState<Attachment[]>([]);
	const [isListening, setIsListening] = useState(false);
	const internalTextareaRef = useRef<HTMLTextAreaElement>(null);
	const textareaRef = (externalTextareaRef ??
		internalTextareaRef) as React.RefObject<HTMLTextAreaElement>;
	const fileInputRef = useRef<HTMLInputElement>(null);
	const recognitionRef = useRef<any>(null);

	// Take the host's text only when it says to (see `textRevision`). Reading
	// the text through a ref keeps it out of the dependency list, so a value
	// that changes for any other reason cannot re-run this.
	const pushedTextRef = useRef(initialText ?? '');
	pushedTextRef.current = initialText ?? '';
	useEffect(() => {
		setText(pushedTextRef.current);
	}, [textRevision]);

	// Grow the box with its content up to the cap, then let it scroll. The
	// overflow is toggled here instead of left on `auto` because Blink counts a
	// wrapped placeholder towards scrollHeight: an empty input whose placeholder
	// ran to two lines was showing a scrollbar with nothing to scroll. An empty
	// box drops back to the stylesheet's single-row height for the same reason —
	// scrollHeight would size it to the placeholder.
	useLayoutEffect(() => {
		const ta = textareaRef.current;
		if (!ta) return;
		if (!text) {
			ta.style.height = '';
			ta.style.overflowY = 'hidden';
			return;
		}
		ta.style.height = 'auto';
		ta.style.height = Math.min(ta.scrollHeight, MAX_INPUT_HEIGHT) + 'px';
		ta.style.overflowY = ta.scrollHeight > MAX_INPUT_HEIGHT ? 'auto' : 'hidden';
	}, [text]);

	// Re-focus input when streaming completes
	useEffect(() => {
		if (!isStreaming && textareaRef.current) {
			textareaRef.current.focus();
		}
	}, [isStreaming]);

	// Cleanup speech recognition on unmount
	useEffect(() => {
		return () => recognitionRef.current?.stop();
	}, []);

	const handleSend = useCallback(() => {
		const trimmed = text.trim();
		if ((!trimmed && !attachments.length) || disabled || isStreaming) return;
		// Stop listening if active
		if (recognitionRef.current) {
			recognitionRef.current.stop();
			recognitionRef.current = null;
			setIsListening(false);
		}
		onSend(trimmed, attachments.length ? attachments : undefined);
		setText('');
		setAttachments([]);
	}, [text, attachments, disabled, isStreaming, onSend]);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
			if (e.key === 'Enter' && !e.shiftKey) {
				e.preventDefault();
				handleSend();
			}
		},
		[handleSend],
	);

	const handleInput = useCallback(
		(e: React.ChangeEvent<HTMLTextAreaElement>) => {
			const newText = e.target.value;
			setText(newText);
			onTextChange?.(newText);
		},
		[onTextChange],
	);

	const addFileAttachment = useCallback((file: File) => {
		const isImage = file.type.startsWith('image/');
		const url = URL.createObjectURL(file);
		const attachment: Attachment = {
			id: `att_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
			type: isImage ? 'image' : 'file',
			name: file.name,
			url,
			mimeType: file.type,
			file,
		};
		setAttachments(prev => [...prev, attachment]);
	}, []);

	const handlePaste = useCallback(
		(e: React.ClipboardEvent<HTMLTextAreaElement>) => {
			const items = e.clipboardData?.items;
			if (!items) return;

			for (let i = 0; i < items.length; i++) {
				if (items[i].type.startsWith('image/')) {
					e.preventDefault();
					const file = items[i].getAsFile();
					if (file) addFileAttachment(file);
					return;
				}
			}
		},
		[addFileAttachment],
	);

	const handleFileSelect = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const files = e.target.files;
			if (!files) return;
			for (let i = 0; i < files.length; i++) {
				addFileAttachment(files[i]);
			}
			e.target.value = '';
		},
		[addFileAttachment],
	);

	const removeAttachment = useCallback((id: string) => {
		setAttachments(prev => {
			const removed = prev.find(a => a.id === id);
			if (removed) URL.revokeObjectURL(removed.url);
			return prev.filter(a => a.id !== id);
		});
	}, []);

	// Speech recognition handlers
	const startListening = useCallback(() => {
		if (!speechSupported) return;

		const SpeechRecognition =
			(globalThis as any).SpeechRecognition || (globalThis as any).webkitSpeechRecognition;
		const recognition = new SpeechRecognition();
		recognition.continuous = true;
		recognition.interimResults = true;
		recognition.lang = navigator.language || 'en-US';

		let finalTranscript = '';

		recognition.onresult = (event: any) => {
			for (let i = event.resultIndex; i < event.results.length; i++) {
				if (event.results[i].isFinal) {
					finalTranscript += event.results[i][0].transcript;
				}
			}
			if (finalTranscript) {
				const transcript = finalTranscript;
				finalTranscript = '';
				setText(prev => {
					const newText = prev + (prev && !prev.endsWith(' ') ? ' ' : '') + transcript;
					onTextChange?.(newText);
					return newText;
				});
			}
		};

		recognition.onend = () => {
			recognitionRef.current = null;
			setIsListening(false);
		};

		recognition.onerror = () => {
			recognitionRef.current = null;
			setIsListening(false);
		};

		recognitionRef.current = recognition;
		recognition.start();
		setIsListening(true);
	}, [onTextChange]);

	const stopListening = useCallback(() => {
		recognitionRef.current?.stop();
		recognitionRef.current = null;
		setIsListening(false);
	}, []);

	const toggleListening = useCallback(() => {
		if (isListening) stopListening();
		else startListening();
	}, [isListening, startListening, stopListening]);

	const showMic = enableVoiceInput && speechSupported;

	return (
		<div className="_promptInputBar" style={styleProperties?.inputBar ?? {}}>
			<SubHelperComponent definition={definition} subComponentName="inputBar" />
			{attachments.length > 0 && (
				<div className="_inputAttachments">
					{attachments.map(att => (
						<div key={att.id} className="_inputAttachmentItem">
							{att.type === 'image' ? (
								<img
									src={att.url}
									alt={att.name}
									className="_inputAttachmentThumb"
								/>
							) : (
								<div className="_inputAttachmentFile">
									<i className={fileIcon} />
									<span>{att.name}</span>
								</div>
							)}
							<button
								className="_removeAttachment"
								onClick={() => removeAttachment(att.id)}
								title="Remove"
							>
								<i className={removeAttachmentIcon} />
							</button>
						</div>
					))}
				</div>
			)}
			<div className="_inputContainer">
				<button
					className="_addAttachmentButton"
					onClick={() => fileInputRef.current?.click()}
					disabled={disabled || isStreaming}
					title="Add attachment"
				>
					<i className={addAttachmentIcon} />
				</button>
				<input
					ref={fileInputRef}
					type="file"
					multiple
					accept="image/*,.pdf,.txt,.csv,.json,.xml,.doc,.docx,.xls,.xlsx"
					onChange={handleFileSelect}
					style={{ display: 'none' }}
				/>
				<textarea
					ref={textareaRef}
					value={text}
					onChange={handleInput}
					onKeyDown={handleKeyDown}
					onPaste={handlePaste}
					placeholder={placeholder}
					disabled={disabled}
					rows={1}
					autoFocus
					aria-keyshortcuts={ariaKeyShortcuts}
					style={styleProperties?.inputTextArea ?? {}}
				/>
				<div className="_inputActions">
					{shortcutHint}
					{showMic && (
						<button
							className={`_micButton ${isListening ? '_recording' : ''}`}
							onClick={toggleListening}
							disabled={disabled}
							title={isListening ? 'Stop recording' : 'Voice input'}
						>
							<i className={isListening ? microphoneActiveIcon : microphoneIcon} />
						</button>
					)}
					{isStreaming ? (
						<button
							className="_stopButton"
							onClick={onStop}
							title="Stop generating"
							style={styleProperties?.sendButton ?? {}}
						>
							<i className={stopIcon} />
						</button>
					) : (
						<button
							className="_sendButton"
							onClick={handleSend}
							disabled={(!text.trim() && !attachments.length) || disabled}
							title="Send message"
							style={styleProperties?.sendButton ?? {}}
						>
							<SubHelperComponent
								definition={definition}
								subComponentName="sendButton"
							/>
							<i className={sendIcon} />
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
