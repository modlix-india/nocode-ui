import {
	ComponentPropertyDefinition,
	StylePropertyDefinition,
	StyleResolution,
} from '../../../types/common';
import { styleProperties as appStyleProperties } from '../../../App/appStyleProperties';
import { styleProperties as messageStyleProperties } from '../../../App/Messages/messageStyleProperies';
import ComponentDefinitions from '../../index';
import { useEffect, useState } from 'react';
import { removeSpecialCharsAndMakeFirstLetterCap } from '../../util/lazyStylePropertyUtil';

export interface VariableEditProps {
	themeGroup: StyleResolution;
	variableName: string;
	value: string;
}

export function Variables({
	theme,
	themeGroup,
	component,
	onThemeChange,
}: Readonly<{
	theme: any;
	themeGroup: StyleResolution;
	component: string;
	onThemeChange: (changedProps: Array<VariableEditProps>) => void;
}>) {
	const [search, setSearch] = useState('');
	const [groupsStatus, setGroupStatus] = useState<Record<string, boolean>>({});
	const [defaultOpen, setDefaultOpen] = useState(true);
	const [filterValues, setFilterValues] = useState<Record<string, string>>({});

	useEffect(() => setGroupStatus({}), [component]);

	let otherProps: StylePropertyDefinition[] | undefined = undefined;

	if (component === '_app' || component === '_message') {
		otherProps = component === '_app' ? appStyleProperties : messageStyleProperties;
	}

	const compDef = ComponentDefinitions.get(component);

	let styleProps = otherProps ?? compDef!.stylePropertiesForTheme;

	const stylePropGroups = Array.from(
		Object.entries(
			styleProps.reduce(
				(groups, prop) => {
					const group = prop.gn ?? 'Default';
					if (!groups[group]) {
						groups[group] = [];
					}
					groups[group].push(prop);
					return groups;
				},
				{} as Record<string, StylePropertyDefinition[]>,
			),
		),
	).map(([group, props]) => (
		<VariableGroup
			key={group}
			search={search}
			groupName={group}
			theme={theme}
			themeGroup={themeGroup}
			component={component}
			onThemeChange={onThemeChange}
			props={props}
			filterValues={filterValues}
			propertiesForTheme={compDef?.propertiesForTheme}
			isGroupOpen={defaultOpen ? !groupsStatus[group] : groupsStatus[group]}
			onToggleGroup={() => setGroupStatus({ ...groupsStatus, [group]: !groupsStatus[group] })}
			styleDefaults={compDef?.styleDefaults}
		/>
	));

	let filterProps: Array<JSX.Element> = [];

	if (compDef?.propertiesForTheme?.length) {
		filterProps = compDef.propertiesForTheme.map(prop => (
			<div key={prop.name} className="_variable">
				<div className="_variableName">{prop.displayName}</div>
				<select
					value={filterValues[prop.name] ?? ''}
					onChange={e =>
						setFilterValues({ ...filterValues, [prop.name]: e.target.value })
					}
				>
					<option value="">All</option>
					{prop.enumValues?.map(value => (
						<option key={value.name} value={value.name}>
							{value.displayName ?? value.name}
						</option>
					))}
				</select>
			</div>
		));
	}

	return (
		<div className="_variables">
			<div className="_filterContainer">
				<div className="_searchBar">
					<input
						type="text"
						placeholder="Filter"
						value={search}
						onChange={e => setSearch(e.target.value)}
					/>
					<button
						className="_smallButton"
						onClick={() => {
							setDefaultOpen(true);
							setGroupStatus({});
						}}
					>
						<svg viewBox="0 0 24 24" fill="none">
							<path
								d="M6 12H18M12 6V18"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
					</button>
					<button
						className="_smallButton"
						onClick={() => {
							setDefaultOpen(false);
							setGroupStatus({});
						}}
					>
						<svg viewBox="0 0 24 24" fill="none">
							<path d="M6 12H18" stroke-linecap="round" stroke-linejoin="round" />
						</svg>
					</button>
				</div>
				{filterProps}
			</div>
			<div className="_variableGroups">{stylePropGroups}</div>
		</div>
	);
}

function VariableGroup({
	search,
	groupName,
	theme,
	themeGroup,
	component,
	onThemeChange,
	propertiesForTheme,
	filterValues,
	props,
	isGroupOpen,
	onToggleGroup,
	styleDefaults,
}: Readonly<{
	search: string;
	groupName: string;
	theme: any;
	themeGroup: StyleResolution;
	component: string;
	onThemeChange: (changedProps: Array<VariableEditProps>) => void;
	propertiesForTheme: ComponentPropertyDefinition[] | undefined;
	filterValues: Record<string, string>;
	props: StylePropertyDefinition[];
	isGroupOpen: boolean;
	onToggleGroup: () => void;
	styleDefaults: Map<string, string> | undefined;
}>) {
	let variables;

	if (isGroupOpen) {
		variables = props
			.filter(prop => !search || prop.dn.toLowerCase().includes(search.toLowerCase()))
			.map(prop => (
				<VariableEdit
					key={prop.n}
					theme={theme}
					themeGroup={themeGroup}
					component={component}
					onThemeChange={onThemeChange}
					prop={prop}
					filterValues={filterValues}
					propertiesForTheme={propertiesForTheme}
					styleDefaults={styleDefaults}
				/>
			));
	}

	const caret = (
		<svg className={`_caret ${isGroupOpen ? '_open' : '_closed'}`} viewBox="0 0 256 256">
			<path d="M96,212a4,4,0,0,1-2.82861-6.82837L170.34326,128,93.17139,50.82837a4.00009,4.00009,0,0,1,5.65722-5.65674l80,80a4,4,0,0,1,0,5.65674l-80,80A3.98805,3.98805,0,0,1,96,212Z" />
		</svg>
	);

	return (
		<div className="_variableGroup">
			<div className="_title" onClick={onToggleGroup}>
				{caret}
				{groupName}
			</div>
			{variables}
		</div>
	);
}

