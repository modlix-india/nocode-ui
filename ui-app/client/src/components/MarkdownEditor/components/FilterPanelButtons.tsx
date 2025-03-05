import React, { useRef, useState, useEffect } from 'react';

interface FilterPanelButtonsProps {
	onFormatClick: (command: string, value?: string | { url: string; text: string }) => void;
	isVisible: boolean;
	styleProperties: any;
	selectedText: string;
	isFloating?: boolean;
	position?: { x: number; y: number };
}

export function FilterPanelButtons({
	onFormatClick,
	isVisible,
	styleProperties,
	selectedText,
	isFloating,
	position,
}: Readonly<FilterPanelButtonsProps>) {
	const [showLinkDialog, setShowLinkDialog] = useState(false);
	const [linkText, setLinkText] = useState('');
	const [linkUrl, setLinkUrl] = useState('');
	const [showMoreDropdown, setShowMoreDropdown] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setShowMoreDropdown(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

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
				<button
					onClick={() => onFormatClick('bold')}
					className="_button"
					title="Bold ( ctrl/cmd + B )"
				>
					<strong>B</strong>
				</button>
				<button
					onClick={() => onFormatClick('italic')}
					className="_button"
					title="Italic ( ctrl/cmd + I )"
				>
					<em>I</em>
				</button>
			</div>

			<div className="_buttonSeperator" />

			<div className="_buttonGroup">
				<button
					onClick={() => onFormatClick('heading1')}
					className="_button"
					title="heading1"
				>
					<b>h1</b>
				</button>
				<button
					onClick={() => onFormatClick('heading2')}
					className="_button"
					title="heading2"
				>
					<b>h2</b>
				</button>
				<button
					onClick={() => onFormatClick('heading3')}
					className="_button"
					title="heading3"
				>
					<b>h3</b>
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
								onClick={() => onFormatClick('heading4')}
								className="_dropdownItem"
								title="heading4"
							>
								<b>h4</b> heading4
							</button>
							<button
								onClick={() => onFormatClick('heading5')}
								className="_dropdownItem"
								title="heading5"
							>
								<b>h5</b> heading5
							</button>
							<button
								onClick={() => onFormatClick('heading6')}
								className="_dropdownItem"
								title="heading6"
							>
								<b>h6</b> heading6
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
		// <div className="_filterToolbar" ref={dropdownRef}>
		<div
			className={`_filterToolbar ${isFloating ? '_floating' : ''}`}
			ref={dropdownRef}
			style={
				isFloating && position
					? {
							position: 'fixed',
							left: `${position.x}px`,
							top: `${position.y}px`,
							transform: 'translateY(-100%)',
							zIndex: 1000,
						}
					: undefined
			}
		>
			<div className="_buttonGroup">{mainButtons}</div>
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
		</div>
	);
}
