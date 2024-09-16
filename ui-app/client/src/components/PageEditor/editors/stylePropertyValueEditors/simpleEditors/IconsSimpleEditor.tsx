import React, { useMemo } from 'react';
import { SimpleEditorMultipleValueType } from '.';

export type IconOptions = Array<{
	name: string;
	icon: React.ReactNode;
	description?: string;
	width?: string;
	height?: string;
	viewBox?: string;
	transform?: string;
}>;

export function IconsSimpleEditor({
	options,
	selected,
	onChange,
	withBackground = false,
	multipleValueType = SimpleEditorMultipleValueType.SpaceSeparated,
	multiSelect = false,
	multiSelectWithControl = false,
}: {
	options: IconOptions;
	selected: string | Array<string>;
	onChange: (v: string | Array<string>) => void;
	withBackground?: boolean;
	multipleValueType?: SimpleEditorMultipleValueType;
	multiSelect?: boolean;
	multiSelectWithControl?: boolean;
}) {
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

	const handleSelection = (clickedOption: string, ctrlKey: boolean, metaKey: boolean) => {
		if (!multiSelect) {
			onChange(selected === clickedOption ? '' : clickedOption);
			return;
		}

		let newSelection: string[];

		if (multiSelectWithControl && !ctrlKey && !metaKey) {
			newSelection = [clickedOption];
		} else {
			const currentSelection = Array.from(selection);
			const allOptionIndex = options.findIndex(opt => opt.name === 'ALL');
			const isAllOption = clickedOption === 'ALL';

			if (isAllOption) {
				newSelection = currentSelection.includes('ALL') ? [] : ['ALL'];
			} else {
				if (currentSelection.includes(clickedOption)) {
					newSelection = currentSelection.filter(item => item !== clickedOption);
				} else {
					newSelection = [...currentSelection, clickedOption];
				}

				if (
					newSelection.length === options.length - 1 &&
					!newSelection.includes('ALL') &&
					allOptionIndex !== -1
				) {
					newSelection = ['ALL'];
				}

				if (newSelection.includes('ALL') && newSelection.length > 1) {
					newSelection = newSelection.filter(item => item !== 'ALL');
				}
			}
		}

		onChange(
			multipleValueType === SimpleEditorMultipleValueType.Array
				? newSelection
				: newSelection.join(multipleValueType.toString()),
		);
	};

	return (
		<div className={`_simpleEditorIcons ${withBackground ? '_bground' : ''}`}>
			{options.map((e, i) => {
				const activeClass = selection.has(e.name) ? '_active' : '';
				return (
					<div
						key={i}
						className={`_eachIcon ${activeClass}`}
						onClick={ev => handleSelection(e.name, ev.ctrlKey, ev.metaKey)}
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
					</div>
				);
			})}
		</div>
	);
}
