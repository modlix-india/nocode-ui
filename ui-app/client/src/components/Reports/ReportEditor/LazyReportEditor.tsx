import React, { useState } from 'react';
import {
	getPathFromLocation,
	PageStoreExtractor,
	setData,
	UrlDetailsExtractor,
} from '../../../context/StoreContext';
import { ComponentProps } from '../../../types/common';
import { processComponentStylePseudoClasses } from '../../../util/styleProcessor';
import { HelperComponent } from '../../HelperComponents/HelperComponent';
import useDefinition from '../../util/useDefinition';
import { addWidget } from '../dashboardModel';
import { useDashboardDoc } from '../dashboardStore';
import { usePageEvents } from '../pageEvents';
import { defaultCatalogFunction, defaultRunFunction } from '../reportApi';
import { useCatalog, useTransport } from '../ui/hooks';
import { ReportEditorView } from '../ui/ReportEditorView';
import { propertiesDefinition, stylePropertiesDefinition } from './reportEditorProperties';

export default function LazyReportEditor(props: Readonly<ComponentProps>) {
	const { definition, locationHistory, context, pageDefinition } = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const urlExtractor = UrlDetailsExtractor.getForContext(context.pageName);
	const { properties = {}, stylePropertiesWithPseudoStates } = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
		urlExtractor,
	);
	const resolvedStyles = processComponentStylePseudoClasses(
		pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);
	const ns = properties.appNamespace as string | undefined;
	const runFunction = (properties.runFunction as string) || defaultRunFunction(ns);
	const catalogFunction = (properties.catalogFunction as string) || defaultCatalogFunction(ns);
	const transport = useTransport(properties.useFixtures);
	const cat = useCatalog(transport, catalogFunction);
	const docState = useDashboardDoc(
		transport,
		(properties.dashboardName as string) || 'dashboard',
		cat.catalog,
	);
	const event = usePageEvents(props);
	const [toDashboard, setToDashboard] = useState<boolean | undefined>(undefined);
	const [message, setMessage] = useState<{ text: string; error?: boolean } | undefined>(
		undefined,
	);
	const [round, setRound] = useState(0);
	const path = definition.bindingPath
		? getPathFromLocation(definition.bindingPath, locationHistory, pageExtractor)
		: undefined;
	const addIt = toDashboard ?? properties.addToDashboard !== false;

	let body: React.ReactNode;
	if (cat.error || docState.status === 'error')
		body = (
			<div className="_rpState" role="alert">
				<span className="_rpError">{cat.error ?? docState.error}</span>
				<button
					type="button"
					className="_rpBtn"
					onClick={() => (cat.error ? cat.retry() : docState.retry())}
				>
					Try again
				</button>
			</div>
		);
	else if (!cat.catalog || docState.status !== 'ready')
		body = (
			<div className="_rpState" aria-busy="true">
				<div className="_rpSkeleton" style={{ width: '100%', minHeight: 200 }} />
			</div>
		);
	else
		body = (
			<ReportEditorView
				key={round}
				transport={transport}
				catalog={cat.catalog}
				runFunction={runFunction}
				saveLabel="Save widget"
				extra={
					<label className="_rpCheck">
						<input
							type="checkbox"
							checked={addIt}
							onChange={e => setToDashboard(e.target.checked)}
						/>
						Add to my dashboard
					</label>
				}
				onSave={v => {
					let saved: { id: string } | undefined;
					let error = '';
					docState.update(d => {
						const r = addWidget(
							d,
							{ name: v.name, spec: v.spec, refreshMin: v.refreshMin },
							{ toDashboard: addIt },
						);
						if (!r.ok) {
							error = r.error;
							return d;
						}
						saved = { id: r.id! };
						return r.doc;
					});
					if (error || !saved) {
						setMessage({ text: error || 'Could not save the widget.', error: true });
						return;
					}
					setMessage({
						text: `Saved "${v.name}"${addIt ? ' to your dashboard' : ' to your library'}.`,
					});
					if (path)
						setData(
							path,
							{ id: saved.id, name: v.name, spec: v.spec },
							context.pageName,
						);
					event(properties.onSave)?.();
					setRound(r => r + 1);
				}}
			/>
		);

	return (
		<div className="comp compReportEditor" style={resolvedStyles.comp ?? {}}>
			<HelperComponent context={context} definition={definition} />
			{message ? (
				<div
					className={message.error ? '_rpError' : '_rpMuted'}
					role="status"
					style={{ marginBottom: 8 }}
				>
					{message.text}
				</div>
			) : null}
			{body}
		</div>
	);
}
