import React, { useEffect } from 'react';
import { AnyValueEditor } from '../../PageEditor/editors/propertyValueEditors/AnyValueEditor';

export default function AnyField({
	label,
	value,
	helpText,
	onChange,
	propPath,
	buttonLabel = 'Edit',
}: {
	label: string;
	value: string;
	helpText?: string;
	propPath: string;
	onChange: (propPath: string, v: string | undefined) => void;
	buttonLabel?: string;
}) {
	const labelComp = label ? <label className="_rightJustify">{label} :</label> : <></>;
	const helpTextComp = helpText ? <span className="_helptext">{helpText}</span> : <></>;
	return (
		<>
			{labelComp}
			<div className="_leftJustify _flexRow">
				<AnyValueEditor
					value={value}
					onChange={v => onChange(propPath, v)}
					buttonLabel={buttonLabel}
				/>
				{helpTextComp}
			</div>
		</>
	);
}
