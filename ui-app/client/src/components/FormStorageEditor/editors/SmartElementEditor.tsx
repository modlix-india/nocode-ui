import React, { Fragment, useEffect, useState } from 'react';
import {
	CustomSchema,
	FormCompDefinition,
	FormCompValidation,
	compValidationMap,
	compValidations,
} from '../components/formCommons';
import { duplicate } from '@fincity/kirun-js';
import CommonTextBox from '../components/CommonTextBox';
import CommonCheckBox from '../components/CommonCheckBox';

interface SmartElementEditorProps {
	data: FormCompDefinition;
	editorType: string;
	handleFieldDefMapChanges: (key: string, data: any, newKey?: string) => void;
}

export default function SmartElementEditor({
	data,
	editorType,
	handleFieldDefMapChanges,
}: SmartElementEditorProps) {
	const [minChar, setMinChar] = useState<string>('');
	const [maxChar, setMaxChar] = useState<string>('');
	const [message, setMessage] = useState<string>('');

	useEffect(() => {
		let min = data.validation['STRING_LENGTH']?.minLength ?? '';
		let max = data.validation['STRING_LENGTH']?.maxLength ?? '';
		setMinChar('' + min);
		setMaxChar('' + max);
		setMessage(data.validation['STRING_LENGTH']?.message ?? '');
	}, [data]);

	const reEvaluateOrder = (tempObj: compValidations) => {
		// re-arrange order
		Object.entries(tempObj)
			.sort((a, b) => (a[1].order ?? 0) - (b[1].order ?? 0))
			.map(([key, val], index) => (tempObj[key].order = index));
		return tempObj;
	};

	const handleKeyChange = (key: string | undefined) => {
		if (key === data.key) return;
		let tempData = {
			...data,
			key: key,
		};
		handleFieldDefMapChanges(data.key, tempData, key);
	};

	const handleLabelChange = (label: string | undefined) => {
		if (label === data.label) return;
		let tempData = {
			...data,
			label: label,
		};
		handleFieldDefMapChanges(data.key, tempData);
	};

	const handlePlaceholderChange = (placeholder: string | undefined) => {
		if (placeholder === data?.placeholder) return;
		let tempData = {
			...data,
			placeholder: placeholder,
		};
		handleFieldDefMapChanges(data.key, tempData);
	};

	const handleCharLimitChange = () => {
		let tempValidation: compValidations = duplicate(data?.validation);

		let tempLenVal: FormCompValidation = duplicate(tempValidation['STRING_LENGTH']);
		if (maxChar) tempLenVal['maxLength'] = parseInt(maxChar);
		else delete tempLenVal['maxLength'];
		if (minChar) tempLenVal['minLength'] = parseInt(minChar);
		else delete tempLenVal['minLength'];
		if (message) tempLenVal['message'] = message;
		else delete tempLenVal['message'];

		tempValidation['STRING_LENGTH'] = tempLenVal;

		let tempSchema: CustomSchema = duplicate(data.schema);
		if (maxChar) tempSchema['maxLength'] = parseInt(maxChar);
		else delete tempSchema['maxLength'];
		if (minChar) tempSchema['minLength'] = parseInt(minChar);
		else delete tempSchema['minLength'];

		let tempData: FormCompDefinition = {
			...duplicate(data),
			validation: tempValidation,
			schema: tempSchema,
		};
		if (maxChar) tempData['maxChars'] = parseInt(maxChar);
		else delete tempData['maxChars'];

		handleFieldDefMapChanges(data.key, tempData);
	};

	const handleMandatoryChange = (checked: boolean) => {
		let tempValidation: compValidations = duplicate(data?.validation);
		if (checked) {
			tempValidation['MANDATORY'] = {
				...compValidationMap.get('MANDATORY')!,
				order: Object.entries(data?.validation).length,
			};
		} else {
			delete tempValidation['MANDATORY'];
		}
		let tempData = {
			...data,
			validation: reEvaluateOrder(tempValidation),
		};

		handleFieldDefMapChanges(data.key, tempData);
	};

	const handleMandatoryMessageChange = (message: string | undefined) => {
		if (message === data.validation['MANDATORY']?.message) return;
		let tempValidation: compValidations = duplicate(data?.validation);
		tempValidation['MANDATORY'] = { ...tempValidation['MANDATORY'], message: message };
		let tempData = {
			...data,
			validation: tempValidation,
		};

		handleFieldDefMapChanges(data.key, tempData);
	};

	const handleValidationCheckChange = (checked: boolean) => {
		let tempValidation: compValidations = duplicate(data?.validation);
		const newValidationKey = editorType === 'email' ? 'EMAIL' : 'PHONE';
		let tempSchema: CustomSchema;

		if (checked) {
			tempValidation[newValidationKey] = {
				...compValidationMap.get(newValidationKey)!,
				order: Object.entries(data?.validation).length,
			};
			tempSchema = {
				...data.schema,
				...(editorType === 'email'
					? { format: 'EMAIL' }
					: { pattern: tempValidation[newValidationKey]?.pattern }),
			};
		} else {
			delete tempValidation[newValidationKey];
			tempSchema = duplicate(data.schema);
			if (editorType === 'email') delete tempSchema['format'];
			else delete tempSchema['pattern'];
		}

		let tempData = {
			...data,
			validation: reEvaluateOrder(tempValidation),
			schema: tempSchema,
		};

		handleFieldDefMapChanges(data.key, tempData);
	};

	const handleValidationCheckMessageChange = (
		validationKey: string,
		value: string | undefined,
	) => {
		if (value === data.validation[validationKey]?.message) return;

		let tempValidation: compValidations = duplicate(data?.validation);
		tempValidation[validationKey] = {
			...tempValidation[validationKey],
			message: value,
		};
		let tempData = {
			...data,
			validation: tempValidation,
		};

		handleFieldDefMapChanges(data.key, tempData);
	};

	const handlePhonePatternChange = (regex: string | undefined) => {
		if (regex === data.validation['PHONE']?.pattern) return;
		let tempValidation: compValidations = duplicate(data?.validation);
		tempValidation['PHONE'] = { ...tempValidation['PHONE'], pattern: regex };
		let tempSchema: CustomSchema = { ...data.schema, pattern: regex };
		let tempData = {
			...data,
			validation: tempValidation,
			schema: tempSchema,
		};

		handleFieldDefMapChanges(data.key, tempData);
	};

	return (
		<Fragment>
			<div className="_item">
				<span>Key</span>
				<CommonTextBox value={data.key} onChange={v => handleKeyChange(v)} />
			</div>
			<div className="_item">
				<span>Label</span>
				<CommonTextBox value={data.label} onChange={v => handleLabelChange(v)} />
			</div>
			<div className="_item">
				<span>Placeholder</span>
				<CommonTextBox
					value={data?.placeholder}
					onChange={v => handlePlaceholderChange(v)}
				/>
			</div>
			<div className="_lengthValidationGrid">
				<div className="_item">
					<span>Character limit</span>
					<div className="_inputContainer">
						<input
							type="number"
							value={minChar}
							placeholder="min"
							min={0}
							onChange={e => setMinChar(e.target.value)}
							onBlur={() => handleCharLimitChange()}
							onKeyDown={e => {
								if (e.key === 'Enter') {
									e.preventDefault();
									e.stopPropagation();
									handleCharLimitChange();
								}
							}}
						/>
						<input
							type="number"
							value={maxChar}
							placeholder="max"
							min={0}
							onChange={e => setMaxChar(e.target.value)}
							onBlur={() => handleCharLimitChange()}
							onKeyDown={e => {
								if (e.key === 'Enter') {
									e.preventDefault();
									e.stopPropagation();
									handleCharLimitChange();
								}
							}}
						/>
					</div>
				</div>
				<div className="_item">
					<span>Char limit validation message </span>
					<input
						type="text"
						value={message}
						placeholder="message"
						onChange={e => setMessage(e.target.value)}
						onBlur={() => handleCharLimitChange()}
						onKeyDown={e => {
							if (e.key === 'Enter') {
								e.preventDefault();
								e.stopPropagation();
								handleCharLimitChange();
							}
						}}
					/>
				</div>
			</div>
			<div className="_checkBoxValidationsGrid">
				<div className="_checkBoxItem">
					<CommonCheckBox
						checked={data.validation['MANDATORY'] ? true : false}
						onChange={checked => handleMandatoryChange(checked)}
					/>
					<span>Mandatory field</span>
				</div>
				{editorType !== 'name' && (
					<div className="_checkBoxItem">
						<CommonCheckBox
							checked={
								data.validation['EMAIL'] || data.validation['PHONE'] ? true : false
							}
							onChange={checked => handleValidationCheckChange(checked)}
						/>
						<span>Validation check</span>
					</div>
				)}
			</div>
			{data.validation['MANDATORY'] && (
				<div className="_item">
					<span>Mandatory validation message</span>
					<CommonTextBox
						value={data.validation['MANDATORY']?.message}
						onChange={v => handleMandatoryMessageChange(v)}
					/>
				</div>
			)}
			{(data.validation['EMAIL'] || data.validation['PHONE']) && (
				<>
					{editorType === 'phone' && (
						<div className="_item">
							<span>Regular Expression</span>
							<CommonTextBox
								value={data.validation['PHONE']?.pattern}
								onChange={v => handlePhonePatternChange(v)}
							/>
						</div>
					)}
					<div className="_item">
						<span>Validation check message</span>
						<CommonTextBox
							value={
								editorType === 'email'
									? data.validation['EMAIL']?.message
									: data.validation['PHONE']?.message
							}
							onChange={v =>
								handleValidationCheckMessageChange(
									editorType === 'email' ? 'EMAIL' : 'PHONE',
									v,
								)
							}
						/>
					</div>
				</>
			)}
		</Fragment>
	);
}
