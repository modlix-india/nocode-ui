import React from 'react';
import { AngleSize, PixelSize, TimeSize, UnitOption } from './SizeSliders';
import { IconButtonOptions, IconsSimpleEditor } from './IconsSimpleEditor';
import { duplicate } from '@fincity/kirun-js';
import { Dropdown } from './Dropdown';
import { CommonColorPickerPropertyEditor } from '../../../../../commonComponents/CommonColorPicker';
import { ComponentProperty } from '../../../../../types/common';
import { RelatedProps } from './index';
import { ButtonBar } from './ButtonBar';
export interface PropertyDetail {
	name: string;
	displayName: string;
	type:
		| 'number'
		| 'pixel size'
		| 'angle size'
		| 'text area'
		| 'number percentage'
		| 'dropdown'
		| 'icons'
		| 'color'
		| 'time'
		| 'buttonBar'
		| 'text';
	default: string;
	optionOverride?: Array<UnitOption>;
	dropdownOptions?: Array<{ name: string; displayName: string }>;
	numberOptions?: { min: number; max: number; step: number };
	options?: IconButtonOptions;
	buttonBarOptions?: Array<{ name: string; displayName: string }>;
	relatedProps?: RelatedProps;
	gridSize?: string;
	withBackground?: boolean;
	textValue?: string;
}

