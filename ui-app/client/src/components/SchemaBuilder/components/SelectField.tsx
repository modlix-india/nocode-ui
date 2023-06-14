import React, { useEffect } from 'react';

export default function SelectField({
	label,
	value,
	helpText,
	onChange,
	undefinedOnEmpty = true,
	propPath,
	options = [],
}: {
	label: string;
	value: any;
	helpText?: string;
	propPath: string;
	onChange: (propPath: string, v: any | undefined) => void;
	undefinedOnEmpty?: boolean;
	options?: { value: any; label: string }[];
}) {
	const [inValue, setInValue] = React.useState<string>(value ?? '');

	useEffect(() => {
		setInValue(value ?? '');
	}, [value]);
	const labelComp = label ? <label className="_rightJustify">{label} :</label> : <></>;
	const helpTextComp = helpText ? <span className="_helptext">{helpText}</span> : <></>;
	return (
		<>
			{labelComp}
			<div className="_leftJustify _flexRow">
				<select
					value={value ?? ''}
					onChange={e => {
						if (e.target.value === value) return;
						onChange(
							propPath,
							e.target.value === '' && undefinedOnEmpty ? undefined : e.target.value,
						);
					}}
				>
					{options.map(o => (
						<option key={o.label} value={o.value}>
							{o.label}
						</option>
					))}
				</select>
				{helpTextComp}
			</div>
		</>
	);
}
