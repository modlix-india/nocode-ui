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
	readOnly = false,
}: Readonly<{
	label: string;
	value: string | undefined;
	helpText?: string;
	propPath: string;
	onChange: (propPath: string, v: string | undefined) => void;
	undefinedOnEmpty?: boolean;
	textArea?: boolean;
	validationLogic?: (v: string | undefined) => string;
	readOnly?: boolean;
}>) {
	const [inValue, setInValue] = React.useState<string>(value ?? '');
	const [msg, setMsg] = React.useState<string>('');

	useEffect(() => {
		setInValue(value ?? '');
		if (validationLogic) setMsg(validationLogic(value));
	}, [value]);

	const labelComp = label ? <label className="_rightJustify">{label} :</label> : <></>;
	const helpTextComp = helpText ? <span className="_helptext">{helpText}</span> : <></>;

	// `value` is undefined for any unset field, so reverting to it bare would flip a controlled
	// input to uncontrolled and stop it tracking.
	const revert = () => setInValue(value ?? '');
	const commit = () => {
		if (inValue === (value ?? '')) return;
		onChange(propPath, inValue === '' && undefinedOnEmpty ? undefined : inValue);
	};

	const textInput = textArea ? (
		<textarea
			value={inValue}
			disabled={readOnly}
			onKeyDown={e => {
				if (e.key === 'Escape') revert();
			}}
			onChange={e => setInValue(e.target.value)}
			onBlur={commit}
		/>
	) : (
		<input
			type="text"
			value={inValue}
			disabled={readOnly}
			onKeyDown={e => {
				if (e.key === 'Escape') revert();
				else if (e.key === 'Enter') commit();
			}}
			onChange={e => setInValue(e.target.value)}
			onBlur={commit}
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
