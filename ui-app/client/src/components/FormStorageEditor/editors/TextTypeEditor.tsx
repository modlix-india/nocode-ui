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
	editerType,
	handleFieldDefMapChanges,
}: {
	data: FormCompDefinition;
	editerType: string;
	handleFieldDefMapChanges: (key: string, data: any, newKey?: string) => void;
}) {
	const [key, setKey] = useState<string>('');
	const [label, setLabel] = useState<string>('');
	const [placeholder, setPlaceholder] = useState<string>('');

	const [min, setMin] = useState<string>('');
	const [max, setMax] = useState<string>('');

	const [inputType, setInputType] = useState<string>('');
	const [numberType, setNumberType] = useState<string>('');

	const [validationOption, setValidationOption] = useState<DropdownOptions>([]);
	const [validationSelected, setValidationSelected] = useState<string>('');
	const [isMandatory, setIsMandatory] = useState<boolean>(false);

	const [message, setMessage] = useState<string>('');
	const [message1, setMessage1] = useState<string>('');
	const [message2, setMessage2] = useState<string>('');
	const [regex, setRegex] = useState<string>('');

	useEffect(() => {
		setKey(data.key);
		setLabel(data.label);
		setPlaceholder(data?.placeholder ?? '');
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

		setMin('' + min);
		setMax('' + max);
		setMessage(msg || '');
		setValidationOption(tempOption);

		setIsMandatory(data.validation['MANDATORY'] ? true : false);
		setMessage1(data.validation['MANDATORY']?.message ?? '');

		let tempVal = Object.entries(data.validation).find(
			([_, value]) => value.pattern !== undefined,
		);
		setValidationSelected(tempVal ? tempVal[0] : '');
		setRegex(tempVal ? tempVal[1]?.pattern! : '');
		setMessage2(tempVal ? tempVal[1]?.message! : '');
	}, [data]);

	const reEvaluateOrder = (tempObj: compValidations) => {
		// re-arrange order
		Object.entries(tempObj)
			.sort(
				(a: [string, FormCompValidation], b: [string, FormCompValidation]) =>
					(a[1].order ?? 0) - (b[1].order ?? 0),
			)
			.map(([key, obj], index) => {
				tempObj[key] = { ...obj, order: index };
			});
		return tempObj;
	};

	const handleKeyChange = () => {
		if (key === data.key) return;
		let tempData = {
			...data,
			key: key,
		};
		handleFieldDefMapChanges(data.key, tempData, key);
	};

	const handleLabelChange = () => {
		if (label === data.label) return;
		let tempData = {
			...data,
			label: label,
		};

		handleFieldDefMapChanges(data.key, tempData);
	};

	const handlePlaceholderChange = () => {
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
			if (max) tempSchema.oneOf![0]['maximum'] = parseInt(max);
			else delete tempSchema.oneOf![0]['maximum'];
			if (min) tempSchema.oneOf![0]['minimum'] = parseInt(min);
			else delete tempSchema.oneOf![0]['minimum'];
		}
		let tempData: FormCompDefinition = {
			...data,
			maxChars: inputType === 'text' && max ? parseInt(max) : '',
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
			tempSchema = { type: ['STRING'], minLength: '', maxLength: '' };
			tempValidation['STRING_LENGTH'] = {
				...compValidationMap.get('STRING_LENGTH')!,
				order: Object.entries(tempValidation).length,
			};
			delete tempValidation['NUMBER_VALUE'];
		} else {
			tempSchema = {
				oneOf: [
					{
						type: ['INTEGER', 'LONG', 'FLOAT', 'DOUBLE'],
						minimum: '',
						maximum: '',
					},
				],
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
			maxChars: v === 'text' ? data.maxChars : '',
			schema: tempSchema,
			validation: reEvaluateOrder(tempValidation),
		};

		handleFieldDefMapChanges(data.key, tempData);
	};

	const handleNumberypeChanges = (v: string) => {
		if (v === data.numberType) return;

		let tempSchema: CustomSchema;
		if (v === 'INTEGER') {
			tempSchema = {
				oneOf: [
					{
						type: ['INTEGER', 'LONG'],
					},
				],
			};
		} else {
			tempSchema = {
				oneOf: [
					{
						type: ['INTEGER', 'LONG', 'FLOAT', 'DOUBLE'],
					},
				],
			};
		}

		if (max) tempSchema.oneOf![0]['maximum'] = parseInt(max);
		else delete tempSchema.oneOf![0]['maximum'];
		if (min) tempSchema.oneOf![0]['minimum'] = parseInt(min);
		else delete tempSchema.oneOf![0]['minimum'];

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

	const handleValidationMessageChange = () => {
		if (message2 === data.validation[validationSelected]?.message) return;
		let tempValidation: compValidations = duplicate(data?.validation);
		tempValidation[validationSelected] = {
			...tempValidation[validationSelected],
			message: message2,
		};
		let tempData = {
			...data,
			validation: tempValidation,
		};

		handleFieldDefMapChanges(data.key, tempData);
	};

	const handlePatternChange = () => {
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

	const handleMandatoryMessageChange = () => {
		if (message1 === data.validation['MANDATORY']?.message) return;
		let tempValidation: compValidations = duplicate(data?.validation);
		tempValidation['MANDATORY'] = { ...tempValidation['MANDATORY'], message: message1 };
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
				<input
					type="text"
					value={key}
					onChange={e => setKey(e.target.value)}
					onBlur={() => handleKeyChange()}
					onKeyDown={e => {
						if (e.key === 'Enter') {
							e.preventDefault();
							e.stopPropagation();
							handleKeyChange();
						}
					}}
				/>
			</div>
			<div className="_item">
				<span>Label</span>
				<input
					type="text"
					value={label}
					onChange={e => setLabel(e.target.value)}
					onBlur={() => handleLabelChange()}
					onKeyDown={e => {
						if (e.key === 'Enter') {
							e.preventDefault();
							e.stopPropagation();
							handleLabelChange();
						}
					}}
				/>
			</div>
			<div className="_item">
				<span>Placeholder</span>
				<input
					type="text"
					value={placeholder}
					onChange={e => setPlaceholder(e.target.value)}
					onBlur={() => handlePlaceholderChange()}
					onKeyDown={e => {
						if (e.key === 'Enter') {
							e.preventDefault();
							e.stopPropagation();
							handlePlaceholderChange();
						}
					}}
				/>
			</div>
			{editerType === 'textBox' && (
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
					onChange={handleNumberypeChanges}
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
							<input
								type="text"
								value={regex}
								onChange={e => setRegex(e.target.value)}
								onBlur={() => handlePatternChange()}
								onKeyDown={e => {
									if (e.key === 'Enter') {
										e.preventDefault();
										e.stopPropagation();
										handlePatternChange();
									}
								}}
							/>
						</div>
					)}
					<div className="_item">
						<span>Validation check message</span>
						<input
							type="text"
							value={message2}
							onChange={e => setMessage2(e.target.value)}
							onBlur={() => handleValidationMessageChange()}
							onKeyDown={e => {
								if (e.key === 'Enter') {
									e.preventDefault();
									e.stopPropagation();
									handleValidationMessageChange();
								}
							}}
						/>
					</div>
				</>
			)}
			<div className="_checkBoxValidationsGrid">
				<div className="_checkBoxItem">
					<input
						type="checkbox"
						checked={isMandatory}
						onChange={e => handleMandatoryChange(e.target.checked)}
					/>
					<span>Mandatory field</span>
				</div>
			</div>
			{isMandatory && (
				<div className="_item">
					<span>Mandatory validation message</span>
					<input
						type="text"
						value={message1}
						onChange={e => setMessage1(e.target.value)}
						onBlur={() => handleMandatoryMessageChange()}
						onKeyDown={e => {
							if (e.key === 'Enter') {
								e.preventDefault();
								e.stopPropagation();
								handleMandatoryMessageChange();
							}
						}}
					/>
				</div>
			)}
		</Fragment>
	);
}
