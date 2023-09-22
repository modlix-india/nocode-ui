import { deepEqual, duplicate, isNullValue } from '@fincity/kirun-js';
import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import ComponentDefinitions from '../../';
import {
	COPY_STYLE_PROPS_KEY,
	SCHEMA_BOOL_COMP_PROP,
	SCHEMA_STRING_COMP_PROP,
} from '../../../constants';
import {
	PageStoreExtractor,
	addListenerAndCallImmediatelyWithChildrenActivity,
	getDataFromPath,
	setData,
} from '../../../context/StoreContext';
import { camelCaseToUpperSpaceCase } from '../../../functions/utils';
import {
	ComponentDefinition,
	ComponentPropertyEditor,
	ComponentStyle,
	EachComponentStyle,
	LocationHistory,
	PageDefinition,
	StyleResolution,
} from '../../../types/common';
import { shortUUID } from '../../../util/shortUUID';
import { StyleResolutionDefinition, processStyleFromString } from '../../../util/styleProcessor';
import { COMPONENT_STYLE_GROUPS, COMPONENT_STYLE_GROUP_PROPERTIES } from '../../util/properties';
import PageOperations from '../functions/PageOperations';
import { PropertyGroup } from './PropertyGroup';
import PropertyValueEditor from './propertyValueEditors/PropertyValueEditor';
import { PseudoStateSelector } from './stylePropertyValueEditors/PseudoStateSelector';
import { ScreenSizeSelector } from './stylePropertyValueEditors/ScreenSizeSelector';
import { TypographyEditor } from './stylePropertyValueEditors/TypographyEditor';
import { StyleEditorsProps } from './stylePropertyValueEditors/simpleEditors';

