import React, { useCallback, useEffect, useState } from 'react';
import {
	PageStoreExtractor,
	addListenerAndCallImmediatelyWithChildrenActivity,
	getDataFromPath,
	setData,
} from '../../../context/StoreContext';
import {
	ComponentDefinition,
	LocationHistory,
	PageDefinition,
	ComponentPropertyEditor,
} from '../../../types/common';
import ComponentDefinitions from '../../';
import { COMPONENT_STYLE_GROUP_PROPERTIES, COMPONENT_STYLE_GROUPS } from '../../util/properties';
import { PropertyGroup } from './PropertyGroup';
import PropertyValueEditor from './propertyValueEditors/PropertyValueEditor';
import { SCHEMA_STRING_COMP_PROP } from '../../../constants';
import { StyleResolutionDefinition } from '../../../util/styleProcessor';
import { ComponentStyle } from '../../../types/common';
import { shortUUID } from '../../../util/shortUUID';
import duplicate from '../../../util/duplicate';

interface StylePropertyEditorProps {
	selectedComponent: string;
	pageExtractor: PageStoreExtractor;
	defPath: string | undefined;
	locationHistory: Array<LocationHistory>;
	theme: string;
	personalizationPath: string | undefined;
	onChangePersonalization: (prop: string, value: any) => void;
	storePaths: Set<string>;
	selectedSubComponent: string;
	onSelectedSubComponentChanged: (key: string) => void;
}

function makeObject(pref: any = {}, styles: any = {}) {}

function processOldCondition(styleProps: ComponentStyle | undefined): ComponentStyle {
	if (!styleProps) return { [shortUUID()]: { resolutions: { ALL: {} } } };

	styleProps = duplicate(styleProps);
	let i = 1;
	Object.values(styleProps!)
		.filter(e => !e.conditionName && e.condition)
		.forEach(e => (e.conditionName = `Condition ${i++}`));

	return styleProps!;
}

