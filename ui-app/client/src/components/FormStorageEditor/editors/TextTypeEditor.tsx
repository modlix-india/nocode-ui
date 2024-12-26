import React, { Fragment, useEffect, useState } from 'react';
import {
	CustomSchema,
	FormCompDefinition,
	FormCompValidation,
	COMP_VALIDATION_MAP,
	CompValidations,
} from '../components/formCommons';
import { duplicate } from '@fincity/kirun-js';
import { Dropdown, DropdownOptions } from '../components/Dropdown';
import CommonCheckBox from '../components/CommonCheckBox';
import CommonTextBox from '../components/CommonTextBox';

const INPUT_TYPE_OPTION: DropdownOptions = [
	{ name: 'text', displayName: 'Text' },
	{ name: 'number', displayName: 'Number' },
];
const NUMBER_TYPE_OPTION: DropdownOptions = [
	{ name: 'INTEGER', displayName: 'Integer' },
	{ name: 'DECIMAL', displayName: 'Decimal' },
];
const TEXT_VALIDATIOPN_OPTION: DropdownOptions = [
	{ name: 'ALPHABETIC', displayName: 'Alphabetic' },
	{ name: 'ALPHANUMERIC', displayName: 'Alphanumeric' },
	{ name: 'CHARACTERS_ONLY', displayName: 'Characters Only' },
	{ name: 'URL', displayName: 'Url' },
	{ name: 'CURRENCY', displayName: 'Currency' },
	{ name: 'REGEX', displayName: 'Regular Expression' },
];
const NUMBER_VALIDATIOPN_OPTION: DropdownOptions = [];

interface TextTypeEditorProps {
	data: FormCompDefinition;
	editorType: string;
	handleFieldDefMapChanges: (key: string, data: any, newKey?: string) => void;
}