function VariableEdit({
	theme,
	themeGroup,
	component,
	onThemeChange,
	prop,
	filterValues,
	propertiesForTheme,
	styleDefaults,
}: Readonly<{
	theme: any;
	themeGroup: StyleResolution;
	component: string;
	onThemeChange: (changedProps: Array<VariableEditProps>) => void;
	prop: StylePropertyDefinition;
	filterValues: Record<string, string>;
	propertiesForTheme: ComponentPropertyDefinition[] | undefined;
	styleDefaults: Map<string, string> | undefined;
}>) {
	const usedProperties = propertiesForTheme?.filter(
		({ name }) => prop.n.indexOf(`<${name}>`) !== -1,
	);

	const propName = makePropName(prop.n, usedProperties, filterValues);

	const defaultValue = makeValue(
		usedProperties,
		filterValues,
		prop,
		theme,
		themeGroup,
		styleDefaults,
	);
	const [value, setValue] = useState<string>();

	useEffect(() => {
		setValue(makeValue(usedProperties, filterValues, prop, theme, themeGroup, styleDefaults));
	}, [theme, themeGroup, propName, filterValues]);

	return (
		<div className="_variable">
			<div className="_variableName" title={prop.de}>
				{prop.dn}:
			</div>
			<input
				type="text"
				value={value}
				onChange={v => setValue(v.target.value)}
				onBlur={e => {
					if (e.target.value === '') setValue(defaultValue);
					if (e.target.value === defaultValue) return;

					onThemeChange(
						applyPropertiesForTheme(
							[{ themeGroup, variableName: prop.n, value: e.target.value }],
							propertiesForTheme,
							filterValues,
						),
					);
				}}
			/>
		</div>
	);
}

function makeValue(
	usedProperties: ComponentPropertyDefinition[] | undefined,
	filterValues: Record<string, string>,
	prop: StylePropertyDefinition,
	theme: any,
	themeGroup: string,
	styleDefaults: Map<string, string> | undefined,
): string {
	if (!prop) return '';

	if (!usedProperties?.length)
		return (
			theme?.variables?.[themeGroup]?.[prop.n] ??
			theme?.variables?.ALL?.[prop.n] ??
			prop.dv ??
			''
		);

	let propNames = [prop.n];

	for (const property of usedProperties) {
		if (filterValues?.[property.name]) {
			for (let i = 0; i < propNames.length; i++) {
				propNames[i] = propNames[i].replace(
					`<${property.name}>`,
					removeSpecialCharsAndMakeFirstLetterCap(filterValues[property.name]),
				);
			}
		} else {
			const newPropNames: Array<string> = [];
			for (const pn of propNames) {
				for (const enumValue of property.enumValues ?? []) {
					newPropNames.push(
						pn.replace(
							`<${property.name}>`,
							removeSpecialCharsAndMakeFirstLetterCap(enumValue.name),
						),
					);
				}
			}
			propNames = newPropNames;
		}
	}

	return (
		Object.entries(
			propNames
				.map(
					name =>
						theme?.variables?.[themeGroup]?.[name] ??
						theme?.variables?.ALL?.[name] ??
						styleDefaults?.get(name) ??
						prop.dv ??
						'',
				)
				.reduce(
					(acc: Record<string, number>, v: string) => {
						if (v) acc[v] = (acc[v] ?? 0) + 1;
						return acc;
					},
					{} as Record<string, number>,
				),
		).sort((a, b) => (b[1] as number) - (a[1] as number))?.[0]?.[0] ?? ''
	);
}

function makePropName(
	name: string,
	usedProperties: ComponentPropertyDefinition[] | undefined,
	filterValues: Record<string, string>,
) {
	if (!usedProperties?.length) return name;

	for (const property of usedProperties) {
		if (!filterValues[property.name]) continue;
		name = name.replace(
			`<${property.name}>`,
			removeSpecialCharsAndMakeFirstLetterCap(filterValues[property.name]),
		);
	}

	return name;
}

function applyPropertiesForTheme(
	changedProps: Array<VariableEditProps>,
	usedProperties: ComponentPropertyDefinition[] | undefined,
	filterValues: Record<string, string>,
) {
	if (!usedProperties?.length) return changedProps;

	let valuesMade: Array<VariableEditProps> = [changedProps[0]];

	for (const property of usedProperties) {
		if (filterValues[property.name]) {
			for (const value of valuesMade) {
				value.variableName = value.variableName.replace(
					`<${property.name}>`,
					removeSpecialCharsAndMakeFirstLetterCap(filterValues[property.name]),
				);
			}
		} else {
			let newValuesMade: Array<VariableEditProps> = [];
			for (const value of valuesMade) {
				for (const enumValue of property.enumValues ?? []) {
					newValuesMade.push({
						themeGroup: value.themeGroup,
						variableName: value.variableName.replace(
							`<${property.name}>`,
							removeSpecialCharsAndMakeFirstLetterCap(enumValue.name),
						),
						value: value.value,
					});
				}
			}
			if (newValuesMade?.length) {
				valuesMade = newValuesMade;
			}
		}
	}

	return valuesMade;
}
