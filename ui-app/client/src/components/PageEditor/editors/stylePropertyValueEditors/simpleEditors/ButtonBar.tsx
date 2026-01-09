import React from 'react';

export type ButtonBarOptions = Array<{ name: string; displayName: string; description?: string }>;

export function ButtonBar({
	value,
	onChange,
	options: orignalOptions,
	auto = false,
}: {
	value: string;
	onChange: (v: string | Array<string>) => void;
	options: ButtonBarOptions;
	auto?: boolean;
}) {
	return (
		<div
			tabIndex={0}
			className={`_simpleEditorButtonBar ${auto ? '_auto' : ''}`}
			role="menubar"
		>
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
