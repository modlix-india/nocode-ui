import React from 'react';

export default function ToggleButton({
	value,
	onChange,
}: {
	value: boolean;
	onChange: (value: boolean) => void;
}) {
	return (
		<div
			role="button"
			tabIndex={0}
			className={`_toggleButton ${value ? '_on' : '_off'}`}
			onClick={() => onChange(!value)}
		/>
	);
}
