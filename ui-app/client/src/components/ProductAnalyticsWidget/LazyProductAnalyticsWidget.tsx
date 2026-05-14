import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import {
	PageStoreExtractor,
	UrlDetailsExtractor,
	getPathFromLocation,
	setData,
} from '../../context/StoreContext';
import { ComponentProps } from '../../types/common';
import useDefinition from '../util/useDefinition';
import {
	propertiesDefinition,
	stylePropertiesDefinition,
} from './productAnalyticsWidgetProperties';
import { runEvent } from '../util/runEvent';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { PRODUCT_TEMPLATES, ProductWidgetType } from './productAnalyticsTemplates';

interface FunnelStepData {
	name?: string;
	count?: number;
	conversion?: number;
}
interface RetentionRow {
	date?: string;
	cohortSize?: number;
	values?: Array<number>;
}
interface AnyResponse {
	results?: any;
	columns?: any;
}

function authToken(): string | undefined {
	try {
		return window.localStorage.getItem('AuthToken') || undefined;
	} catch {
		return undefined;
	}
}

function fmt(value: unknown): string {
	if (value === null || value === undefined) return '';
	if (typeof value === 'number') return value.toLocaleString();
	return String(value);
}

/**
 * PostHog FunnelsQuery returns either an array of step objects or a nested
 * array (one per breakdown). Normalise the simple case here; bail to raw
 * binding for breakdown funnels.
 */
function normaliseFunnel(payload: AnyResponse): Array<FunnelStepData> | null {
	const results = payload?.results;
	if (!Array.isArray(results) || results.length === 0) return null;
	const first = results[0];
	// Simple funnel: results is an array of step objects
	if (first && typeof first === 'object' && !Array.isArray(first) && 'count' in first) {
		const startCount = Number(first.count) || 0;
		return results.map((step: any) => ({
			name: step?.custom_name ?? step?.name ?? step?.action_id ?? step?.event,
			count: Number(step?.count) || 0,
			conversion:
				startCount > 0 ? ((Number(step?.count) || 0) / startCount) * 100 : 0,
		}));
	}
	return null;
}

/**
 * PostHog RetentionQuery returns rows with { date, label, values: [{count}, ...] }
 * The first value in each row is the cohort size; subsequent values are
 * retention counts at each period offset.
 */
function normaliseRetention(payload: AnyResponse): Array<RetentionRow> | null {
	const results = payload?.results;
	if (!Array.isArray(results) || results.length === 0) return null;
	const first = results[0];
	if (!first || typeof first !== 'object' || !('values' in first)) return null;
	return results.map((row: any) => {
		const valuesRaw: any[] = Array.isArray(row?.values) ? row.values : [];
		const cohortSize = Number(valuesRaw[0]?.count ?? 0);
		const values = valuesRaw.map((v: any) => Number(v?.count) || 0);
		return {
			date: row?.label ?? row?.date,
			cohortSize,
			values,
		};
	});
}

