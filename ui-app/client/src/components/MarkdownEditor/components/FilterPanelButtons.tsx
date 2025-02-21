import React, { useRef, useState, useEffect } from 'react';

interface FilterPanelButtonsProps {
	onFormatClick: (command: string, value?: string | { url: string; text: string }) => void;
	position: { x: number; y: number } | null;
	isVisible: boolean;
	onPositionChange: (position: { x: number; y: number }) => void;
	styleProperties: any;
	selectedText: string;
}

export function FilterPanelButtons({
	onFormatClick,
	position,
	isVisible,
	onPositionChange,
	styleProperties,
	selectedText,
}: Readonly<FilterPanelButtonsProps>) {
	const panelRef = useRef<any>(null);
	const [showLinkDialog, setShowLinkDialog] = useState(false);
	const [linkText, setLinkText] = useState('');
	const [linkUrl, setLinkUrl] = useState('');
	const [showHeadingDropdown, setShowHeadingDropdown] = useState(false);

	useEffect(() => {
		if (showLinkDialog && selectedText) {
			setLinkText(selectedText);
		}
	}, [showLinkDialog, selectedText]);

	const handleLinkAdd = () => {
		onFormatClick('link', { text: linkText, url: linkUrl });
		setShowLinkDialog(false);
		setLinkText('');
		setLinkUrl('');
	};

	return (
		<>
			<div
				className="_filterPanel"
				ref={panelRef}
				style={{
					...styleProperties.filterPanel,
					transform: position ? `translate(${position.x}px, ${position.y}px)` : 'none',
					display: isVisible ? 'flex' : 'none',
					position: 'fixed',
					top: 0,
					left: 0,
				}}
				onMouseDown={ev => {
					if (ev.buttons !== 1 || !panelRef.current || !position) return;
					const currentLocation = { x: ev.clientX, y: ev.clientY };
					let newX = position.x;
					let newY = position.y;

					const mouseMove = (ev: MouseEvent) => {
						if (ev.buttons !== 1) return;
						newX = position.x + ev.clientX - currentLocation.x;
						newY = position.y + ev.clientY - currentLocation.y;
						panelRef.current.style.transform = `translate(${newX}px, ${newY}px)`;
					};

					const mouseUp = () => {
						onPositionChange({ x: newX, y: newY });
						document.removeEventListener('mousemove', mouseMove);
						document.removeEventListener('mouseup', mouseUp);
					};

					document.addEventListener('mousemove', mouseMove);
					document.addEventListener('mouseup', mouseUp);
				}}
			>
				<div className="_buttonGroup">
					<button onClick={() => onFormatClick('bold')} className="_button" title="Bold">
						<strong>B</strong>
					</button>
					<button
						onClick={() => onFormatClick('italic')}
						className="_button"
						title="Italic"
					>
						<em>I</em>
					</button>
					<button
						onClick={() => onFormatClick('strikethrough')}
						className="_button"
						title="Strikethrough"
					>
						<s>S</s>
					</button>
				</div>

				<div className="_buttonSeperator" />

				<div className="_buttonGroup">
					<div className="_dropdownContainer">
						<button
							onClick={() => setShowHeadingDropdown(!showHeadingDropdown)}
							className="_button"
							title="Heading"
						>
							H
						</button>
						{showHeadingDropdown && (
							<div className="_dropdown">
								{[1, 2, 3, 4, 5, 6].map(level => (
									<button
										key={level}
										onClick={() => {
											onFormatClick(`heading${level}`);
											setShowHeadingDropdown(false);
										}}
										className="_dropdownItem"
									>
										H{level}
									</button>
								))}
							</div>
						)}
					</div>
					<button
						onClick={() => onFormatClick('alignLeft')}
						className="_button"
						title="Align Left"
					>
						⇤
					</button>
					<button
						onClick={() => onFormatClick('alignCenter')}
						className="_button"
						title="Center"
					>
						⇔
					</button>
					<button
						onClick={() => onFormatClick('alignRight')}
						className="_button"
						title="Align Right"
					>
						⇥
					</button>
					<button
						onClick={() => onFormatClick('alignJustify')}
						className="_button"
						title="Justify"
					>
						⇹
					</button>
				</div>

				<div className="_buttonSeperator" />

				<div className="_buttonGroup">
					<button
						onClick={() => onFormatClick('indent')}
						className="_button"
						title="Indent"
					>
						⇥
					</button>
					<button
						onClick={() => onFormatClick('unindent')}
						className="_button"
						title="Unindent"
					>
						⇤
					</button>
				</div>

				<div className="_buttonSeperator" />

				<div className="_buttonGroup">
					<button
						onClick={() => onFormatClick('inlineCode')}
						className="_button"
						title="Inline Code"
					>
						<code>{'<>'}</code>
					</button>
					<button
						onClick={() => onFormatClick('highlight')}
						className="_button"
						title="Highlight"
					>
						<span style={{ background: '#ff0' }}>H</span>
					</button>
					<button
						onClick={() => onFormatClick('superscript')}
						className="_button"
						title="Superscript"
					>
						x²
					</button>
					<button
						onClick={() => onFormatClick('subscript')}
						className="_button"
						title="Subscript"
					>
						x₂
					</button>
				</div>

				<div className="_buttonSeperator" />

				<div className="_buttonGroup">
					<button
						onClick={() => onFormatClick('footnote')}
						className="_button"
						title="Footnote"
					>
						†
					</button>
					<button
						onClick={() => setShowLinkDialog(true)}
						className="_button"
						title="Add Link"
					>
						🔗
					</button>
					<button
						onClick={() => onFormatClick('inlineImage')}
						className="_button"
						title="Inline Image"
					>
						🖼
					</button>
				</div>
			</div>
			{showLinkDialog && (
				<div
					className="_popupBackground"
					style={{ position: 'fixed', inset: 0 }}
					onClick={e => {
						if (e.target === e.currentTarget) setShowLinkDialog(false);
					}}
				>
					<div className="_linkDialog">
						<input
							type="text"
							placeholder="Link Text"
							value={linkText}
							onChange={e => setLinkText(e.target.value)}
							className="_linkInput"
						/>
						<input
							type="text"
							placeholder="URL"
							value={linkUrl}
							onChange={e => setLinkUrl(e.target.value)}
							className="_linkInput"
						/>
						<div className="_dialogButtons">
							<button onClick={handleLinkAdd} className="_button _addButton">
								Add Link
							</button>
							<button
								onClick={() => {
									setShowLinkDialog(false);
									setLinkText('');
									setLinkUrl('');
								}}
								className="_button _cancelButton"
							>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
