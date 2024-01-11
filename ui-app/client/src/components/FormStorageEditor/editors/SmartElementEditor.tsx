import React, { Fragment, useEffect, useState } from 'react';
import {
	CustomSchema,
	FormCompDefinition,
	FormCompValidation,
	compValidationMap,
	compValidations,
} from '../components/formCommons';
import { duplicate } from '@fincity/kirun-js';

interface SmartElementEditorProps {
	data: FormCompDefinition;
	editorType: string;
	handleCompDefChanges: (key: string, data: any, newKey?: string) => void;
}

export default function SmartElementEditor({
	data,
	editorType,
	handleCompDefChanges,
}: SmartElementEditorProps) {
	const [key, setKey] = useState<string>('');
	const [label, setLabel] = useState<string>('');
	const [placeholder, setPlaceholder] = useState<string>('');

	const [minChar, setMinChar] = useState<string>('');
	const [maxChar, setMaxChar] = useState<string>('');

	const [isMandatory, setIsMandatory] = useState<boolean>(false);
	const [isValidationCheck, setIsValidationCheck] = useState<boolean>(false);

	const [message, setMessage] = useState<string>('');
	const [message1, setMessage1] = useState<string>('');
	const [message2, setMessage2] = useState<string>('');
	const [regex, setRegex] = useState<string>('');

	useEffect(() => {
		setKey(data.key);
		setLabel(data.label);
		setPlaceholder(data?.placeholder ?? '');
		let min = data.validation['STRING_LENGTH']?.minLength ?? '';
		let max = data.validation['STRING_LENGTH']?.maxLength ?? '';
		setMinChar('' + min);
		setMaxChar('' + max);
		setIsMandatory(data.validation['MANDATORY'] ? true : false);
		setIsValidationCheck(data.validation['EMAIL'] || data.validation['PHONE'] ? true : false);
		setRegex(data.validation['PHONE']?.pattern ?? '');
		setMessage(data.validation['STRING_LENGTH']?.message ?? '');
		setMessage1(data.validation['MANDATORY']?.message ?? '');
		setMessage2(
			editorType === 'email'
				? data.validation['EMAIL']?.message ?? ''
				: data.validation['PHONE']?.message ?? '',
		);
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
		handleCompDefChanges(data.key, tempData, key);
	};

	const handleLabelChange = () => {
		if (label === data.label) return;
		let tempData = {
			...data,
			label: label,
		};
		handleCompDefChanges(data.key, tempData);
	};

	const handlePlaceholderChange = () => {
		if (placeholder === data?.placeholder) return;
		let tempData = {
			...data,
			placeholder: placeholder,
		};
		handleCompDefChanges(data.key, tempData);
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

		handleCompDefChanges(data.key, tempData);
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

		handleCompDefChanges(data.key, tempData);
	};

	const handleMandatoryMessageChange = () => {
		if (message1 === data.validation['MANDATORY']?.message) return;
		let tempValidation: compValidations = duplicate(data?.validation);
		tempValidation['MANDATORY'] = { ...tempValidation['MANDATORY'], message: message1 };
		let tempData = {
			...data,
			validation: tempValidation,
		};

		handleCompDefChanges(data.key, tempData);
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

		handleCompDefChanges(data.key, tempData);
	};

	const handleValidationCheckMessageChange = () => {
		let tempValidation: compValidations = duplicate(data?.validation);
		let validationKey = editorType === 'email' ? 'EMAIL' : 'PHONE';
		if (message2 === data.validation[validationKey]?.message) return;
		tempValidation[validationKey] = {
			...tempValidation[validationKey],
			message: message2,
		};
		let tempData = {
			...data,
			validation: tempValidation,
		};

		handleCompDefChanges(data.key, tempData);
	};

	const handlePhonePatternChange = () => {
		if (regex === data.validation['PHONE']?.pattern) return;
		let tempValidation: compValidations = duplicate(data?.validation);
		tempValidation['PHONE'] = { ...tempValidation['PHONE'], pattern: regex };
		let tempSchema: CustomSchema = { ...data.schema, pattern: regex };
		let tempData = {
			...data,
			validation: tempValidation,
			schema: tempSchema,
		};

		handleCompDefChanges(data.key, tempData);
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
					<input
						type="checkbox"
						checked={isMandatory}
						onChange={e => handleMandatoryChange(e.target.checked)}
					/>
					<span>Mandatory field</span>
				</div>
				{editorType !== 'name' && (
					<div className="_checkBoxItem">
						<input
							type="checkbox"
							checked={isValidationCheck}
							onChange={e => handleValidationCheckChange(e.target.checked)}
						/>
						<span>Validation check</span>
					</div>
				)}
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
			{isValidationCheck && (
				<>
					{editorType === 'phone' && (
						<div className="_item">
							<span>Regular Expression</span>
							<input
								type="text"
								value={regex}
								onChange={e => setRegex(e.target.value)}
								onBlur={() => handlePhonePatternChange()}
								onKeyDown={e => {
									if (e.key === 'Enter') {
										e.preventDefault();
										e.stopPropagation();
										handlePhonePatternChange();
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
							onBlur={() => handleValidationCheckMessageChange()}
							onKeyDown={e => {
								if (e.key === 'Enter') {
									e.preventDefault();
									e.stopPropagation();
									handleValidationCheckMessageChange();
								}
							}}
						/>
					</div>
				</>
			)}
		</Fragment>
	);
}
