import React from 'react';

export type IconOptions = Array<{ name: string; icon: React.ElementType; description?: string }>;

export function Icons({
	options,
	selected,
	onChange,
	withBackground = false,
}: {
	options: IconOptions;
	selected: string;
	onChange: (v: string) => void;
	withBackground?: boolean;
}) {
	return (
		<div className="_icons">
			{options.map((e, i) => (
				<div
					key={i}
					className={`_eachIcon ${selected === e.name ? '_selected' : ''}`}
					onClick={() => onChange(e.name)}
					title={e.description}
				>
					<e.icon />
				</div>
			))}
		</div>
	);
}
