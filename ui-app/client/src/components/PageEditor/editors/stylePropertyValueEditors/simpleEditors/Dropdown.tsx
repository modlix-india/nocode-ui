import React, { CSSProperties, ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { SimpleEditorMultipleValueType } from '.';
import { isNullValue } from '@fincity/kirun-js';

export type DropdownOptions = Array<{ name: string; displayName: string; description?: string }>;

export function Dropdown({
	value,
	onChange,
	options: orignalOptions,
	placeholder,
	selectNoneLabel = '- None -',
	showNoneLabel = true,
	multipleValueType = SimpleEditorMultipleValueType.SpaceSeparated,
	multiSelect = false,
	children,
}: {
	value: string;
	onChange: (v: string | Array<string>) => void;
	options: DropdownOptions;
	placeholder?: string;
	selectNoneLabel?: string;
	showNoneLabel?: boolean;
	multipleValueType?: SimpleEditorMultipleValueType;
	multiSelect?: boolean;
	children?: ReactNode;
}) {
	const options = showNoneLabel
		? [{ name: '', displayName: selectNoneLabel }, ...orignalOptions]
		: orignalOptions;
	let label = undefined;

	const selection = useMemo(() => {
		if (!multiSelect) return new Set<string>([value]);
		if (!value) return new Set<string>();
		if (multipleValueType === SimpleEditorMultipleValueType.Array)
			return new Set<string>(value);
		return new Set<string>(value.split(multipleValueType.toString()));
	}, [value]);

	if (!isNullValue(value)) {
		label = (
			<span className="_selectedOption">
				{Array.from(selection)
					.map(s => options.find(e => e.name === s)?.displayName)
					.join(
						multipleValueType === SimpleEditorMultipleValueType.Array
							? ', '
							: multipleValueType.toString(),
					)}
			</span>
		);
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
		const options = ddBody.current.querySelectorAll('._simpleEditorDropdownOption');
		if (options[num]) options[num].scrollIntoView({ block: 'nearest' });
	};

	useEffect(() => {
		if (!open && currentOption != -1) setOriginalCurrentOption(-1);
	}, [open]);

	let body;
	if (open) {
		const dropdownBodyStyle: CSSProperties = {};
		if (dropDown.current) {
			const rect = dropDown.current.getBoundingClientRect();
			if (rect.top + 300 > document.body.clientHeight)
				dropdownBodyStyle.bottom = document.body.clientHeight - rect.top;
			else dropdownBodyStyle.top = rect.top + rect.height - 4;
			dropdownBodyStyle.right = document.body.clientWidth - rect.right;
			dropdownBodyStyle.minWidth = rect.width;
		}
		body = (
			<div className="_simpleEditorDropdownBody" ref={ddBody} style={dropdownBodyStyle}>
				{children}
				{React.Children.count(children) > 0 ? (
					<div className="_options_divider"></div>
				) : null}

				{options.map((o, i) => (
					<div
						key={o.name}
						className={`_simpleEditorDropdownOption ${
							i === currentOption ? '_hovered' : ''
						} ${selection.has(o.name) ? '_selected' : ''}`}
						onClick={() => {
							setOpen(false);
							setTimeout(() => dropDown.current?.blur(), 0);
							if (!multiSelect) {
								onChange(value === o.name ? '' : o.name);
								return;
							}

							let arr = Array.from(selection);
							if (selection.has(o.name)) arr.splice(arr.indexOf(o.name), 1);
							else arr.push(o.name);

							onChange(
								multipleValueType === SimpleEditorMultipleValueType.Array
									? arr
									: arr.join(multipleValueType.toString()),
							);
						}}
						onMouseOver={() => setCurrentOption(i)}
						title={o.description}
					>
						{o.displayName}
					</div>
				))}
			</div>
		);
	}

	return (
		<div
			tabIndex={0}
			ref={dropDown}
			className="_simpleEditorSelect"
			role="combobox"
			onClick={() => setOpen(true)}
			onFocus={() => setOpen(true)}
			onBlur={() => setOpen(false)}
			onMouseLeave={() => setOpen(false)}
			onKeyDown={e => {
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
					onChange(options[currentOption].name);
					setOpen(false);
				} else if (e.key === 'Escape') {
					e.preventDefault();
					e.stopPropagation();
					setOpen(false);
				}
			}}
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
	);
}
