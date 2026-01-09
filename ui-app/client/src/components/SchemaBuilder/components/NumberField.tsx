import { isNullValue } from '@fincity/kirun-js';
import React, { useCallback, useEffect } from 'react';

export default function NumberField({
	label,
	value,
	helpText,
	onChange,
	propPath,
}: {
	label: string;
	value: number | undefined;
	helpText?: string;
	propPath: string;
	onChange: (propPath: string, v: number | undefined) => void;
}) {
	const [inValue, setInValue] = React.useState<string>(makeValue(value));

	useEffect(() => {
		setInValue(makeValue(value));
	}, [value]);

	const updateValue = useCallback(
		(v: string) => {
			const inNumValue = Number(v);
			if (inNumValue !== value) {
				if (inValue.trim() === '') {
					onChange(propPath, undefined);
					return;
				}
				if (isNaN(inNumValue)) {
					setInValue(makeValue(value));
					return;
				}
				onChange(propPath, isNaN(inNumValue) ? undefined : inNumValue);
			}
		},
		[value, onChange, propPath, inValue],
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
