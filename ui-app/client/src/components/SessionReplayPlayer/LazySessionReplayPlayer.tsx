import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
	PageStoreExtractor,
	UrlDetailsExtractor,
} from '../../context/StoreContext';
import { ComponentProps } from '../../types/common';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './sessionReplayPlayerProperties';
import { runEvent } from '../util/runEvent';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';

function authToken(): string | undefined {
	try {
		return window.localStorage.getItem('AuthToken') || undefined;
	} catch {
		return undefined;
	}
}

export default function LazySessionReplayPlayer(props: Readonly<ComponentProps>) {
	const { definition, pageDefinition, locationHistory, context } = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const urlExtractor = UrlDetailsExtractor.getForContext(context.pageName);

	const {
		properties: {
			appCode,
			clientCode,
			sessionId,
			iframeHeight,
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

	const [embedUrl, setEmbedUrl] = useState<string | undefined>();
	const [error, setError] = useState<string | undefined>();
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		setEmbedUrl(undefined);
		setError(undefined);
		if (!appCode || !clientCode || !sessionId) return;

		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
			appCode,
			clientCode,
		};
		const tok = authToken();
		if (tok) headers.Authorization = tok;

		setLoading(true);
		axios
			.post(
				`/api/ui/analytics/replays/${encodeURIComponent(sessionId)}/playback`,
				{},
				{ headers },
			)
			.then(response => setEmbedUrl(response.data?.url))
			.catch(err => {
				const status = err?.response?.status;
				const detail = err?.response?.data?.message ?? err?.message ?? 'Failed to load replay';
				setError(`${status ? status + ': ' : ''}${detail}`);
				if (onError && pageDefinition.eventFunctions?.[onError])
					runEvent(
						pageDefinition.eventFunctions[onError],
						onError,
						context.pageName,
						locationHistory,
						pageDefinition,
					);
			})
			.finally(() => setLoading(false));
	}, [appCode, clientCode, sessionId, onError, pageDefinition, context.pageName, locationHistory]);

	if (visibility === false) return null;

	const baseProps = {
		className: 'comp compSessionReplayPlayer',
		style: resolvedStyles.comp ?? {},
		'data-analytics-label': analyticsLabel || undefined,
	};
	const helper = <HelperComponent context={props.context} definition={definition} />;
	const height = Number(iframeHeight) || 480;

	if (!sessionId)
		return (
			<div {...baseProps} key={key}>
				{helper}
				<div className="_empty">Pick a session in the list to play it back.</div>
			</div>
		);

	if (error)
		return (
			<div {...baseProps} key={key}>
				{helper}
				<div className="_error" style={resolvedStyles.error ?? {}}>
					{error}
				</div>
			</div>
		);

	if (loading || !embedUrl)
		return (
			<div {...baseProps} key={key}>
				{helper}
				<div className="_loading">Loading replay…</div>
			</div>
		);

	return (
		<div {...baseProps} key={key}>
			{helper}
			<iframe
				className="_iframe"
				style={{ height, ...(resolvedStyles.iframe ?? {}) }}
				src={embedUrl}
				title="Session replay"
				allow="autoplay; fullscreen"
			/>
		</div>
	);
}
