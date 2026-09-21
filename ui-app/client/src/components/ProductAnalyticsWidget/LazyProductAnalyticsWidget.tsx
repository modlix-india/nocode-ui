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
import { axisTicks, shortDay } from '../util/analyticsChart';

/**
 * What the analytics engine answers. One shape for every widget: `rows` for anything that
 * ranks or plots a single series, and a named array for the four analyses that cannot be
 * expressed that way.
 */
interface EngineResponse {
	rows?: Array<{ label: string; events: number; visitors: number }>;
	funnel?: Array<{
		step: number;
		event: string;
		visitors: number;
		conversionFromPrevious: number;
		conversionFromFirst: number;
	}>;
	retention?: Array<{ label: string; size: number; values: Array<number> }>;
	stickiness?: Array<{ periods: number; visitors: number }>;
	lifecycle?: Array<{
		label: string;
		new: number;
		returning: number;
		resurrecting: number;
		dormant: number;
	}>;
	/**
	 * True wherever a visitor count came from a sketch rather than a scan. Surfaced in the
	 * UI rather than swallowed: presenting an estimate as exact is how someone reconciles it
	 * against another tool and concludes the whole thing is broken.
	 */
	visitorsApproximate?: boolean;
	/** How many boundary hours had to be read raw — non-zero only for half-hour zones. */
	rawHoursScanned?: number;
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
			subtitle,
			dateRangeDays,
			dateFrom,
			dateTo,
			limit,
			eventName,
			breakdownProperty,
			funnelSteps,
			funnelWindowHours,
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

	const [data, setLocal] = useState<EngineResponse | null>(null);
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
				dateFrom,
				dateTo,
				limit: Number(limit) || template.defaultLimit,
				eventName,
				breakdownProperty,
				funnelSteps: Array.isArray(funnelSteps) ? funnelSteps : [],
				funnelWindowHours: Number(funnelWindowHours) || undefined,
				retentionPeriod: retentionPeriod as 'day' | 'week' | undefined,
			});

			const response = await axios.post<EngineResponse>(
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
		dateFrom,
		dateTo,
		limit,
		eventName,
		breakdownProperty,
		funnelSteps,
		funnelWindowHours,
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
			{subtitle ? (
				<div className="_subtitle" style={resolvedStyles.subtitle ?? {}}>
					{subtitle}
				</div>
			) : null}
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
		const steps = data?.funnel ?? [];
		if (steps.length === 0)
			return wrapper(<div className="_empty">No funnel data for the selected range.</div>);
		const max = steps[0]?.visitors || 1;
		return wrapper(
			<div className="_funnel">
				{steps.map((s, i) => {
					const pct = ((s.visitors ?? 0) / max) * 100;
					return (
						<div className="_funnelStep" key={i}>
							<div className="_funnelStepLabel">{s.event || `Step ${i + 1}`}</div>
							<div className="_funnelStepBar">
								<div
									className="_funnelStepFill"
									style={{ width: `${pct}%`, ...(resolvedStyles.stepBar ?? {}) }}
								/>
								<span className="_funnelStepNum">{fmt(s.visitors)}</span>
							</div>
							{/* Of everyone who entered the funnel, not of the previous step: the
							    two answer different questions, and the one people mean by
							    "conversion" without qualifying it is this one. */}
							<div className="_funnelStepConv">
								{((s.conversionFromFirst ?? 0) * 100).toFixed(1)}%
							</div>
						</div>
					);
				})}
			</div>,
		);
	}

	// Retention render
	if (template.renderHint === 'retention') {
		const rows = data?.retention ?? [];
		if (rows.length === 0)
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
							<td className="_date">{r.label ?? ''}</td>
							<td className="_size">{fmt(r.size)}</td>
							{(r.values ?? []).map((count, ci) => {
								const pct =
									(r.size ?? 0) > 0 ? (count / (r.size ?? 1)) * 100 : 0;
								const bg =
									ci === 0
										? 'transparent'
										: `rgba(59,130,246,${Math.min(0.6, pct / 100)})`;
								return (
									<td
										key={ci}
										className="_cohortCell"
										style={{ background: bg, ...(resolvedStyles.cohortCell ?? {}) }}
										title={`${count} of ${r.size} (${pct.toFixed(1)}%)`}
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

	// Stickiness has its own array but reads as an ordinary ranked list: how many visitors
	// were active in one period, two, three. Mapping it here keeps one table renderer.
	const rows =
		data?.stickiness && data.stickiness.length
			? data.stickiness.map(b => ({
					label: `${b.periods} ${b.periods === 1 ? 'period' : 'periods'}`,
					events: b.visitors,
					visitors: b.visitors,
				}))
			: (data?.rows ?? []);

	if (rows.length === 0)
		return wrapper(<div className="_empty">No data for the selected range.</div>);

	if (template.renderHint === 'timeSeries') {
		const points = rows.map(r => Number(r.events) || 0);
		const max = Math.max(...points, 1);
		const ticks = axisTicks(rows.length);
		return wrapper(
			<div className="_chart">
				{/* Two numbers, not a scale. The bars carry the shape; the axis only has to
				    say how tall the tallest one is, or the whole thing is unitless. */}
				<div className="_yAxis">
					<span>{max.toLocaleString()}</span>
					<span className="_yUnit">Events</span>
					<span>0</span>
				</div>
				<div className="_plot">
					<div className="_timeSeries">
						{points.map((p, i) => (
							<div
								key={rows[i].label ?? i}
								className={p > 0 ? '_point' : '_point _zero'}
								title={`${rows[i].label}: ${p.toLocaleString()} events`}
								style={{
									height: `${(p / max) * 100}%`,
									...(resolvedStyles.bar ?? {}),
								}}
							/>
						))}
					</div>
					{/* One cell per bucket, so a tick sits under the bar it names. A bucket
					    with nothing in it still gets its column: the gap is the answer. */}
					<div
						className="_xAxis"
						style={{ gridTemplateColumns: `repeat(${rows.length}, 1fr)` }}
					>
						{rows.map((r, i) =>
							ticks.includes(i) ? (
								<span
									key={r.label ?? i}
									className="_tick"
									style={{ gridColumn: i + 1 }}
								>
									{shortDay(String(r.label ?? ''))}
								</span>
							) : null,
						)}
					</div>
				</div>
			</div>,
		);
	}

	// table
	const bars = String(showBars ?? 'true') !== 'false';
	const max = rows.reduce((m, r) => Math.max(m, Number(r.events) || 0), 0);
	return wrapper(
		<table className="_table">
			<tbody>
				{rows.map((row, i) => {
					const value = Number(row.events) || 0;
					const pct = max > 0 ? (value / max) * 100 : 0;
					return (
						<tr key={i} style={resolvedStyles.row ?? {}}>
							<td className="_rank">{i + 1}</td>
							<td className="_label">{fmt(row.label) || '(empty)'}</td>
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
