import { isNullValue } from '@fincity/kirun-js';
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
import PageOperations from '../../functions/PageOperations';
import { AnyValueEditor } from './AnyValueEditor';
import { BooleanValueEditor } from './BooleanValueEditor';
import { ExpressionEditor2 } from './ExpressionEditor2';
import { IconSelectionEditor2 } from './IconSelectionEditor2';
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
	onShowCodeEditor?: (eventName: string) => void;
	slaveStore: any;
	editPageName: string | undefined;
	pageOperations: PageOperations;
	appPath?: string;
}

export default function PropertyValueEditor({
	propDef,
	value,
	onChange,
	onlyValue = false,
	pageDefinition,
	showPlaceholder = true,
	storePaths,
	onShowCodeEditor,
	slaveStore,
	editPageName,
	pageOperations,
	appPath,
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
		if (!value?.value && !value?.location && !value?.backupExpression) return;
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
		storePaths,
		slaveStore,
		editPageName,
		pageOperations,
		onShowCodeEditor,
		pageDefinition,
		showPlaceholder,
		appPath,
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
	storePaths: Set<string>,
	slaveStore: any,
	editPageName: string | undefined,
	pageOperations: PageOperations,
	onShowCodeEditor?: (eventName: string) => void,
	pageDef?: PageDefinition,
	showPlaceholder = true,
	appPath?: string,
) {
	if (propDef.editor === ComponentPropertyEditor.ICON) {
		return (
			<IconSelectionEditor2
				appPath={appPath}
				value={chngValue}
				propDef={propDef}
				onChange={e => onChange({ ...value, value: e })}
				pageExtractor={pageOperations.getPageExtractor()}
			/>
		);
	}

	if (propDef.editor === ComponentPropertyEditor.ENUM || propDef.enumValues?.length) {
		let noneOption = !isNullValue(propDef.defaultValue) ? (
			<></>
		) : (
			<option key="" value="">
				--NONE--
			</option>
		);
		return (
			<div className="_smallEditorContainer">
				<select
					className="_peSelect"
					value={(chngValue === '' ? propDef.defaultValue ?? '' : chngValue) ?? ''}
					onChange={e => {
						const newValue: ComponentProperty<any> = {
							...(value ?? {}),
							value: e.target.value,
						};

						if (newValue.value === propDef.defaultValue || newValue.value === '')
							delete newValue.value;

						onChange(newValue);
					}}
				>
					{noneOption}
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
					className="_peSelect"
					value={(chngValue === '' ? propDef.defaultValue : chngValue) ?? ''}
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
				<i
					className="fa fa-solid fa-up-right-from-square"
					onClick={() =>
						onShowCodeEditor?.(
							(chngValue === '' ? propDef.defaultValue : chngValue) ?? '',
						)
					}
				></i>
			</div>
		);
	}

	if (propDef.editor === ComponentPropertyEditor.VALIDATION) {
		return (
			<ValidationEditor
				value={chngValue === '' ? undefined : chngValue}
				onChange={e => onChange({ ...value, value: e })}
				storePaths={storePaths}
				onShowCodeEditor={onShowCodeEditor}
				editPageName={editPageName}
				slaveStore={slaveStore}
				pageOperations={pageOperations}
			/>
		);
	}

	if (propDef.editor === ComponentPropertyEditor.IMAGE) {
		return (
			<ImageEditor
				propDef={propDef}
				value={chngValue === '' ? undefined : chngValue}
				onChange={e => onChange({ ...value, value: e })}
				pageOperations={pageOperations}
			/>
		);
	}

	if (propDef.editor === ComponentPropertyEditor.LARGE_TEXT) {
		return (
			<textarea
				className="_peInput"
				value={chngValue}
				placeholder={showPlaceholder ? propDef.defaultValue : undefined}
				onChange={e => setChngValue(e.target.value)}
				onKeyDown={e => {
					if (e.key === 'Enter') {
						onChange({
							...value,
							value:
								chngValue === '' || chngValue === propDef.defaultValue
									? undefined
									: chngValue,
						});
					} else if (e.key === 'Escape') {
						setChngValue(value?.value ?? '');
					}
				}}
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
				className="_peInput"
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
			className="_peInput"
			type="text"
			value={chngValue}
			placeholder={showPlaceholder ? propDef.defaultValue : undefined}
			onChange={e => setChngValue(e.target.value)}
			onKeyDown={e => {
				if (e.key === 'Enter') {
					onChange({
						...value,
						value:
							chngValue === '' || chngValue === propDef.defaultValue
								? undefined
								: chngValue,
					});
				} else if (e.key === 'Escape') {
					setChngValue(value?.value ?? '');
				}
			}}
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
