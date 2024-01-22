import React from 'react';
import { ValueEditorProps } from './common';

export default function BooleanValueEditor({
	label,
	value,
	onChange,
}: {
	label: string;
	value: boolean | undefined;
	onChange: (value: boolean) => void;
}) {
	return (
		<div className="_eachProp">
			<div className="_pvEditor">
				{label ? <div className="_pvLabel">{label}</div> : <></>}
				<div className="_pvValueEditor">
					<div
						className={`_microToggle2 _withText ${value === true ? '_on' : '_off'}`}
						onClick={() => onChange(!value)}
					/>
				</div>
			</div>
		</div>
	);
}
