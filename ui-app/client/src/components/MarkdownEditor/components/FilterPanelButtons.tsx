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
	const [showMoreDropdown, setShowMoreDropdown] = useState(false);
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

	const mainButtons = (
		<>
			<div className="_buttonGroup">
				<button onClick={() => onFormatClick('bold')} className="_button" title="Bold">
					<strong>B</strong>
				</button>
				<button onClick={() => onFormatClick('italic')} className="_button" title="Italic">
					<em>I</em>
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
				<button
					onClick={() => setShowLinkDialog(true)}
					className="_button"
					title="Add Link"
				>
					🔗
				</button>
			</div>

			<div className="_buttonSeperator" />

			<div className="_buttonGroup">
				<div className="_dropdownContainer">
					<button
						onClick={() => setShowMoreDropdown(!showMoreDropdown)}
						className="_button"
						title="More Options"
					>
						•••
					</button>
					{showMoreDropdown && (
						<div className="_dropdown">
							<button
								onClick={() => onFormatClick('superscript')}
								className="_dropdownItem"
							>
								x² Superscript
							</button>
							<button
								onClick={() => onFormatClick('subscript')}
								className="_dropdownItem"
							>
								x₂ Subscript
							</button>
							<button
								onClick={() => onFormatClick('footnote')}
								className="_dropdownItem"
							>
								† Footnote
							</button>
							<button
								onClick={() => onFormatClick('highlight')}
								className="_dropdownItem"
							>
								<span style={{ background: '#ff0' }}>Highlight</span>
							</button>
							<button
								onClick={() => onFormatClick('alignLeft')}
								className="_dropdownItem"
							>
								⇤ Align Left
							</button>
							<button
								onClick={() => onFormatClick('alignCenter')}
								className="_dropdownItem"
							>
								⇔ Center
							</button>
							<button
								onClick={() => onFormatClick('alignRight')}
								className="_dropdownItem"
							>
								⇥ Align Right
							</button>
							<button
								onClick={() => onFormatClick('alignJustify')}
								className="_dropdownItem"
							>
								⇹ Justify
							</button>
							<button
								onClick={() => onFormatClick('indent')}
								className="_dropdownItem"
							>
								⇥ Indent
							</button>
							<button
								onClick={() => onFormatClick('unindent')}
								className="_dropdownItem"
							>
								⇤ Unindent
							</button>
						</div>
					)}
				</div>
			</div>
		</>
	);

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
				{mainButtons}
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
