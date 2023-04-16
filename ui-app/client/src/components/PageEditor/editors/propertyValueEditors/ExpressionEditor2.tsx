import React, { useEffect, useState } from 'react';
import { DataLocation } from '../../../../types/common';

interface ExpressionEditor2Props {
	value?: DataLocation | undefined;
	onChange: (v: DataLocation | undefined) => void;
	bothModes?: boolean;
}

export function ExpressionEditor2({ value, onChange, bothModes }: ExpressionEditor2Props) {
	const [inValue, setInValue] = useState<DataLocation>(
		value ?? { type: bothModes ? 'VALUE' : 'EXPRESSION' },
	);
	const [textValue, setTextValue] = useState(
		(value?.type === 'VALUE' ? value.value : value?.expression) ?? '',
	);
	useEffect(() => {
		setInValue(value ?? { type: bothModes ? 'VALUE' : 'EXPRESSION' });
		setTextValue((value?.type === 'VALUE' ? value.value : value?.expression) ?? '');
	}, [value]);

	return (
		<div className="_pvExpressionEditor">
			<span
				className="_pillTag"
				title="Expression"
				tabIndex={0}
				onClick={() => {
					if (!bothModes) return;
					if (!textValue.trim()) {
						if (value?.value && value.type === 'EXPRESSION') {
							onChange({ ...value, type: 'VALUE', expression: undefined });
						} else if (value?.expression && value.type === 'VALUE') {
							onChange({ ...value, type: 'EXPRESSION', value: undefined });
						} else {
							setInValue({
								...(inValue ?? {}),
								type: inValue.type === 'VALUE' ? 'EXPRESSION' : 'VALUE',
							});
						}
					} else {
						onChange({
							...inValue,
							type: inValue.type === 'VALUE' ? 'EXPRESSION' : 'VALUE',
						});
					}
				}}
			>
				{inValue?.type === 'VALUE' ? 'Path' : 'Expr'}
			</span>
			<input
				type="text"
				value={textValue}
				onChange={e => setTextValue(e.target.value)}
				onBlur={() => {
					if (!textValue.trim() && value) {
						if (value.type === 'EXPRESSION' && value.value) {
							onChange({ ...value, type: 'VALUE', expression: undefined });
						} else if (value.type === 'VALUE' && value.expression) {
							onChange({ ...value, type: 'EXPRESSION', value: undefined });
						} else {
							onChange(undefined);
						}
					} else {
						onChange(
							!textValue.trim()
								? undefined
								: {
										...inValue,
										[bothModes && inValue.type === 'VALUE'
											? 'value'
											: 'expression']: textValue,
								  },
						);
					}
				}}
			/>
		</div>
	);
}
