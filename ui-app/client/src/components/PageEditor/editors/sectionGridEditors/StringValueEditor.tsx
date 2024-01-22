import React from 'react';

export default function StringValueEditor({
	label,
	value,
	onChange,
}: {
	label: string;
	value: string | undefined;
	onChange: (value: string) => void;
}) {
	return (
		<div className="_eachProp">
			<div className="_pvEditor">
				{label ? <div className="_pvLabel">{label}</div> : <></>}
				<div className="_pvValueEditor">
					<input
						className="_peInput"
						type="text"
						value={value ?? ''}
						onChange={e => onChange(e.target.value)}
					/>
				</div>
			</div>
		</div>
	);
}
