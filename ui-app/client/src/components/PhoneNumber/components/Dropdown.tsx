import React, { CSSProperties, useEffect, useRef, useState } from 'react';

export type DropdownOptions = Array<{
	D: string;
	N: string;
	C: string;
}>;

export function Dropdown({
	value,
	onChange,
	options,
	placeholder,
}: {
	value: string;
	onChange: (v: string) => void;
	options: DropdownOptions;
	placeholder?: string;
}) {
	let label = undefined;
	if (value.length > 0) {
		const x = options.find(e => e.D === value);
		label = <span className="_selectedOption">{getFlagEmoji(x!.C)}</span>;
	} else {
		label = <span className="_selectedOption _placeholder">{placeholder ?? ''}</span>;
	}

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
		if (!open && currentOption != -1) setOriginalCurrentOption(-1);
	}, [open]);

	const handleClick = (o: any) => {
		onChange(o.D);
		setOpen(false);
	};

	function getFlagEmoji(C: string) {
		const OFFSET = 127397;
		const codePoints = C.toUpperCase()
			.split('')
			.map(char => OFFSET + char.charCodeAt(0));
		return String.fromCodePoint(...codePoints);
	}

	let body;
	if (open) {
		const dropdownBodyStyle: CSSProperties = {};
		if (dropDown.current) {
			const rect = dropDown.current.getBoundingClientRect();
			if (rect.top + 300 > document.body.clientHeight)
				dropdownBodyStyle.bottom = document.body.clientHeight - rect.top;
			else dropdownBodyStyle.top = rect.top + rect.height;
			const parentRect = dropDown.current.parentElement?.getBoundingClientRect();
			dropdownBodyStyle.right = document.body.clientWidth - (parentRect?.right ?? 0);
			dropdownBodyStyle.minWidth = rect.width;
			dropdownBodyStyle.maxWidth = parentRect?.width ?? '100%';
		}
		body = (
			<div className="_dropdownBody" ref={ddBody} style={dropdownBodyStyle}>
				{options.map((o, i) => (
					<div
						key={o.C}
						className={`_dropdownOption ${i === currentOption ? '_hovered' : ''} ${
							value === o.D ? '_selected' : ''
						}`}
						onClick={e => {
							e.preventDefault();
							e.stopPropagation();
							handleClick(o);
						}}
						onMouseOver={() => setCurrentOption(i)}
					>
						<span>{getFlagEmoji(o.C) + ' ' + o.N + ' ' + o.D}</span>
					</div>
				))}
			</div>
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
			onChange(options[currentOption].D);
			setOpen(false);
		} else if (e.key === 'Escape') {
			e.preventDefault();
			e.stopPropagation();
			setOpen(false);
		}
	};

	return (
		<>
			<div
				tabIndex={0}
				className="_dropdownSelect"
				role="combobox"
				onClick={() => setOpen(true)}
				onFocus={() => setOpen(true)}
				onBlur={() => setOpen(false)}
				onMouseLeave={() => setOpen(false)}
				onKeyDown={e => handleKeyDown(e)}
				ref={dropDown}
			>
				{label}
				<svg
					width="8"
					height="4"
					viewBox="0 0 8 4"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M4.56629 3.80476C4.56548 3.80476 4.5647 3.80505 4.56408 3.80556C4.25163 4.06508 3.74506 4.06481 3.43301 3.80476L0.234347 1.13914C0.00444266 0.947547 -0.0630292 0.662241 0.0619187 0.412339C0.186867 0.162436 0.476746 5.68513e-09 0.80161 9.5591e-09L7.19894 8.58465e-08C7.52131 8.96907e-08 7.81369 0.162437 7.93863 0.412339C8.06358 0.662241 7.99361 0.947547 7.76621 1.13914L4.5685 3.80396C4.56788 3.80448 4.5671 3.80476 4.56629 3.80476Z"
						fill="#CCCCCC"
					/>
				</svg>
				{body}
			</div>
		</>
	);
}