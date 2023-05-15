import React, { Component, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
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
	EachComponentResolutionStyle,
} from '../../../types/common';
import ComponentDefinitions from '../../';
import { COMPONENT_STYLE_GROUP_PROPERTIES, COMPONENT_STYLE_GROUPS } from '../../util/properties';
import { PropertyGroup } from './PropertyGroup';
import PropertyValueEditor from './propertyValueEditors/PropertyValueEditor';
import {
	COPY_STYLE_PROPS_KEY,
	SCHEMA_BOOL_COMP_PROP,
	SCHEMA_STRING_COMP_PROP,
} from '../../../constants';
import { StyleResolutionDefinition, processStyleFromString } from '../../../util/styleProcessor';
import { ComponentStyle } from '../../../types/common';
import { shortUUID } from '../../../util/shortUUID';
import duplicate from '../../../util/duplicate';
import { deepEqual } from '@fincity/kirun-js';
import { camelCaseToUpperSpaceCase } from '../../../functions/utils';
import PageOperations from '../functions/PageOperations';

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
	reverseStyleSections?: boolean;
	slaveStore: any;
	editPageName: string | undefined;
	pageOperations: PageOperations;
}

function processOldCondition(styleProps: ComponentStyle | undefined): ComponentStyle {
	if (!styleProps) return { [shortUUID()]: { resolutions: { ALL: {} } } };

	styleProps = duplicate(styleProps);
	let i = 1;
	Object.values(styleProps!)
		.filter(e => !e.conditionName && e.condition)
		.forEach(e => (e.conditionName = `Condition ${i++}`));

	return styleProps!;
}

