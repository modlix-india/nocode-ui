import React, { ReactNode, useEffect, useState } from 'react';
import { DRAG_PROP_MV_KEY } from '../../../../constants';
import {
	ComponentMultiProperty,
	ComponentPropertyDefinition,
	PageDefinition,
} from '../../../../types/common';
import { duplicate } from '@fincity/kirun-js';
import { shortUUID } from '../../../../util/shortUUID';
import PropertyValueEditor from './PropertyValueEditor';
import PageOperations from '../../functions/PageOperations';

interface PropertyMultiValueEditorProps {
	propDef: ComponentPropertyDefinition;
	value?: ComponentMultiProperty<any>;
	onChange: (v: ComponentMultiProperty<any>) => void;
	pageDefinition?: PageDefinition;
	onShowCodeEditor: (eventName: string) => void;
	slaveStore: any;
	editPageName: string | undefined;
	storePaths: Set<string>;
	pageOperations: PageOperations;
	appPath: string | undefined;
}

export default function PropertyMultiValueEditor({
	propDef,
	value,
	onChange,
	pageDefinition,
	onShowCodeEditor,
	slaveStore,
	editPageName,
	storePaths,
	pageOperations,
	appPath,
}: PropertyMultiValueEditorProps) {
	const [chngValue, setChngValue] = useState<ComponentMultiProperty<any> | undefined>(value);
	const [newValueKey, setNewValueKey] = useState<string>(shortUUID());

	useEffect(() => {
		let v: any = value;
		if (typeof v?.value === 'string')
			v = (v.value as string)
				.split(',')
				.map((e, i) => ({ key: shortUUID(), order: i, property: { value: e } }));
		setChngValue(v);
	}, [value]);

	let allValues: Array<ReactNode> = [];

	if (chngValue) {
		allValues = Object.values(chngValue)
			.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
			.map(e => (
				<div
					className="_eachProperty"
					key={e.key}
					draggable={true}
					onDragStart={ev =>
						ev.dataTransfer.items.add(
							`${DRAG_PROP_MV_KEY}${propDef.name}_${e.key}`,
							'text/plain',
						)
					}
					onDragOver={ev => {
						ev.preventDefault();
						ev.stopPropagation();
					}}
					onDrop={ev =>
						ev.dataTransfer.items[0].getAsString(dragData => {
							let key_propName = `${DRAG_PROP_MV_KEY}${propDef.name}_`;
							if (!dragData.startsWith(key_propName)) return;
							let key = dragData.substring(key_propName.length);
							let newValue = duplicate(chngValue) as ComponentMultiProperty<any>;
							const orderedValues = Object.values(newValue).sort(
								(a, b) => (a.order ?? 0) - (b.order ?? 0),
							);
							let fromIndex = 0,
								toIndex = 0;
							for (let i = 0; i < orderedValues.length; i++) {
								if (orderedValues[i].key === key) fromIndex = i;
								else if (orderedValues[i].key === e.key) toIndex = i;
							}

							// Removing the component from the order
							let x = orderedValues.splice(fromIndex, 1);

							// If the dropped component is coming from below the dropped on component
							if (toIndex < fromIndex) toIndex--;
							if (toIndex < 0) toIndex = 0;

							// Adding it back into order in the right position
							orderedValues.splice(toIndex, 0, ...x);

							// Generating the right displayOrder starting fromn 0
							newValue = orderedValues.reduce((a, c, i) => {
								c.order = i + 1;
								a[c.key] = c;
								return a;
							}, {} as ComponentMultiProperty<any>);

							onChange(newValue);
						})
					}
				>
					<i className="_controlIcons fa fa-solid fa-up-down" />
					<i
						className="_controlIcons fa fa-solid fa-close"
						tabIndex={0}
						onClick={() => {
							const newValue = { ...chngValue };
							delete newValue[e.key];
							onChange(newValue);
						}}
					/>
					<PropertyValueEditor
						appPath={appPath}
						propDef={propDef}
						value={e.property}
						onChange={v => {
							const newValue = { ...chngValue };
							newValue[e.key] = { ...e, property: v };
							onChange(newValue);
						}}
						pageDefinition={pageDefinition}
						showPlaceholder={false}
						onShowCodeEditor={onShowCodeEditor}
						editPageName={editPageName}
						slaveStore={slaveStore}
						storePaths={storePaths}
						pageOperations={pageOperations}
					/>
				</div>
			));
	}

	return (
		<div className="_multiValueEditor">
			{allValues}
			<div className="_eachProperty fixed">
				<PropertyValueEditor
					appPath={appPath}
					key={newValueKey}
					propDef={propDef}
					onChange={v => {
						const newValue = { ...chngValue };
						let key = shortUUID();
						let order =
							Object.values(chngValue ?? {})
								.map(e => e.order ?? 0)
								.reduce((a, b) => Math.max(a, b), 0) + 1;
						newValue[key] = { key, order, property: v };
						onChange(newValue);
						setNewValueKey(shortUUID());
					}}
					pageDefinition={pageDefinition}
					showPlaceholder={false}
					onShowCodeEditor={onShowCodeEditor}
					editPageName={editPageName}
					slaveStore={slaveStore}
					storePaths={storePaths}
					pageOperations={pageOperations}
				/>
			</div>
		</div>
	);
}
