import React from 'react';
import { SimpleEditorMultipleValueType } from '.';

export type RadioButtonOptions = Array<{ name: string; displayName: string; description?: string }>;

export function RadioButton({
	value,
	onChange,
	options: originalOptions,
	placeholder,
	selectNoneLabel = '- None -',
	showNoneLabel = true,
	multipleValueType = SimpleEditorMultipleValueType.SpaceSeparated,
	multiSelect = false,
}: {
	value: string;
	onChange: (v: string | Array<string>) => void;
	options: RadioButtonOptions;
	placeholder?: string;
	selectNoneLabel?: string;
	showNoneLabel?: boolean;
	multipleValueType?: SimpleEditorMultipleValueType;
	multiSelect?: boolean;
}) {
	const options = showNoneLabel
		? [{ name: '', displayName: selectNoneLabel }, ...originalOptions]
		: originalOptions;

	const selection = React.useMemo(() => {
		if (!multiSelect) return new Set<string>([value]);
		if (!value) return new Set<string>();
		if (multipleValueType === SimpleEditorMultipleValueType.Array)
			return new Set<string>(value);
		return new Set<string>(value.split(multipleValueType.toString()));
	}, [value, multiSelect, multipleValueType]);

	const handleChange = (optionName: string) => {
		if (!multiSelect) {
			onChange(value === optionName ? '' : optionName);
			return;
		}

		let newSelection = new Set(selection);
		if (newSelection.has(optionName)) {
			newSelection.delete(optionName);
		} else {
			newSelection.add(optionName);
		}

		const newValue = Array.from(newSelection);
		onChange(
			multipleValueType === SimpleEditorMultipleValueType.Array
				? newValue
				: newValue.join(multipleValueType.toString()),
		);
	};

	return (
		<div className="_simpleEditorRadioButton" role="radiogroup">
			{options.map(option => (
				<label
					key={option.name}
					className={`_simpleEditorRadioButtonOption ${
						selection.has(option.name) ? '_selected' : ''
					}`}
				>
					<input
						type={multiSelect ? 'checkbox' : 'radio'}
						name="radioButtonGroup"
						value={option.name}
						checked={selection.has(option.name)}
						onChange={() => handleChange(option.name)}
					/>
					<span title={option.description}>{option.displayName}</span>
				</label>
			))}
		</div>
	);
}
