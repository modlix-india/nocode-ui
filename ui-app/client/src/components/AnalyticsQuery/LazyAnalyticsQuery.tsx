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
import { propertiesDefinition, stylePropertiesDefinition } from './analyticsQueryProperties';
import { runEvent } from '../util/runEvent';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';

interface HogQLLikeResponse {
	results?: Array<Array<unknown>>;
	columns?: Array<string>;
}

function authToken(): string | undefined {
	try {
		const t = window.localStorage.getItem('AuthToken');
		return t || undefined;
	} catch {
		return undefined;
	}
}

export default function LazyAnalyticsQuery(props: Readonly<ComponentProps>) {
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
			appCode,
			clientCode,
			query,
			refreshIntervalSeconds,
			renderAs,
			counterValuePrefix,
			counterValueSuffix,
			counterLabel,
			tableMaxRows,
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
		if (!appCode || !clientCode || !query) return;
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
		query,
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
		className: 'comp compAnalyticsQuery',
		style: resolvedStyles.comp ?? {},
		'data-analytics-label': analyticsLabel || undefined,
	};

	const helper = <HelperComponent context={props.context} definition={definition} />;

	if (error) {
		return (
			<div {...baseProps} key={key}>
				{helper}
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
				<div className="_loading">Loading…</div>
			</div>
		);
	}

	if (renderAs === 'counter') {
		const value = data?.results?.[0]?.[0];
		const display = value === undefined || value === null ? '—' : String(value);
		return (
			<div {...baseProps} key={key}>
				{helper}
				<div className="_counter" style={resolvedStyles.counter ?? {}}>
					<span className="_counterValue">
						{counterValuePrefix ?? ''}
						{display}
						{counterValueSuffix ?? ''}
					</span>
					{counterLabel ? (
						<span className="_counterLabel" style={resolvedStyles.counterLabel ?? {}}>
							{counterLabel}
						</span>
					) : null}
				</div>
			</div>
		);
	}

	if (renderAs === 'table') {
		const rows = (data?.results ?? []).slice(0, Number(tableMaxRows) || 100);
		const cols = data?.columns ?? rows[0]?.map((_, i) => `col${i}`) ?? [];
		return (
			<div {...baseProps} key={key}>
				{helper}
				<table className="_table" style={resolvedStyles.table ?? {}}>
					<thead style={resolvedStyles.thead ?? {}}>
						<tr>
							{cols.map(c => (
								<th key={c}>{c}</th>
							))}
						</tr>
					</thead>
					<tbody>
						{rows.map((row, ri) => (
							<tr key={ri}>
								{row.map((cell, ci) => (
									<td key={ci} style={resolvedStyles.td ?? {}}>
										{cell === null || cell === undefined ? '' : String(cell)}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		);
	}

	// renderAs === 'none' — invisible in runtime, marker in design mode only
	if (globalThis.designMode) {
		return (
			<div {...baseProps} key={key}>
				{helper}
				<span style={{ fontSize: 12, opacity: 0.6 }}>Analytics Query (data only)</span>
			</div>
		);
	}
	return null;
}
