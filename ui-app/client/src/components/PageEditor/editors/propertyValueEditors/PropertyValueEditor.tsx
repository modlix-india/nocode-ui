import React, { useCallback, useEffect, useState } from 'react';
import { SCHEMA_BOOL_COMP_PROP } from '../../../../constants';
import {
	ComponentProperty,
	ComponentPropertyDefinition,
	ComponentPropertyEditor,
	DataLocation,
} from '../../../../types/common';
import { BooleanValueEditor } from './BooleanValueEditor';
import { ExpressionEditor } from './ExpressionEditor';

interface PropertyValueEditorProps {
	propDef: ComponentPropertyDefinition;
	value?: ComponentProperty<any>;
	onChange: (v: any) => void;
	onlyValue?: boolean;
}

export default function PropertyValueEditor({
	propDef,
	value,
	onChange,
	onlyValue = false,
}: PropertyValueEditorProps) {
	const [chngValue, setChngValue] = useState<any>('');
	const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
	const [expression, setExpression] = useState<string>('');

	useEffect(() => {
		setChngValue(value?.value ?? '');
		if (value?.location) {
			setShowAdvanced(true);
			setExpression(
				(value.location.type === 'VALUE'
					? value.location.value
					: value.location.expression) ?? '',
			);
		} else {
			setExpression('');
			setShowAdvanced(false);
		}
	}, [value]);

	const toggleAdvanced = useCallback(() => {
		setShowAdvanced(!showAdvanced);
		if (!value) return;
		const newValue = { ...value };
		if (showAdvanced) {
			delete newValue.location;
			if (value.location)
				newValue.backupExpression =
					value.location.type === 'VALUE'
						? value.location.value
						: value.location.expression;
		} else {
			delete newValue.backupExpression;
			newValue.location = {
				type: 'EXPRESSION',
				expression: value.backupExpression,
			};
		}
		onChange(newValue);
	}, [setShowAdvanced, onChange, value, showAdvanced]);

	let advancedEditor = undefined;

	if (showAdvanced && !onlyValue) {
		advancedEditor = (
			<ExpressionEditor
				value={
					value?.location
						? value.location.type === 'VALUE'
							? value.location.value
							: value.location.expression
						: undefined
				}
				onChange={(v: string | undefined) =>
					onChange(
						!v
							? { ...(value ?? {}), location: undefined }
							: { ...(value ?? {}), location: { type: 'EXPRESSION', expression: v } },
					)
				}
			/>
		);
	}

	let valueEditor = undefined;
	if (propDef.editor) {
		//Give a specific editor...
	}

	if (!valueEditor) {
		if (propDef.schema.getName() === SCHEMA_BOOL_COMP_PROP.getName()) {
			valueEditor = (
				<BooleanValueEditor
					title={propDef.displayName}
					value={chngValue === '' ? undefined : !!chngValue}
					defaultValue={propDef.defaultValue}
					onChange={e => onChange({ ...value, value: e })}
				/>
			);
		}
	}

	if (!valueEditor) {
		valueEditor = (
			<input
				type="text"
				value={chngValue}
				onChange={e => setChngValue(e.target.value)}
				onBlur={() =>
					onChange({ ...value, value: chngValue === '' ? undefined : chngValue })
				}
			/>
		);
	}

	const microToggle = onlyValue ? undefined : (
		<div
			className={`_microToggle ${showAdvanced ? '_on' : '_off'}`}
			tabIndex={0}
			onKeyDown={e => (e.key === ' ' ? toggleAdvanced() : undefined)}
			onClick={toggleAdvanced}
			title={showAdvanced ? 'Value' : 'Expression'}
		/>
	);

	return (
		<div className="_pvEditor">
			<div className="_pvValueEditor">
				{valueEditor}
				{microToggle}
			</div>
			{advancedEditor}
		</div>
	);
}
