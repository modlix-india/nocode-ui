import React, { useEffect } from 'react';

export default function StringField({
	label,
	value,
	helpText,
	onChange,
	undefinedOnEmpty = true,
	propPath,
	textArea = false,
	validationLogic,
}: {
	label: string;
	value: string;
	helpText?: string;
	propPath: string;
	onChange: (propPath: string, v: string | undefined) => void;
	undefinedOnEmpty?: boolean;
	textArea?: boolean;
	validationLogic?: (v: string | undefined) => string;
}) {
	const [inValue, setInValue] = React.useState<string>(value ?? '');
	const [msg, setMsg] = React.useState<string>('');

	useEffect(() => {
		setInValue(value ?? '');
		if (validationLogic) setMsg(validationLogic(value));
	}, [value]);

	const labelComp = label ? <label className="_rightJustify">{label} :</label> : <></>;
	const helpTextComp = helpText ? <span className="_helptext">{helpText}</span> : <></>;

	const textInput = textArea ? (
		<textarea
			value={inValue}
			onKeyDown={e => {
				if (e.key === 'Escape') setInValue(value);
			}}
			onChange={e => setInValue(e.target.value)}
			onBlur={() => {
				if (inValue === value) return;
				onChange(propPath, inValue === '' && undefinedOnEmpty ? undefined : inValue);
			}}
		/>
	) : (
		<input
			type="text"
			value={inValue}
			onKeyDown={e => {
				if (e.key === 'Escape') setInValue(value);
				else if (e.key === 'Enter' && inValue !== value)
					onChange(propPath, inValue === '' && undefinedOnEmpty ? undefined : inValue);
			}}
			onChange={e => setInValue(e.target.value)}
			onBlur={() => {
				if (inValue === value) return;
				onChange(propPath, inValue === '' && undefinedOnEmpty ? undefined : inValue);
			}}
		/>
	);

	const msgComp = msg ? <span className="_error">{msg}</span> : <></>;

	return (
		<>
			{labelComp}
			<div className="_leftJustify _flexRow">
				{textInput}
				{helpTextComp}
				{msgComp}
			</div>
		</>
	);
}
