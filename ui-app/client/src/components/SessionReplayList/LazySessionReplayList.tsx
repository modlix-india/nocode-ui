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
import { propertiesDefinition, stylePropertiesDefinition } from './sessionReplayListProperties';
import { runEvent } from '../util/runEvent';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';

interface Recording {
	id?: string;
	start_time?: string;
	recording_duration?: number;
	person?: { properties?: { email?: string }; distinct_ids?: Array<string> };
	click_count?: number;
}

function authToken(): string | undefined {
	try {
		return window.localStorage.getItem('AuthToken') || undefined;
	} catch {
		return undefined;
	}
}

function fmtDuration(seconds: number | undefined): string {
	if (!seconds) return '—';
	const m = Math.floor(seconds / 60);
	const s = Math.floor(seconds % 60);
	return `${m}:${String(s).padStart(2, '0')}`;
}

function fmtWhen(iso: string | undefined): string {
	if (!iso) return '';
	try {
		return new Date(iso).toLocaleString();
	} catch {
		return iso;
	}
}

function personLabel(r: Recording): string {
	return r.person?.properties?.email ?? r.person?.distinct_ids?.[0] ?? '(anonymous)';
}

export default function LazySessionReplayList(props: Readonly<ComponentProps>) {
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
			dateFrom,
			dateTo,
			limit,
			refreshIntervalSeconds,
			title,
			onSelect,
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

	const [recordings, setRecordings] = useState<Array<Recording>>([]);
	const [error, setError] = useState<string | undefined>();
	const [loading, setLoading] = useState(false);
	const [selectedId, setSelectedId] = useState<string | undefined>();

	const fetchList = useCallback(async () => {
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

			const params = new URLSearchParams();
			if (dateFrom) params.set('date_from', dateFrom);
			if (dateTo) params.set('date_to', dateTo);
			if (limit) params.set('limit', String(limit));

			const response = await axios.get(
				`/api/ui/analytics/replays?${params.toString()}`,
				{ headers },
			);
			const list = (response.data?.results ?? []) as Array<Recording>;
			setRecordings(list);
		} catch (err: any) {
			const status = err?.response?.status;
			const detail = err?.response?.data?.message ?? err?.message ?? 'Fetch failed';
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
		dateFrom,
		dateTo,
		limit,
		onError,
		pageDefinition,
		context.pageName,
		locationHistory,
	]);

	useEffect(() => {
		fetchList();
		const interval = Number(refreshIntervalSeconds) || 0;
		if (interval <= 0) return undefined;
		const handle = window.setInterval(fetchList, interval * 1000);
		return () => window.clearInterval(handle);
	}, [fetchList, refreshIntervalSeconds]);

	const select = (r: Recording) => {
		if (!r.id) return;
		setSelectedId(r.id);
		if (bindingPathPath) setData(bindingPathPath, r.id, context.pageName);
		if (onSelect && pageDefinition.eventFunctions?.[onSelect])
			runEvent(
				pageDefinition.eventFunctions[onSelect],
				onSelect,
				context.pageName,
				locationHistory,
				pageDefinition,
			);
	};

	if (visibility === false) return null;

	const baseProps = {
		className: 'comp compSessionReplayList',
		style: resolvedStyles.comp ?? {},
		'data-analytics-label': analyticsLabel || undefined,
	};
	const helper = <HelperComponent context={props.context} definition={definition} />;

	const wrapper = (body: React.ReactNode) => (
		<div {...baseProps} key={key}>
			{helper}
			{title ? (
				<div className="_title" style={resolvedStyles.title ?? {}}>
					{title}
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
	if (loading && recordings.length === 0) return wrapper(<div className="_loading">Loading…</div>);
	if (recordings.length === 0)
		return wrapper(<div className="_empty">No recordings for the selected range.</div>);

	return wrapper(
		<table className="_table">
			<thead>
				<tr>
					<th>When</th>
					<th>Person</th>
					<th style={{ textAlign: 'right' }}>Duration</th>
					<th style={{ textAlign: 'right' }}>Clicks</th>
				</tr>
			</thead>
			<tbody>
				{recordings.map(r => {
					const isSelected = r.id === selectedId;
					return (
						<tr
							key={r.id}
							className={isSelected ? '_selected' : ''}
							style={isSelected ? resolvedStyles.rowSelected ?? {} : resolvedStyles.row ?? {}}
							onClick={() => select(r)}
						>
							<td className="_when">{fmtWhen(r.start_time)}</td>
							<td className="_person">{personLabel(r)}</td>
							<td className="_duration">{fmtDuration(r.recording_duration)}</td>
							<td className="_clicks">{r.click_count ?? 0}</td>
						</tr>
					);
				})}
			</tbody>
		</table>,
	);
}
