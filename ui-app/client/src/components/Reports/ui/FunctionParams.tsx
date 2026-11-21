import React, { useEffect, useState } from 'react';
import { reportSources } from '../reportSpecUtil';
import { CatalogSource, ReportCatalog } from '../reportTypes';
import { PickOption } from './common';

/**
 * The options of a function source (PLAT-1705), as simple inputs instead of a JSON box: one per
 * param the spec may set (`allowedParams`, else the keys of `params`, never the paging param).
 * A yes / no default is a select, a number a number box, a text param named like a catalog field
 * (productId) a select of that field's values, anything else a text box. The output is the same
 * `spec.params` as before: only the values the user set, `undefined` when none.
 */

/** "waitingForMe" -> "Waiting for me"; a field of that name in the catalog gives its label. */
export function paramLabel(key: string, catalog: ReportCatalog | undefined): string {
	for (const [, s] of reportSources(catalog)) {
		const f = s.fields?.[key];
		if (f?.label) return f.label;
	}
	const words = key
		.replace(/Id$/, '')
		.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
		.toLowerCase()
		.trim();
	return words ? words[0].toUpperCase() + words.slice(1) : key;
}

/** The params a spec may set for a function source. */
export function editableParams(source: CatalogSource | undefined): string[] {
	if (!source) return [];
	const keys = source.allowedParams?.length
		? source.allowedParams
		: Object.keys(source.params ?? {});
	return keys.filter(k => k !== source.paging?.param);
}

/** A changed param value into the spec's params (empty clears it). */
export function setParam(
	params: Record<string, any> | undefined,
	key: string,
	value: any,
): Record<string, any> | undefined {
	const next = { ...(params ?? {}) };
	if (value === undefined || value === '') delete next[key];
	else next[key] = value;
	return Object.keys(next).length ? next : undefined;
}

export function FunctionParams({
	source,
	catalog,
	params,
	loadValues,
	onChange,
}: Readonly<{
	source: CatalogSource | undefined;
	catalog: ReportCatalog | undefined;
	params: Record<string, any> | undefined;
	/** The values of a catalog field, for a param named like one. */
	loadValues: (field: string) => (() => Promise<PickOption[]>) | undefined;
	onChange: (params: Record<string, any> | undefined) => void;
}>) {
	const keys = editableParams(source);
	if (!keys.length) return <span className="_rpMuted">This data has no options to set.</span>;
	return (
		<div className="_rpGroup" role="group" aria-label="Options">
			<span className="_rpGroupTitle">Options</span>
			{keys.map(k => (
				<ParamInput
					key={k}
					name={k}
					label={paramLabel(k, catalog)}
					def={source?.params?.[k]}
					value={params?.[k]}
					load={loadValues(k)}
					onChange={v => onChange(setParam(params, k, v))}
				/>
			))}
		</div>
	);
}

function ParamInput({
	name,
	label,
	def,
	value,
	load,
	onChange,
}: Readonly<{
	name: string;
	label: string;
	def: any;
	value: any;
	load?: () => Promise<PickOption[]>;
	onChange: (v: any) => void;
}>) {
	const [options, setOptions] = useState<PickOption[] | undefined>(undefined);
	const isText = typeof def === 'string' || def === undefined || def === null;
	useEffect(() => {
		if (!load || !isText) return;
		let alive = true;
		load().then(
			o => alive && setOptions(o),
			() => alive && setOptions(undefined),
		);
		return () => {
			alive = false;
		};
	}, [load, isText]);

	if (typeof def === 'boolean')
		return (
			<label className="_rpLabel">
				{label}
				<select
					className="_rpSelect"
					name={name}
					value={value === undefined ? '' : String(!!value)}
					onChange={e =>
						onChange(e.target.value === '' ? undefined : e.target.value === 'true')
					}
				>
					<option value="">As set by the app ({def ? 'yes' : 'no'})</option>
					<option value="true">Yes</option>
					<option value="false">No</option>
				</select>
			</label>
		);
	if (typeof def === 'number')
		return (
			<label className="_rpLabel">
				{label}
				<input
					className="_rpInput"
					type="number"
					name={name}
					placeholder={String(def)}
					value={value ?? ''}
					onChange={e =>
						onChange(e.target.value === '' ? undefined : Number(e.target.value))
					}
				/>
			</label>
		);
	if (options)
		return (
			<label className="_rpLabel">
				{label}
				<select
					className="_rpSelect"
					name={name}
					value={value ?? ''}
					onChange={e => onChange(e.target.value || undefined)}
				>
					<option value="">Any</option>
					{options.map(o => (
						<option key={String(o.value)} value={String(o.value)}>
							{o.label}
						</option>
					))}
					{value && !options.some(o => String(o.value) === String(value)) ? (
						<option value={String(value)}>{String(value)}</option>
					) : null}
				</select>
			</label>
		);
	return (
		<label className="_rpLabel">
			{label}
			<input
				className="_rpInput"
				name={name}
				placeholder={def ? String(def) : 'Any'}
				value={value ?? ''}
				onChange={e => onChange(e.target.value)}
			/>
		</label>
	);
}
