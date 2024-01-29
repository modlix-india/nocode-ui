import React, { Fragment, useEffect, useState } from 'react';
import {
	CustomSchema,
	FormCompDefinition,
	FormCompValidation,
	compValidationMap,
	compValidations,
} from '../components/formCommons';
import { duplicate } from '@fincity/kirun-js';
import { Dropdown, DropdownOptions } from '../components/Dropdown';
import CommonCheckBox from '../components/CommonCheckBox';
import CommonTextBox from '../components/CommonTextBox';

const inputTypeOption: DropdownOptions = [
	{ name: 'text', displayName: 'Text' },
	{ name: 'number', displayName: 'Number' },
];
const numberTypeOption: DropdownOptions = [
	{ name: 'INTEGER', displayName: 'Integer' },
	{ name: 'DECIMAL', displayName: 'Decimal' },
];
const textValidatiopnOption: DropdownOptions = [
	{ name: 'ALPHABETIC', displayName: 'Alphabetic' },
	{ name: 'ALPHANUMERIC', displayName: 'Alphanumeric' },
	{ name: 'CHARACTERS_ONLY', displayName: 'Characters Only' },
	{ name: 'URL', displayName: 'Url' },
	{ name: 'CURRENCY', displayName: 'Currency' },
	{ name: 'REGEX', displayName: 'Regular Expression' },
];
const numberValidatiopnOption: DropdownOptions = [];
export default function TextTypeEditor({
	data,
	editorType,
	handleFieldDefMapChanges,
}: {
	data: FormCompDefinition;
	editorType: string;
	handleFieldDefMapChanges: (key: string, data: any, newKey?: string) => void;
}) {
	const [min, setMin] = useState<string>('');
	const [max, setMax] = useState<string>('');
	const [message, setMessage] = useState<string>('');

	const [inputType, setInputType] = useState<string>('');
	const [numberType, setNumberType] = useState<string>('');

	const [validationOption, setValidationOption] = useState<DropdownOptions>([]);
	const [validationSelected, setValidationSelected] = useState<string>('');

	useEffect(() => {
		setInputType(data?.inputType ?? '');
		setNumberType(data?.numberType ?? '');
		let min =
			data?.inputType === 'text'
				? data.validation['STRING_LENGTH']?.minLength ?? ''
				: data.validation['NUMBER_VALUE']?.minValue ?? '';

		let max =
			data?.inputType === 'text'
				? data.validation['STRING_LENGTH']?.maxLength ?? ''
				: data.validation['NUMBER_VALUE']?.maxValue ?? '';

		let msg =
			data?.inputType === 'text'
				? data.validation['STRING_LENGTH']?.message
				: data.validation['NUMBER_VALUE']?.message;

		let tempOption =
			data?.inputType === 'text' ? textValidatiopnOption : numberValidatiopnOption;

		let selectedDropdownVal = Object.entries(data.validation).find(
			([_, value]) => value.pattern !== undefined,
		);

		setMin('' + min);
		setMax('' + max);
		setMessage(msg || '');
		setValidationOption(tempOption);
		setValidationSelected(selectedDropdownVal ? selectedDropdownVal[0] : '');
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
		if (placeholder === data.placeholder) return;
		let tempData = {
			...data,
			placeholder: placeholder,
		};

		handleFieldDefMapChanges(data.key, tempData);
	};

	const handleMinMaxChange = () => {
		let tempValidation: compValidations = data?.validation;
		let tempSchema: CustomSchema;
		if (inputType === 'text') {
			let tempLenVal: FormCompValidation = duplicate(tempValidation['STRING_LENGTH']);

			if (max) tempLenVal['maxLength'] = parseInt(max);
			else delete tempLenVal['maxLength'];
			if (min) tempLenVal['minLength'] = parseInt(min);
			else delete tempLenVal['minLength'];
			if (message) tempLenVal['message'] = message;
			else delete tempLenVal['message'];

			tempValidation['STRING_LENGTH'] = tempLenVal;

			tempSchema = duplicate(data.schema);
			if (max) tempSchema['maxLength'] = parseInt(max);
			else delete tempSchema['maxLength'];
			if (min) tempSchema['minLength'] = parseInt(min);
			else delete tempSchema['minLength'];
		} else {
			let tempNumVal: FormCompValidation = duplicate(tempValidation['NUMBER_VALUE']);

			if (max) tempNumVal['maxValue'] = parseInt(max);
			else delete tempNumVal['maxValue'];
			if (min) tempNumVal['minValue'] = parseInt(min);
			else delete tempNumVal['minValue'];
			if (message) tempNumVal['message'] = message;
			else delete tempNumVal['message'];

			tempValidation['NUMBER_VALUE'] = tempNumVal;

			tempSchema = duplicate(data.schema);
			if (max) tempSchema['maximum'] = parseInt(max);
			else delete tempSchema['maximum'];
			if (min) tempSchema['minimum'] = parseInt(min);
			else delete tempSchema['minimum'];
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

	const handleInputTypeChanges = (v: string) => {
		if (v === data.inputType) return;
		let tempSchema: CustomSchema;
		let tempValidation: compValidations = data?.validation;

		if (v === 'text') {
			tempSchema = { type: ['STRING'] };
			tempValidation['STRING_LENGTH'] = {
				...compValidationMap.get('STRING_LENGTH')!,
				order: Object.entries(tempValidation).length,
			};
			delete tempValidation['NUMBER_VALUE'];
		} else {
			tempSchema = {
				type: ['INTEGER', 'LONG', 'FLOAT', 'DOUBLE'],
			};
			tempValidation['NUMBER_VALUE'] = {
				...compValidationMap.get('NUMBER_VALUE')!,
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

		if (max) tempSchema['maximum'] = parseInt(max);
		else delete tempSchema['maximum'];
		if (min) tempSchema['minimum'] = parseInt(min);
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

		let tempValidation: compValidations = duplicate(data?.validation);
		let tempSchema: CustomSchema = duplicate(data.schema);

		if (deleteVal) {
			delete tempValidation[deleteVal[0]];
			delete tempSchema['pattern'];
		}
		if (v) {
			tempValidation[v] = {
				...compValidationMap.get(v)!,
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
		let tempValidation: compValidations = duplicate(data?.validation);
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
		let tempValidation: compValidations = duplicate(data?.validation);
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
			{editorType === 'textBox' && (
				<Dropdown
					value={inputType}
					onChange={handleInputTypeChanges}
					options={inputTypeOption}
					placeholder="Input type"
					showNoneLabel={false}
				/>
			)}
			{inputType === 'number' && (
				<Dropdown
					value={numberType}
					onChange={handleNumberTypeChanges}
					options={numberTypeOption}
					placeholder="Number type"
					showNoneLabel={false}
				/>
			)}
			<div className="_lengthValidationGrid">
				<div className="_item">
					<span>{inputType === 'text' ? 'Character limit' : 'Number Range'}</span>
					<div className="_inputContainer">
						<input
							type="number"
							value={min}
							placeholder="min"
							min={inputType === 'text' ? 0 : undefined}
							onChange={e => setMin(e.target.value)}
							onBlur={() => handleMinMaxChange()}
							onKeyDown={e => {
								if (e.key === 'Enter') {
									e.preventDefault();
									e.stopPropagation();
									handleMinMaxChange();
								}
							}}
						/>
						<input
							type="number"
							value={max}
							placeholder="max"
							min={inputType === 'text' ? 0 : undefined}
							onChange={e => setMax(e.target.value)}
							onBlur={() => handleMinMaxChange()}
							onKeyDown={e => {
								if (e.key === 'Enter') {
									e.preventDefault();
									e.stopPropagation();
									handleMinMaxChange();
								}
							}}
						/>
					</div>
				</div>
				<div className="_item">
					<span>
						{inputType === 'text'
							? 'Char limit validation message'
							: 'Number range validation message'}
					</span>
					<input
						type="text"
						value={message}
						placeholder="message"
						onChange={e => setMessage(e.target.value)}
						onBlur={() => handleMinMaxChange()}
						onKeyDown={e => {
							if (e.key === 'Enter') {
								e.preventDefault();
								e.stopPropagation();
								handleMinMaxChange();
							}
						}}
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
						value={data.validation['MANDATORY']?.message}
						onChange={v => handleMandatoryMessageChange(v)}
					/>
				</div>
			)}
		</Fragment>
	);
}
