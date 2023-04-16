import React, { useCallback, useEffect, useState } from 'react';
import {
	SCHEMA_ANY_COMP_PROP,
	SCHEMA_BOOL_COMP_PROP,
	SCHEMA_NUM_COMP_PROP,
} from '../../../../constants';
import {
	ComponentProperty,
	ComponentPropertyDefinition,
	ComponentPropertyEditor,
	DataLocation,
	PageDefinition,
} from '../../../../types/common';
import { AnyValueEditor } from './AnyValueEditor';
import { BooleanValueEditor } from './BooleanValueEditor';
import { ExpressionEditor2 } from './ExpressionEditor2';
import { IconSelectionEditor } from './IconSelectionEditor';
import { ImageEditor } from './ImageEditor';
import { ValidationEditor } from './ValidationEditor';

interface PropertyValueEditorProps {
	propDef: ComponentPropertyDefinition;
	value?: ComponentProperty<any>;
	onChange: (v: ComponentProperty<any>) => void;
	onlyValue?: boolean;
	pageDefinition?: PageDefinition;
	showPlaceholder?: boolean;
	storePaths: Set<string>;
}

export default function PropertyValueEditor({
	propDef,
	value,
	onChange,
	onlyValue = false,
	pageDefinition,
	showPlaceholder = true,
	storePaths,
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
			<ExpressionEditor2
				value={value?.location}
				onChange={(v: DataLocation | undefined) => onChange({ ...value, location: v })}
				storePaths={storePaths}
			/>
		);
	}

	let valueEditor = makeValueEditor(
		propDef,
		chngValue,
		onChange,
		value,
		setChngValue,
		pageDefinition,
		showPlaceholder,
	);

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

function makeValueEditor(
	propDef: ComponentPropertyDefinition,
	chngValue: any,
	onChange: (v: any) => void,
	value: ComponentProperty<any> | undefined,
	setChngValue: React.Dispatch<any>,
	pageDef?: PageDefinition,
	showPlaceholder = true,
) {
	if (propDef.editor === ComponentPropertyEditor.ICON) {
		return (
			<IconSelectionEditor
				value={chngValue}
				propDef={propDef}
				onChange={e => onChange({ ...value, value: e })}
			/>
		);
	}

	if (propDef.editor === ComponentPropertyEditor.ENUM || propDef.enumValues?.length) {
		return (
			<div className="_smallEditorContainer">
				<select
					value={chngValue === '' ? propDef.defaultValue : chngValue}
					onChange={e => {
						const newValue: ComponentProperty<any> = {
							...(value ?? {}),
							value: e.target.value,
						};
						if (newValue.value === propDef.defaultValue) delete newValue.value;
						onChange(newValue);
					}}
				>
					{propDef.enumValues?.map(v => (
						<option key={v.name} value={v.name} title={v.description}>
							{v.displayName}
						</option>
					))}
				</select>
			</div>
		);
	}

	if (propDef.editor === ComponentPropertyEditor.EVENT_SELECTOR) {
		return (
			<div className="_smallEditorContainer">
				<select
					value={chngValue === '' ? propDef.defaultValue : chngValue}
					onChange={e => {
						const newValue: ComponentProperty<any> = {
							...(value ?? {}),
							value: e.target.value,
						};
						if (newValue.value === propDef.defaultValue) delete newValue.value;
						onChange(newValue);
					}}
				>
					<option value="" title="No event">
						-- No event --
					</option>
					{Object.entries(pageDef?.eventFunctions ?? {}).map(v => (
						<option key={v[0]} value={v[0]} title={v[0]}>
							{v[1].name}
						</option>
					))}
				</select>
			</div>
		);
	}

	if (propDef.editor === ComponentPropertyEditor.VALIDATION) {
		return (
			<ValidationEditor
				value={chngValue === '' ? undefined : chngValue}
				onChange={e => onChange({ ...value, value: e })}
			/>
		);
	}

	if (propDef.editor === ComponentPropertyEditor.IMAGE) {
		return (
			<ImageEditor
				propDef={propDef}
				value={chngValue === '' ? undefined : chngValue}
				onChange={e => onChange({ ...value, value: e })}
			/>
		);
	}

	if (propDef.schema.getName() === SCHEMA_ANY_COMP_PROP.getName()) {
		return (
			<AnyValueEditor
				value={chngValue === '' ? undefined : chngValue}
				defaultValue={propDef.defaultValue}
				onChange={e => onChange({ ...value, value: e })}
			/>
		);
	}

	if (propDef.schema.getName() === SCHEMA_BOOL_COMP_PROP.getName()) {
		return (
			<BooleanValueEditor
				value={chngValue === '' ? undefined : !!chngValue}
				defaultValue={propDef.defaultValue}
				onChange={e => onChange({ ...value, value: e })}
			/>
		);
	}

	if (propDef.schema.getName() === SCHEMA_NUM_COMP_PROP.getName()) {
		return (
			<input
				type="number"
				value={chngValue}
				placeholder={showPlaceholder ? propDef.defaultValue : undefined}
				onChange={e => setChngValue(e.target.value)}
				onBlur={() =>
					onChange({
						...value,
						value:
							chngValue === '' || chngValue === propDef.defaultValue
								? undefined
								: Number(chngValue),
					})
				}
			/>
		);
	}

	return (
		<input
			type="text"
			value={chngValue}
			placeholder={showPlaceholder ? propDef.defaultValue : undefined}
			onChange={e => setChngValue(e.target.value)}
			onBlur={() =>
				onChange({
					...value,
					value:
						chngValue === '' || chngValue === propDef.defaultValue
							? undefined
							: chngValue,
				})
			}
		/>
	);
}
