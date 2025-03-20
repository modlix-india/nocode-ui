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

	// State for dropdowns
	const [showAlignmentDropdown, setShowAlignmentDropdown] = useState(false);
	const [showHeadingDropdown, setShowHeadingDropdown] = useState(false);
	const [showListDropdown, setShowListDropdown] = useState(false);
	const [showMoreDropdown, setShowMoreDropdown] = useState(false);

	// Refs for dropdowns
	const alignmentDropdownRef = useRef<HTMLDivElement>(null);
	const headingDropdownRef = useRef<HTMLDivElement>(null);
	const listDropdownRef = useRef<HTMLDivElement>(null);
	const moreDropdownRef = useRef<HTMLDivElement>(null);

	// Close all dropdowns
	const closeAllDropdowns = () => {
		setShowAlignmentDropdown(false);
		setShowHeadingDropdown(false);
		setShowListDropdown(false);
		setShowMoreDropdown(false);
	};

	// Handle click outside to close dropdowns
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				alignmentDropdownRef.current &&
				!alignmentDropdownRef.current.contains(event.target as Node) &&
				!(event.target && String(event.target).includes('alignmnet'))
			) {
				setShowAlignmentDropdown(false);
			}

			if (
				headingDropdownRef.current &&
				!headingDropdownRef.current.contains(event.target as Node) &&
				!(event.target && String(event.target).includes('heading'))
			) {
				setShowHeadingDropdown(false);
			}

			if (
				listDropdownRef.current &&
				!listDropdownRef.current.contains(event.target as Node) &&
				!(event.target && String(event.target).includes('List'))
			) {
				setShowListDropdown(false);
			}

			if (
				moreDropdownRef.current &&
				!moreDropdownRef.current.contains(event.target as Node) &&
				!(event.target && String(event.target).includes('More'))
			) {
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

	// Toggle dropdown functions
	const toggleAlignmentDropdown = (e: React.MouseEvent) => {
		e.stopPropagation();
		setShowAlignmentDropdown(!showAlignmentDropdown);
		setShowHeadingDropdown(false);
		setShowListDropdown(false);
		setShowMoreDropdown(false);
	};

	const toggleHeadingDropdown = (e: React.MouseEvent) => {
		e.stopPropagation();
		setShowHeadingDropdown(!showHeadingDropdown);
		setShowAlignmentDropdown(false);
		setShowListDropdown(false);
		setShowMoreDropdown(false);
	};

	const toggleListDropdown = (e: React.MouseEvent) => {
		e.stopPropagation();
		setShowListDropdown(!showListDropdown);
		setShowAlignmentDropdown(false);
		setShowHeadingDropdown(false);
		setShowMoreDropdown(false);
	};

	const toggleMoreDropdown = (e: React.MouseEvent) => {
		e.stopPropagation();
		setShowMoreDropdown(!showMoreDropdown);
		setShowAlignmentDropdown(false);
		setShowHeadingDropdown(false);
		setShowListDropdown(false);
	};

	// Handle dropdown item click
	const handleDropdownItemClick = (command: string) => {
		onFormatClick(command);
		closeAllDropdowns();
	};

	const mainButtons = (
		<div className="_filterPanel" style={styleProperties.filterPanel ?? {}}>
			<div className="_formatButtonGroup">
				<button
					onClick={() => onFormatClick('bold')}
					className="_formatbutton"
					title="Bold ( ctrl/cmd + B )"
				>
					<svg
						width="14"
						height="17"
						viewBox="0 0 14 17"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
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
					<svg
						width="12"
						height="16"
						viewBox="0 0 12 16"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
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
					<svg
						width="16"
						height="16"
						viewBox="0 0 16 16"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
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
				{/* Alignment Dropdown */}
				<div className="_dropdownContainer">
					<button
						onClick={toggleAlignmentDropdown}
						className="_formatbutton"
						title="Alignment options"
					>
						<svg
							width="14"
							height="16"
							viewBox="0 0 14 16"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
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
								<svg
									width="10"
									height="12"
									viewBox="0 0 10 12"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
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
								<svg
									width="10"
									height="12"
									viewBox="0 0 10 12"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
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
								<svg
									width="10"
									height="12"
									viewBox="0 0 10 12"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
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
								<svg
									width="10"
									height="12"
									viewBox="0 0 10 12"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
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
								<svg
									width="13"
									height="14"
									viewBox="0 0 13 14"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
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
								<svg
									width="13"
									height="14"
									viewBox="0 0 13 14"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
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
						<svg
							width="18"
							height="16"
							viewBox="0 0 18 16"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
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
						<svg
							width="16"
							height="16"
							viewBox="0 0 16 16"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
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
						<div className="_dropdown" ref={listDropdownRef}>
							<button
								onClick={() => handleDropdownItemClick('bulletList')}
								className="_dropdownItem"
							>
								<svg
									width="16"
									height="16"
									viewBox="0 0 16 16"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
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
								<svg
									width="16"
									height="16"
									viewBox="0 0 16 16"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
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
								<svg
									width="16"
									height="16"
									viewBox="0 0 16 16"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
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
					<svg
						width="16"
						height="16"
						viewBox="0 0 16 16"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M6.66667 8.66667C7.05215 9.0799 7.52553 9.40959 8.05333 9.63358C8.58113 9.85758 9.15061 9.97148 9.72667 9.96718C10.3027 9.96288 10.8702 9.84047 11.3944 9.60865C11.9186 9.37684 12.3869 9.04009 12.7667 8.62L14.7667 6.5C15.5301 5.69498 15.9484 4.61198 15.9367 3.48834C15.925 2.36471 15.4842 1.29146 14.7037 0.503966C13.9233 -0.283526 12.8613 -0.729401 11.7502 -0.741397C10.6392 -0.753393 9.56836 -0.330891 8.77333 0.44L7.64667 1.56"
							stroke="black"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
						<path
							d="M9.33333 7.33333C8.94785 6.9201 8.47447 6.59041 7.94667 6.36642C7.41887 6.14242 6.84939 6.02852 6.27333 6.03282C5.69727 6.03712 5.12981 6.15953 4.60557 6.39135C4.08133 6.62316 3.61306 6.95991 3.23333 7.38L1.23333 9.5C0.469884 10.305 0.0516366 11.388 0.0633343 12.5117C0.0750321 13.6353 0.515839 14.7085 1.29626 15.496C2.07669 16.2835 3.13866 16.7294 4.24975 16.7414C5.36084 16.7534 6.43164 16.3309 7.22667 15.56L8.34667 14.44"
							stroke="black"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</button>

				<button
					onClick={() => onFormatClick('inlineCode')}
					className="_formatbutton"
					title="Inline Code"
				>
					<svg
						width="16"
						height="16"
						viewBox="0 0 16 16"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
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

			{/* More Options Dropdown */}
			<div className="_formatButtonGroup">
				<div className="_dropdownContainer">
					<button
						onClick={toggleMoreDropdown}
						className="_formatbutton"
						title="More options"
					>
						<svg
							width="16"
							height="16"
							viewBox="0 0 16 16"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
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
						<div className="_dropdown" ref={moreDropdownRef}>
							<button
								onClick={() => handleDropdownItemClick('highlight')}
								className="_dropdownItem"
							>
								<svg
									width="16"
									height="16"
									viewBox="0 0 16 16"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M2 12H14M4 2L8 10L12 2"
										stroke="#666"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
									<rect
										x="4"
										y="8"
										width="8"
										height="4"
										fill="#FFEB3B"
										fillOpacity="0.5"
									/>
								</svg>
								<span>Highlight</span>
							</button>
							<button
								onClick={() => handleDropdownItemClick('superscript')}
								className="_dropdownItem"
							>
								<svg
									width="16"
									height="16"
									viewBox="0 0 16 16"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M6 8L2 12M2 8L6 12M10 12V8L14 4M14 8H10"
										stroke="#666"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
								<span>Superscript</span>
							</button>
							<button
								onClick={() => handleDropdownItemClick('subscript')}
								className="_dropdownItem"
							>
								<svg
									width="16"
									height="16"
									viewBox="0 0 16 16"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M6 4L2 8M2 4L6 8M10 12V8L14 4M14 12H10"
										stroke="#666"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
								<span>Subscript</span>
							</button>
							<button
								onClick={() => handleDropdownItemClick('footnote')}
								className="_dropdownItem"
							>
								<svg
									width="16"
									height="16"
									viewBox="0 0 16 16"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M8 2V10M8 10L5 7M8 10L11 7M2 14H14"
										stroke="#666"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
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
					<div className="_linkDialogHeader">
						<h3>Add Link</h3>
						<button onClick={() => setShowLinkDialog(false)} className="_closeButton">
							<svg
								width="16"
								height="16"
								viewBox="0 0 16 16"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M12 4L4 12M4 4L12 12"
									stroke="black"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
						</button>
					</div>
					<div className="_linkDialogContent">
						<div className="_inputGroup">
							<label htmlFor="linkText">Text</label>
							<input
								type="text"
								id="linkText"
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
							className="_addButton"
							disabled={!linkText || !linkUrl}
						>
							Add
						</button>
					</div>
				</div>
			</div>
		);
	}

	const floatingPanelStyle =
		isFloating && position
			? {
					position: 'absolute' as const,
					top: `${position.y}px`,
					left: `${position.x}px`,
					zIndex: 1000,
				}
			: {};

	if (!isVisible) {
		return null;
	}

	return (
		<>
			<div style={floatingPanelStyle}>{mainButtons}</div>
			{linkDialog}
		</>
	);
}