export default function LazyProductAnalyticsWidget(props: Readonly<ComponentProps>) {
	const {
		definition,
		pageDefinition,
		locationHistory,
		context,
		definition: { bindingPath },
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const urlExtractor = UrlDetailsExtractor.getForContext(context.pageName);

	const {
		properties: {
			widgetType: rawWidgetType,
			appCode,
			clientCode,
			title,
			dateRangeDays,
			limit,
			eventName,
			breakdownProperty,
			funnelSteps,
			retentionTargetEvent,
			retentionReturningEvent,
			retentionPeriod,
			refreshIntervalSeconds,
			showBars,
			onSuccess,
			onError,
			analyticsLabel,
			visibility,
		} = {},
		stylePropertiesWithPseudoStates,
		key,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
		urlExtractor,
	);

	const widgetType = (rawWidgetType as ProductWidgetType) || 'topEvents';
	const template = PRODUCT_TEMPLATES[widgetType] ?? PRODUCT_TEMPLATES.topEvents;

	const resolvedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);
	const bindingPathPath = bindingPath
		? getPathFromLocation(bindingPath, locationHistory, pageExtractor)
		: undefined;

	const [data, setLocal] = useState<AnyResponse | null>(null);
	const [error, setError] = useState<string | undefined>();
	const [loading, setLoading] = useState(false);

	const runQuery = useCallback(async () => {
		if (!appCode || !clientCode) return;
		setLoading(true);
		setError(undefined);
		try {
			const headers: Record<string, string> = {
				'Content-Type': 'application/json',
				appCode,
				clientCode,
			};
			const tok = authToken();
			if (tok) headers.Authorization = tok;

			const query = template.build({
				dateRangeDays: Number(dateRangeDays) || 30,
				limit: Number(limit) || template.defaultLimit,
				eventName,
				breakdownProperty,
				funnelSteps: Array.isArray(funnelSteps) ? funnelSteps : [],
				retentionTargetEvent,
				retentionReturningEvent,
				retentionPeriod: retentionPeriod as 'Day' | 'Week' | 'Month' | undefined,
			});

			const response = await axios.post<AnyResponse>(
				'/api/ui/analytics/query',
				query,
				{ headers },
			);
			setLocal(response.data);
			if (bindingPathPath) setData(bindingPathPath, response.data, context.pageName);
			if (onSuccess && pageDefinition.eventFunctions?.[onSuccess])
				runEvent(
					pageDefinition.eventFunctions[onSuccess],
					onSuccess,
					context.pageName,
					locationHistory,
					pageDefinition,
				);
		} catch (err: any) {
			const status = err?.response?.status;
			const detail = err?.response?.data?.message ?? err?.message ?? 'Query failed';
			setError(`${status ? status + ': ' : ''}${detail}`);
			if (onError && pageDefinition.eventFunctions?.[onError])
				runEvent(
					pageDefinition.eventFunctions[onError],
					onError,
					context.pageName,
					locationHistory,
					pageDefinition,
				);
		} finally {
			setLoading(false);
		}
	}, [
		appCode,
		clientCode,
		template,
		dateRangeDays,
		limit,
		eventName,
		breakdownProperty,
		funnelSteps,
		retentionTargetEvent,
		retentionReturningEvent,
		retentionPeriod,
		bindingPathPath,
		context.pageName,
		onSuccess,
		onError,
		pageDefinition,
		locationHistory,
	]);

	useEffect(() => {
		runQuery();
		const interval = Number(refreshIntervalSeconds) || 0;
		if (interval <= 0) return undefined;
		const handle = window.setInterval(runQuery, interval * 1000);
		return () => window.clearInterval(handle);
	}, [runQuery, refreshIntervalSeconds]);

	if (visibility === false) return null;

	const baseProps = {
		className: 'comp compProductAnalyticsWidget',
		style: resolvedStyles.comp ?? {},
		'data-analytics-label': analyticsLabel || undefined,
	};
	const helper = <HelperComponent context={props.context} definition={definition} />;
	const heading = title || template.displayName;

	const wrapper = (body: React.ReactNode) => (
		<div {...baseProps} key={key}>
			{helper}
			<div className="_title" style={resolvedStyles.title ?? {}}>
				{heading}
			</div>
			{body}
		</div>
	);

	if (error)
		return wrapper(
			<div className="_error" style={resolvedStyles.error ?? {}}>
				{error}
			</div>,
		);

	if (loading && !data) return wrapper(<div className="_loading">Loading…</div>);

	// Funnel render
	if (template.renderHint === 'funnel') {
		const steps = data ? normaliseFunnel(data) : null;
		if (!steps || steps.length === 0)
			return wrapper(<div className="_empty">No funnel data for the selected range.</div>);
		const max = steps[0]?.count || 1;
		return wrapper(
			<div className="_funnel">
				{steps.map((s, i) => {
					const pct = ((s.count ?? 0) / max) * 100;
					return (
						<div className="_funnelStep" key={i}>
							<div className="_funnelStepLabel">{s.name ?? `Step ${i + 1}`}</div>
							<div className="_funnelStepBar">
								<div
									className="_funnelStepFill"
									style={{ width: `${pct}%`, ...(resolvedStyles.stepBar ?? {}) }}
								/>
								<span className="_funnelStepNum">{fmt(s.count)}</span>
							</div>
							<div className="_funnelStepConv">{(s.conversion ?? 0).toFixed(1)}%</div>
						</div>
					);
				})}
			</div>,
		);
	}

	// Retention render
	if (template.renderHint === 'retention') {
		const rows = data ? normaliseRetention(data) : null;
		if (!rows || rows.length === 0)
			return wrapper(<div className="_empty">No retention data for the selected range.</div>);
		const periodCount = rows.reduce((m, r) => Math.max(m, (r.values ?? []).length), 0);
		return wrapper(
			<table className="_cohort">
				<thead>
					<tr>
						<th>Cohort</th>
						<th style={{ textAlign: 'right' }}>Size</th>
						{Array.from({ length: periodCount }, (_, i) => (
							<th key={i} style={{ textAlign: 'center' }}>
								{i}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{rows.map((r, ri) => (
						<tr key={ri}>
							<td className="_date">{r.date ?? ''}</td>
							<td className="_size">{fmt(r.cohortSize)}</td>
							{(r.values ?? []).map((count, ci) => {
								const pct =
									(r.cohortSize ?? 0) > 0
										? (count / (r.cohortSize ?? 1)) * 100
										: 0;
								const bg =
									ci === 0
										? 'transparent'
										: `rgba(59,130,246,${Math.min(0.6, pct / 100)})`;
								return (
									<td
										key={ci}
										className="_cohortCell"
										style={{ background: bg, ...(resolvedStyles.cohortCell ?? {}) }}
										title={`${count} of ${r.cohortSize} (${pct.toFixed(1)}%)`}
									>
										{ci === 0 ? fmt(count) : `${pct.toFixed(0)}%`}
									</td>
								);
							})}
						</tr>
					))}
				</tbody>
			</table>,
		);
	}

	const rows: Array<Array<unknown>> = Array.isArray(data?.results) ? (data!.results as any) : [];

	if (rows.length === 0)
		return wrapper(<div className="_empty">No data for the selected range.</div>);

	if (template.renderHint === 'timeSeries') {
		const points = rows.map(r => Number(r[1]) || 0);
		const max = Math.max(...points, 1);
		return wrapper(
			<div className="_timeSeries">
				{points.map((p, i) => (
					<div
						key={i}
						className="_point"
						title={`${rows[i][0]}: ${p}`}
						style={{
							height: `${(p / max) * 100}%`,
							...(resolvedStyles.bar ?? {}),
						}}
					/>
				))}
			</div>,
		);
	}

	// table
	const bars = String(showBars ?? 'true') !== 'false';
	const max = rows.reduce((m, r) => Math.max(m, Number(r[1]) || 0), 0);
	return wrapper(
		<table className="_table">
			<tbody>
				{rows.map((row, i) => {
					const value = Number(row[1]) || 0;
					const pct = max > 0 ? (value / max) * 100 : 0;
					return (
						<tr key={i} style={resolvedStyles.row ?? {}}>
							<td className="_rank">{i + 1}</td>
							<td className="_label">{fmt(row[0]) || '(empty)'}</td>
							<td className="_value">
								{bars ? (
									<span className="_barWrap">
										<span
											className="_bar"
											style={{
												width: `${pct}%`,
												...(resolvedStyles.bar ?? {}),
											}}
										/>
										<span style={{ position: 'relative' }}>{fmt(value)}</span>
									</span>
								) : (
									fmt(value)
								)}
							</td>
						</tr>
					);
				})}
			</tbody>
		</table>,
	);
}
