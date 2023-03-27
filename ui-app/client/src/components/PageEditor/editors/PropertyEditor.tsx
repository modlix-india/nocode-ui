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
	ComponentPropertyDefinition,
	ComponentPropertyGroup,
	LocationHistory,
	PageDefinition,
} from '../../../types/common';
import duplicate from '../../../util/duplicate';
import { PropertyGroup } from './PropertyGroup';
import BindingPathEditor from './propertyValueEditors/BindingPathEditor';
import PropertyValueEditor from './propertyValueEditors/PropertyValueEditor';

interface PropertyEditorProps {
	selectedComponent: string;
	pageExtractor: PageStoreExtractor;
	defPath: string | undefined;
	locationHistory: Array<LocationHistory>;
	theme: string;
	personalizationPath: string | undefined;
	onChangePersonalization: (prop: string, value: any) => void;
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
	onChangePersonalization,
	theme,
	personalizationPath,
}: PropertyEditorProps) {
	const [def, setDef] = useState<ComponentDefinition>();
	const [pageDef, setPageDef] = useState<PageDefinition>();

	useEffect(() => {
		if (!defPath) return;

		return addListenerAndCallImmediatelyWithChildrenActivity(
			(_, v: PageDefinition) => {
				setDef(v.componentDefinition[selectedComponent]);
				setPageDef(v);
			},
			pageExtractor,
			defPath,
		);
	}, [defPath, selectedComponent]);

	if (!def) return <></>;

	const cd = ComponentDefinitions.get(def.type);

	let bpGroup = undefined;
	if (cd?.bindingPaths) {
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
		if (bps.length) {
			bpGroup = (
				<PropertyGroup
					name="bindings"
					displayName="Bindings"
					defaultStateOpen={false}
					pageExtractor={pageExtractor}
					locationHistory={locationHistory}
					onChangePersonalization={onChangePersonalization}
					personalizationPath={personalizationPath}
				>
					{bps}
				</PropertyGroup>
			);
		}
	}

	const propGroups = cd?.properties?.reduce((a: { [key: string]: Array<React.ReactNode> }, e) => {
		let grp = '' + (e.group ?? ComponentPropertyGroup.ADVANCED);
		if (!a[grp]) a[grp] = [];
		a[grp].push(
			<div className="_eachProp" key={`${selectedComponent}-${e.name}`}>
				<div className="_propLabel" title={e.description}>
					{e.displayName} :
					<span className="_description" title={e.description}>
						i
					</span>
				</div>
				<PropertyValueEditor
					pageDefinition={pageDef}
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
			</div>,
		);
		return a;
	}, {});

	return (
		<div className="_propertyEditor">
			<PropertyGroup
				name="first"
				displayName="General"
				defaultStateOpen={true}
				pageExtractor={pageExtractor}
				locationHistory={locationHistory}
				onChangePersonalization={onChangePersonalization}
				personalizationPath={personalizationPath}
			>
				<div className="_eachProp">
					<div className="_propLabel" title="Name">
						Name :
						<span className="_description" title="Name to identify the component">
							i
						</span>
					</div>
					<PropertyValueEditor
						pageDefinition={pageDef}
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
			</PropertyGroup>
			{bpGroup}
			{Object.entries(ComponentPropertyGroup).map((e, i) => {
				if (!propGroups?.[e[1]]) return null;
				return (
					<PropertyGroup
						key={e[0]}
						name={e[1]}
						displayName={e[0]}
						defaultStateOpen={e[1] === ComponentPropertyGroup.IMPORTANT}
						pageExtractor={pageExtractor}
						locationHistory={locationHistory}
						onChangePersonalization={onChangePersonalization}
						personalizationPath={personalizationPath}
					>
						{propGroups[e[1]]}
					</PropertyGroup>
				);
			})}
		</div>
	);
}
