import React from 'react';
import { TimeSize, UnitOption } from './SizeSliders';
import { IconsSimpleEditor } from './IconsSimpleEditor';
import { duplicate } from '@fincity/kirun-js';
import { Dropdown } from './Dropdown';

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
		| 'time';
	default: string;
	optionOverride?: Array<UnitOption>;
	dropdownOptions?: Array<{ name: string; displayName: string }>;
	numberOptions?: { min: number; max: number; step: number };
}

export function ManyValuesEditor({
	newValueGroupTitle: newValueTitle,
	onChange,
	values,
	propDefinitions,
	newValueProps,
	groupTitle,
	showNewGroup,
}: {
	values: { prop: string; value: string }[];
	newValueGroupTitle?: string;
	onChange: (v: { prop: string; value: string }[]) => void;
	propDefinitions: Array<PropertyDetail>;
	newValueProps: Array<string>;
	groupTitle?: string;
	showNewGroup?: boolean;
}) {
	const props: { [key: string]: Array<string> } = {};
	let max = 0;
	for (let i = 0; i < values.length; i++) {
		props[values[i].prop] = values[i].value.trim()
			? values[i].value.split(',').map(e => e.trim()) ?? []
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
		onChange(
			Object.entries(newProps).map(e => ({
				prop: e[0],
				value: e[1].join(','),
			})),
		);
	};

	console.log(props, max);

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
						}

						return (
							<div className="_editorLine">
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
							}

							return (
								<div className="_editorLine">
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
