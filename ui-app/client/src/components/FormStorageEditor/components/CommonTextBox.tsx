import React, { useEffect, useState } from 'react';

export default function CommonTextBox({
	value,
	onChange,
}: {
	value: string | undefined;
	onChange: (value: string | undefined) => void;
}) {
	const [inValue, setInvalue] = useState<string>(value ?? '');

	useEffect(() => setInvalue(value ?? ''), [value]);

	return (
		<input
			type="text"
			value={inValue}
			onChange={e => setInvalue(e.target.value)}
			onBlur={() => onChange(inValue.trim() == '' ? undefined : inValue)}
		/>
	);
}
