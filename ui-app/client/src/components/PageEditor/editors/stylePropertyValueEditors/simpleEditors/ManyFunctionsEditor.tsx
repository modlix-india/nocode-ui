import React from 'react';
import { Dropdown } from './Dropdown';
import { duplicate } from '@fincity/kirun-js';
import { IconsSimpleEditor } from './IconsSimpleEditor';
import {
	AngleSize,
	NumberPercentageSize,
	PixelSize,
	RangeWithoutUnit,
	UnitOption,
} from './SizeSliders';

export interface ParamDetail {
	name: string;
	displayName: string;
	type: 'number' | 'pixel size' | 'angle size' | 'text area' | 'number percentage';
	default?: string;
	optionOverride?: Array<UnitOption>;
	numberOptions?: { min: number; max: number; step: number };
}

export interface FunctionDetail {
	name: string;
	displayName: string;
	params: Array<ParamDetail>;
}

export function ManyFunctionsEditor({
	value = '',
	newFunctionTitle,
	onChange,
	functionDetails,
}: {
	value?: string;
	newFunctionTitle: string;
	onChange: (v: string) => void;
	functionDetails: Array<FunctionDetail>;
}) {
	const functionValues = value
		.split(')')
		.map((e: string) => e.trim())
		.filter((e: string) => !!e)
		.map((e: string) => {
			const split = e.split('(');
			return {
				name: split[0],
				value: split[1],
			};
		});

	let functions = undefined;

	const functionNameOptions = functionDetails.map(e => ({
		name: e.name,
		displayName: e.displayName,
	}));

	const newFunctionSelector = (
		<div className="_simpleEditorGroup">
			<div className="_simpleEditorGroupTitle _gradient">{newFunctionTitle}</div>
			<div className="_simpleEditorGroupContent">
				<div className="_editorLine">
					<span className="_label">Function : </span>
					<Dropdown
						value=""
						options={functionNameOptions}
						onChange={e => onChange((value ? value + ' ' : '') + e + '()')}
					/>
				</div>
			</div>
		</div>
	);

	const changeFunctionValue = (
		functionIndex: number,
		valueIndex: number,
		value: string,
		functionDetail: FunctionDetail,
	) => {
		const newFunctions = duplicate(functionValues);
		if (functionDetail.params.length === 1) {
			newFunctions[functionIndex].value = value;
		} else {
			let values = newFunctions[functionIndex].value.split(',');
			let i = 0;
			while (functionDetail.params.length !== values.length) {
				if (values.length <= i) values.push(functionDetail.params[i].default ?? '');
				i++;
			}
			values[valueIndex] = value;
			newFunctions[functionIndex].value = values.join(',');
		}
		onChange(newFunctions.map((e: any) => `${e.name}(${e.value})`).join(' '));
	};
	functions = functionValues.map((e: any, i: number) => {
		const fun = functionDetails.find(f => f.name.toLowerCase() === e.name.toLowerCase());
		let paramValue = [e.value];
		if ((fun?.params?.length ?? 0) > 1) {
			paramValue = (e.value ?? '').split(',').map((e: string) => e.trim());
		}
		return (
			<div className="_simpleEditorGroup" key={`${e.name}_${i}`}>
				<div className="_simpleEditorGroupTitle _gradient">
					{fun?.displayName}
					<span className="_controls">
						<IconsSimpleEditor
							selected={''}
							onChange={v => {
								if (v !== 'Delete') return;
								const newFunctions = duplicate(functionValues);
								newFunctions.splice(i, 1);
								onChange(
									newFunctions.map((e: any) => `${e.name}(${e.value})`).join(' '),
								);
							}}
							withBackground={false}
							options={[
								{
									name: 'Delete',
									description: 'Delete this animation',
									width: '13',
									height: '14',
									icon: (
										<>
											<path
												d="M3.93393 0.483984L3.74107 0.875H1.16964C0.695536 0.875 0.3125 1.26602 0.3125 1.75C0.3125 2.23398 0.695536 2.625 1.16964 2.625H11.4554C11.9295 2.625 12.3125 2.23398 12.3125 1.75C12.3125 1.26602 11.9295 0.875 11.4554 0.875H8.88393L8.69107 0.483984C8.54643 0.185938 8.24911 0 7.925 0H4.7C4.37589 0 4.07857 0.185938 3.93393 0.483984ZM11.4554 3.5H1.16964L1.7375 12.7695C1.78036 13.4613 2.34286 14 3.02054 14H9.60446C10.2821 14 10.8446 13.4613 10.8875 12.7695L11.4554 3.5Z"
												strokeWidth="0"
											/>
										</>
									),
								},
							]}
						/>
					</span>
				</div>
				<div className="_simpleEditorGroupContent">
					{fun?.params.map((paramDetail, ip) => {
						let paramEditor = undefined;

						if (paramDetail.type === 'number') {
							paramEditor = (
								<RangeWithoutUnit
									value={paramValue[ip]}
									onChange={v => changeFunctionValue(i, ip, v, fun)}
									min={paramDetail.numberOptions?.min}
									max={paramDetail.numberOptions?.max}
									step={paramDetail.numberOptions?.step}
								/>
							);
						} else if (paramDetail.type === 'pixel size') {
							paramEditor = (
								<PixelSize
									value={paramValue[ip]}
									onChange={v => changeFunctionValue(i, ip, v, fun)}
									placeholder={paramDetail.displayName}
									extraOptions={paramDetail.optionOverride}
								/>
							);
						} else if (paramDetail.type === 'angle size') {
							paramEditor = (
								<AngleSize
									onChange={v => changeFunctionValue(i, ip, v, fun)}
									value={paramValue[ip]}
									placeholder={paramDetail.displayName}
								/>
							);
						} else if (paramDetail.type === 'text area') {
							paramEditor = (
								<textarea
									className="_peInput"
									placeholder="Comma Seperated Parameters"
									value={paramValue[ip]}
									onChange={v => changeFunctionValue(i, ip, v.target.value, fun)}
								/>
							);
						} else if (paramDetail.type === 'number percentage') {
							paramEditor = (
								<NumberPercentageSize
									value={paramValue[ip]}
									onChange={v => changeFunctionValue(i, ip, v, fun)}
									placeholder={paramDetail.displayName}
									extraOptions={paramDetail.optionOverride}
								/>
							);
						}

						return (
							<>
								<div className="_editorLine" key={`${paramDetail.name}_label_${i}`}>
									<span className="_label">{paramDetail.displayName} : </span>
								</div>
								<div className="_editorLine" key={`${paramDetail.name}_${i}`}>
									{paramEditor}
								</div>
							</>
						);
					})}
				</div>
			</div>
		);
	});

	return (
		<>
			{functions}
			{newFunctionSelector}
		</>
	);
}
