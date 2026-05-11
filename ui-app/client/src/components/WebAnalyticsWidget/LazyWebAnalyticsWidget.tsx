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
import { propertiesDefinition, stylePropertiesDefinition } from './webAnalyticsWidgetProperties';
import { runEvent } from '../util/runEvent';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { WIDGET_TEMPLATES, WidgetType } from './webAnalyticsTemplates';

interface HogQLLikeResponse {
	results?: Array<Array<unknown>>;
	columns?: Array<string>;
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

export default function LazyWebAnalyticsWidget(props: Readonly<ComponentProps>) {
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

	const widgetType = (rawWidgetType as WidgetType) || 'topPages';
	const template = WIDGET_TEMPLATES[widgetType] ?? WIDGET_TEMPLATES.topPages;
	const resolvedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);
	const bindingPathPath = bindingPath
		? getPathFromLocation(bindingPath, locationHistory, pageExtractor)
		: undefined;

	const [data, setLocal] = useState<HogQLLikeResponse | null>(null);
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
				dateRangeDays: Number(dateRangeDays) || 7,
				limit: Number(limit) || template.defaultLimit,
			});

			const response = await axios.post<HogQLLikeResponse>(
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
		className: 'comp compWebAnalyticsWidget',
		style: resolvedStyles.comp ?? {},
		'data-analytics-label': analyticsLabel || undefined,
	};
	const helper = <HelperComponent context={props.context} definition={definition} />;
	const heading = title || template.displayName;

	if (error) {
		return (
			<div {...baseProps} key={key}>
				{helper}
				<div className="_title" style={resolvedStyles.title ?? {}}>
					{heading}
				</div>
				<div className="_error" style={resolvedStyles.error ?? {}}>
					{error}
				</div>
			</div>
		);
	}

	if (loading && !data) {
		return (
			<div {...baseProps} key={key}>
				{helper}
				<div className="_title" style={resolvedStyles.title ?? {}}>
					{heading}
				</div>
				<div className="_loading">Loading…</div>
			</div>
		);
	}

	const rows = data?.results ?? [];

	if (rows.length === 0) {
		return (
			<div {...baseProps} key={key}>
				{helper}
				<div className="_title" style={resolvedStyles.title ?? {}}>
					{heading}
				</div>
				<div className="_empty">No data for the selected range.</div>
			</div>
		);
	}

	if (template.renderHint === 'timeSeries') {
		const points = rows.map(r => Number(r[1]) || 0);
		const max = Math.max(...points, 1);
		return (
			<div {...baseProps} key={key}>
				{helper}
				<div className="_title" style={resolvedStyles.title ?? {}}>
					{heading}
				</div>
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
				</div>
			</div>
		);
	}

	const bars = String(showBars ?? 'true') !== 'false';
	const max = rows.reduce((m, r) => Math.max(m, Number(r[1]) || 0), 0);

	return (
		<div {...baseProps} key={key}>
			{helper}
			<div className="_title" style={resolvedStyles.title ?? {}}>
				{heading}
			</div>
			<table className="_table" style={resolvedStyles.table ?? {}}>
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
			</table>
		</div>
	);
}
