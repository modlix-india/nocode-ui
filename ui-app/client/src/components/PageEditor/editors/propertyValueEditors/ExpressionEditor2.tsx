import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DataLocation } from '../../../../types/common';
import { allPathsFilter } from '../../../../util/allPaths';
import { shortUUID } from '../../../../util/shortUUID';

interface ExpressionEditor2Props {
	value?: DataLocation | undefined;
	onChange: (v: DataLocation | undefined) => void;
	bothModes?: boolean;
	storePaths?: Set<string>;
}

const allowedValues = new Set(
	'0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ[]._-',
);

export function ExpressionEditor2({
	value,
	onChange,
	bothModes,
	storePaths,
}: ExpressionEditor2Props) {
	const [inValue, setInValue] = useState<DataLocation>(
		value ?? { type: bothModes ? 'VALUE' : 'EXPRESSION' },
	);
	const [textValue, setTextValue] = useState(
		(value?.type === 'VALUE' ? value.value : value?.expression) ?? '',
	);
	const [matchedPaths, setMatchedPaths] = useState<Array<string>>(new Array());
	const [selectingFromPaths, setSelectingFromPaths] = useState(false);
	const [caretPosition, setCaretPosition] = useState<any>();
	useEffect(() => {
		setInValue(value ?? { type: bothModes ? 'VALUE' : 'EXPRESSION' });
		setTextValue((value?.type === 'VALUE' ? value.value : value?.expression) ?? '');
	}, [value]);

	const inputRef = useRef<HTMLInputElement>(null);

	const pathsListDiv = matchedPaths.length ? (
		<div className="_pathsList">
			{matchedPaths.map(path => (
				<div
					className="_path"
					key={path}
					onMouseDown={e => setSelectingFromPaths(true)}
					onClick={() => {
						const stringValue = textValue;
						setTextValue(
							caretPosition
								? stringValue.slice(0, caretPosition.start) +
										path +
										stringValue.slice(caretPosition.end)
								: path,
						);
						setCaretPosition(undefined);
						setMatchedPaths(new Array());
						setSelectingFromPaths(false);
						inputRef.current?.focus();
					}}
				>
					{path}
				</div>
			))}
		</div>
	) : undefined;

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
				className="_peInput"
				type="text"
				value={textValue}
				ref={inputRef}
				onChange={e => {
					setTextValue(e.target.value);

					const position = e.target.selectionStart;
					if (!position) return;

					const stringValue = e.target.value;
					let moveLeft = position;
					while (moveLeft > 0 && allowedValues.has(stringValue[moveLeft - 1])) moveLeft--;
					setCaretPosition({ start: moveLeft, end: position });
					setMatchedPaths(
						allPathsFilter(storePaths, stringValue.slice(moveLeft, position), 10),
					);
				}}
				onKeyDown={e => {
					if (e.key === 'Escape') setMatchedPaths(new Array());
				}}
				onBlur={e => {
					if (selectingFromPaths) return;

					setMatchedPaths(new Array());
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
			{pathsListDiv}
		</div>
	);
}
