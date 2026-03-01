import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ComponentDefinition } from '../../../types/common';
import { SubHelperComponent } from '../../HelperComponents/SubHelperComponent';

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
	onTextChange?: (text: string) => void;
	sendIcon?: string;
	stopIcon?: string;
	addAttachmentIcon?: string;
	removeAttachmentIcon?: string;
	fileIcon?: string;
	enableVoiceInput?: boolean;
	microphoneIcon?: string;
	microphoneActiveIcon?: string;
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
	onTextChange,
	sendIcon = 'fa fa-arrow-up',
	stopIcon = 'fa fa-stop',
	addAttachmentIcon = 'fa fa-plus',
	removeAttachmentIcon = 'fa fa-xmark',
	fileIcon = 'fa fa-file',
	enableVoiceInput = true,
	microphoneIcon = 'fa fa-microphone',
	microphoneActiveIcon = 'fa fa-stop',
}: Readonly<InputBarProps>) {
	const [text, setText] = useState(initialText ?? '');
	const [attachments, setAttachments] = useState<Attachment[]>([]);
	const [isListening, setIsListening] = useState(false);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const recognitionRef = useRef<any>(null);

	// Sync internal text when initialText changes (e.g. session switch)
	useEffect(() => {
		setText(initialText ?? '');
	}, [initialText]);

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
		if (textareaRef.current) {
			textareaRef.current.style.height = 'auto';
		}
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

	const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const newText = e.target.value;
		setText(newText);
		onTextChange?.(newText);
		const ta = e.target;
		ta.style.height = 'auto';
		ta.style.height = Math.min(ta.scrollHeight, 200) + 'px';
	}, [onTextChange]);

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
		<div
			className="_promptInputBar"
			style={styleProperties?.inputBar ?? {}}
		>
			<SubHelperComponent
				definition={definition}
				subComponentName="inputBar"
			/>
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
					style={styleProperties?.inputTextArea ?? {}}
				/>
				<div className="_inputActions">
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
							disabled={
								(!text.trim() && !attachments.length) ||
								disabled
							}
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