function getDefaultStyles(styleProps: ComponentStyle | undefined) {
	const inStyles = Object.entries(styleProps ?? {}).filter(e => !e[1].condition);
	if (inStyles.length !== 1) {
		if (inStyles.length === 0) {
			const key = shortUUID();
			const newStyleProps = duplicate(styleProps ?? {}) as ComponentStyle;
			newStyleProps[key] = { resolutions: { ALL: {} } };
			return [key, {}];
		} else {
			let styles = duplicate(inStyles);
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
	return inStyles[0];
}

function getProperties(
	defaultStyles: [string, EachComponentStyle],
	styleProps: ComponentStyle | undefined,
	selectedComponent: string,
	selectorPref: any,
) {
	if (!selectorPref[selectedComponent]?.condition?.value) return duplicate(defaultStyles);

	const conditionStyles = Object.entries(styleProps ?? {}).filter(
		e => e[1].conditionName === selectorPref[selectedComponent]?.condition?.value,
	)?.[0];
	if (!conditionStyles) return duplicate(defaultStyles);

	let styles = duplicate(conditionStyles);
	const first = duplicate(defaultStyles);

	Object.entries(styles[1].resolutions).forEach(e => {
		if (!first[1].resolutions[e[0]]) first[1].resolutions[e[0]] = {};
		Object.assign(first[1].resolutions[e[0]], e[1]);
	});

	return [styles[0], first[1]];
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
	reverseStyleSections,
	slaveStore,
	editPageName,
	pageOperations,
}: StylePropertyEditorProps) {
	const [def, setDef] = useState<ComponentDefinition>();
	const [pageDef, setPageDef] = useState<PageDefinition>();
	const [styleProps, setStyleProps] = useState<ComponentStyle>();
	const [showAdvanced, setShowAdvanced] = useState<Array<string>>([]);

	const [properties, setProperties] = useState<[string, EachComponentStyle]>();

	useEffect(
		() =>
			addListenerAndCallImmediatelyWithChildrenActivity(
				(_, v: PageDefinition) => {
					setPageDef(v);
					if (!v) return;
					const inDef = v.componentDefinition[selectedComponent];
					setDef(inDef);
					const props = processOldCondition(inDef?.styleProperties);
					setStyleProps(props);
					setProperties(
						getProperties(
							getDefaultStyles(props),
							props,
							selectedComponent,
							selectorPref,
						),
					);
				},
				pageExtractor,
				defPath!,
			),
		[defPath, selectedComponent],
	);

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
			const newPDef = duplicate(
				getDataFromPath(defPath, locationHistory, pageExtractor),
			) as PageDefinition;
			newPDef.componentDefinition[selectedComponent].styleProperties = newStyleProps;
			setData(`${defPath}`, newPDef, pageExtractor.getPageName());
		},
		[defPath, locationHistory, pageExtractor, selectedComponent],
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
			editPageName={editPageName}
			slaveStore={slaveStore}
			pageOperations={pageOperations}
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
			editPageName={editPageName}
			slaveStore={slaveStore}
			pageOperations={pageOperations}
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
			editPageName={editPageName}
			slaveStore={slaveStore}
			pageOperations={pageOperations}
		/>
	) : (
		<></>
	);

	const size = (selectorPref[selectedComponent]?.screenSize?.value as string) ?? 'ALL';
	let iterateProps = properties?.[1].resolutions?.ALL ?? {};
	if (size !== 'ALL') {
		const sizedProps = properties?.[1].resolutions?.[size as StyleResolution] ?? {};
		iterateProps = { ...iterateProps, ...sizedProps };
	}

	const hasSubComponents = new Set<string>();
	const hasPseudoStates = new Set<string>();
	Object.keys(iterateProps).forEach(e => {
		let splits = e.split(':');
		if (splits.length > 1) hasPseudoStates.add(splits[1]);
		else hasPseudoStates.add('');
		splits = e.split('-');
		if (splits.length > 1) hasSubComponents.add(splits[0]);
		else hasSubComponents.add('');
	});

	let subComponentName = '';
	if (selectedSubComponent) {
		subComponentName = selectedSubComponent.split(':')[1];
	}
	const subComponentSectionsArray = (cd?.styleProperties ?? {})[subComponentName];
	const styleSectionsToShow = reverseStyleSections
		? Object.values(COMPONENT_STYLE_GROUP_PROPERTIES).filter(
				each => subComponentSectionsArray.findIndex(e => e === each.name) === -1,
		  )
		: subComponentSectionsArray.map(each => COMPONENT_STYLE_GROUP_PROPERTIES[each]);

	let pseudoState = '';
	if (selectorPref[selectedComponent]?.stylePseudoState?.value)
		pseudoState = selectorPref[selectedComponent].stylePseudoState.value;
	return (
		<div className="_propertyEditor">
			<div className="_eachStyleClass">
				<div className="_propLabel">
					<button onClick={() => saveStyle({})} title="Clear Styles">
						<i className="fa fa-regular fa-trash-can" /> Clear
					</button>
					<button
						onClick={() => {
							if (!navigator?.clipboard) return;
							navigator.clipboard.write([
								new ClipboardItem({
									'text/plain': new Blob(
										[COPY_STYLE_PROPS_KEY + JSON.stringify(styleProps ?? {})],
										{
											type: 'text/plain',
										},
									),
								}),
							]);
						}}
						title="Copy Styles"
					>
						<i className="fa fa-regular fa-clipboard" /> Copy
					</button>
					<button
						onClick={() => {
							if (!navigator?.clipboard) return;
							navigator.clipboard.readText().then(data => {
								if (!data.startsWith(COPY_STYLE_PROPS_KEY)) {
									if (!properties || !data) return;

									const pastedStyles = processStyleFromString(data);

									if (!Object.keys(pastedStyles).length) {
										return;
									}

									const newProps = duplicate(styleProps) as ComponentStyle;
									const screenSize = ((selectorPref[selectedComponent]?.screenSize
										?.value as string) ?? 'ALL') as StyleResolution;

									if (!newProps[properties[0]])
										newProps[properties[0]] = { resolutions: {} };

									if (!newProps[properties[0]].resolutions)
										newProps[properties[0]].resolutions = {};

									if (!newProps[properties[0]].resolutions![screenSize])
										newProps[properties[0]].resolutions![screenSize] = {};

									const styleObj =
										newProps[properties[0]].resolutions![screenSize];

									Object.entries(pastedStyles).forEach(
										([prop, v]: [string, string]) => {
											let actualProp = prop;
											if (pseudoState) actualProp = `${prop}:${pseudoState}`;
											if (subComponentName)
												actualProp = `${subComponentName}-${actualProp}`;
											if (!styleObj![actualProp])
												styleObj![actualProp] = { value: v };
											else
												styleObj![actualProp] = {
													...styleObj![actualProp],
													value: v,
												};
										},
									);

									saveStyle(newProps);
									return;
								}
								const copiedStyleProps = JSON.parse(
									data.replace(COPY_STYLE_PROPS_KEY, ''),
								);
								const newStyleProps = Object.entries(copiedStyleProps).reduce(
									(a, [key, value]) => {
										a[shortUUID()] = value as EachComponentStyle;
										return a;
									},
									{} as ComponentStyle,
								);
								saveStyle(newStyleProps);
							});
						}}
						title="Paste Styles"
					>
						<i className="fa fa-regular fa-paste" /> Paste
					</button>
				</div>
			</div>
			<div className="_overflowContainer">
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
								enumValues: Array.from(StyleResolutionDefinition.values())
									.map(e => {
										if (
											properties?.[1].resolutions?.[
												e.name as StyleResolution
											] &&
											Object.keys(
												properties?.[1].resolutions?.[
													e.name as StyleResolution
												] ?? {},
											).length
										)
											return { ...e, displayName: `★ ${e.displayName}` };
										return e;
									})
									.sort((a, b) => a.order - b.order),
							}}
							value={selectorPref[selectedComponent]?.screenSize}
							onlyValue={true}
							onChange={v => updateSelectorPref('screenSize', v)}
							storePaths={storePaths}
							editPageName={editPageName}
							slaveStore={slaveStore}
							pageOperations={pageOperations}
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
										displayName:
											(hasSubComponents.has(name) ? '★ ' : '') +
											(name === ''
												? 'Component'
												: camelCaseToUpperSpaceCase(name)),
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
								editPageName={editPageName}
								slaveStore={slaveStore}
								pageOperations={pageOperations}
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
										{
											name: '',
											displayName: hasPseudoStates.has('')
												? '★ Default'
												: 'Default',
											description: 'No State',
										},
										...pseudoStates.map(name => ({
											name,
											displayName:
												(hasPseudoStates.has(name) ? '★ ' : '') +
												name.toUpperCase(),
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
								editPageName={editPageName}
								slaveStore={slaveStore}
								pageOperations={pageOperations}
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
										const newStyleProps = duplicate(
											styleProps,
										) as ComponentStyle;
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

				{styleSectionsToShow.map(group => {
					const isAdvancedSelected = showAdvanced.findIndex(e => e === group.name) !== -1;

					const withValueProps: string[] = [];
					const withoutValueProps: string[] = [];
					const advancedProps: string[] = [];

					const props: ReactNode[] = [];

					const prefix = subComponentName ? `${subComponentName}-` : '';
					const postfix = pseudoState ? `:${pseudoState}` : '';

					COMPONENT_STYLE_GROUPS[group.name].forEach(prop => {
						if (iterateProps[prefix + prop]) withValueProps.push(prop);
						else if (postfix && iterateProps[prefix + prop + postfix])
							withValueProps.push(prop);
						else withoutValueProps.push(prop);
					});

					group.advanced?.forEach(prop => {
						if (iterateProps[prefix + prop]) withValueProps.push(prop);
						else if (postfix && iterateProps[prefix + prop + postfix])
							withValueProps.push(prop);
						else advancedProps.push(prop);
					});

					let i = 0;
					for (const eachGroup of [withValueProps, withoutValueProps, advancedProps]) {
						if (i === 2 && eachGroup.length) {
							props.push(
								<div className="_eachProp" key="advancedCheckBox">
									<label
										className="_propLabel"
										htmlFor={`${group.name}_showAdvanced`}
									>
										<input
											className="_peInput"
											type="checkbox"
											checked={isAdvancedSelected}
											onChange={e => {
												if (isAdvancedSelected)
													setShowAdvanced(
														showAdvanced.filter(e => e !== group.name),
													);
												else setShowAdvanced([...showAdvanced, group.name]);
											}}
											id={`${group.name}_showAdvanced`}
										/>
										Show Advanced Properties
									</label>
								</div>,
							);
						}
						if (i === 2 && !isAdvancedSelected) break;
						for (const prop of eachGroup) {
							props.push(
								<EachPropEditor
									key={prop}
									subComponentName={subComponentName}
									pseudoState={pseudoState}
									prop={prop}
									iterateProps={iterateProps}
									pageDef={pageDef}
									editPageName={editPageName}
									slaveStore={slaveStore}
									storePaths={storePaths}
									selectorPref={selectorPref}
									styleProps={styleProps}
									selectedComponent={selectedComponent}
									saveStyle={saveStyle}
									properties={properties}
									pageOperations={pageOperations}
								/>,
							);
						}
						i++;
					}

					return (
						<PropertyGroup
							key={group.name}
							name={group.name}
							displayName={group.displayName + (withValueProps.length ? ' ★' : '')}
							defaultStateOpen={false}
							pageExtractor={pageExtractor}
							locationHistory={locationHistory}
							onChangePersonalization={onChangePersonalization}
							personalizationPath={personalizationPath}
						>
							{props}
						</PropertyGroup>
					);
				})}
			</div>
		</div>
	);
}

function EachPropEditor({
	subComponentName,
	pseudoState,
	iterateProps,
	prop,
	pageDef,
	editPageName,
	slaveStore,
	storePaths,
	selectorPref,
	styleProps,
	selectedComponent,
	saveStyle,
	properties,
	pageOperations,
}: {
	pseudoState: string;
	subComponentName: string;
	prop: string;
	iterateProps: any;
	pageDef: PageDefinition | undefined;
	editPageName: string | undefined;
	slaveStore: any;
	storePaths: Set<string>;
	selectorPref: any;
	styleProps: ComponentStyle | undefined;
	selectedComponent: string;
	saveStyle: (newStyleProps: ComponentStyle) => void;
	properties: [string, EachComponentStyle] | undefined;
	pageOperations: PageOperations;
}) {
	const compProp = subComponentName ? `${subComponentName}-${prop}` : prop;
	let value = iterateProps[compProp] ?? {};
	const actualProp = pseudoState ? `${compProp}:${pseudoState}` : compProp;
	if (pseudoState && iterateProps[`${compProp}:${pseudoState}`]) {
		value = { ...value, ...iterateProps[`${compProp}:${pseudoState}`] };
	}

	if (!properties) return <></>;

	let propName = prop.replace(/([A-Z])/g, ' $1');
	propName = propName[0].toUpperCase() + propName.slice(1);

	const screenSize = ((selectorPref[selectedComponent]?.screenSize?.value as string) ??
		'ALL') as StyleResolution;

	return (
		<div className="_eachProp">
			<div className="_propLabel" title={propName}>
				{propName}:{' '}
				{(pseudoState && iterateProps[compProp]) ||
				(screenSize !== 'ALL' &&
					(properties[1]?.resolutions?.ALL?.[compProp] ||
						properties[1]?.resolutions?.ALL?.[actualProp])) ? (
					<span title="Has a default value">★</span>
				) : (
					''
				)}
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
				editPageName={editPageName}
				slaveStore={slaveStore}
				onChange={v => {
					const newProps = duplicate(styleProps) as ComponentStyle;

					if (!newProps[properties[0]]) newProps[properties[0]] = { resolutions: {} };

					if (!newProps[properties[0]].resolutions)
						newProps[properties[0]].resolutions = {};

					if (!newProps[properties[0]].resolutions![screenSize])
						newProps[properties[0]].resolutions![screenSize] = {};

					if (
						(pseudoState && deepEqual(v, iterateProps[compProp] ?? {})) ||
						(!v.value && !v.location?.expression && !v.location?.value)
					) {
						delete newProps[properties[0]].resolutions![screenSize]![actualProp];
					} else {
						newProps[properties[0]].resolutions![screenSize]![actualProp] = v;
					}

					saveStyle(newProps);
				}}
				pageOperations={pageOperations}
			/>
		</div>
	);
}