export default function TextTypeEditor({
	data,
	editorType,
	handleFieldDefMapChanges,
}: TextTypeEditorProps) {
	const [inputType, setInputType] = useState<string>('');
	const [numberType, setNumberType] = useState<string>('');
	const [validationOption, setValidationOption] = useState<DropdownOptions>([]);
	const [validationSelected, setValidationSelected] = useState<string>('');

	useEffect(() => {
		setInputType(data?.inputType ?? '');
		setNumberType(data?.numberType ?? '');
		let tempOption =
			data?.inputType === 'text' ? TEXT_VALIDATIOPN_OPTION : NUMBER_VALIDATIOPN_OPTION;

		let selectedDropdownVal = Object.entries(data.validation).find(
			([_, value]) => value.pattern !== undefined,
		);
		setValidationOption(tempOption);
		setValidationSelected(selectedDropdownVal ? selectedDropdownVal[0] : '');
	}, [data]);

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
		if (placeholder === data.placeholder) return;
		let tempData = {
			...data,
			placeholder: placeholder,
		};

		handleFieldDefMapChanges(data.key, tempData);
	};

	const handleMinLimitChange = (min: string | undefined) => {
		let tempValidation: CompValidations = duplicate(data?.validation);
		let tempSchema: CustomSchema = duplicate(data.schema);

		if (inputType === 'text') {
			if (min) tempValidation['STRING_LENGTH']['minLength'] = parseInt(min);
			else delete tempValidation['STRING_LENGTH']['minLength'];
			if (min) tempSchema['minLength'] = parseInt(min);
			else delete tempSchema['minLength'];
		} else {
			if (min) tempValidation['NUMBER_VALUE']['minValue'] = parseInt(min);
			else delete tempValidation['NUMBER_VALUE']['minValue'];
			if (min) tempSchema['minimum'] = parseInt(min);
			else delete tempSchema['minimum'];
		}

		let tempData: FormCompDefinition = {
			...data,
			validation: tempValidation,
			schema: tempSchema,
		};

		handleFieldDefMapChanges(data.key, tempData);
	};
	const handleMaxLimitChange = (max: string | undefined) => {
		let tempValidation: CompValidations = duplicate(data?.validation);
		let tempSchema: CustomSchema = duplicate(data.schema);

		if (inputType === 'text') {
			if (max) tempValidation['STRING_LENGTH']['maxLength'] = parseInt(max);
			else delete tempValidation['STRING_LENGTH']['maxLength'];
			if (max) tempSchema['maxLength'] = parseInt(max);
			else delete tempSchema['maxLength'];
		} else {
			if (max) tempValidation['NUMBER_VALUE']['maxValue'] = parseInt(max);
			else delete tempValidation['NUMBER_VALUE']['maxValue'];
			if (max) tempSchema['maximum'] = parseInt(max);
			else delete tempSchema['maximum'];
		}

		let tempData: FormCompDefinition = {
			...data,
			validation: tempValidation,
			schema: tempSchema,
		};

		if (inputType === 'text' && max) tempData['maxChars'] = parseInt(max);
		else delete tempData['maxChars'];

		handleFieldDefMapChanges(data.key, tempData);
	};
	const handleMinMaxLimitMessageChange = (message: string | undefined) => {
		let tempValidation: CompValidations = duplicate(data?.validation);

		if (inputType === 'text') {
			if (message) tempValidation['STRING_LENGTH']['message'] = message;
			else delete tempValidation['STRING_LENGTH']['message'];
		} else {
			if (message) tempValidation['NUMBER_VALUE']['message'] = message;
			else delete tempValidation['NUMBER_VALUE']['message'];
		}
		let tempData: FormCompDefinition = {
			...data,
			validation: tempValidation,
		};

		handleFieldDefMapChanges(data.key, tempData);
	};

	const handleInputTypeChanges = (v: string) => {
		if (v === data.inputType) return;
		let tempSchema: CustomSchema;
		let tempValidation: CompValidations = data?.validation;

		if (v === 'text') {
			tempSchema = { type: ['STRING'] };
			tempValidation['STRING_LENGTH'] = {
				...COMP_VALIDATION_MAP.get('STRING_LENGTH')!,
				order: Object.entries(tempValidation).length,
			};
			delete tempValidation['NUMBER_VALUE'];
		} else {
			tempSchema = {
				type: ['INTEGER', 'LONG', 'FLOAT', 'DOUBLE'],
			};
			tempValidation['NUMBER_VALUE'] = {
				...COMP_VALIDATION_MAP.get('NUMBER_VALUE')!,
				order: Object.entries(tempValidation).length,
			};
			delete tempValidation['STRING_LENGTH'];
		}

		let deleteVal = Object.entries(tempValidation).find(
			([_, value]) => value.pattern !== undefined,
		);

		if (deleteVal) delete tempValidation[deleteVal[0]];

		let tempData: FormCompDefinition = {
			...data,
			inputType: v,
			numberType: v === 'text' ? '' : 'DECIMAL',
			schema: tempSchema,
			validation: reEvaluateOrder(tempValidation),
		};
		if (tempData['maxChars']) delete tempData['maxChars'];

		handleFieldDefMapChanges(data.key, tempData);
	};

	const handleNumberTypeChanges = (v: string) => {
		if (v === data.numberType) return;

		let tempSchema: CustomSchema;
		if (v === 'INTEGER') {
			tempSchema = {
				type: ['INTEGER', 'LONG'],
			};
		} else {
			tempSchema = {
				type: ['INTEGER', 'LONG', 'FLOAT', 'DOUBLE'],
			};
		}
		let min =
			data?.inputType === 'text'
				? data.validation['STRING_LENGTH']['minLength']
				: data.validation['NUMBER_VALUE']['minValue'];

		let max =
			data?.inputType === 'text'
				? data.validation['STRING_LENGTH']['maxLength']
				: data.validation['NUMBER_VALUE']['maxValue'];

		if (max) tempSchema['maximum'] = parseInt('' + max);
		else delete tempSchema['maximum'];
		if (min) tempSchema['minimum'] = parseInt('' + min);
		else delete tempSchema['minimum'];

		let tempData: FormCompDefinition = {
			...data,
			numberType: v,
			schema: tempSchema,
		};

		handleFieldDefMapChanges(data.key, tempData);
	};

	const handleValidationDropdownChanges = (v: string) => {
		let deleteVal = Object.entries(data.validation).find(
			([_, value]) => value.pattern !== undefined,
		);
		if (deleteVal && v === deleteVal[0]) return;

		let tempValidation: CompValidations = duplicate(data?.validation);
		let tempSchema: CustomSchema = duplicate(data.schema);

		if (deleteVal) {
			delete tempValidation[deleteVal[0]];
			delete tempSchema['pattern'];
		}
		if (v) {
			tempValidation[v] = {
				...COMP_VALIDATION_MAP.get(v)!,
				order: Object.keys(data?.validation).length,
			};
			tempSchema['pattern'] = tempValidation[v]?.pattern;
		}

		let tempData: FormCompDefinition = {
			...data,
			validation: reEvaluateOrder(tempValidation),
			schema: tempSchema,
		};

		handleFieldDefMapChanges(data.key, tempData);
	};

	const handleValidationMessageChange = (message: string | undefined) => {
		if (message === data.validation[validationSelected]?.message) return;
		let tempValidation: CompValidations = duplicate(data?.validation);
		tempValidation[validationSelected] = {
			...tempValidation[validationSelected],
			message: message,
		};
		let tempData = {
			...data,
			validation: tempValidation,
		};

		handleFieldDefMapChanges(data.key, tempData);
	};

	const handlePatternChange = (regex: string | undefined) => {
		if (regex === data.validation[validationSelected]?.pattern) return;
		let tempValidation: CompValidations = duplicate(data?.validation);
		tempValidation[validationSelected] = {
			...tempValidation[validationSelected],
			pattern: regex,
		};
		let tempSchema: CustomSchema = { ...data.schema, pattern: regex };
		let tempData = {
			...data,
			validation: tempValidation,
			schema: tempSchema,
		};

		handleFieldDefMapChanges(data.key, tempData);
	};

	const handleMandatoryChange = (checked: boolean) => {
		let tempValidation: CompValidations = duplicate(data?.validation);
		if (checked) {
			tempValidation['MANDATORY'] = {
				...COMP_VALIDATION_MAP.get('MANDATORY')!,
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
			{editorType === 'textBox' && (
				<Dropdown
					value={inputType}
					onChange={handleInputTypeChanges}
					options={INPUT_TYPE_OPTION}
					placeholder="Input type"
					showNoneLabel={false}
				/>
			)}
			{inputType === 'number' && (
				<Dropdown
					value={numberType}
					onChange={handleNumberTypeChanges}
					options={NUMBER_TYPE_OPTION}
					placeholder="Number type"
					showNoneLabel={false}
				/>
			)}
			<div className="_lengthValidationGrid">
				<div className="_item">
					<span>{inputType === 'text' ? 'Character limit' : 'Number Range'}</span>
					<div className="_inputContainer">
						<CommonTextBox
							type="number"
							value={
								data?.inputType === 'text'
									? data.validation['STRING_LENGTH']?.minLength != undefined
										? '' + data.validation['STRING_LENGTH']?.minLength
										: undefined
									: data.validation['NUMBER_VALUE']?.minValue != undefined
										? '' + data.validation['NUMBER_VALUE']?.minValue
										: undefined
							}
							min={0}
							placeholder="min"
							onChange={v => handleMinLimitChange(v)}
						/>
						<CommonTextBox
							type="number"
							value={
								data?.inputType === 'text'
									? data.validation['STRING_LENGTH']?.maxLength != undefined
										? '' + data.validation['STRING_LENGTH']?.maxLength
										: undefined
									: data.validation['NUMBER_VALUE']?.maxValue != undefined
										? '' + data.validation['NUMBER_VALUE']?.maxValue
										: undefined
							}
							min={0}
							placeholder="max"
							onChange={v => handleMaxLimitChange(v)}
						/>
					</div>
				</div>
				<div className="_item">
					<span>
						{inputType === 'text'
							? 'Char limit validation message'
							: 'Number range validation message'}
					</span>
					<CommonTextBox
						type="text"
						value={
							data?.inputType === 'text'
								? data.validation['STRING_LENGTH']?.message
								: data.validation['NUMBER_VALUE']?.message
						}
						onChange={v => handleMinMaxLimitMessageChange(v)}
					/>
				</div>
			</div>
			<Dropdown
				value={validationSelected}
				onChange={handleValidationDropdownChanges}
				options={validationOption}
				placeholder="Validation"
				showNoneLabel={true}
				selectNoneLabel={'None'}
			/>
			{validationSelected && (
				<>
					{(validationSelected === 'URL' ||
						validationSelected === 'CURRENCY' ||
						validationSelected === 'REGEX') && (
						<div className="_item">
							<span>Regular Expression</span>
							<CommonTextBox
								type="text"
								value={
									validationSelected
										? data.validation[validationSelected]?.pattern
										: undefined
								}
								onChange={v => handlePatternChange(v)}
							/>
						</div>
					)}
					<div className="_item">
						<span>Validation check message</span>
						<CommonTextBox
							type="text"
							value={
								validationSelected
									? data.validation[validationSelected]?.message
									: undefined
							}
							onChange={v => handleValidationMessageChange(v)}
						/>
					</div>
				</>
			)}
			<div className="_checkBoxValidationsGrid">
				<div className="_checkBoxItem">
					<CommonCheckBox
						checked={data.validation['MANDATORY'] ? true : false}
						onChange={checked => handleMandatoryChange(checked)}
					/>
					<span>Mandatory field</span>
				</div>
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
		</Fragment>
	);
}
