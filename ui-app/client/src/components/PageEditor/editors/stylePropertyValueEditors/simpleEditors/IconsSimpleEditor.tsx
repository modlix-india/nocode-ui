import React, { useMemo } from 'react';
import { SimpleEditorMultipleValueType } from '.';

export type IconOptions = Array<{
	name: string;
	icon: React.ReactNode;
	description?: string;
	width?: string;
	height?: string;
	viewBox?: string;
}>;

export function IconsSimpleEditor({
	options,
	selected,
	onChange,
	withBackground = false,
	multipleValueType = SimpleEditorMultipleValueType.SpaceSeparated,
	multiSelect = false,
}: {
	options: IconOptions;
	selected: string;
	onChange: (v: string | Array<string>) => void;
	withBackground?: boolean;
	multipleValueType?: SimpleEditorMultipleValueType;
	multiSelect?: boolean;
}) {
	const selection = useMemo(() => {
		if (!multiSelect) return new Set<string>([selected]);
		if (!selected) return new Set<string>();
		if (multipleValueType === SimpleEditorMultipleValueType.Array)
			return new Set<string>(selected);
		return new Set<string>(selected.split(multipleValueType.toString()));
	}, [selected]);

	return (
		<div className={`_simpleEditorIcons ${withBackground ? '_bground' : ''}`}>
			{options.map((e, i) => {
				const activeClass = selection.has(e.name) ? '_active' : '';
				return (
					<div
						key={i}
						className={`_eachIcon ${activeClass}`}
						onClick={() => {
							if (!multiSelect) {
								onChange(selected === e.name ? '' : e.name);
								return;
							}

							let arr = Array.from(selection);
							if (selection.has(e.name)) arr.splice(arr.indexOf(e.name), 1);
							else arr.push(e.name);

							onChange(
								multipleValueType === SimpleEditorMultipleValueType.Array
									? arr
									: arr.join(multipleValueType.toString()),
							);
						}}
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
						>
							{e.icon}
						</svg>
					</div>
				);
			})}
		</div>
	);
}
