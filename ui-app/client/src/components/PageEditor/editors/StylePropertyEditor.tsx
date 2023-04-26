import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
	EachComponentStyle,
	StyleResolution,
} from '../../../types/common';
import ComponentDefinitions from '../../';
import { COMPONENT_STYLE_GROUP_PROPERTIES, COMPONENT_STYLE_GROUPS } from '../../util/properties';
import { PropertyGroup } from './PropertyGroup';
import PropertyValueEditor from './propertyValueEditors/PropertyValueEditor';
import { SCHEMA_BOOL_COMP_PROP, SCHEMA_STRING_COMP_PROP } from '../../../constants';
import { StyleResolutionDefinition } from '../../../util/styleProcessor';
import { ComponentStyle } from '../../../types/common';
import { shortUUID } from '../../../util/shortUUID';
import duplicate from '../../../util/duplicate';
import { deepEqual } from '@fincity/kirun-js';

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
	setStyleSelectorPref: (pref: any) => void;
	styleSelectorPref: any;
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
	styleSelectorPref: selectorPref,
	setStyleSelectorPref: setSelectorPref,
}: StylePropertyEditorProps) {
	const [def, setDef] = useState<ComponentDefinition>();
	const [pageDef, setPageDef] = useState<PageDefinition>();
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
		(pref1: string, value1: any) => {
			const newPref = duplicate(selectorPref);
			newPref[selectedComponent] = { ...newPref[selectedComponent], [pref1]: value1 };
			setSelectorPref(newPref);
		},
		[selectedComponent, setSelectorPref, selectorPref],
	);

	const saveStyle = useCallback(
		(newStyleProps: ComponentStyle) => {
			const pageDef = duplicate(
				getDataFromPath(defPath, locationHistory, pageExtractor),
			) as PageDefinition;
			pageDef.componentDefinition[selectedComponent].styleProperties = newStyleProps;
			setData(`${defPath}`, pageDef, pageExtractor.getPageName());
		},
		[defPath, locationHistory, pageExtractor, selectedComponent],
	);

	const defaultStyles: [string, EachComponentStyle] = useMemo(() => {
		const defaultStyles = Object.entries(styleProps ?? {}).filter(e => !e[1].condition);
		if (defaultStyles.length !== 1) {
			if (defaultStyles.length === 0) {
				const key = shortUUID();
				const newStyleProps = duplicate(styleProps ?? {}) as ComponentStyle;
				newStyleProps[key] = { resolutions: { ALL: {} } };
				return [key, {}];
			} else {
				let styles = duplicate(defaultStyles);
				const first = styles[0];
				const newStyleProps = duplicate(styleProps) as ComponentStyle;
				for (let i = 1; i < styles.length; i++) {
					delete newStyleProps[styles[i][0]];
					Object.entries(styles[i][1].resolutions).forEach(e => {
						if (!first[1].resolutions[e[0]]) first[1].resolutions[e[0]] = {};
						Object.assign(first[1].resolutions[e[0]], e[1]);
					});
				}
				newStyleProps[first[0]] = first[1];
				return first;
			}
		}
		return defaultStyles[0];
	}, [styleProps]);

	const properties: [string, EachComponentStyle] = useMemo(() => {
		if (!selectorPref[selectedComponent]?.condition?.value) return defaultStyles;

		const conditionStyles = Object.entries(styleProps ?? {}).filter(
			e => e[1].conditionName === selectorPref[selectedComponent]?.condition?.value,
		)?.[0];
		if (!conditionStyles) return defaultStyles;

		let styles = duplicate(conditionStyles);
		const first = duplicate(defaultStyles);

		Object.entries(styles[1].resolutions).forEach(e => {
			if (!first[1].resolutions[e[0]]) first[1].resolutions[e[0]] = {};
			Object.assign(first[1].resolutions[e[0]], e[1]);
		});

		return [styles[0], first[1]];
	}, [selectorPref, selectedComponent, styleProps, defaultStyles]);

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
					updateSelectorPref('condition', undefined);
					return;
				}
				const state = Object.values(styleProps ?? {}).filter(
					e => e.conditionName === v.value,
				)?.[0]?.pseudoState;
				updateSelectorPref('condition', v);
			}}
			storePaths={storePaths}
		/>
	);

	const conditionNameEditor = selectorPref[selectedComponent]?.condition?.value ? (
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
				saveStyle(newStyleProps);
				updateSelectorPref('condition', v);
			}}
			storePaths={storePaths}
		/>
	) : (
		<></>
	);

	const conditionEditor = selectorPref[selectedComponent]?.condition?.value ? (
		<PropertyValueEditor
			pageDefinition={pageDef}
			propDef={{
				name: 'condition',
				displayName: 'Condition',
				schema: SCHEMA_BOOL_COMP_PROP,
				defaultValue: true,
			}}
			storePaths={storePaths}
			value={
				Object.values(styleProps ?? {}).filter(
					e => e.conditionName === selectorPref[selectedComponent]?.condition?.value,
				)?.[0]?.condition
			}
			onChange={v => {
				const newStyleProps = duplicate(styleProps ?? {}) as ComponentStyle;

				const styleObj = Object.values(newStyleProps ?? {}).filter(
					e => e.conditionName === selectorPref[selectedComponent]?.condition?.value,
				)?.[0];
				if (styleObj) styleObj.condition = v;
				saveStyle(newStyleProps);
			}}
		/>
	) : (
		<></>
	);

	const size = (selectorPref[selectedComponent]?.screenSize?.value as string) ?? 'ALL';
	let iterateProps = properties[1].resolutions?.ALL ?? {};
	if (size !== 'ALL') {
		const sizedProps = properties[1].resolutions?.[size as StyleResolution] ?? {};
		iterateProps = { ...iterateProps, ...sizedProps };
	}

	let subComponentName = '';
	if (selectedSubComponent) {
		subComponentName = selectedSubComponent.split(':')[1];
	}

	let pseudoState = '';
	if (selectorPref[selectedComponent]?.stylePseudoState?.value)
		pseudoState = selectorPref[selectedComponent].stylePseudoState.value;
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
							enumValues: Array.from(StyleResolutionDefinition.values()).sort(
								(a, b) => a.order - b.order,
							),
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
								updateSelectorPref('stylePseudoState', v);
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
								saveStyle(newStyleProps);
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
									saveStyle(newStyleProps);
									updateSelectorPref('condition', undefined);
								}}
							/>
						) : (
							<></>
						)}
					</div>
					{conditionSelector}
					{conditionNameEditor}
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
							let value = iterateProps[prop] ?? {};
							if (pseudoState && iterateProps[`${prop}:${pseudoState}`]) {
								value = { ...value, ...iterateProps[`${prop}:${pseudoState}`] };
							}
							if (subComponentName && iterateProps[`${subComponentName}-${prop}`]) {
								value = {
									...value,
									...iterateProps[`${subComponentName}-${prop}`],
								};
							}
							if (
								pseudoState &&
								iterateProps[`${subComponentName}-${prop}:${pseudoState}`]
							) {
								value = {
									...value,
									...iterateProps[`${subComponentName}-${prop}:${pseudoState}`],
								};
							}
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
										value={value}
										storePaths={storePaths}
										onChange={v => {
											const newProps = duplicate(
												styleProps,
											) as ComponentStyle;
											const screenSize = ((selectorPref[selectedComponent]
												?.screenSize?.value as string) ??
												'ALL') as StyleResolution;
											let value = iterateProps[prop] ?? {};
											if (pseudoState) {
												value = {
													...value,
													...(screenSize === 'ALL'
														? {}
														: properties[1].resolutions?.[screenSize]?.[
																`${prop}:${pseudoState}`
														  ] ?? {}),
													...(iterateProps[`${prop}:${pseudoState}`] ??
														{}),
												};
											}
											if (subComponentName) {
												value = {
													...value,
													...(screenSize === 'ALL'
														? {}
														: properties[1].resolutions?.[screenSize]?.[
																`${subComponentName}-${prop}`
														  ] ?? {}),
													...(iterateProps[
														`${subComponentName}-${prop}`
													] ?? {}),
												};
											}
											if (pseudoState) {
												value = {
													...value,
													...(screenSize === 'ALL'
														? {}
														: properties[1].resolutions?.[screenSize]?.[
																`${subComponentName}-${prop}:${pseudoState}`
														  ] ?? {}),
													...(iterateProps[
														`${subComponentName}-${prop}:${pseudoState}`
													] ?? {}),
												};
											}

											if (selectorPref[selectedComponent]?.condition?.value) {
											}

											let actualProp = prop;
											if (subComponentName && pseudoState) {
												actualProp = `${subComponentName}-${prop}:${pseudoState}`;
											} else if (subComponentName) {
												actualProp = `${subComponentName}-${prop}`;
											} else if (pseudoState) {
												actualProp = `${prop}:${pseudoState}`;
											}

											if (newProps[properties[0]].resolutions) {
												if (
													!newProps[properties[0]].resolutions![
														screenSize
													]
												)
													newProps[properties[0]].resolutions![
														screenSize
													] = {};
												if (
													deepEqual(value, v) ||
													(!v.value &&
														!v.location?.expression &&
														!v.location?.value)
												) {
													delete newProps[properties[0]].resolutions![
														screenSize
													]![actualProp];
												} else {
													if (
														!newProps[properties[0]].resolutions![
															screenSize
														]
													) {
														newProps[properties[0]].resolutions![
															screenSize
														] = {};
													}
													newProps[properties[0]].resolutions![
														screenSize
													]![actualProp] = v;
												}
												saveStyle(newProps);
											}
										}}
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
