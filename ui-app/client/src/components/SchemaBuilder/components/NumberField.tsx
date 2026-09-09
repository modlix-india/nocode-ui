import { isNullValue } from '@fincity/kirun-js';
import React, { useCallback, useEffect } from 'react';

export default function NumberField({
	label,
	value,
	helpText,
	onChange,
	propPath,
	readOnly = false,
}: Readonly<{
	label: string;
	value: number | undefined;
	helpText?: string;
	propPath: string;
	onChange: (propPath: string, v: number | undefined) => void;
	readOnly?: boolean;
}>) {
	const [inValue, setInValue] = React.useState<string>(makeValue(value));

	useEffect(() => {
		setInValue(makeValue(value));
	}, [value]);

	const updateValue = useCallback(
		(v: string) => {
			// The blank check has to come first. Number('') is 0, so folding it into a
			// `Number(v) !== value` guard made clearing a stored 0 a no-op, and made blurring
			// an already-empty field emit a redundant undefined on every pass.
			if (v.trim() === '') {
				if (!isNullValue(value)) onChange(propPath, undefined);
				return;
			}
			const inNumValue = Number(v);
			if (isNaN(inNumValue)) {
				setInValue(makeValue(value));
				return;
			}
			if (inNumValue !== value) onChange(propPath, inNumValue);
		},
		[value, onChange, propPath],
	);
	const labelComp = label ? <label className="_rightJustify">{label} :</label> : <></>;
	const helpTextComp = helpText ? <span className="_helptext">{helpText}</span> : <></>;

	return (
		<>
			{labelComp}
			<div className="_leftJustify _flexRow">
				<input
					type="text"
					value={inValue}
					disabled={readOnly}
					onKeyDown={e => {
						if (e.key === 'Escape') {
							setInValue(makeValue(value));
							return;
						}
						if (e.key === 'Enter') updateValue(inValue);
					}}
					onChange={e => setInValue(e.target.value ?? '')}
					onBlur={() => updateValue(inValue)}
				/>
				{helpTextComp}
			</div>
		</>
	);
}
function makeValue(value: number | undefined): string | (() => string) {
	return isNullValue(value) ? '' : '' + value;
}
