import React, { useEffect, useState } from 'react';
import { DataLocation } from '../../../../types/common';
import { ExpressionEditor } from './ExpressionEditor';

interface PropertyValueEditorProps {
	value?: DataLocation;
	onChange: (v: DataLocation) => void;
}

export default function BindingPathEditor({ value, onChange }: PropertyValueEditorProps) {
	const [localValue, setLocalValue] = useState<DataLocation>({ type: 'VALUE' });

	useEffect(() => {
		if (!value) setLocalValue({ type: 'VALUE' });
		else setLocalValue(value);
	}, [value]);

	return (
		<div className="_pvEditor">
			<ExpressionEditor
				mode={localValue.type}
				onModeChange={mode => {
					onChange({ ...localValue, type: mode });
				}}
				value={localValue.type === 'VALUE' ? localValue.value : localValue.expression}
				onChange={(v: string | undefined) => {
					let x: DataLocation = { type: localValue.type };
					if (!v || v === '') {
						if (localValue.type === 'VALUE') x.expression = localValue.expression;
						else x.value = localValue.value;
					} else {
						if (localValue.type === 'VALUE') x.value = v;
						else x.expression = v;
					}
					onChange(x);
				}}
			/>
		</div>
	);
}
