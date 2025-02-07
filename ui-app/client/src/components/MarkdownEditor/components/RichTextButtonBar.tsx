import React, { useState } from 'react';
import { FileBrowser } from '../../../commonComponents/FileBrowser';

interface RichTextButtonBarProps {
	onCommand: (command: string, value?: string | { url: string; text: string }) => void;
	textAreaRef: HTMLTextAreaElement | null;
}

interface LinkPopupProps {
	onSubmit: (data: { url: string; text: string }) => void;
	onClose: () => void;
	initialText?: string;
}

function LinkPopup({ onSubmit, onClose, initialText }: LinkPopupProps) {
	const [url, setUrl] = useState('');
	const [text, setText] = useState(initialText || '');

	return (
		<div className="_popupBackground" onClick={e => e.target === e.currentTarget && onClose()}>
			<div className="_popupContainer">
				<h3>Insert Link</h3>
				<div style={{ marginBottom: '10px' }}>
					<label>Link Text:</label>
					<input
						type="text"
						value={text}
						onChange={e => setText(e.target.value)}
						style={{ width: '100%', padding: '5px' }}
					/>
				</div>
				<div style={{ marginBottom: '10px' }}>
					<label>URL:</label>
					<input
						type="text"
						value={url}
						onChange={e => setUrl(e.target.value)}
						style={{ width: '100%', padding: '5px' }}
					/>
				</div>
				<div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
					<button onClick={onClose}>Cancel</button>
					<button onClick={() => onSubmit({ url, text })}>Insert</button>
				</div>
			</div>
		</div>
	);
}

export function RichTextButtonBar({ onCommand, textAreaRef }: RichTextButtonBarProps) {
	const [showFileBrowser, setShowFileBrowser] = useState(false);
	const [showLinkPopup, setShowLinkPopup] = useState(false);
	const [selectedText, setSelectedText] = useState('');

	const [position, setPosition] = useState({ x: 0, y: 0 });
	const buttonBarRef = React.useRef<HTMLDivElement>(null);
	const [buttonBarTop, setButtonBarTop] = useState<number>();

	React.useEffect(() => {
		if (!textAreaRef) return;
		setButtonBarTop(x => {
			if (x) return x;
			let tp = textAreaRef.getBoundingClientRect().top;
			if (tp + 100 > window.innerHeight) tp -= 100;
			return tp;
		});
	}, [textAreaRef?.getBoundingClientRect().top]);

	return (
		<>
			<div
				className="_richTextButtonBar"
				ref={buttonBarRef}
				style={{
					position: 'fixed',
					transform: `translate(${position.x}px, ${position.y}px)`,
					top: `${buttonBarTop}px`,
					cursor: 'move',
					zIndex: 4,
				}}
				onMouseDown={ev => {
					if (ev.buttons !== 1 || !buttonBarRef.current) return;
					const startX = ev.clientX - position.x;
					const startY = ev.clientY - position.y;

					const handleMouseMove = (moveEv: MouseEvent) => {
						setPosition({
							x: moveEv.clientX - startX,
							y: moveEv.clientY - startY,
						});
					};

					const handleMouseUp = () => {
						document.removeEventListener('mousemove', handleMouseMove);
						document.removeEventListener('mouseup', handleMouseUp);
					};

					document.addEventListener('mousemove', handleMouseMove);
					document.addEventListener('mouseup', handleMouseUp);
				}}
			>
				<div className="_buttonGroup">
					<button onClick={() => onCommand('bold')} title="Bold">
						<i className="fa-solid fa-bold"></i>
					</button>
					<button onClick={() => onCommand('italic')} title="Italic">
						<i className="fa-solid fa-italic"></i>
					</button>
					<button onClick={() => onCommand('underline')} title="Underline">
						<i className="fa-solid fa-underline"></i>
					</button>
					<button onClick={() => onCommand('color')} title="Text Color">
						<i className="fa-solid fa-palette"></i>
					</button>
					<button onClick={() => onCommand('highlight')} title="Highlight">
						<i className="fa-solid fa-highlighter"></i>
					</button>
				</div>
				<div className="_buttonGroup">
					<button
						onClick={() => onCommand('h1')}
						title="Heading 1"
						className="_headingBtn"
					>
						<span style={{ fontSize: '1.2em' }}>H1</span>
					</button>
					<button
						onClick={() => onCommand('h2')}
						title="Heading 2"
						className="_headingBtn"
					>
						<span style={{ fontSize: '1.1em' }}>H2</span>
					</button>
					<button
						onClick={() => onCommand('h3')}
						title="Heading 3"
						className="_headingBtn"
					>
						<span style={{ fontSize: '1em' }}>H3</span>
					</button>
				</div>
				<div className="_buttonGroup">
					<button onClick={() => onCommand('ul')} title="Unordered List">
						<i className="fa-solid fa-list-ul"></i>
					</button>
					<button onClick={() => onCommand('ol')} title="Ordered List">
						<i className="fa-solid fa-list-ol"></i>
					</button>
					<button onClick={() => onCommand('quote')} title="Quote">
						<i className="fa-solid fa-quote-right"></i>
					</button>
				</div>
				<div className="_buttonGroup">
					<button
						onClick={() => {
							if (textAreaRef) {
								setSelectedText(
									textAreaRef.value.substring(
										textAreaRef.selectionStart,
										textAreaRef.selectionEnd,
									),
								);
								setShowLinkPopup(true);
							}
						}}
						title="Insert Link"
					>
						<i className="fa-solid fa-link"></i>
					</button>
					<button onClick={() => setShowFileBrowser(true)} title="Insert Image">
						<i className="fa-solid fa-image"></i>
					</button>
					<button onClick={() => onCommand('code')} title="Code Block">
						<i className="fa-solid fa-code"></i>
					</button>
				</div>
			</div>
			{showFileBrowser && (
				<div
					className="_popupBackground"
					onClick={e => e.target === e.currentTarget && setShowFileBrowser(false)}
				>
					<div className="_popupContainer">
						<FileBrowser
							selectedFile=""
							onChange={file => {
								onCommand('image', file);
								setShowFileBrowser(false);
							}}
							editOnUpload={false}
						/>
					</div>
				</div>
			)}
			{showLinkPopup && (
				<LinkPopup
					initialText={selectedText}
					onSubmit={data => {
						onCommand('link', data);
						setShowLinkPopup(false);
					}}
					onClose={() => setShowLinkPopup(false)}
				/>
			)}
		</>
	);
}