export default function StylePropertyEditor({
	selectedComponent,
	defPath,
	locationHistory,
	pageExtractor,
	onChangePersonalization,
	theme,
	personalizationPath,
	storePaths,
	selectedSubComponent,
	onSelectedSubComponentChanged,
}: StylePropertyEditorProps) {
	const [def, setDef] = useState<ComponentDefinition>();
	const [pageDef, setPageDef] = useState<PageDefinition>();
	const [selectorPref, setSelectorPref] = useState<any>({});
	const [styleProps, setStyleProps] = useState<ComponentStyle>();

	useEffect(
		() =>
			addListenerAndCallImmediatelyWithChildrenActivity(
				(_, v: PageDefinition) => {
					setPageDef(v);
				},
				pageExtractor,
				defPath!,
			),
		[defPath, selectedComponent],
	);

	useEffect(() => {
		const inDef = pageDef?.componentDefinition[selectedComponent];
		setDef(inDef);
		const props = processOldCondition(inDef?.styleProperties);
		setStyleProps(props);
	}, [pageDef, selectedComponent]);

	const updateSelectorPref = useCallback(
		(pref1: string, value1: any, pref2?: string, value2?: any) => {
			const newPref = { ...selectorPref };
			newPref[selectedComponent] = { ...newPref[selectedComponent], [pref1]: value1 };
			if (pref2) newPref[selectedComponent][pref2] = value2;
			setSelectorPref(newPref);
		},
		[selectedComponent, setSelectorPref, selectorPref],
	);

	if (!def) return <></>;

	const cd = ComponentDefinitions.get(def.type);

	const subComponentsList = Object.keys(cd?.styleProperties ?? { '': {} });
	const pseudoStates = cd?.stylePseudoStates ?? [];
	const conditions = !styleProps
		? []
		: Object.values(styleProps)
				.filter(e => e.condition)
				.map(e => ({
					name: e.conditionName!,
					displayName: e.conditionName!,
					description: '',
				}));

	const properties = makeObject(selectorPref[selectedComponent], styleProps);

	const conditionSelector = (
		<PropertyValueEditor
			pageDefinition={pageDef}
			propDef={{
				name: 'condition',
				displayName: 'Condition',
				schema: SCHEMA_STRING_COMP_PROP,
				editor: ComponentPropertyEditor.ENUM,
				defaultValue: '',
				enumValues: [
					{
						name: '',
						displayName: 'None',
						description: 'No Condition',
					},
					...conditions,
				],
			}}
			value={selectorPref[selectedComponent]?.condition}
			onlyValue={true}
			onChange={v => {
				if (v.value === '' || !v) {
					updateSelectorPref('condition', undefined, 'stylePseudoState', undefined);
					return;
				}
				const state = Object.values(styleProps ?? {}).filter(
					e => e.conditionName === v.value,
				)?.[0]?.pseudoState;
				updateSelectorPref(
					'condition',
					v,
					'stylePseudoState',
					state ? { value: state } : undefined,
				);
			}}
			storePaths={storePaths}
		/>
	);

	const conditionEditor = selectorPref[selectedComponent]?.condition?.value ? (
		<PropertyValueEditor
			pageDefinition={pageDef}
			propDef={{
				name: 'conditionName',
				displayName: 'Condition Name',
				schema: SCHEMA_STRING_COMP_PROP,
				defaultValue: selectorPref[selectedComponent]?.condition?.value,
			}}
			value={selectorPref[selectedComponent]?.condition}
			onlyValue={true}
			onChange={v => {
				if (!v?.value) return;
				const newStyleProps = duplicate(styleProps) as ComponentStyle;
				Object.values(newStyleProps).forEach(e => {
					if (e.conditionName !== selectorPref[selectedComponent]?.condition?.value)
						return;
					e.conditionName = v.value;
				});
				const pageDef = duplicate(
					getDataFromPath(defPath, locationHistory, pageExtractor),
				) as PageDefinition;
				pageDef.componentDefinition[selectedComponent].styleProperties = newStyleProps;
				setData(`${defPath}`, pageDef, pageExtractor.getPageName());
				updateSelectorPref('condition', v);
			}}
			storePaths={storePaths}
		/>
	) : (
		<></>
	);

	return (
		<div className="_propertyEditor">
			<PropertyGroup
				name="selector"
				displayName="Selector"
				defaultStateOpen={true}
				pageExtractor={pageExtractor}
				locationHistory={locationHistory}
				onChangePersonalization={onChangePersonalization}
				personalizationPath={personalizationPath}
			>
				<div className="_eachProp">
					<div className="_propLabel" title="Screen Size">
						Screen Size:
					</div>
					<PropertyValueEditor
						pageDefinition={pageDef}
						propDef={{
							name: 'screenSize',
							displayName: 'Screen Size',
							schema: SCHEMA_STRING_COMP_PROP,
							editor: ComponentPropertyEditor.ENUM,
							defaultValue: 'ALL',
							enumValues: Array.from(StyleResolutionDefinition.values()),
						}}
						value={selectorPref[selectedComponent]?.screenSize}
						onlyValue={true}
						onChange={v => updateSelectorPref('screenSize', v)}
						storePaths={storePaths}
					/>
				</div>
				{subComponentsList.length !== 1 ? (
					<div className="_eachProp">
						<div className="_propLabel" title="Subcomponent">
							Sub Component:
						</div>
						<PropertyValueEditor
							pageDefinition={pageDef}
							propDef={{
								name: 'subcomponent',
								displayName: 'Sub Component',
								schema: SCHEMA_STRING_COMP_PROP,
								editor: ComponentPropertyEditor.ENUM,
								defaultValue: '',
								enumValues: subComponentsList.map(name => ({
									name,
									displayName: name === '' ? 'Component' : name.toUpperCase(),
									description: '',
								})),
							}}
							value={{
								value:
									selectedSubComponent === ''
										? selectedSubComponent
										: selectedSubComponent.split(':')[1],
							}}
							onlyValue={true}
							onChange={v =>
								onSelectedSubComponentChanged(
									!v.value ? '' : `${selectedComponent}:${v.value}`,
								)
							}
							storePaths={storePaths}
						/>
					</div>
				) : (
					<></>
				)}
				{pseudoStates.length ? (
					<div className="_eachProp">
						<div className="_propLabel" title="Pseudo State">
							Pseudo State:
						</div>
						<PropertyValueEditor
							pageDefinition={pageDef}
							propDef={{
								name: 'stylePseudoState',
								displayName: 'Pseudo State',
								schema: SCHEMA_STRING_COMP_PROP,
								editor: ComponentPropertyEditor.ENUM,
								defaultValue: '',
								enumValues: [
									{ name: '', displayName: 'Default', description: 'No State' },
									...pseudoStates.map(name => ({
										name,
										displayName: name.toUpperCase(),
										description: '',
									})),
								],
							}}
							value={selectorPref[selectedComponent]?.stylePseudoState}
							onlyValue={true}
							onChange={v => {
								updateSelectorPref('stylePseudoState', v, 'condition', undefined);
							}}
							storePaths={storePaths}
						/>
					</div>
				) : (
					<></>
				)}
				<div className="_eachProp">
					<div className="_propLabel" title="Conditional Application">
						Conditional Application:
						<i
							className="fa fa-solid fa-square-plus"
							onClick={() => {
								const newStyleProps = duplicate(styleProps) as ComponentStyle;
								const conditionNames = new Set(
									Object.values(newStyleProps).map(e => e.conditionName),
								);
								let i = 0;
								while (conditionNames.has(`Condition ${i}`)) i++;
								const key = shortUUID();
								newStyleProps[key] = {
									resolutions: { ALL: {} },
									conditionName: `Condition ${i}`,
									condition: { value: true },
								};
								if (selectorPref[selectedComponent]?.stylePseudoState?.value)
									newStyleProps[key].pseudoState =
										selectorPref[selectedComponent].stylePseudoState.value;
								const pageDef = duplicate(
									getDataFromPath(defPath, locationHistory, pageExtractor),
								) as PageDefinition;
								pageDef.componentDefinition[selectedComponent].styleProperties =
									newStyleProps;
								setData(`${defPath}`, pageDef, pageExtractor.getPageName());
								updateSelectorPref('condition', { value: `Condition ${i}` });
							}}
						></i>
						{selectorPref[selectedComponent]?.condition?.value ? (
							<i
								className="fa fa-regular fa-trash-can"
								onClick={() => {
									const newStyleProps = duplicate(styleProps) as ComponentStyle;
									const conditionKey = Object.entries(newStyleProps).find(
										([_, e]) =>
											e.conditionName ===
											selectorPref[selectedComponent]?.condition?.value,
									)?.[0];
									if (conditionKey) delete newStyleProps[conditionKey];

									const pageDef = duplicate(
										getDataFromPath(defPath, locationHistory, pageExtractor),
									) as PageDefinition;
									pageDef.componentDefinition[selectedComponent].styleProperties =
										newStyleProps;
									setData(`${defPath}`, pageDef, pageExtractor.getPageName());
									updateSelectorPref('condition', undefined);
								}}
							/>
						) : (
							<></>
						)}
					</div>
					{conditionSelector}
					{conditionEditor}
				</div>
			</PropertyGroup>

			{Object.values(COMPONENT_STYLE_GROUP_PROPERTIES).map(group => {
				return (
					<PropertyGroup
						key={group.name}
						name={group.name}
						displayName={group.displayName}
						defaultStateOpen={true}
						pageExtractor={pageExtractor}
						locationHistory={locationHistory}
						onChangePersonalization={onChangePersonalization}
						personalizationPath={personalizationPath}
					>
						{COMPONENT_STYLE_GROUPS[group.name].map(prop => {
							return (
								<div className="_eachProp" key={prop}>
									<div className="_propLabel" title="Name">
										{prop.replace(/([A-Z])/g, ' $1')}:
									</div>
									<PropertyValueEditor
										pageDefinition={pageDef}
										propDef={{
											name: prop,
											displayName: '',
											schema: SCHEMA_STRING_COMP_PROP,
										}}
										value={{ value: def.name }}
										storePaths={storePaths}
										onChange={v => {}}
									/>
								</div>
							);
						})}
					</PropertyGroup>
				);
			})}
		</div>
	);
}
