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
	isFloating,
	position,
	selectedText,
}: Readonly<FilterPanelButtonsProps>) {
	const [showLinkDialog, setShowLinkDialog] = useState(false);
	const [linkText, setLinkText] = useState('');
	const [linkUrl, setLinkUrl] = useState('');

	const [showAlignmentDropdown, setShowAlignmentDropdown] = useState(false);
	const [showHeadingDropdown, setShowHeadingDropdown] = useState(false);
	const [showListDropdown, setShowListDropdown] = useState(false);
	const [showMoreDropdown, setShowMoreDropdown] = useState(false);
	const [showFontStyleDropdown, setShowFontStyleDropdown] = useState(false);
	const [showFontSizeDropdown, setShowFontSizeDropdown] = useState(false);
	const [showColorDropdown, setShowColorDropdown] = useState(false);

	const alignmentDropdownRef = useRef<HTMLDivElement>(null);
	const headingDropdownRef = useRef<HTMLDivElement>(null);
	const listDropdownRef = useRef<HTMLDivElement>(null);
	const moreDropdownRef = useRef<HTMLDivElement>(null);
	const fontStyleDropdownRef = useRef<HTMLDivElement>(null);
	const fontSizeDropdownRef = useRef<HTMLDivElement>(null);
	const colorDropdownRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const dropdownConfig = [
			{
				ref: alignmentDropdownRef,
				setter: setShowAlignmentDropdown,
				identifier: 'alignmnet',
			},
			{
				ref: headingDropdownRef,
				setter: setShowHeadingDropdown,
				identifier: 'heading',
			},
			{
				ref: listDropdownRef,
				setter: setShowListDropdown,
				identifier: 'List',
			},
			{
				ref: moreDropdownRef,
				setter: setShowMoreDropdown,
				identifier: 'More',
			},
			{
				ref: fontStyleDropdownRef,
				setter: setShowFontStyleDropdown,
				identifier: 'FontStyle',
			},
			{
				ref: fontSizeDropdownRef,
				setter: setShowFontSizeDropdown,
				identifier: 'FontSize',
			},
			{
				ref: colorDropdownRef,
				setter: setShowColorDropdown,
				identifier: 'Color',
			},
		];

		const handleClickOutside = (event: MouseEvent) => {
			dropdownConfig.forEach(({ ref, setter, identifier }) => {
				if (
					ref.current &&
					!ref.current.contains(event.target as Node) &&
					!(event.target && String(event.target).includes(identifier))
				) {
					setter(false);
				}
			});
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

	type DropdownType =
		| 'alignment'
		| 'heading'
		| 'list'
		| 'more'
		| 'fontStyle'
		| 'fontSize'
		| 'color';

	const closeAllDropdowns = () => {
		setShowAlignmentDropdown(false);
		setShowHeadingDropdown(false);
		setShowListDropdown(false);
		setShowMoreDropdown(false);
		setShowFontStyleDropdown(false);
		setShowFontSizeDropdown(false);
		setShowColorDropdown(false);
	};

	const toggleDropdown = (dropdownType: DropdownType, e: React.MouseEvent) => {
		e.stopPropagation();

		const setterMap = {
			alignment: setShowAlignmentDropdown,
			heading: setShowHeadingDropdown,
			list: setShowListDropdown,
			more: setShowMoreDropdown,
			fontStyle: setShowFontStyleDropdown,
			fontSize: setShowFontSizeDropdown,
			color: setShowColorDropdown,
		};

		closeAllDropdowns();

		setterMap[dropdownType](prev => !prev);
	};

	const toggleAlignmentDropdown = (e: React.MouseEvent) => toggleDropdown('alignment', e);
	const toggleHeadingDropdown = (e: React.MouseEvent) => toggleDropdown('heading', e);
	const toggleListDropdown = (e: React.MouseEvent) => toggleDropdown('list', e);
	const toggleMoreDropdown = (e: React.MouseEvent) => toggleDropdown('more', e);
	const toggleFontStyleDropdown = (e: React.MouseEvent) => toggleDropdown('fontStyle', e);
	const toggleFontSizeDropdown = (e: React.MouseEvent) => toggleDropdown('fontSize', e);
	const toggleColorDropdown = (e: React.MouseEvent) => toggleDropdown('color', e);

	const handleDropdownItemClick = (command: string, value?: any) => {
		onFormatClick(command, value);
		closeAllDropdowns();
	};

	const fontStyles = [
		{ name: 'Arial', displayName: 'Arial' },
		{ name: 'Times New Roman', displayName: 'Times New Roman' },
		{ name: 'Courier New', displayName: 'Courier New' },
		{ name: 'Georgia', displayName: 'Georgia' },
		{ name: 'Verdana', displayName: 'Verdana' },
		{ name: 'Helvetica', displayName: 'Helvetica' },
		{ name: 'Tahoma', displayName: 'Tahoma' },
		{ name: 'Trebuchet MS', displayName: 'Trebuchet MS' },
		{ name: 'Garamond', displayName: 'Garamond' },
		{ name: 'Palatino', displayName: 'Palatino' },
	];

	const fontSizes = Array.from({ length: 29 }, (_, i) => i + 8).map(size => ({
		name: size.toString(),
		displayName: size.toString() + 'px',
	}));

	const handleColorChange = (type: 'fontColor' | 'backgroundColor', color: string) => {
		onFormatClick(type, color);
	};

	const mainButtons = (
		<div className="_filterPanel" style={styleProperties.filterPanel ?? {}}>
			<div className="_formatButtonGroup">
				<button
					onClick={() => onFormatClick('bold')}
					className="_formatbutton"
					title="Bold ( ctrl/cmd + B )"
				>
					<svg width="14" height="17" viewBox="0 0 14 17" fill="none">
						<path
							d="M7.71429 8.66667C8.59834 8.66667 9.44619 8.31548 10.0713 7.69036C10.6964 7.06523 11.0476 6.21739 11.0476 5.33333C11.0476 4.44928 10.6964 3.60143 10.0713 2.97631C9.44619 2.35119 8.59834 2 7.71429 2H2V8.66667M7.71429 8.66667H2M7.71429 8.66667H8.66667C9.55072 8.66667 10.3986 9.01786 11.0237 9.64298C11.6488 10.2681 12 11.1159 12 12C12 12.8841 11.6488 13.7319 11.0237 14.357C10.3986 14.9821 9.55072 15.3333 8.66667 15.3333H2V8.66667"
							stroke="black"
							strokeWidth="3"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</button>
				<button
					onClick={() => onFormatClick('italic')}
					className="_formatbutton"
					title="Italic ( ctrl/cmd + I )"
				>
					<svg width="12" height="16" viewBox="0 0 12 16" fill="none">
						<path
							d="M4.80952 1H10.5238M1 14.3333H6.71429M7.66667 1L3.85714 14.3333"
							stroke="black"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</button>
				<button
					onClick={() => onFormatClick('strikethrough')}
					className="_formatbutton"
					title="Strikethrough"
				>
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
						<path
							d="M7.36686 7.66667H9.01295C10.8312 7.66667 12.3051 9.15905 12.3051 11C12.3051 12.8409 10.8312 14.3333 9.01295 14.3333H7.36686C5.54864 14.3333 4.07468 12.8409 4.07468 11M12.3051 4.33333C12.3051 2.49238 10.8312 1 9.01295 1H7.36686C5.54864 1 4.07468 2.49238 4.07468 4.33333C4.07468 4.62108 4.11069 4.90032 4.1784 5.16667M1.52344 7.66667H14.8568"
							stroke="black"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</button>
			</div>

			<div className="_buttonSeperator" />

			<div className="_formatButtonGroup">
				<div className="_dropdownContainer">
					<button
						onClick={toggleFontStyleDropdown}
						className="_formatbutton"
						title="Font Style"
					>
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
							<path
								d="M2 14H14M8 2V11M8 2H5M8 2H11"
								stroke="black"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</button>
					{showFontStyleDropdown && (
						<div className="_dropdown _fontStyleDropdown" ref={fontStyleDropdownRef}>
							{fontStyles.map(style => (
								<button
									key={style.name}
									onClick={() =>
										handleDropdownItemClick(`fontStyle-${style.name}`)
									}
									className="_dropdownItem"
									style={{ fontFamily: style.name }}
								>
									{style.displayName}
								</button>
							))}
						</div>
					)}
				</div>

				<div className="_dropdownContainer">
					<button
						onClick={toggleFontSizeDropdown}
						className="_formatbutton"
						title="Font Size"
					>
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
							<path
								d="M3 14H13M8 2V12M8 2L5 5M8 2L11 5"
								stroke="black"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</button>
					{showFontSizeDropdown && (
						<div className="_dropdown _fontSizeDropdown" ref={fontSizeDropdownRef}>
							{fontSizes.map(size => (
								<button
									key={size.name}
									onClick={() => handleDropdownItemClick(`fontSize-${size.name}`)}
									className="_dropdownItem"
								>
									{size.displayName}
								</button>
							))}
						</div>
					)}
				</div>

				<div className="_dropdownContainer">
					<button
						onClick={toggleColorDropdown}
						className="_formatbutton"
						title="Text & Background Color"
					>
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
							<path
								d="M8 2L2 8L8 14L14 8L8 2Z"
								stroke="black"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
							<circle cx="8" cy="8" r="2" fill="black" />
						</svg>
					</button>
					{showColorDropdown && (
						<div className="_dropdown _colorDropdown" ref={colorDropdownRef}>
							<div className="_colorSection">
								<div className="_colorSectionTitle">Text Color</div>
								<div className="_colorGrid">
									<div className="_colorPickerContainer">
										<label htmlFor="fontColorPicker">Custom:</label>
										<input
											type="color"
											id="fontColorPicker"
											onChange={e =>
												handleColorChange('fontColor', e.target.value)
											}
											className="_colorPicker"
										/>
									</div>
								</div>
							</div>
							<div className="_colorSection">
								<div className="_colorSectionTitle">Background Color</div>
								<div className="_colorGrid">
									<div className="_colorPickerContainer">
										<label htmlFor="bgColorPicker">Custom:</label>
										<input
											type="color"
											id="bgColorPicker"
											onChange={e =>
												handleColorChange('backgroundColor', e.target.value)
											}
											className="_colorPicker"
										/>
									</div>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>

			<div className="_buttonSeperator" />

			<div className="_formatButtonGroup">
				<div className="_dropdownContainer">
					<button
						onClick={toggleAlignmentDropdown}
						className="_formatbutton"
						title="Alignment options"
					>
						<svg width="14" height="16" viewBox="0 0 14 16" fill="none">
							<path
								d="M13 1H1.8"
								stroke="black"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
							<path
								d="M13 5.66675H8.02222"
								stroke="black"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
							<path
								d="M13 10.3333H1.8"
								stroke="black"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
							<path
								d="M13 15H8.02222"
								stroke="black"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</button>
					{showAlignmentDropdown && (
						<div className="_dropdown" ref={alignmentDropdownRef}>
							<button
								onClick={() => handleDropdownItemClick('alignLeft')}
								className="_dropdownItem"
							>
								<svg width="10" height="12" viewBox="0 0 10 12" fill="none">
									<path
										d="M1 1H9"
										stroke="black"
										strokeOpacity="0.3"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
									<path
										d="M1 4.33374H4.55556"
										stroke="black"
										strokeOpacity="0.3"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
									<path
										d="M1 7.66626H9"
										stroke="black"
										strokeOpacity="0.3"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
									<path
										d="M1 11H4.55556"
										stroke="black"
										strokeOpacity="0.3"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>

								<span>Align text left</span>
							</button>
							<button
								onClick={() => handleDropdownItemClick('alignCenter')}
								className="_dropdownItem"
							>
								<svg width="10" height="12" viewBox="0 0 10 12" fill="none">
									<path
										d="M1 1H9"
										stroke="black"
										strokeOpacity="0.3"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
									<path
										d="M3 4.3335H6.55556"
										stroke="black"
										strokeOpacity="0.3"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
									<path
										d="M1 7.6665H9"
										stroke="black"
										strokeOpacity="0.3"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
									<path
										d="M3 11H6.55556"
										stroke="black"
										strokeOpacity="0.3"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>

								<span>Align text center</span>
							</button>
							<button
								onClick={() => handleDropdownItemClick('alignRight')}
								className="_dropdownItem"
							>
								<svg width="10" height="12" viewBox="0 0 10 12" fill="none">
									<path d="M1 1H9H1Z" fill="black" />
									<path
										d="M1 1H9"
										stroke="black"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
									<path d="M5 4.3335H8.55556H5Z" fill="black" />
									<path
										d="M5 4.3335H8.55556"
										stroke="black"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
									<path d="M1 7.6665H9H1Z" fill="black" />
									<path
										d="M1 7.6665H9"
										stroke="black"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
									<path d="M5 11H8.55556H5Z" fill="black" />
									<path
										d="M5 11H8.55556"
										stroke="black"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>

								<span>Align text right</span>
							</button>
							<button
								onClick={() => handleDropdownItemClick('alignJustify')}
								className="_dropdownItem"
							>
								<svg width="10" height="12" viewBox="0 0 10 12" fill="none">
									<path
										d="M1 1H9"
										stroke="black"
										strokeOpacity="0.3"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
									<path
										d="M1 4.33374H4.55556"
										stroke="black"
										strokeOpacity="0.3"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
									<path
										d="M1 7.66626H9"
										stroke="black"
										strokeOpacity="0.3"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
									<path
										d="M1 11H4.55556"
										stroke="black"
										strokeOpacity="0.3"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
								<span>Justify</span>
							</button>
							<button
								onClick={() => handleDropdownItemClick('indent')}
								className="_dropdownItem"
							>
								<svg width="13" height="14" viewBox="0 0 13 14" fill="none">
									<path
										d="M1 2H4.33333"
										stroke="black"
										strokeOpacity="0.3"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
									<path
										d="M2.33301 5.3335H4.33301"
										stroke="black"
										strokeOpacity="0.3"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
									<path
										d="M1 8.6665H4.33333"
										stroke="black"
										strokeOpacity="0.3"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
									<path
										d="M2.33301 12H4.33301"
										stroke="black"
										strokeOpacity="0.3"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
									<path
										d="M7 1V13"
										stroke="black"
										strokeOpacity="0.3"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
									<path
										d="M11.6663 4.6665L10.6382 5.49468C9.76807 6.19564 9.33301 6.54604 9.33301 6.99984C9.33301 7.45364 9.76807 7.80404 10.6382 8.50497L11.6663 9.33317"
										stroke="black"
										strokeOpacity="0.3"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>

								<span>Right text indent</span>
							</button>
							<button
								onClick={() => handleDropdownItemClick('unindent')}
								className="_dropdownItem"
							>
								<svg width="13" height="14" viewBox="0 0 13 14" fill="none">
									<path
										d="M11.666 2H8.33268"
										stroke="black"
										strokeOpacity="0.3"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
									<path
										d="M10.333 5.3335H8.33301"
										stroke="black"
										strokeOpacity="0.3"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
									<path
										d="M11.666 8.6665H8.33268"
										stroke="black"
										strokeOpacity="0.3"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
									<path
										d="M10.333 12H8.33301"
										stroke="black"
										strokeOpacity="0.3"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
									<path
										d="M5.66602 1V13"
										stroke="black"
										strokeOpacity="0.3"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
									<path
										d="M0.999674 4.6665L2.02781 5.49468C2.89794 6.19564 3.33301 6.54604 3.33301 6.99984C3.33301 7.45364 2.89794 7.80404 2.02781 8.50497L0.999674 9.33317"
										stroke="black"
										strokeOpacity="0.3"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>

								<span>Left text indent</span>
							</button>
						</div>
					)}
				</div>

				{/* Heading Dropdown */}
				<div className="_dropdownContainer">
					<button
						onClick={toggleHeadingDropdown}
						className="_formatbutton"
						title="Heading options"
					>
						<svg width="18" height="16" viewBox="0 0 18 16" fill="none">
							<path
								d="M1.33323 1L1.33301 12.7171M10.1209 1L10.1206 12.7171M1.33301 6.85858H10.1206M16.8338 14.67V5.88214L14.6368 8.07911"
								stroke="black"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</button>
					{showHeadingDropdown && (
						<div className="_dropdown" ref={headingDropdownRef}>
							<button
								onClick={() => handleDropdownItemClick('heading1')}
								className="_dropdownItem"
							>
								<span style={{ fontWeight: 'bold', fontSize: '18px' }}>H1</span>
								<span>Heading 1</span>
							</button>
							<button
								onClick={() => handleDropdownItemClick('heading2')}
								className="_dropdownItem"
							>
								<span style={{ fontWeight: 'bold', fontSize: '16px' }}>H2</span>
								<span>Heading 2</span>
							</button>
							<button
								onClick={() => handleDropdownItemClick('heading3')}
								className="_dropdownItem"
							>
								<span style={{ fontWeight: 'bold', fontSize: '14px' }}>H3</span>
								<span>Heading 3</span>
							</button>
							<button
								onClick={() => handleDropdownItemClick('heading4')}
								className="_dropdownItem"
							>
								<span style={{ fontWeight: 'bold', fontSize: '13px' }}>H4</span>
								<span>Heading 4</span>
							</button>
							<button
								onClick={() => handleDropdownItemClick('heading5')}
								className="_dropdownItem"
							>
								<span style={{ fontWeight: 'bold', fontSize: '12px' }}>H5</span>
								<span>Heading 5</span>
							</button>
							<button
								onClick={() => handleDropdownItemClick('heading6')}
								className="_dropdownItem"
							>
								<span style={{ fontWeight: 'bold', fontSize: '11px' }}>H6</span>
								<span>Heading 6</span>
							</button>
						</div>
					)}
				</div>

				<div className="_dropdownContainer">
					<button
						onClick={toggleListDropdown}
						className="_formatbutton"
						title="List options"
					>
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
							<path
								d="M5.33333 4H14M5.33333 8H14M5.33333 12H14M2 4V4.00667M2 8V8.00667M2 12V12.0067"
								stroke="black"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</button>
					{showListDropdown && (
						<div className="_dropdown _right" ref={listDropdownRef}>
							<button
								onClick={() => handleDropdownItemClick('bulletList')}
								className="_dropdownItem"
							>
								<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
									<path
										d="M6 4H14M6 8H14M6 12H14M3 4C3 4.55228 2.55228 5 2 5C1.44772 5 1 4.55228 1 4C1 3.44772 1.44772 3 2 3C2.55228 3 3 3.44772 3 4ZM3 8C3 8.55228 2.55228 9 2 9C1.44772 9 1 8.55228 1 8C1 7.44772 1.44772 7 2 7C2.55228 7 3 7.44772 3 8ZM3 12C3 12.5523 2.55228 13 2 13C1.44772 13 1 12.5523 1 12C1 11.4477 1.44772 11 2 11C2.55228 11 3 11.4477 3 12Z"
										stroke="#666"
										strokeWidth="1.5"
										strokeLinecap="round"
									/>
								</svg>
								<span>Bullet list</span>
							</button>
							<button
								onClick={() => handleDropdownItemClick('numberedList')}
								className="_dropdownItem"
							>
								<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
									<path
										d="M6 4H14M6 8H14M6 12H14M3 4H1.5V2.5L3 1.5M1.5 8H3V6.5H1.5V8ZM1.5 12H3C3 11 1.5 10.5 1.5 10C1.5 9.5 2 9 3 9"
										stroke="#666"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
								<span>Numbered list</span>
							</button>
							<button
								onClick={() => handleDropdownItemClick('taskList')}
								className="_dropdownItem"
							>
								<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
									<path
										d="M6 4H14M6 8H14M6 12H14M2 4C2 4.55228 1.55228 5 1 5C0.447715 5 0 4.55228 0 4C0 3.44772 0.447715 3 1 3C1.55228 3 2 3.44772 2 4ZM2 8C2 8.55228 1.55228 9 1 9C0.447715 9 0 8.55228 0 8C0 7.44772 0.447715 7 1 7C1.55228 7 2 7.44772 2 8ZM2 12C2 12.5523 1.55228 13 1 13C0.447715 13 0 12.5523 0 12C0 11.4477 0.447715 11 1 11C1.55228 11 2 11.4477 2 12Z"
										stroke="#666"
										strokeWidth="1.5"
									/>
									<rect
										x="1"
										y="3"
										width="2"
										height="2"
										rx="0.5"
										fill="white"
										stroke="#666"
										strokeWidth="1"
									/>
									<rect
										x="1"
										y="7"
										width="2"
										height="2"
										rx="0.5"
										fill="white"
										stroke="#666"
										strokeWidth="1"
									/>
									<rect
										x="1"
										y="11"
										width="2"
										height="2"
										rx="0.5"
										fill="white"
										stroke="#666"
										strokeWidth="1"
									/>
									<path
										d="M1.5 3.5L2.5 4.5M1.5 4.5L2.5 3.5"
										stroke="#666"
										strokeWidth="1"
										strokeLinecap="round"
									/>
									<path
										d="M1.5 7.5L2.5 8.5"
										stroke="#666"
										strokeWidth="1"
										strokeLinecap="round"
									/>
								</svg>
								<span>Task list</span>
							</button>
						</div>
					)}
				</div>

				<button
					onClick={() => setShowLinkDialog(true)}
					className="_formatbutton"
					title="Add Link"
				>
					<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
						<path
							d="M7.61982 8.90915L7.79225 8.73674C9.44116 7.08775 12.1147 7.08775 13.7636 8.73674C15.4126 10.3857 15.4126 13.0592 13.7636 14.7081L11.3751 17.0966C9.72616 18.7456 7.05265 18.7456 5.4037 17.0966C3.75476 15.4477 3.75476 12.7742 5.4037 11.1252L5.79066 10.7383"
							stroke="black"
							strokeWidth="1.5"
							stroke-linecap="round"
						/>
						<path
							d="M14.2097 9.2615L14.5966 8.87459C16.2456 7.22563 16.2456 4.55216 14.5966 2.90321C12.9477 1.25427 10.2742 1.25427 8.62525 2.90321L6.23671 5.29176C4.58776 6.9407 4.58776 9.61417 6.23671 11.2631C7.88566 12.9121 10.5592 12.9121 12.2081 11.2631L12.3805 11.0907"
							stroke="black"
							strokeWidth="1.5"
							stroke-linecap="round"
						/>
					</svg>
				</button>

				<button
					onClick={() => onFormatClick('inlineCode')}
					className="_formatbutton"
					title="Inline Code"
				>
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
						<path
							d="M10.6667 12L14.6667 8L10.6667 4M5.33333 4L1.33333 8L5.33333 12"
							stroke="black"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</button>
			</div>

			<div className="_buttonSeperator" />

			<div className="_formatButtonGroup">
				<div className="_dropdownContainer">
					<button
						onClick={toggleMoreDropdown}
						className="_formatbutton"
						title="More options"
					>
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
							<path
								d="M8 8.66667C8.36819 8.66667 8.66667 8.36819 8.66667 8C8.66667 7.63181 8.36819 7.33333 8 7.33333C7.63181 7.33333 7.33333 7.63181 7.33333 8C7.33333 8.36819 7.63181 8.66667 8 8.66667Z"
								stroke="black"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
							<path
								d="M8 4C8.36819 4 8.66667 3.70152 8.66667 3.33333C8.66667 2.96514 8.36819 2.66667 8 2.66667C7.63181 2.66667 7.33333 2.96514 7.33333 3.33333C7.33333 3.70152 7.63181 4 8 4Z"
								stroke="black"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
							<path
								d="M8 13.3333C8.36819 13.3333 8.66667 13.0349 8.66667 12.6667C8.66667 12.2985 8.36819 12 8 12C7.63181 12 7.33333 12.2985 7.33333 12.6667C7.33333 13.0349 7.63181 13.3333 8 13.3333Z"
								stroke="black"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</button>
					{showMoreDropdown && (
						<div className="_dropdown _right" ref={moreDropdownRef}>
							<button
								onClick={() => handleDropdownItemClick('highlight')}
								className="_dropdownItem"
							>
								<svg width="15" height="17" viewBox="0 0 15 17" fill="none">
									<path
										d="M7.8568 11.9098L2.88162 12.8337C1.92735 13.0109 1.45023 13.0995 1.17535 12.8247C0.900479 12.5497 0.989079 12.0726 1.16629 11.1183L2.09015 6.14287C2.2383 5.34508 2.31237 4.94617 2.57535 4.70513C2.83833 4.46411 3.31926 4.41707 4.28113 4.32299C5.20818 4.23231 6.08553 3.91451 7 3L11 7.00033C10.0855 7.91487 9.76753 8.7916 9.67673 9.71873C9.58253 10.6807 9.5354 11.1617 9.2944 11.4247C9.0534 11.6876 8.65453 11.7617 7.8568 11.9098Z"
										stroke="black"
										strokeWidth="1.2"
										stroke-linejoin="round"
									/>
									<path
										d="M6.33366 9.14066C5.96066 9.08013 5.61963 8.91786 5.35121 8.64946M5.35121 8.64946C5.08278 8.38106 4.92053 8.03999 4.85997 7.66699M5.35121 8.64946L1.66699 12.3337"
										stroke="black"
										strokeWidth="1.2"
										stroke-linecap="round"
									/>
									<path
										d="M7 3C7.47487 2.2994 8.11807 1.1208 9.071 1.00732C9.72147 0.92986 10.2604 1.46875 11.3381 2.54652L11.4535 2.66185C12.5313 3.73963 13.0701 4.27851 12.9927 4.929C12.8792 5.88193 11.7006 6.52513 11 7"
										stroke="black"
										strokeWidth="1.2"
										stroke-linejoin="round"
									/>
									<path
										d="M1 16H14"
										stroke="black"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
								</svg>

								<span>Highlight</span>
							</button>
							<button
								onClick={() => handleDropdownItemClick('superscript')}
								className="_dropdownItem"
							>
								<svg width="13" height="15" viewBox="0 0 13 15" fill="none">
									<path
										d="M9.03195 6.62793V5.85336L11.0404 3.83891C11.2325 3.64045 11.3926 3.46415 11.5206 3.31001C11.6487 3.15587 11.7448 3.00654 11.8088 2.86203C11.8728 2.71753 11.9048 2.56338 11.9048 2.39961C11.9048 2.21271 11.8634 2.05279 11.7805 1.91984C11.6977 1.78496 11.5837 1.68092 11.4387 1.6077C11.2937 1.53448 11.1289 1.49787 10.9444 1.49787C10.7542 1.49787 10.5875 1.53833 10.4444 1.61926C10.3012 1.69826 10.1901 1.81097 10.111 1.95741C10.0338 2.10385 9.99522 2.27822 9.99522 2.48053H8.99805C8.99805 2.10481 9.08185 1.77822 9.24946 1.50076C9.41707 1.22331 9.64776 1.00847 9.94155 0.856254C10.2372 0.704038 10.5762 0.62793 10.9585 0.62793C11.3464 0.62793 11.6873 0.702111 11.9811 0.850473C12.2749 0.998835 12.5028 1.20211 12.6647 1.4603C12.8286 1.71849 12.9105 2.01329 12.9105 2.34469C12.9105 2.56627 12.869 2.784 12.7862 2.99787C12.7033 3.21174 12.5574 3.44874 12.3483 3.70885C12.1412 3.96897 11.8502 4.284 11.4754 4.65394L10.4783 5.69151V5.73198H12.998V6.62793H9.03195Z"
										fill="black"
									/>
									<path
										d="M4.0257 8.2674L4.0433 8.2958H4.0767H4.15625H4.18965L4.20725 8.2674L6.65238 4.32185C6.75327 4.15905 6.93118 4.06 7.12271 4.06C7.558 4.06 7.82284 4.53941 7.5911 4.90789L4.98046 9.05897L4.96037 9.09091L4.98046 9.12285L7.5897 13.2717C7.82205 13.6412 7.55652 14.1218 7.12009 14.1218C6.92974 14.1218 6.75269 14.0242 6.65104 13.8633L4.20698 9.99353L4.18932 9.96557H4.15625H4.0767H4.04363L4.02598 9.99353L1.58009 13.8662C1.47958 14.0253 1.3045 14.1218 1.11628 14.1218C0.68197 14.1218 0.419892 13.6411 0.655179 13.276L3.33168 9.12341L3.35263 9.09091L3.33168 9.0584L0.653769 4.90358C0.419091 4.53947 0.680492 4.06 1.11368 4.06C1.30307 4.06 1.479 4.15795 1.57877 4.31893L4.0257 8.2674Z"
										fill="black"
										stroke="black"
										strokeWidth="0.12"
									/>
								</svg>

								<span>Superscript</span>
							</button>
							<button
								onClick={() => handleDropdownItemClick('subscript')}
								className="_dropdownItem"
							>
								<svg width="13" height="13" viewBox="0 0 13 13" fill="none">
									<path
										d="M9.03195 12.6279V11.8534L11.0404 9.83891C11.2325 9.64045 11.3926 9.46415 11.5206 9.31001C11.6487 9.15587 11.7448 9.00654 11.8088 8.86203C11.8728 8.71753 11.9048 8.56338 11.9048 8.39961C11.9048 8.21271 11.8634 8.05279 11.7805 7.91984C11.6977 7.78496 11.5837 7.68092 11.4387 7.6077C11.2937 7.53448 11.1289 7.49787 10.9444 7.49787C10.7542 7.49787 10.5875 7.53833 10.4444 7.61926C10.3012 7.69826 10.1901 7.81097 10.111 7.95741C10.0338 8.10385 9.99522 8.27822 9.99522 8.48053H8.99805C8.99805 8.10481 9.08185 7.77822 9.24946 7.50076C9.41707 7.22331 9.64776 7.00847 9.94155 6.85625C10.2372 6.70404 10.5762 6.62793 10.9585 6.62793C11.3464 6.62793 11.6873 6.70211 11.9811 6.85047C12.2749 6.99884 12.5028 7.20211 12.6647 7.4603C12.8286 7.71849 12.9105 8.01329 12.9105 8.34469C12.9105 8.56627 12.869 8.784 12.7862 8.99787C12.7033 9.21174 12.5574 9.44874 12.3483 9.70885C12.1412 9.96897 11.8502 10.284 11.4754 10.6539L10.4783 11.6915V11.732H12.998V12.6279H9.03195Z"
										fill="black"
									/>
									<path
										d="M4.0257 4.2674L4.0433 4.2958H4.0767H4.15625H4.18965L4.20725 4.2674L6.65238 0.321849C6.75327 0.159048 6.93118 0.06 7.12271 0.06C7.558 0.06 7.82284 0.539412 7.5911 0.907891L4.98046 5.05897L4.96037 5.09091L4.98046 5.12285L7.5897 9.27171C7.82205 9.64115 7.55652 10.1218 7.12009 10.1218C6.92974 10.1218 6.75269 10.0242 6.65104 9.86329L4.20698 5.99353L4.18932 5.96557H4.15625H4.0767H4.04363L4.02598 5.99353L1.58009 9.86618C1.47958 10.0253 1.3045 10.1218 1.11628 10.1218C0.68197 10.1218 0.419892 9.6411 0.655179 9.27605L3.33168 5.12341L3.35263 5.09091L3.33168 5.0584L0.653769 0.903582C0.419091 0.539474 0.680492 0.06 1.11368 0.06C1.30307 0.06 1.479 0.157945 1.57877 0.318933L4.0257 4.2674Z"
										fill="black"
										stroke="black"
										strokeWidth="0.12"
									/>
								</svg>

								<span>Subscript</span>
							</button>
							<button
								onClick={() => handleDropdownItemClick('footnote')}
								className="_dropdownItem"
							>
								<svg width="19" height="17" viewBox="0 0 19 17" fill="none">
									<path
										d="M17.684 1H6.21363C5.96658 1 5.77246 1.19411 5.77246 1.44117C5.77246 1.68822 5.96658 1.88234 6.21363 1.88234H17.684C17.9311 1.88234 18.1252 1.68822 18.1252 1.44117C18.1252 1.19411 17.9311 1 17.684 1Z"
										fill="black"
										stroke="black"
										strokeWidth="0.3"
									/>
									<path
										d="M6.21363 4.5298H15.9193C16.1664 4.5298 16.3605 4.33568 16.3605 4.08863C16.3605 3.84158 16.1664 3.64746 15.9193 3.64746H6.21363C5.96658 3.64746 5.77246 3.84158 5.77246 4.08863C5.77246 4.33568 5.96658 4.5298 6.21363 4.5298Z"
										fill="black"
										stroke="black"
										strokeWidth="0.3"
									/>
									<path
										d="M17.684 6.29395H6.21363C5.96658 6.29395 5.77246 6.48806 5.77246 6.73511C5.77246 6.98217 5.96658 7.17628 6.21363 7.17628H17.684C17.9311 7.17628 18.1252 6.98217 18.1252 6.73511C18.1252 6.48806 17.9311 6.29395 17.684 6.29395Z"
										fill="black"
										stroke="black"
										strokeWidth="0.3"
									/>
									<path
										d="M6.21363 9.82277H15.9193C16.1664 9.82277 16.3605 9.62865 16.3605 9.3816C16.3605 9.13454 16.1664 8.94043 15.9193 8.94043H6.21363C5.96658 8.94043 5.77246 9.13454 5.77246 9.3816C5.77246 9.62865 5.96658 9.82277 6.21363 9.82277Z"
										fill="black"
										stroke="black"
										strokeWidth="0.3"
									/>
									<path
										d="M17.684 11.5884H6.21363C5.96658 11.5884 5.77246 11.7825 5.77246 12.0295V15.5589C5.77246 15.8059 5.96658 16.0001 6.21363 16.0001H17.684C17.9311 16.0001 18.1252 15.8059 18.1252 15.5589V12.0295C18.1252 11.7825 17.9311 11.5884 17.684 11.5884ZM17.2428 15.1177H6.6548V12.4707H17.2428V15.1177Z"
										fill="black"
										stroke="black"
										strokeWidth="0.3"
									/>
									<path
										d="M1.117 15.876C1.20523 15.9642 1.32876 15.9995 1.43464 15.9995C1.54052 15.9995 1.66405 15.9642 1.75228 15.876L3.51695 14.1113C3.69342 13.9349 3.69342 13.6525 3.51695 13.4937L1.75228 11.729C1.57581 11.5526 1.29346 11.5526 1.13464 11.729C0.958176 11.9055 0.958176 12.1878 1.13464 12.3467L2.58168 13.7937L1.13464 15.2407C0.958176 15.4172 0.958176 15.6995 1.117 15.876Z"
										fill="black"
										stroke="black"
										strokeWidth="0.3"
									/>
								</svg>

								<span>Footnote</span>
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);

	let linkDialog = null;
	if (showLinkDialog) {
		linkDialog = (
			<div
				className="_popupBackground"
				onClick={e => {
					if ((e.target as HTMLElement).className === '_popupBackground') {
						setShowLinkDialog(false);
					}
				}}
			>
				<div className="_linkDialog">
					<span className="_linkDialogHeader">
						<h3>Add Link</h3>
						<button onClick={() => setShowLinkDialog(false)} className="_closeButton">
							<i className="fa fa-times" />
						</button>
					</span>
					<div className="_linkDialogContent">
						<div className="_inputGroup">
							<label htmlFor="linkText">Text</label>
							<input
								type="text"
								id="linkText"
								className="_linkInput"
								value={linkText}
								onChange={e => setLinkText(e.target.value)}
								placeholder="Link text"
							/>
						</div>
						<div className="_inputGroup">
							<label htmlFor="linkUrl">URL</label>
							<input
								type="text"
								id="linkUrl"
								className="_linkInput"
								value={linkUrl}
								onChange={e => setLinkUrl(e.target.value)}
								placeholder="https://example.com"
							/>
						</div>
					</div>
					<div className="_linkDialogFooter">
						<button onClick={() => setShowLinkDialog(false)} className="_cancelButton">
							Cancel
						</button>
						<button
							onClick={handleLinkAdd}
							className="_addLinkButton"
							disabled={!linkText || !linkUrl}
						>
							Add
						</button>
					</div>
				</div>
			</div>
		);
	}

	if (!isVisible) {
		return null;
	}

	return (
		<>
			{mainButtons}
			{linkDialog}
		</>
	);
}
