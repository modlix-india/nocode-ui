import type { JSX } from 'react';
import {
	ComponentPropertyDefinition,
	StylePropertyDefinition,
	StyleResolution,
} from '../../../types/common';
import { useEffect, useMemo, useState } from 'react';
import { removeSpecialCharsAndMakeFirstLetterCap } from '../../util/lazyStylePropertyUtil';
import { ThemableComponent, themableComponent, themableComponents } from './themableComponents';

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
	onComponentChange,
}: Readonly<{
	theme: any;
	themeGroup: StyleResolution;
	component: string;
	onThemeChange: (changedProps: Array<VariableEditProps>) => void;
	onComponentChange?: (component: string) => void;
}>) {
	const [search, setSearch] = useState('');
	const [searchAll, setSearchAll] = useState(true);
	const [onlyOverridden, setOnlyOverridden] = useState(false);
	const [groupsStatus, setGroupStatus] = useState<Record<string, boolean>>({});
	const [defaultOpen, setDefaultOpen] = useState(true);
	const [filterValues, setFilterValues] = useState<Record<string, string>>({});

	useEffect(() => setGroupStatus({}), [component]);

	const current = themableComponent(component);
	const searching = search.trim().length > 0;
	// Searching every component is the point of the box: you usually know the
	// variable's name but not which component owns it. Narrowing to the selected
	// component stays available behind the scope toggle.
	const crossComponent = searching && searchAll;

	const vars = useMemo(
		() => ({ ...(theme?.variables?.ALL ?? {}), ...(theme?.variables?.[themeGroup] ?? {}) }),
		[theme, themeGroup],
	);

	let body: JSX.Element | Array<JSX.Element>;

	if (crossComponent) {
		const blocks = themableComponents()
			.map(comp => {
				const matches = comp.styleProps.filter(prop =>
					matchesFilters(prop, search, onlyOverridden, theme, themeGroup, comp, {}),
				);
				if (!matches.length) return undefined;
				return (
					<div className="_variableGroup" key={comp.key}>
						<button
							type="button"
							className="_title _componentTitle"
							onClick={() => onComponentChange?.(comp.key)}
							title={`Show every ${comp.displayName} variable`}
						>
							{comp.displayName}
							<span className="_hitCount">{matches.length}</span>
						</button>
						{matches.map(prop => (
							<VariableEdit
								key={prop.n}
								theme={theme}
								themeGroup={themeGroup}
								onThemeChange={onThemeChange}
								prop={prop}
								filterValues={{}}
								propertiesForTheme={comp.propertiesForTheme}
								styleDefaults={comp.styleDefaults}
								vars={vars}
							/>
						))}
					</div>
				);
			})
			.filter(Boolean) as Array<JSX.Element>;

		body = blocks.length ? (
			blocks
		) : (
			<div className="_noHits">Nothing matches “{search}” in any component.</div>
		);
	} else {
		const styleProps = current?.styleProps ?? [];
		const grouped = styleProps.reduce(
			(groups, prop) => {
				const group = prop.gn ?? 'Default';
				if (!groups[group]) groups[group] = [];
				groups[group].push(prop);
				return groups;
			},
			{} as Record<string, StylePropertyDefinition[]>,
		);

		const groups = Object.entries(grouped)
			.map(([group, props]) => (
				<VariableGroup
					key={group}
					search={search}
					onlyOverridden={onlyOverridden}
					groupName={group}
					theme={theme}
					themeGroup={themeGroup}
					onThemeChange={onThemeChange}
					props={props}
					filterValues={filterValues}
					comp={current}
					isGroupOpen={defaultOpen ? !groupsStatus[group] : groupsStatus[group]}
					onToggleGroup={() =>
						setGroupStatus({ ...groupsStatus, [group]: !groupsStatus[group] })
					}
					vars={vars}
				/>
			))
			.filter(Boolean) as Array<JSX.Element>;

		body =
			groups.length || !(searching || onlyOverridden) ? (
				groups
			) : (
				<div className="_noHits">
					{onlyOverridden && !searching
						? `Nothing is set on this theme for ${current?.displayName ?? component}.`
						: `Nothing matches “${search}” in ${current?.displayName ?? component}.`}
				</div>
			);
	}

	let filterProps: Array<JSX.Element> = [];

	if (!crossComponent && current?.propertiesForTheme?.length) {
		filterProps = current.propertiesForTheme.map(prop => (
			<div key={prop.name} className="_variable">
				<div className="_variableName">{prop.displayName}</div>
				<select
					value={filterValues[prop.name] ?? ''}
					onChange={e =>
						setFilterValues({ ...filterValues, [prop.name]: e.target.value })
					}
				>
					<option value="">All</option>
					{prop.enumValues?.map((value: any) => (
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
						type="button"
						className={`_smallButton _scopeButton ${searchAll ? '_selected' : ''}`}
						onClick={() => setSearchAll(!searchAll)}
						title={
							searchAll
								? 'Searching every component. Click to search only the selected one.'
								: 'Searching the selected component. Click to search every component.'
						}
					>
						{searchAll ? 'All' : 'This'}
					</button>
					<button
						type="button"
						className={`_smallButton _overrideButton ${onlyOverridden ? '_selected' : ''}`}
						onClick={() => setOnlyOverridden(!onlyOverridden)}
						title={
							onlyOverridden
								? 'Showing only variables set on this theme. Click to show all.'
								: 'Show only the variables set on this theme.'
						}
					>
						<span className="_dot" />
					</button>
					<button
						type="button"
						className="_smallButton"
						title="Expand every group"
						onClick={() => {
							setDefaultOpen(true);
							setGroupStatus({});
						}}
					>
						<svg viewBox="0 0 24 24" fill="none">
							<path
								d="M6 12H18M12 6V18"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</button>
					<button
						type="button"
						className="_smallButton"
						title="Collapse every group"
						onClick={() => {
							setDefaultOpen(false);
							setGroupStatus({});
						}}
					>
						<svg viewBox="0 0 24 24" fill="none">
							<path d="M6 12H18" strokeLinecap="round" strokeLinejoin="round" />
						</svg>
					</button>
				</div>
				{filterProps}
			</div>
			<div className="_variableGroups">{body}</div>
		</div>
	);
}

function VariableGroup({
	search,
	onlyOverridden,
	groupName,
	theme,
	themeGroup,
	onThemeChange,
	filterValues,
	props,
	comp,
	isGroupOpen,
	onToggleGroup,
	vars,
}: Readonly<{
	search: string;
	onlyOverridden: boolean;
	groupName: string;
	theme: any;
	themeGroup: StyleResolution;
	onThemeChange: (changedProps: Array<VariableEditProps>) => void;
	filterValues: Record<string, string>;
	props: StylePropertyDefinition[];
	comp: ThemableComponent | undefined;
	isGroupOpen: boolean;
	onToggleGroup: () => void;
	vars: Record<string, string>;
}>) {
	// Computed whether or not the group is open, so a group with no hits can drop
	// out entirely instead of leaving a row of empty titles behind a filter.
	const matching = props.filter(prop =>
		matchesFilters(prop, search, onlyOverridden, theme, themeGroup, comp, filterValues),
	);

	if (!matching.length && (search.trim() || onlyOverridden)) return null;

	const variables = isGroupOpen
		? matching.map(prop => (
				<VariableEdit
					key={prop.n}
					theme={theme}
					themeGroup={themeGroup}
					onThemeChange={onThemeChange}
					prop={prop}
					filterValues={filterValues}
					propertiesForTheme={comp?.propertiesForTheme}
					styleDefaults={comp?.styleDefaults}
					vars={vars}
				/>
			))
		: undefined;

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
				<span className="_hitCount">{matching.length}</span>
			</div>
			{variables}
		</div>
	);
}

function VariableEdit({
	theme,
	themeGroup,
	onThemeChange,
	prop,
	filterValues,
	propertiesForTheme,
	styleDefaults,
	vars,
}: Readonly<{
	theme: any;
	themeGroup: StyleResolution;
	onThemeChange: (changedProps: Array<VariableEditProps>) => void;
	prop: StylePropertyDefinition;
	filterValues: Record<string, string>;
	propertiesForTheme: ComponentPropertyDefinition[] | undefined;
	styleDefaults: Map<string, string> | undefined;
	vars: Record<string, string>;
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

	const overridden = isOverridden(
		expandPropNames(prop, usedProperties, filterValues),
		theme,
		themeGroup,
	);

	const commit = (next: string) => {
		if (next === defaultValue) return;
		onThemeChange(
			applyPropertiesForTheme(
				[{ themeGroup, variableName: prop.n, value: next }],
				propertiesForTheme,
				filterValues,
			),
		);
	};

	// The value the app will actually paint, once `<var>` indirections are followed.
	const resolved = resolveIndirections(value, vars);
	const swatchValue = resolved ?? value;
	const hex = toHexColor(swatchValue);
	const showSwatch = !!hex || (isColourProp(prop) && !!swatchValue);

	return (
		<div className={`_variable ${overridden ? '_overridden' : ''}`}>
			<div className="_variableName" title={prop.de}>
				<span className="_setMarker" title="Set on this theme" />
				{prop.dn}:
			</div>
			<div className="_variableValue">
				<div className="_valueRow">
					{showSwatch &&
						(hex ? (
							<input
								type="color"
								className="_colorPicker"
								value={hex}
								title={`${swatchValue}`}
								onChange={e => {
									setValue(e.target.value);
									commit(e.target.value);
								}}
							/>
						) : (
							<span
								className="_colorSwatch"
								style={{ background: swatchValue }}
								title={`${swatchValue}`}
							/>
						))}
					<input
						type="text"
						value={value ?? ''}
						onChange={v => setValue(v.target.value)}
						onBlur={e => {
							if (e.target.value === '') {
								setValue(defaultValue);
								commit('');
								return;
							}
							commit(e.target.value);
						}}
					/>
				</div>
				{resolved !== undefined && resolved !== value && (
					<div className="_resolvedHint" title="What this resolves to">
						{resolved || '(empty)'}
					</div>
				)}
			</div>
		</div>
	);
}

/**
 * Every concrete variable name a definition can stand for.
 *
 * A name like `buttonColor<designType><colorScheme>` is a template: with a design
 * type picked in the filter it collapses to one name, without it to one per enum
 * value. Both the value read and the "is it set" test need the same expansion, so
 * it lives here instead of inside either.
 */
export function expandPropNames(
	prop: StylePropertyDefinition,
	usedProperties: ComponentPropertyDefinition[] | undefined,
	filterValues: Record<string, string>,
): string[] {
	if (!usedProperties?.length) return [prop.n];

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

	return propNames;
}

/** True when this theme document itself carries a value, rather than inheriting one. */
export function isOverridden(names: string[], theme: any, themeGroup: string): boolean {
	const group = theme?.variables?.[themeGroup];
	const all = theme?.variables?.ALL;
	return names.some(n => group?.[n] !== undefined || all?.[n] !== undefined);
}

function matchesFilters(
	prop: StylePropertyDefinition,
	search: string,
	onlyOverridden: boolean,
	theme: any,
	themeGroup: StyleResolution,
	comp: ThemableComponent | undefined,
	filterValues: Record<string, string>,
): boolean {
	const term = search.trim().toLowerCase();
	if (term && !prop.dn?.toLowerCase().includes(term) && !prop.n?.toLowerCase().includes(term))
		return false;

	if (!onlyOverridden) return true;

	const usedProperties = comp?.propertiesForTheme?.filter(
		({ name }: any) => prop.n.indexOf(`<${name}>`) !== -1,
	);
	return isOverridden(expandPropNames(prop, usedProperties, filterValues), theme, themeGroup);
}

/**
 * Follow `<var>` indirections the way `processStyleValueWithFunction` does, but
 * bounded. An unknown variable resolves to empty, same as the runtime; a cycle
 * stops and reports nothing rather than hanging the editor while you type.
 */
export function resolveIndirections(
	value: string | undefined,
	vars: Record<string, string>,
): string | undefined {
	if (!value || value.indexOf('<') === -1) return undefined;

	let out = value;
	for (let depth = 0; depth < 8 && out.indexOf('<') !== -1; depth++) {
		const next = out.replace(/<([^<>]+)>/g, (_m, name) => vars[name] ?? '');
		if (next === out) break;
		out = next;
	}

	return out.indexOf('<') !== -1 ? undefined : out;
}

const HEX_COLOR = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

/** A 6-digit hex for `input[type=color]`, or undefined when the value is not hex. */
export function toHexColor(value: string | undefined): string | undefined {
	if (!value) return undefined;
	const s = value.trim();
	if (!HEX_COLOR.test(s)) return undefined;

	let h = s.slice(1);
	if (h.length === 3 || h.length === 4)
		h = h
			.slice(0, 3)
			.split('')
			.map(c => c + c)
			.join('');
	else h = h.slice(0, 6);

	return `#${h.toLowerCase()}`;
}

function isColourProp(prop: StylePropertyDefinition): boolean {
	const cp = ((prop as any).cp ?? '').toLowerCase();
	return (
		cp.includes('color') ||
		cp.includes('background') ||
		cp.includes('fill') ||
		cp.includes('stroke')
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

	const propNames = expandPropNames(prop, usedProperties, filterValues);

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
