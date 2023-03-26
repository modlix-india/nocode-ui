import { isNullValue } from '@fincity/kirun-js';
import React, { useEffect, useState } from 'react';
import ComponentDefinitions from '../../';
import { SCHEMA_STRING_COMP_PROP } from '../../../constants';
import {
	addListenerAndCallImmediatelyWithChildrenActivity,
	getDataFromPath,
	PageStoreExtractor,
	setData,
} from '../../../context/StoreContext';
import {
	ComponentDefinition,
	ComponentProperty,
	LocationHistory,
	PageDefinition,
} from '../../../types/common';
import duplicate from '../../../util/duplicate';
import BindingPathEditor from './propertyValueEditors/BindingPathEditor';
import PropertyValueEditor from './propertyValueEditors/PropertyValueEditor';

interface PropertyEditorProps {
	selectedComponent: string;
	pageExtractor: PageStoreExtractor;
	defPath: string | undefined;
	locationHistory: Array<LocationHistory>;
}

function updatePropertyDefinition(
	defPath: string,
	locationHistory: Array<LocationHistory>,
	pageExtractor: PageStoreExtractor,
	component: string,
	propertyName: string,
	value: ComponentProperty<any>,
) {
	const pageDef = duplicate(
		getDataFromPath(defPath, locationHistory, pageExtractor),
	) as PageDefinition;
	if (!pageDef.componentDefinition[component].properties)
		pageDef.componentDefinition[component].properties = {};
	if (!value.location && isNullValue(value.value) && isNullValue(value.overrideValue)) {
		delete pageDef.componentDefinition[component].properties![propertyName];
	} else {
		pageDef.componentDefinition[component].properties![propertyName] = value;
	}
	console.log(propertyName, value, pageDef.componentDefinition[component].properties);
	setData(defPath, pageDef, pageExtractor.getPageName());
}

function updateDefinition(
	defPath: string,
	locationHistory: Array<LocationHistory>,
	pageExtractor: PageStoreExtractor,
	component: string,
	def: ComponentDefinition,
) {
	const pageDef = duplicate(
		getDataFromPath(defPath, locationHistory, pageExtractor),
	) as PageDefinition;
	pageDef.componentDefinition[component] = def;
	setData(defPath, pageDef, pageExtractor.getPageName());
}

export default function PropertyEditor({
	selectedComponent,
	defPath,
	locationHistory,
	pageExtractor,
}: PropertyEditorProps) {
	const [def, setDef] = useState<ComponentDefinition>();

	useEffect(() => {
		if (!defPath) return;

		return addListenerAndCallImmediatelyWithChildrenActivity(
			(_, v: PageDefinition) => setDef(v.componentDefinition[selectedComponent]),
			pageExtractor,
			defPath,
		);
	}, [defPath, selectedComponent]);

	if (!def) return <></>;

	const cd = ComponentDefinitions.get(def.type);

	let bps = [];
	let x: [
		'bindingPath',
		'bindingPath2',
		'bindingPath3',
		'bindingPath4',
		'bindingPath5',
		'bindingPath6',
	] = [
		'bindingPath',
		'bindingPath2',
		'bindingPath3',
		'bindingPath4',
		'bindingPath5',
		'bindingPath6',
	];

	if (cd?.bindingPaths) {
		for (let i = 0; i < 6; i++) {
			if (!cd.bindingPaths[x[i]]) continue;
			bps.push(
				<div className="_eachProp" key={x[i]}>
					<div className="_propLabel" title="Name">
						{cd.bindingPaths[x[i]]?.name}
					</div>
					<BindingPathEditor
						value={def[x[i]]}
						onChange={bp => {
							const newDef = duplicate(def);
							if (!bp || (bp.value === undefined && bp.expression === undefined))
								delete newDef[x[i]];
							else newDef[x[i]] = bp;
							updateDefinition(
								defPath!,
								locationHistory,
								pageExtractor,
								selectedComponent,
								newDef,
							);
						}}
					/>
				</div>,
			);
		}
	}

	return (
		<div className="_propertyEditor">
			<div className="_eachProp">
				<div className="_propLabel" title="Name">
					Name :
					<span className="_description" title="Name to identify the component">
						i
					</span>
				</div>
				<PropertyValueEditor
					propDef={{
						name: 'name',
						displayName: 'Name',
						description: 'Name to identify the component',
						schema: SCHEMA_STRING_COMP_PROP,
					}}
					value={{ value: def.name }}
					onlyValue={true}
					onChange={v => {
						const newDef = duplicate(def);
						newDef.name = v.value;
						updateDefinition(
							defPath!,
							locationHistory,
							pageExtractor,
							selectedComponent,
							newDef,
						);
					}}
				/>
			</div>
			{bps}
			{cd?.properties.map(e => {
				return (
					<div className="_eachProp" key={`${selectedComponent}-${e.name}`}>
						<div className="_propLabel" title={e.description}>
							{e.displayName} :
							<span className="_description" title={e.description}>
								i
							</span>
						</div>
						<PropertyValueEditor
							propDef={e}
							value={def.properties?.[e.name] as ComponentProperty<any>}
							onChange={v =>
								updatePropertyDefinition(
									defPath!,
									locationHistory,
									pageExtractor,
									selectedComponent,
									e.name,
									v,
								)
							}
						/>
					</div>
				);
			})}
		</div>
	);
}
