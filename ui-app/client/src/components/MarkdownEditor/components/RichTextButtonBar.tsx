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
	const [showFontFamily, setShowFontFamily] = useState(false);
	const [showFontSize, setShowFontSize] = useState(false);
	const [showHeadings, setShowHeadings] = useState(false);

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
					<button onClick={() => onCommand('superscript')} title="Superscript">
						<i className="fa-solid fa-superscript"></i>
					</button>
					<button onClick={() => onCommand('subscript')} title="Subscript">
						<i className="fa-solid fa-subscript"></i>
					</button>

					<button onClick={() => onCommand('strikethrough')} title="Strikethrough">
						<i className="fa-solid fa-strikethrough"></i>
					</button>
				</div>
				<div className="_buttonGroup">
					<div className="_dropdown">
						<button onClick={() => setShowHeadings(!showHeadings)} title="Headings">
							<i className="fa-solid fa-heading"></i>
						</button>
						{showHeadings && (
							<div className="_dropdownContent">
								{[1, 2, 3, 4, 5, 6].map(level => (
									<button
										key={`h${level}`}
										onClick={() => {
											onCommand(`h${level}`);
											setShowHeadings(false);
										}}
									>
										<span style={{ fontSize: `${1.4 - level * 0.1}em` }}>
											Heading {level}
										</span>
									</button>
								))}
							</div>
						)}
					</div>
				</div>
				<div className="_buttonGroup">
					<div className="_dropdown">
						<button
							onClick={() => setShowFontFamily(!showFontFamily)}
							title="Font Family"
						>
							<i className="fa-solid fa-font"></i>
						</button>
						{showFontFamily && (
							<div className="_dropdownContent">
								{[
									'Arial',
									'Times New Roman',
									'Courier New',
									'Georgia',
									'Verdana',
								].map(font => (
									<button
										key={font}
										onClick={() => {
											onCommand('fontFamily', font);
											setShowFontFamily(false);
										}}
									>
										<span style={{ fontFamily: font }}>{font}</span>
									</button>
								))}
							</div>
						)}
					</div>
					<div className="_dropdown">
						<button onClick={() => setShowFontSize(!showFontSize)} title="Font Size">
							<i className="fa-solid fa-text-height"></i>
						</button>
						{showFontSize && (
							<div className="_dropdownContent">
								{[
									'8px',
									'10px',
									'12px',
									'14px',
									'16px',
									'18px',
									'20px',
									'24px',
								].map(size => (
									<button
										key={size}
										onClick={() => {
											onCommand('fontSize', size);
											setShowFontSize(false);
										}}
									>
										<span style={{ fontSize: size }}>{size}</span>
									</button>
								))}
							</div>
						)}
					</div>
				</div>

				<div className="_buttonGroup">
					<button onClick={() => onCommand('align', 'left')} title="Align Left">
						<i className="fa-solid fa-align-left"></i>
					</button>
					<button onClick={() => onCommand('align', 'center')} title="Align Center">
						<i className="fa-solid fa-align-center"></i>
					</button>
					<button onClick={() => onCommand('align', 'right')} title="Align Right">
						<i className="fa-solid fa-align-right"></i>
					</button>
					<button onClick={() => onCommand('clearFormat')} title="Clear Formatting">
						<i className="fa-solid fa-remove-format"></i>
					</button>
				</div>

				<div className="_buttonGroup">
					<button onClick={() => onCommand('direction', 'rtl')} title="Right to Left">
						<i className="fa-solid fa-align-right"></i>
					</button>
					<button onClick={() => onCommand('direction', 'ltr')} title="Left to Right">
						<i className="fa-solid fa-align-left"></i>
					</button>
				</div>

				<div className="_buttonGroup">
					<button onClick={() => onCommand('indent', 'increase')} title="Increase Indent">
						<i className="fa-solid fa-indent"></i>
					</button>
					<button onClick={() => onCommand('indent', 'decrease')} title="Decrease Indent">
						<i className="fa-solid fa-outdent"></i>
					</button>
					<button onClick={() => onCommand('hr')} title="Horizontal Line">
						<i className="fa-solid fa-minus"></i>
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
