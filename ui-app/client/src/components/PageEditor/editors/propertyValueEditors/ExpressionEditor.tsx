import React, { useEffect, useState } from 'react';

interface ExpressionEditorProps {
	value?: string;
	onChange: (v: string | undefined) => void;
	mode?: 'EXPRESSION' | 'VALUE';
	onModeChange?: (mode: 'EXPRESSION' | 'VALUE') => void;
}

export function ExpressionEditor({ value, onChange, mode, onModeChange }: ExpressionEditorProps) {
	const [inValue, setInValue] = useState(value ?? '');
	useEffect(() => setInValue(value ?? ''), [value]);
	return (
		<div className="_pvExpressionEditor">
			<span
				className="_pillTag"
				title="Expression"
				tabIndex={0}
				onClick={() => onModeChange?.(mode === 'VALUE' ? 'EXPRESSION' : 'VALUE')}
			>
				{mode === 'VALUE' ? 'Path' : 'Expr'}
			</span>
			<input
				type="text"
				value={inValue}
				onChange={e => setInValue(e.target.value)}
				onBlur={() => onChange(inValue === '' ? undefined : inValue)}
			/>
		</div>
	);
}
