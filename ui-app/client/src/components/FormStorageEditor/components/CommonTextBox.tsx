import React, { HTMLInputTypeAttribute, useEffect, useState } from 'react';

export default function CommonTextBox({
	type,
	value,
	onChange,
	min,
	placeholder,
}: {
	type: HTMLInputTypeAttribute;
	value: string | undefined;
	min?: string | number | undefined;
	placeholder?: string | undefined;
	onChange: (value: string | undefined) => void;
}) {
	const [inValue, setInvalue] = useState<string>(value ?? '');

	useEffect(() => setInvalue(value ?? ''), [value]);

	return (
		<input
			type={type}
			value={inValue}
			min={min}
			placeholder={placeholder}
			onChange={e => setInvalue(e.target.value)}
			onBlur={() => onChange(inValue.trim() == '' ? undefined : inValue)}
		/>
	);
}
