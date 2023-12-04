import React, { useState } from 'react';

export default function TextBox({
	value,
	onChange,
	mandatory = false,
}: {
	value: string | undefined;
	onChange: (value: string | undefined) => void;
	mandatory?: boolean;
}) {
	const [textValue, setTextValue] = useState<string>(value ?? '');

	return (
		<input
			className="_textBox"
			type="text"
			value={textValue}
			onChange={e => setTextValue(e.target.value)}
			onKeyDown={e => {
				if (e.key === 'Enter') {
					if (!mandatory || textValue.trim() !== '') onChange(textValue);
					else setTextValue(value ?? '');
				} else if (e.key === 'Escape') setTextValue(value ?? '');
			}}
			onBlur={() => {
				if (!mandatory || textValue.trim() !== '') onChange(textValue);
				else setTextValue(value ?? '');
			}}
		/>
	);
}
