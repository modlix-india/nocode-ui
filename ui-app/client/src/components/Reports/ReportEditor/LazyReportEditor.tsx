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
import { readyDoc, updateEntry, useDashboardDoc } from '../dashboardStore';
import { catalogForGroup, labelError } from '../groupsModel';
import { useReportGroups } from '../groupsStore';
import { usePageEvents } from '../pageEvents';
import { defaultCatalogFunction, defaultRunFunction, namespaceOf } from '../reportApi';
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
	// `group` (CONTRACT 9); `dashboardName` is the P1a name of the same thing.
	const initialGroup =
		String(properties.group || properties.dashboardName || '').trim() || 'dashboard';
	const docState = useDashboardDoc(
		transport,
		initialGroup,
		catalogForGroup(cat.catalog, initialGroup),
	);
	const groups = useReportGroups(transport, ns || namespaceOf(runFunction), cat.catalog);
	const [target, setTarget] = useState(initialGroup);
	const [newLabel, setNewLabel] = useState('');
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
	const groupOptions = groups.all.some(g => g.id === initialGroup)
		? groups.all
		: [{ id: initialGroup, label: initialGroup }, ...groups.all];
	const labelOfGroup = (id: string) => groupOptions.find(g => g.id === id)?.label ?? id;

	/** Saves into the picked group (made first when it is a new one); '' when saved. */
	const saveTo = async (v: {
		name: string;
		spec: any;
		refreshMin?: number;
	}): Promise<{ error: string; id?: string; group?: string }> => {
		if (!transport) return { error: 'Not ready yet.' };
		let group = target;
		if (target === NEW_GROUP) {
			const err = labelError(newLabel, groups.user, groups.app);
			if (err) return { error: err };
			const made = await groups.create(newLabel);
			if (!made.ok || !made.id) return { error: made.ok ? 'The group was not made.' : made.error };
			group = made.id;
			setTarget(made.id);
			setNewLabel('');
		}
		let error = '';
		let id: string | undefined;
		try {
			const entry = await readyDoc(transport, group, catalogForGroup(cat.catalog, group));
			updateEntry(entry, d => {
				const r = addWidget(
					d,
					{ name: v.name, spec: v.spec, refreshMin: v.refreshMin },
					{ toDashboard: addIt },
				);
				if (!r.ok) {
					error = r.error;
					return d;
				}
				id = r.id;
				return r.doc;
			});
		} catch (e: any) {
			error = e?.message ?? 'That group could not be loaded.';
		}
		if (!error && !id) error = 'Could not save the widget.';
		return { error, id, group };
	};

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
					<>
						<label className="_rpLabel">
							Save to group
							<select
								className="_rpSelect"
								value={target}
								onChange={e => setTarget(e.target.value)}
							>
								{groupOptions.map(g => (
									<option key={g.id} value={g.id}>
										{g.label}
									</option>
								))}
								{groups.status === 'ready' ? (
									<option value={NEW_GROUP}>New group</option>
								) : null}
							</select>
						</label>
						{target === NEW_GROUP ? (
							<label className="_rpLabel">
								New group name
								<input
									className="_rpInput"
									maxLength={40}
									value={newLabel}
									onChange={e => setNewLabel(e.target.value)}
								/>
							</label>
						) : null}
						<label className="_rpCheck">
							<input
								type="checkbox"
								checked={addIt}
								onChange={e => setToDashboard(e.target.checked)}
							/>
							Add to my dashboard
						</label>
					</>
				}
				onSave={async v => {
					const newName = target === NEW_GROUP ? newLabel.trim() : '';
					const r = await saveTo(v);
					if (r.error || !r.id) {
						setMessage({ text: r.error || 'Could not save the widget.', error: true });
						return;
					}
					const saved = { id: r.id };
					const where = newName || labelOfGroup(r.group!);
					setMessage({
						text: `Saved "${v.name}" to ${where}${addIt ? '' : ' (library only)'}.`,
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

const NEW_GROUP = '__new__';
