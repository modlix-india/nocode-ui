import React, { useEffect, useMemo, useState } from 'react';

export default function Text({
	value,
	onChange,
	isTextArea = false,
	allowedRegex,
	maxChars,
}: {
	value: string | undefined;
	onChange: (v: string | undefined) => void;
	isTextArea?: boolean;
	allowedRegex?: string;
	maxChars?: number;
}) {
	const [inValue, setInValue] = useState<string>(value ?? '');
	const regexp = useMemo(
		() => (allowedRegex ? new RegExp(allowedRegex) : undefined),
		[allowedRegex],
	);

	useEffect(() => setInValue(value ?? ''), [value]);

	if (isTextArea) {
		return (
			<textarea
				className="_textEditor"
				value={inValue}
				onChange={e => {
					const v = e.target.value;
					if (regexp && !regexp.test(v)) return;
					if (maxChars && v.length > maxChars) return;
					setInValue(v);
				}}
				onBlur={() => onChange(inValue)}
				onKeyDown={e => e.key === 'Enter' && onChange(inValue)}
			/>
		);
	}

	return (
		<input
			className="_textBox"
			type="text"
			value={inValue}
			onChange={e => {
				const v = e.target.value;
				if (regexp && !regexp.test(v)) return;
				if (maxChars && v.length > maxChars) return;
				setInValue(v);
			}}
			onBlur={() => onChange(inValue)}
			onKeyDown={e => e.key === 'Enter' && onChange(inValue)}
		/>
	);
}
