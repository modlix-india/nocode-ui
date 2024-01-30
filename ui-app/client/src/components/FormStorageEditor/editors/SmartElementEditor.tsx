import React, { Fragment, useEffect, useState } from 'react';
import {
	CustomSchema,
	FormCompDefinition,
	FormCompValidation,
	compValidationMap,
	CompValidations,
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
	const reEvaluateOrder = (tempObj: CompValidations) => {
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

	const handleMinCharLimitChange = (minChar: string | undefined) => {
		let tempValidation: CompValidations = duplicate(data.validation);
		let tempSchema: CustomSchema = duplicate(data.schema);

		if (minChar) tempValidation['STRING_LENGTH']['minLength'] = parseInt(minChar);
		else delete tempValidation['STRING_LENGTH']['minLength'];
		if (minChar) tempSchema['minLength'] = parseInt(minChar);
		else delete tempSchema['minLength'];

		let tempData: FormCompDefinition = {
			...duplicate(data),
			validation: tempValidation,
			schema: tempSchema,
		};

		handleFieldDefMapChanges(data.key, tempData);
	};

	const handleMaxCharLimitChange = (maxChar: string | undefined) => {
		let tempValidation: CompValidations = duplicate(data?.validation);
		let tempSchema: CustomSchema = duplicate(data.schema);

		if (maxChar) tempValidation['STRING_LENGTH']['maxLength'] = parseInt(maxChar);
		else delete tempValidation['STRING_LENGTH']['maxLength'];
		if (maxChar) tempSchema['maxLength'] = parseInt(maxChar);
		else delete tempSchema['maxLength'];

		let tempData: FormCompDefinition = {
			...duplicate(data),
			validation: tempValidation,
			schema: tempSchema,
		};

		if (maxChar) tempData['maxChars'] = parseInt(maxChar);
		else delete tempData['maxChars'];

		handleFieldDefMapChanges(data.key, tempData);
	};

	const handleCharLimitMessageChange = (message: string | undefined) => {
		if (message === data.validation['STRING_LENGTH']['message']) return;
		let tempValidation: CompValidations = duplicate(data?.validation);

		if (message) tempValidation['STRING_LENGTH']['message'] = message;
		else delete tempValidation['STRING_LENGTH']['message'];

		let tempData: FormCompDefinition = {
			...duplicate(data),
			validation: tempValidation,
		};
		handleFieldDefMapChanges(data.key, tempData);
	};

	const handleMandatoryChange = (checked: boolean) => {
		let tempValidation: CompValidations = duplicate(data?.validation);
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
		let tempValidation: CompValidations = duplicate(data?.validation);
		tempValidation['MANDATORY'] = { ...tempValidation['MANDATORY'], message: message };
		let tempData = {
			...data,
			validation: tempValidation,
		};

		handleFieldDefMapChanges(data.key, tempData);
	};

	const handleValidationCheckChange = (checked: boolean) => {
		let tempValidation: CompValidations = duplicate(data?.validation);
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

		let tempValidation: CompValidations = duplicate(data?.validation);
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
		let tempValidation: CompValidations = duplicate(data?.validation);
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
				<CommonTextBox type="text" value={data.key} onChange={v => handleKeyChange(v)} />
			</div>
			<div className="_item">
				<span>Label</span>
				<CommonTextBox
					type="text"
					value={data.label}
					onChange={v => handleLabelChange(v)}
				/>
			</div>
			<div className="_item">
				<span>Placeholder</span>
				<CommonTextBox
					type="text"
					value={data?.placeholder}
					onChange={v => handlePlaceholderChange(v)}
				/>
			</div>
			<div className="_lengthValidationGrid">
				<div className="_item">
					<span>Character limit</span>
					<div className="_inputContainer">
						<CommonTextBox
							type="number"
							value={
								data.validation['STRING_LENGTH']?.minLength != undefined
									? '' + data.validation['STRING_LENGTH']?.minLength
									: undefined
							}
							min={0}
							placeholder="min"
							onChange={v => handleMinCharLimitChange(v)}
						/>
						<CommonTextBox
							type="number"
							value={
								data.validation['STRING_LENGTH']?.maxLength != undefined
									? '' + data.validation['STRING_LENGTH']?.maxLength
									: undefined
							}
							min={0}
							placeholder="max"
							onChange={v => handleMaxCharLimitChange(v)}
						/>
					</div>
				</div>
				<div className="_item">
					<span>Char limit validation message </span>
					<CommonTextBox
						type="text"
						value={data.validation['STRING_LENGTH']?.message}
						onChange={v => handleCharLimitMessageChange(v)}
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
						type="text"
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
								type="text"
								value={data.validation['PHONE']?.pattern}
								onChange={v => handlePhonePatternChange(v)}
							/>
						</div>
					)}
					<div className="_item">
						<span>Validation check message</span>
						<CommonTextBox
							type="text"
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
