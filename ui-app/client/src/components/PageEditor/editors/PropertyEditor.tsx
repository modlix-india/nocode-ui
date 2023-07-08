import { isNullValue } from '@fincity/kirun-js';
import React, { useEffect, useState } from 'react';
import ComponentDefinitions from '../../';
import { SCHEMA_STRING_COMP_PROP } from '../../../constants';
import {
	PageStoreExtractor,
	addListenerAndCallImmediatelyWithChildrenActivity,
	getDataFromPath,
	setData,
} from '../../../context/StoreContext';
import {
	ComponentDefinition,
	ComponentMultiProperty,
	ComponentProperty,
	ComponentPropertyDefinition,
	ComponentPropertyGroup,
	LocationHistory,
	PageDefinition,
} from '../../../types/common';
import { duplicate } from '@fincity/kirun-js';
import { PropertyGroup } from './PropertyGroup';
import { ExpressionEditor2 } from './propertyValueEditors/ExpressionEditor2';
import PropertyMultiValueEditor from './propertyValueEditors/PropertyMultiValueEditor';
import PropertyValueEditor from './propertyValueEditors/PropertyValueEditor';
import PageOperations from '../functions/PageOperations';

interface PropertyEditorProps {
	selectedComponent: string;
	pageExtractor: PageStoreExtractor;
	defPath: string | undefined;
	locationHistory: Array<LocationHistory>;
	theme: string;
	personalizationPath: string | undefined;
	onChangePersonalization: (prop: string, value: any) => void;
	storePaths: Set<string>;
	onShowCodeEditor: (eventName: string) => void;
	slaveStore: any;
	editPageName: string | undefined;
	pageOperations: PageOperations;
	appPath: string | undefined;
}

function updatePropertyDefinition(
	propDef: ComponentPropertyDefinition,
	defPath: string,
	locationHistory: Array<LocationHistory>,
	pageExtractor: PageStoreExtractor,
	component: string,
	propertyName: string,
	value: ComponentProperty<any> | ComponentMultiProperty<any>,
) {
	const pageDef = duplicate(
		getDataFromPath(defPath, locationHistory, pageExtractor),
	) as PageDefinition;
	if (!pageDef.componentDefinition[component].properties)
		pageDef.componentDefinition[component].properties = {};

	if (propDef.multiValued) {
		const newVal = Object.values(value)
			.filter(
				e =>
					!(
						!e.property.location &&
						isNullValue(e.property.value) &&
						isNullValue(e.property.overrideValue)
					),
			)
			.reduce((a, b) => ({ ...a, [b.key]: b }), {});

		if (Object.keys(newVal).length)
			pageDef.componentDefinition[component].properties![propertyName] = newVal;
		else delete pageDef.componentDefinition[component].properties![propertyName];
	} else {
		if (!value.location && isNullValue(value.value) && isNullValue(value.overrideValue)) {
			delete pageDef.componentDefinition[component].properties![propertyName];
		} else {
			pageDef.componentDefinition[component].properties![propertyName] = value;
		}
	}
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
	storePaths,
	onShowCodeEditor,
	slaveStore,
	editPageName,
	pageOperations,
	appPath,
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
					<ExpressionEditor2
						value={def[x[i]]}
						bothModes={true}
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
						storePaths={storePaths}
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
		let valueEditor;

		if (e.multiValued) {
			valueEditor = (
				<PropertyMultiValueEditor
					appPath={appPath}
					pageDefinition={pageDef}
					propDef={e}
					value={def.properties?.[e.name] as ComponentMultiProperty<any>}
					onChange={v =>
						updatePropertyDefinition(
							e,
							defPath!,
							locationHistory,
							pageExtractor,
							selectedComponent,
							e.name,
							v,
						)
					}
					onShowCodeEditor={onShowCodeEditor}
					editPageName={editPageName}
					slaveStore={slaveStore}
					storePaths={storePaths}
					pageOperations={pageOperations}
				/>
			);
		} else {
			valueEditor = (
				<PropertyValueEditor
					appPath={appPath}
					pageDefinition={pageDef}
					propDef={e}
					value={def.properties?.[e.name] as ComponentProperty<any>}
					storePaths={storePaths}
					onChange={v =>
						updatePropertyDefinition(
							e,
							defPath!,
							locationHistory,
							pageExtractor,
							selectedComponent,
							e.name,
							v,
						)
					}
					onShowCodeEditor={onShowCodeEditor}
					editPageName={editPageName}
					slaveStore={slaveStore}
					pageOperations={pageOperations}
				/>
			);
		}

		a[grp].push(
			<div className="_eachProp" key={`${selectedComponent}-${e.name}`}>
				<div className="_propLabel" title={e.description}>
					{e.displayName} :
					<span className="_description" title={e.description}>
						i
					</span>
				</div>
				{valueEditor}
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
						appPath={appPath}
						pageDefinition={pageDef}
						propDef={{
							name: 'name',
							displayName: 'Name',
							description: 'Name to identify the component',
							schema: SCHEMA_STRING_COMP_PROP,
						}}
						value={{ value: def.name }}
						onlyValue={true}
						storePaths={storePaths}
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
						onShowCodeEditor={onShowCodeEditor}
						editPageName={editPageName}
						slaveStore={slaveStore}
						pageOperations={pageOperations}
					/>
				</div>
				<div className="_eachProp">
					<div className="_propLabel" title="Key">
						Key :
						<span className="_description" title="Key Identifier">
							i
						</span>
					</div>
					<PropertyValueEditor
						appPath={appPath}
						pageDefinition={pageDef}
						propDef={{
							name: 'key',
							displayName: 'Key',
							description: 'Key Identifier',
							schema: SCHEMA_STRING_COMP_PROP,
						}}
						value={{ value: def.key }}
						onlyValue={true}
						storePaths={storePaths}
						onChange={v => {}}
						onShowCodeEditor={onShowCodeEditor}
						editPageName={editPageName}
						slaveStore={slaveStore}
						pageOperations={pageOperations}
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
						defaultStateOpen={e[1] === ComponentPropertyGroup.BASIC}
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