export function ManyValuesEditor({
	newValueGroupTitle: newValueTitle,
	onChange,
	values,
	propDefinitions,
	newValueProps,
	groupTitle,
	showNewGroup,
	relatedProps,
	// gridSize,
	// withBackground,
	textValue,
}: {
	values: { prop: string; value: string }[];
	newValueGroupTitle?: string;
	onChange: (v: { prop: string; value: string }[]) => void;
	propDefinitions: Array<PropertyDetail>;
	newValueProps: Array<string>;
	groupTitle?: string;
	showNewGroup?: boolean;
	relatedProps?: RelatedProps;
	// gridSize?: string;
	// withBackground?: boolean;
	textValue?: string;
}) {
	const props: { [key: string]: Array<string> } = {};
	let max = 0;

	// Initialize all properties from propDefinitions with default values
	propDefinitions.forEach(def => {
		props[def.name] = [];
	});

	// Then process the values
	for (let i = 0; i < values.length; i++) {
		props[values[i].prop] = values[i].value.trim()
			? (values[i].value.split(',').map(e => e.trim()) ?? [])
			: [];
		if (max < props[values[i].prop].length) max = props[values[i].prop].length;
	}

	const valueChanged = (def: PropertyDetail, i: number, curMax: number, v: string) => {
		let newProps = duplicate(props) as { [key: string]: Array<string> };

		if (newProps[def.name].length < curMax) {
			for (let i = newProps[def.name].length; i < curMax; i++) {
				newProps[def.name].push(def.default);
			}
		}
		for (let eachDef of propDefinitions) {
			if (newProps[eachDef.name].length && newProps[eachDef.name].length < curMax) {
				for (let i = newProps[eachDef.name].length; i < curMax; i++) {
					newProps[eachDef.name].push(eachDef.default);
				}
			}
		}
		newProps[def.name][i] = v as string;

		if (relatedProps) {
			const currentValues = relatedProps.props.reduce(
				(acc, propName) => {
					acc[propName] = newProps[propName][i] || '';
					return acc;
				},
				{} as Record<string, string>,
			);

			const updatedValues = relatedProps.logic(currentValues);

			Object.entries(updatedValues).forEach(([prop, value]) => {
				if (prop !== def.name && newProps[prop]) {
					newProps[prop][i] = value;
				}
			});
		}

		onChange(
			Object.entries(newProps).map(e => ({
				prop: e[0],
				value: e[1].join(','),
			})),
		);
	};

	let eachComp = [];
	for (let i = 0; i < max; i++) {
		const key = newValueProps.map(e => props[e][i]).join('_') + '_group_' + i;
		eachComp.push(
			<div className="_simpleEditorGroup" key={key}>
				<div className="_simpleEditorGroupTitle _gradient">
					<span>{groupTitle}</span>
					<span className="_controls">
						<IconsSimpleEditor
							selected={''}
							onChange={v => {
								if (v === 'Delete') {
									onChange(
										Object.entries(props).map(e => ({
											prop: e[0],
											value: e[1]
												.filter((_, inIndex) => inIndex !== i)
												.join(','),
										})),
									);
									return;
								}
							}}
							withBackground={false}
							options={[
								{
									name: 'Delete',
									description: 'Delete this animation',
									width: '15',
									height: '15',
									icon: (
										<path
											d="M3.93393 0.483984L3.74107 0.875H1.16964C0.695536 0.875 0.3125 1.26602 0.3125 1.75C0.3125 2.23398 0.695536 2.625 1.16964 2.625H11.4554C11.9295 2.625 12.3125 2.23398 12.3125 1.75C12.3125 1.26602 11.9295 0.875 11.4554 0.875H8.88393L8.69107 0.483984C8.54643 0.185938 8.24911 0 7.925 0H4.7C4.37589 0 4.07857 0.185938 3.93393 0.483984ZM11.4554 3.5H1.16964L1.7375 12.7695C1.78036 13.4613 2.34286 14 3.02054 14H9.60446C10.2821 14 10.8446 13.4613 10.8875 12.7695L11.4554 3.5Z"
											fillOpacity="1"
											strokeWidth="0"
										/>
									),
								},
							]}
						/>
					</span>
				</div>
				<div className="_simpleEditorGroupContent">
					{propDefinitions.map(def => {
						let editor = undefined;

						if (def.type === 'dropdown') {
							editor = (
								<Dropdown
									value={props[def.name][i]}
									onChange={v => valueChanged(def, i, max, v as string)}
									placeholder={def.displayName}
									options={def.dropdownOptions ?? []}
								/>
							);
						} else if (def.type === 'time') {
							editor = (
								<TimeSize
									value={props[def.name][i]}
									onChange={e => valueChanged(def, i, max, e)}
									placeholder={def.displayName}
								/>
							);
						} else if (def.type === 'pixel size') {
							editor = (
								<PixelSize
									value={props[def.name][i]}
									onChange={e => valueChanged(def, i, max, e)}
									placeholder={def.displayName}
								/>
							);
						} else if (def.type === 'angle size') {
							editor = (
								<AngleSize
									value={props[def.name][i]}
									onChange={e => valueChanged(def, i, max, e)}
									placeholder={def.displayName}
								/>
							);
						} else if (def.type === 'text area') {
							editor = (
								<textarea
									value={props[def.name][i]}
									onChange={e => valueChanged(def, i, max, e.target.value)}
									placeholder={def.displayName}
								/>
							);
						} else if (def.type === 'number percentage') {
							editor = (
								<PixelSize
									value={props[def.name][i]}
									onChange={e => valueChanged(def, i, max, e)}
									placeholder={def.displayName}
								/>
							);
						} else if (def.type === 'icons') {
							editor = (
								<IconsSimpleEditor
									selected={props[def.name][i]}
									onChange={v => valueChanged(def, i, max, v as string)}
									options={def.options ?? []}
									gridSize={def.gridSize}
									withBackground={def.withBackground}
								/>
							);
						} else if (def.type === 'color') {
							editor = (
								<CommonColorPickerPropertyEditor
									color={{
										value: props[def.name][i] || '',
										location: { type: 'VALUE' },
									}}
									onChange={(v: ComponentProperty<string>) => {
										const colorString = v.value || '';
										valueChanged(def, i, max, colorString);
									}}
								/>
							);
						} else if (def.type === 'buttonBar') {
							editor = (
								<ButtonBar
									value={props[def.name][i]}
									onChange={v => valueChanged(def, i, max, v as string)}
									options={def.buttonBarOptions ?? []}
								/>
							);
						} else if (def.type === 'text') {
							editor = (
								<input
									value={textValue ? textValue : props[def.name][i]}
									onChange={e => valueChanged(def, i, max, e.target.value)}
									placeholder={def.displayName}
								/>
							);
						}
						return (
							<div className="_editorLine" key={def.name}>
								<span className="_label">{def.displayName} </span>
								{editor}
							</div>
						);
					})}
				</div>
			</div>,
		);
	}

	let newValue = undefined;
	if (showNewGroup) {
		newValue = (
			<div className="_simpleEditorGroup">
				<div className="_simpleEditorGroupTitle _gradient">
					<span>{newValueTitle}</span>
				</div>
				<div className="_simpleEditorGroupContent">
					{newValueProps
						.map(e => propDefinitions.find(x => x.name === e))
						.map(def => {
							if (!def) return;
							let editor = undefined;

							if (def.type === 'dropdown') {
								editor = (
									<Dropdown
										value={''}
										onChange={v => valueChanged(def, max, max + 1, v as string)}
										placeholder={def.displayName}
										options={def.dropdownOptions ?? []}
									/>
								);
							} else if (def.type === 'time') {
								editor = (
									<TimeSize
										value={''}
										onChange={e => valueChanged(def, max, max + 1, e)}
										placeholder={def.displayName}
									/>
								);
							} else if (def.type === 'icons') {
								editor = (
									<IconsSimpleEditor
										selected={''}
										onChange={v => valueChanged(def, max, max + 1, v as string)}
										options={def.options ?? []}
									/>
								);
							} else if (def.type === 'color') {
								editor = (
									<CommonColorPickerPropertyEditor
										color={{
											value: '',
											location: { type: 'VALUE' },
										}}
										onChange={(v: ComponentProperty<string>) => {
											const colorString = v.value || '';
											valueChanged(def, max, max + 1, colorString);
										}}
									/>
								);
							} else if (def.type === 'number') {
								editor = (
									<input
										type="number"
										value={''}
										onChange={e =>
											valueChanged(def, max, max + 1, e.target.value)
										}
										placeholder={def.displayName}
									/>
								);
							} else if (def.type === 'number percentage') {
								editor = (
									<input
										type="number"
										value={''}
										onChange={e =>
											valueChanged(def, max, max + 1, e.target.value)
										}
										placeholder={def.displayName}
									/>
								);
							} else if (def.type === 'pixel size') {
								editor = (
									<PixelSize
										value={''}
										onChange={e => valueChanged(def, max, max + 1, e)}
										placeholder={def.displayName}
									/>
								);
							} else if (def.type === 'angle size') {
								editor = (
									<AngleSize
										value={''}
										onChange={e => valueChanged(def, max, max + 1, e)}
										placeholder={def.displayName}
									/>
								);
							} else if (def.type === 'text area') {
								editor = (
									<textarea
										value={''}
										onChange={e =>
											valueChanged(def, max, max + 1, e.target.value)
										}
										placeholder={def.displayName}
									/>
								);
							} else if (def.type === 'buttonBar') {
								editor = (
									<ButtonBar
										value={''}
										onChange={v => valueChanged(def, max, max + 1, v as string)}
										options={def.buttonBarOptions ?? []}
									/>
								);
							} else if (def.type === 'text') {
								editor = (
									<input
										value={''}
										onChange={e =>
											valueChanged(def, max, max + 1, e.target.value)
										}
										placeholder={def.displayName}
									/>
								);
							}

							return (
								<div className="_editorLine" key={def.name}>
									<span className="_label">{def.displayName} </span>
									{editor}
								</div>
							);
						})}
				</div>
			</div>
		);
	}

	return (
		<>
			{eachComp}
			{newValue}
		</>
	);
}
