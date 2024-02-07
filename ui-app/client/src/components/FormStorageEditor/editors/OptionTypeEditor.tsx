import React, { ChangeEvent, Fragment, useEffect, useState } from 'react';
import {
	CustomSchema,
	FormCompDefinition,
	FormCompValidation,
	Option,
	COMP_VALIDATION_MAP,
	CompValidations,
} from '../components/formCommons';
import { deepEqual, duplicate } from '@fincity/kirun-js';
import CommonTextBox from '../components/CommonTextBox';
import CommonCheckBox from '../components/CommonCheckBox';

function OptionComp({
	data,
	index,
	handleDeleteOption,
	handleOptionChange,
	handleOptionListChange,
}: {
	data: Option;
	index: number;
	handleDeleteOption: (key: string) => void;
	handleOptionChange: (e: ChangeEvent<HTMLInputElement>, index: number) => void;
	handleOptionListChange: () => void;
}) {
	return (
		<>
			<div className="_item" key={data.key}>
				<span>{data.key}</span>
				<div className="_optionContainer">
					<input
						type="text"
						value={data.value}
						onChange={e => handleOptionChange(e, index)}
						onBlur={() => handleOptionListChange()}
					/>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="12"
						height="16"
						viewBox="0 0 12 16"
						fill="none"
						className="_delete"
						onClick={() => handleDeleteOption(data.key)}
					>
						<path
							d="M0.954746 5.86849C0.951518 5.86849 0.948541 5.86759 0.945312 5.86759L1.43921 14.5554C1.48387 15.3654 2.17427 15.9988 3.00893 15.9988H8.72102C9.55568 15.9988 10.2461 15.3654 10.2907 14.5554L10.7847 5.86719C10.7801 5.86723 10.776 5.86849 10.7715 5.86849H0.954746ZM4.14738 12.43C4.14738 12.6142 3.99375 12.7633 3.8039 12.7633C3.61404 12.7633 3.46042 12.6142 3.46042 12.43V8.10328C3.46042 7.91903 3.61404 7.76994 3.8039 7.76994C3.99375 7.76994 4.14738 7.91903 4.14738 8.10328V12.43ZM6.20827 13.9479C6.20827 14.1322 6.05464 14.2813 5.86478 14.2813C5.67493 14.2813 5.5213 14.1322 5.5213 13.9479V6.58532C5.5213 6.40106 5.67493 6.25197 5.86478 6.25197C6.05464 6.25197 6.20827 6.40106 6.20827 6.58532V13.9479ZM8.26915 12.43C8.26915 12.6142 8.11553 12.7633 7.92567 12.7633C7.73582 12.7633 7.58219 12.6142 7.58219 12.43V8.10328C7.58219 7.91903 7.73582 7.76994 7.92567 7.76994C8.11553 7.76994 8.26915 7.91903 8.26915 8.10328V12.43Z"
							fill="currentColor"
						/>
						<path
							d="M10.775 2.4717H7.62072C7.70166 2.26621 7.7446 2.04655 7.7446 1.82234C7.7446 0.817417 6.90233 0 5.86686 0C4.83138 0 3.98911 0.817417 3.98911 1.82234C3.98911 2.04664 4.03207 2.26629 4.1131 2.4717H0.958326C0.429352 2.4717 0 2.88839 0 3.40175V4.27512C0 4.78845 0.429352 5.20513 0.958326 5.20513H10.775C11.304 5.20513 11.7333 4.78845 11.7333 4.27512V3.40175C11.7333 2.88839 11.304 2.4717 10.775 2.4717ZM4.67608 1.82234C4.67608 1.18527 5.21042 0.666695 5.86686 0.666695C6.52329 0.666695 7.05764 1.18527 7.05764 1.82234C7.05764 2.05571 6.98516 2.28159 6.85105 2.4717H4.88299C4.74889 2.28159 4.67608 2.05571 4.67608 1.82234Z"
							fill="currentColor"
						/>
					</svg>
				</div>
			</div>
		</>
	);
}

