import React, { CSSProperties, useEffect, useRef, useState } from 'react';
import { ComponentDefinition } from '../../../types/common';
import { SubHelperComponent } from '../../HelperComponents/SubHelperComponent';

function getFlagEmoji(C: string) {
	const OFFSET = 127397;
	const codePoints = C.toUpperCase()
		.split('')
		.map(char => OFFSET + char.charCodeAt(0));
	return String.fromCodePoint(...codePoints);
}

export interface DropdownOption {
	nextSeperator?: boolean;
	A?: Array<number>;
	F: Array<number>;
	D: string;
	N: string;
	C: string;
}
export type DropdownOptions = Array<DropdownOption>;
export function Dropdown({
	value,
	onChange,
	options,
	readOnly,
	isSearchable,
	searchLabel,
	clearSearchTextOnClose,
	computedStyles,
	definition,
	handleFocusOnDropdownOpen,
	handleBlurOnDropdownClose,
	showDialCode,
}: {
	value: DropdownOption;
	onChange: (v: DropdownOption) => void;
	options: DropdownOptions;
	readOnly: boolean;
	isSearchable?: boolean;
	searchLabel?: string;
	clearSearchTextOnClose?: boolean;
	computedStyles: any;
	definition: ComponentDefinition;
	handleFocusOnDropdownOpen: () => void;
	handleBlurOnDropdownClose: () => void;
	showDialCode: boolean;
}) {
	let label = undefined;
	if (value) {
		label = (
			<div style={computedStyles.selectedOption ?? {}} className="_selectedOption">
				<SubHelperComponent definition={definition} subComponentName="selectedOption" />
				<span className={`_flag ${value!.C.toLowerCase()}`}></span>
				{/* <span>{getFlagEmoji(value!.C)}</span> */}
				{showDialCode && <span>{value.D}</span>}
			</div>
		);
	}
	const [searchOptions, setSearchOptions] = useState<DropdownOptions>();
	const [searchText, setSearchText] = useState('');

	const [open, setOpen] = useState(false);
	const [currentOption, setOriginalCurrentOption] = useState(-1);

	const dropDown = useRef<HTMLDivElement>(null);
	const ddBody = useRef<HTMLDivElement>(null);

	const setCurrentOption = (num: number) => {
		setOriginalCurrentOption(num);
		if (!ddBody.current) return;
		const options = ddBody.current.querySelectorAll('._dropdownOption');
		if (options[num]) options[num].scrollIntoView({ block: 'nearest' });
	};

	useEffect(() => {
		let searchExpression: string | RegExp;
		try {
			searchExpression = new RegExp(searchText, 'i');
		} catch (error) {
			searchExpression = '';
		}
		setSearchOptions(options.filter(e => (e.N + e.D + '').search(searchExpression) !== -1));
	}, [searchText, options]);

	const handleClose = () => {
		clearSearchTextOnClose && setSearchText('');
		setOpen(false);
		handleBlurOnDropdownClose();
	};

	const handleClick = (o: any) => {
		onChange(o);
		setTimeout(() => {
			if (dropDown.current?.nextSibling instanceof HTMLElement)
				dropDown.current.nextSibling.focus();
		}, 100);
		handleClose();
	};

	useEffect(() => {
		if (!open) return;
		document.addEventListener('mousedown', handleClose);
		return () => window.removeEventListener('mousedown', handleClose);
	}, [open, searchText, handleClose]);

	let body;

	if (open) {
		const dropdownBodyStyle: CSSProperties = computedStyles.dropdownBody ?? {};
		if (dropDown.current) {
			const rect = dropDown.current.getBoundingClientRect();
			const parentRect = dropDown.current.parentElement?.getBoundingClientRect();
			if (parentRect) {
				if (rect.top + 300 > document.body.clientHeight)
					dropdownBodyStyle.bottom = parentRect.height;
				else dropdownBodyStyle.top = rect.height;
				dropdownBodyStyle.left = parentRect.left - rect.left;
				dropdownBodyStyle.minWidth = parentRect?.width;
				dropdownBodyStyle.maxWidth = parentRect?.width ?? '100%';
			}
		}
		body = (
			<>
				<div
					className="_dropdownBody"
					ref={ddBody}
					style={dropdownBodyStyle}
					onMouseDown={e => e.stopPropagation()}
				>
					<SubHelperComponent definition={definition} subComponentName="dropdownBody" />
					{isSearchable && (
						<div
							className="_searchBoxContainer"
							style={computedStyles.searchBoxContainer}
						>
							<SubHelperComponent
								definition={definition}
								subComponentName="searchBoxContainer"
							/>
							<svg
								className="_searchIcon"
								style={computedStyles.searchIcon}
								width="16"
								height="16"
								viewBox="0 0 16 16"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M13.0006 6.49905C13.0006 7.93321 12.535 9.25802 11.7506 10.3329L15.707 14.2917C16.0977 14.6822 16.0977 15.3165 15.707 15.7071C15.3164 16.0976 14.682 16.0976 14.2913 15.7071L10.3349 11.7483C9.25983 12.5357 7.93476 12.9981 6.50032 12.9981C2.90952 12.9981 0 10.0891 0 6.49905C0 2.90895 2.90952 0 6.50032 0C10.0911 0 13.0006 2.90895 13.0006 6.49905ZM6.50032 10.9984C7.09129 10.9984 7.67649 10.882 8.22248 10.6559C8.76847 10.4298 9.26457 10.0984 9.68245 9.68056C10.1003 9.26276 10.4318 8.76676 10.658 8.22087C10.8841 7.67499 11.0005 7.08991 11.0005 6.49905C11.0005 5.90819 10.8841 5.32311 10.658 4.77722C10.4318 4.23134 10.1003 3.73534 9.68245 3.31753C9.26457 2.89973 8.76847 2.56831 8.22248 2.3422C7.67649 2.11609 7.09129 1.99971 6.50032 1.99971C5.90934 1.99971 5.32415 2.11609 4.77816 2.3422C4.23217 2.56831 3.73607 2.89973 3.31818 3.31753C2.9003 3.73534 2.56881 4.23134 2.34266 4.77722C2.1165 5.32311 2.0001 5.90819 2.0001 6.49905C2.0001 7.08991 2.1165 7.67499 2.34266 8.22087C2.56881 8.76676 2.9003 9.26276 3.31818 9.68056C3.73607 10.0984 4.23217 10.4298 4.77816 10.6559C5.32415 10.882 5.90934 10.9984 6.50032 10.9984Z"
									fill="currentColor"
									fillOpacity="1"
								/>
								<SubHelperComponent
									definition={definition}
									subComponentName="searchIcon"
								/>
							</svg>
							<input
								style={computedStyles.searchBox}
								className="_searchBox"
								value={searchText}
								placeholder={searchLabel}
								onChange={e => setSearchText(e.target.value)}
							/>
						</div>
					)}
					<div
						style={computedStyles.dropdownOptionList ?? {}}
						className="_dropdownOptionList"
					>
						<SubHelperComponent
							definition={definition}
							subComponentName="dropdownOptionList"
						/>
						{(searchOptions?.length || searchText ? searchOptions : options)?.map(
							(o, i) => (
								<div
									style={computedStyles.dropdownOption ?? {}}
									key={o.D + '_' + o.C}
									className={`_dropdownOption ${
										i === currentOption ? '_hovered' : ''
									} ${value.C === o.C ? '_selected' : ''} ${
										o.nextSeperator ? '_nextSeperator' : ''
									}`}
									onClick={e => {
										e.stopPropagation();
										handleClick(o);
									}}
									onMouseOver={() => setCurrentOption(i)}
								>
									<SubHelperComponent
										definition={definition}
										subComponentName="dropdownOption"
									/>
									<span className={`_flag ${o.C.toLowerCase()}`}></span>
									{/* <span>{getFlagEmoji(o.C) + ' '}</span> */}
									<span>{`${o.N} (${o.D})`}</span>
								</div>
							),
						)}
					</div>
				</div>
			</>
		);
	}
	const handleKeyDown = (e: any) => {
		if (e.key === 'ArrowUp') {
			e.preventDefault();
			e.stopPropagation();
			setCurrentOption((options.length + currentOption - 1) % options.length);
			if (!open) setOpen(true);
		} else if (e.key === 'ArrowDown') {
			e.preventDefault();
			e.stopPropagation();
			setCurrentOption((currentOption + 1) % options.length);
			if (!open) setOpen(true);
		} else if (e.key === 'Enter') {
			e.preventDefault();
			e.stopPropagation();
			handleClick(options[currentOption]);
		} else if (e.key === 'Escape') {
			e.preventDefault();
			e.stopPropagation();
			handleClose();
		}
	};

	let style = computedStyles.arrowIcon;
	if (!style) style = {};

	if (open && !readOnly) style = { ...style, transform: 'rotate(180deg)' };

	return (
		<div
			style={computedStyles.dropdownSelect ?? {}}
			tabIndex={0}
			className="_dropdownSelect"
			role="combobox"
			onClick={() => {
				setOpen(true);
				handleFocusOnDropdownOpen();
			}}
			onKeyDown={e => handleKeyDown(e)}
			ref={dropDown}
		>
			<SubHelperComponent definition={definition} subComponentName="dropdownSelect" />
			{label}

			<svg
				style={style}
				className="_arrowIcon"
				width="8"
				height="4"
				viewBox="0 0 8 4"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M4.56629 3.80476C4.56548 3.80476 4.5647 3.80505 4.56408 3.80556C4.25163 4.06508 3.74506 4.06481 3.43301 3.80476L0.234347 1.13914C0.00444266 0.947547 -0.0630292 0.662241 0.0619187 0.412339C0.186867 0.162436 0.476746 5.68513e-09 0.80161 9.5591e-09L7.19894 8.58465e-08C7.52131 8.96907e-08 7.81369 0.162437 7.93863 0.412339C8.06358 0.662241 7.99361 0.947547 7.76621 1.13914L4.5685 3.80396C4.56788 3.80448 4.5671 3.80476 4.56629 3.80476Z"
					fill="currentColor"
				/>
				<SubHelperComponent definition={definition} subComponentName="arrowIcon" />
			</svg>

			{!readOnly && body}
		</div>
	);
}