const STYLE_GRP_EDITOR: Map<string, React.ElementType> = new Map([
	['typography', TypographyEditor],
]);

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
	appPath: string | undefined;
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
	appPath,
}: StylePropertyEditorProps) {
	const [def, setDef] = useState<ComponentDefinition>();
	const [pageDef, setPageDef] = useState<PageDefinition>();
	const [appDef, setAppDef] = useState<any>();
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
		[defPath, selectedComponent, selectorPref],
	);

	useEffect(() => {
		if (isNullValue(appPath)) return undefined;

		return addListenerAndCallImmediatelyWithChildrenActivity(
			(_, v) => setAppDef(v),
			pageExtractor,
			appPath!,
		);
	}, [appPath, pageExtractor, setAppDef]);

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
	const subComponentSectionsArray = (cd?.styleProperties ?? {})[subComponentName] ?? [];

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
				<div className="_propLabel _styleButtonContainer">
					<button onClick={() => saveStyle({})} title="Clear Styles">
						<svg
							width="10"
							height="12"
							viewBox="0 0 10 12"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path d="M9.29119 1.09029H5.88995V0.983634C5.88995 0.438487 5.45146 0 4.90632 0C4.36117 0 3.92268 0.438487 3.92268 0.983634V1.09029H0.521444C0.23702 1.09029 0 1.32731 0 1.61174C0 1.89616 0.23702 2.13318 0.521444 2.13318H9.29119C9.57561 2.13318 9.81263 1.89616 9.81263 1.61174C9.81263 1.32731 9.57561 1.09029 9.29119 1.09029Z" />
							<path d="M8.91185 2.84424H0.900574C0.793915 2.84424 0.710958 2.93905 0.722809 3.04571L1.63534 10.3341C1.70644 10.8555 2.14493 11.2585 2.67822 11.2585H7.1342C7.6675 11.2585 8.10599 10.8674 8.17709 10.3341L9.08962 3.04571C9.10147 2.93905 9.01851 2.84424 8.91185 2.84424Z" />
						</svg>
						Clear
					</button>
					<div className="_seperator" />
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
						<svg
							width="10"
							height="11"
							viewBox="0 0 10 11"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path d="M7.17391 0.717391V1.43478H2.63043C2.31333 1.43478 2.00921 1.56075 1.78498 1.78498C1.56075 2.00921 1.43478 2.31333 1.43478 2.63043V9.08696H0.717391C0.527127 9.08696 0.344656 9.01137 0.210119 8.87684C0.075582 8.7423 0 8.55983 0 8.36957V0.717391C0 0.527127 0.075582 0.344656 0.210119 0.210119C0.344656 0.075582 0.527127 0 0.717391 0H6.45652C6.64679 0 6.82926 0.075582 6.96379 0.210119C7.09833 0.344656 7.17391 0.527127 7.17391 0.717391Z" />
							<path d="M8.36961 1.91309H2.63048C2.23427 1.91309 1.91309 2.23427 1.91309 2.63048V10.2827C1.91309 10.6789 2.23427 11 2.63048 11H8.36961C8.76581 11 9.087 10.6789 9.087 10.2827V2.63048C9.087 2.23427 8.76581 1.91309 8.36961 1.91309Z" />
						</svg>
						Copy
					</button>
					<div className="_seperator" />
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
						<svg
							width="10"
							height="11"
							viewBox="0 0 10 11"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path d="M7.17391 0.717391V1.43478H2.63043C2.31333 1.43478 2.00921 1.56075 1.78498 1.78498C1.56075 2.00921 1.43478 2.31333 1.43478 2.63043V9.08696H0.717391C0.527127 9.08696 0.344656 9.01137 0.210119 8.87684C0.075582 8.7423 0 8.55983 0 8.36957V0.717391C0 0.527127 0.075582 0.344656 0.210119 0.210119C0.344656 0.075582 0.527127 0 0.717391 0H6.45652C6.64679 0 6.82926 0.075582 6.96379 0.210119C7.09833 0.344656 7.17391 0.527127 7.17391 0.717391Z" />
							<path d="M8.36961 1.91309H2.63048C2.23427 1.91309 1.91309 2.23427 1.91309 2.63048V10.2827C1.91309 10.6789 2.23427 11 2.63048 11H8.36961C8.76581 11 9.087 10.6789 9.087 10.2827V2.63048C9.087 2.23427 8.76581 1.91309 8.36961 1.91309Z" />
						</svg>
						Paste
					</button>
				</div>
			</div>
			<div className="_overflowContainer _withCopyButtons">
				<PropertyGroup
					name="selector"
					displayName="Selector"
					defaultStateOpen={true}
					pageExtractor={pageExtractor}
					locationHistory={locationHistory}
					onChangePersonalization={onChangePersonalization}
					personalizationPath={personalizationPath}
					tabName={reverseStyleSections ? 'advancedStyles' : 'styles'}
				>
					<div>
						<div className="_eachProp">
							<ScreenSizeSelector
								size={size}
								onChange={v => updateSelectorPref('screenSize', { value: v })}
							/>
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
												return {
													...e,
													displayName: `★ ${e.displayName}`,
												};
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
						{pseudoStates.length ? (
							<div className="_eachProp">
								<PseudoStateSelector
									state={selectorPref[selectedComponent]?.stylePseudoState?.value}
									pseudoStates={pseudoStates}
									onChange={v => {
										updateSelectorPref('stylePseudoState', { value: v });
									}}
								/>
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
										const newStyleProps = duplicate(
											styleProps,
										) as ComponentStyle;
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
										if (
											selectorPref[selectedComponent]?.stylePseudoState?.value
										)
											newStyleProps[key].pseudoState =
												selectorPref[
													selectedComponent
												].stylePseudoState.value;
										saveStyle(newStyleProps);
										updateSelectorPref('condition', {
											value: `Condition ${i}`,
										});
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
													selectorPref[selectedComponent]?.condition
														?.value,
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
					</div>
				</PropertyGroup>

				{styleSectionsToShow.map(group => {
					const isAdvancedSelected = true; //showAdvanced.findIndex(e => e === group.name) !== -1;

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
							// props.push(
							// 	<div className="_eachProp" key="advancedCheckBox">
							// 		<label
							// 			className="_propLabel"
							// 			htmlFor={`${group.name}_showAdvanced`}
							// 		>
							// 			<input
							// 				className="_peInput"
							// 				type="checkbox"
							// 				checked={isAdvancedSelected}
							// 				onChange={e => {
							// 					if (isAdvancedSelected)
							// 						setShowAdvanced(
							// 							showAdvanced.filter(e => e !== group.name),
							// 						);
							// 					else setShowAdvanced([...showAdvanced, group.name]);
							// 				}}
							// 				id={`${group.name}_showAdvanced`}
							// 			/>
							// 			Show Advanced Properties
							// 		</label>
							// 	</div>,
							// );
						}
						if (i === 2 && !isAdvancedSelected) break;
						for (const prop of eachGroup) {
							props.push(
								<EachPropEditor
									appDef={appDef}
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

					let editors = [];

					editors.push(<div key="advanedEditor">{props}</div>);

					if (STYLE_GRP_EDITOR.has(group.name)) {
						const SpecificEditor = STYLE_GRP_EDITOR.get(group.name)!;
						editors.push(
							<SpecificEditor
								key="specificEditor"
								appDef={appDef}
								subComponentName={subComponentName}
								pseudoState={pseudoState}
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

					return (
						<PropertyGroup
							tabName={reverseStyleSections ? 'advancedStyles' : 'styles'}
							key={group.name}
							name={group.name}
							showStar={withValueProps.length ? true : false}
							displayName={group.displayName}
							defaultStateOpen={false}
							pageExtractor={pageExtractor}
							locationHistory={locationHistory}
							onChangePersonalization={onChangePersonalization}
							personalizationPath={personalizationPath}
						>
							{editors}
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
}: StyleEditorsProps & { prop: string }) {
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