interface OptionTypeEditorProps {
	data: FormCompDefinition;
	editorType: string;
	handleFieldDefMapChanges: (key: string, data: any, newKey?: string) => void;
}

export default function OptionTypeEditor({
	data,
	editorType,
	handleFieldDefMapChanges,
}: OptionTypeEditorProps) {
	const [listOfOption, setListOfOption] = useState<Array<Option>>([]);

	useEffect(() => {
		setListOfOption(data?.optionList ?? []);
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
	const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
		let temp = duplicate(listOfOption);
		temp[index].value = e.target.value;
		setListOfOption(temp);
	};
	const handleOptionListChange = () => {
		let tempSchema: CustomSchema;
		let tempEnums: Array<string> = [];
		listOfOption.forEach((el: Option) => {
			tempEnums.push(el.value);
		});
		if (deepEqual(data.schema?.enums, tempEnums)) return;

		tempSchema = { ...data.schema, enums: tempEnums };

		let tempData = {
			...data,
			optionList: listOfOption,
			schema: tempSchema,
		};

		handleFieldDefMapChanges(data.key, tempData);
	};
	const handleAddOption = () => {
		let tempList: Array<Option> = duplicate(data?.optionList);
		let optionNumber = (data?.optionList?.length ?? 0) + 1;
		let tempSchema: CustomSchema;
		let tempEnums: Array<string> = [];

		tempList.push({ key: `option ${optionNumber}`, value: '' });
		tempList.forEach((el: Option) => {
			tempEnums.push(el.value);
		});
		tempSchema = { ...data.schema, enums: tempEnums };
		let tempData = {
			...data,
			optionList: tempList,
			schema: tempSchema,
		};

		handleFieldDefMapChanges(data.key, tempData);
	};
	const handleDeleteOption = (key: string) => {
		let tempList: Array<Option> = [];
		tempList = data?.optionList
			?.filter(e => e.key !== key)
			.map((el, index) => {
				return { ...el, key: `option ${index + 1}` };
			})!;

		let tempEnums: Array<string> = [];
		tempList.forEach((el: Option) => {
			tempEnums.push(el.value);
		});
		let tempSchema: CustomSchema = { ...data.schema, enums: tempEnums };
		let tempData = {
			...data,
			optionList: tempList,
			schema: tempSchema,
		};

		handleFieldDefMapChanges(data.key, tempData);
	};

	const handleMultiSelectChanges = (checked: boolean) => {
		let tempSchema: CustomSchema;
		if (checked) {
			tempSchema = {
				...data.schema,
				type: ['ARRAY'],
				items: {
					type: ['STRING'],
				},
			};
		} else {
			tempSchema = {
				...data.schema,
				type: ['STRING'],
			};
			delete tempSchema['items'];
		}
		let tempData: FormCompDefinition = {
			...data,
			isMultiSelect: checked,
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
			{editorType === 'dropdown' && (
				<div className="_item">
					<span>Placeholder</span>
					<CommonTextBox
						type="text"
						value={data?.placeholder}
						onChange={v => handlePlaceholderChange(v)}
					/>
				</div>
			)}
			<div className="_optionList">
				{listOfOption.map((each: Option, index: number) => (
					<OptionComp
						key={each.key}
						data={each}
						index={index}
						handleDeleteOption={handleDeleteOption}
						handleOptionChange={handleOptionChange}
						handleOptionListChange={handleOptionListChange}
					/>
				))}

				<button className="_addMore" onClick={handleAddOption}>
					+ Add more
				</button>
			</div>
			<div className="_checkBoxValidationsGrid">
				<div className="_checkBoxItem">
					<CommonCheckBox
						checked={data.validation['MANDATORY'] ? true : false}
						onChange={checked => handleMandatoryChange(checked)}
					/>
					<span>Mandatory field</span>
				</div>
				{editorType === 'dropdown' && (
					<div className="_checkBoxItem">
						<CommonCheckBox
							checked={data?.isMultiSelect ? true : false}
							onChange={checked => handleMultiSelectChanges(checked)}
						/>
						<span>Multiple selections</span>
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
		</Fragment>
	);
}
