import React, { useMemo } from 'react';
import { SimpleEditorMultipleValueType } from '.';

interface IconOption {
	name: string;
	icon: React.ReactNode;
	description?: string;
	width?: string;
	height?: string;
	viewBox?: string;
	transform?: string;
}
export type IconOptions = Array<IconOption>;

//When combination options are provided, the editor will resort to the name of the icon to be
// selected when the combination condition is met.
// Works only when multiSelect is true.
// For Example :
// combinationOptions: [
// 	{ condition: ['TOP', 'BOTTOM', 'LEFT', 'RIGHT'], name: 'ALL' },
// ]

export function IconsSimpleEditor({
	options,
	selected,
	onChange,
	withBackground = false,
	multipleValueType = SimpleEditorMultipleValueType.SpaceSeparated,
	multiSelect = false,
	multiSelectWithControl = false,
	exclusiveOptions,
	combinationOptions,
}: Readonly<{
	options: IconOptions;
	selected: string | Array<string>;
	onChange: (v: string | Array<string>) => void;
	withBackground?: boolean;
	multipleValueType?: SimpleEditorMultipleValueType;
	multiSelect?: boolean;
	multiSelectWithControl?: boolean;
	exclusiveOptions?: string[];
	combinationOptions?: { condition: Array<string>; name: string | Array<string> }[];
}>) {
	const selection = useMemo(() => {
		if (!multiSelect && typeof selected === 'string') return new Set<string>([selected]);
		if (!selected) return new Set<string>();
		if (
			multipleValueType === SimpleEditorMultipleValueType.Array &&
			typeof selected === 'string'
		)
			return new Set<string>(selected.split(multipleValueType.toString()));
		return new Set<string>(selected);
	}, [selected]);

	const handleSelection = (ev: React.MouseEvent<HTMLButtonElement>, option: IconOption) => {
		if (!multiSelect) {
			onChange(selected === option.name ? '' : option.name);
			return;
		}
		let arr = Array.from(selection);

		if (multiSelectWithControl && !ev.ctrlKey && !ev.metaKey) {
			arr = [option.name];
		} else {
			if (selection.has(option.name)) arr.splice(arr.indexOf(option.name), 1);
			else arr.push(option.name);
		}

		if (exclusiveOptions?.length && arr.length) {
			const optionName = exclusiveOptions.find(e => arr.includes(e));
			if (optionName) arr = [optionName];
		}

		if (combinationOptions?.length && arr.length) {
			const optionName = combinationOptions.find(e =>
				e.condition.every(c => arr.includes(c)),
			);
			if (optionName)
				arr = Array.isArray(optionName.name) ? optionName.name : [optionName.name];
		}

		onChange(
			multipleValueType === SimpleEditorMultipleValueType.Array
				? arr
				: arr.join(multipleValueType.toString()),
		);
	};

	return (
		<div className={`_simpleEditorIcons ${withBackground ? '_bground' : ''}`}>
			{options.map((e, i) => {
				const activeClass = selection.has(e.name) ? '_active' : '';
				return (
					<button
						key={e.name}
						className={`_eachIcon ${activeClass}`}
						onClick={ev => handleSelection(ev, e)}
						title={e.description}
					>
						<svg
							width={e.width ?? '32'}
							height={e.height ?? '32'}
							viewBox={
								e.viewBox ? e.viewBox : `0 0 ${e.width ?? '32'} ${e.height ?? '32'}`
							}
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
							className={activeClass}
							transform={e.transform}
						>
							{e.icon}
						</svg>
					</button>
				);
			})}
		</div>
	);
}
