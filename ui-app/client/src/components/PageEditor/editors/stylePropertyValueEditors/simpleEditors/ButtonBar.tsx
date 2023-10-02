import React from 'react';

export type ButtonBarOptions = Array<{ name: string; displayName: string; description?: string }>;

export function ButtonBar({
	value,
	onChange,
	options: orignalOptions,
}: {
	value: string;
	onChange: (v: string | Array<string>) => void;
	options: ButtonBarOptions;
}) {
	return (
		<div tabIndex={0} className="_simpleEditorButtonBar" role="menubar">
			{orignalOptions.map(option => {
				return (
					<div
						key={option.name}
						className={`_simpleButtonBarButton ${
							value === option.name ? '_selected' : ''
						}`}
						onClick={() => onChange(option.name)}
					>
						{option.displayName}
					</div>
				);
			})}
		</div>
	);
}
