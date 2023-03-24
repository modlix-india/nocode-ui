import React, { useEffect, useState } from 'react';
import {
	ComponentProperty,
	ComponentPropertyDefinition,
	ComponentPropertyEditor,
} from '../../../../types/common';
import { ExpressionEditor } from './ExpressionEditor';

interface PropertyValueEditorProps {
	propDef: ComponentPropertyDefinition;
	value?: ComponentProperty<any>;
	onChange: (v: any) => void;
}

export default function PropertyValueEditor({
	propDef,
	value,
	onChange,
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

	let advancedEditor = undefined;

	if (showAdvanced) {
		advancedEditor = <ExpressionEditor />;
	}

	if (propDef.editor) {
		//Give a specific editor...
	} else {
	}

	return (
		<div className="_pvEditor">
			<div className="_pvValueEditor">
				<input type="text" value={chngValue} onChange={() => {}} />
				<div
					className={`_microToggle ${showAdvanced ? '_on' : '_off'}`}
					tabIndex={0}
					onClick={() => {
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
					}}
					title={showAdvanced ? 'Value' : 'Expression'}
				/>
			</div>
			{advancedEditor}
		</div>
	);
}
