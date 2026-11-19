import React, { Suspense, useContext, useEffect, useId, useState } from 'react';
import { fetchFunctionDefinition } from '../../AutomationFlow/automationApi';
import { CraftContext } from './craftContext';

const LazyKIRunEditor = React.lazy(
	() => import(/* webpackChunkName: "KIRunEditor" */ '../../KIRunEditor/LazyKIRunEditor'),
);

/**
 * The `kirun` craft block: a function, explained.
 *
 * Contract (agreed with the agent side, `emit_craft` blocks):
 *   { type: "kirun", namespace, name, isServer?: boolean, appCode?: string,
 *     summary?: [string], definition?: <KIRun function definition> }
 *
 * Inline in a message it is one line, "Function: <name> · View", which opens
 * the craft in the side panel. In the panel it has two tabs: "What this does"
 * (the agent's numbered sentences, the default) and "Technical view" (the
 * KIRun editor, read only). Without a `definition` the function is fetched by
 * namespace and name when the technical view is first opened.
 */
export interface KirunBlockProps {
	namespace?: string;
	name?: string;
	isServer?: boolean;
	appCode?: string;
	summary?: string[];
	definition?: any;
}

type Tab = 'summary' | 'technical';

function TechnicalView({
	namespace,
	name,
	isServer,
	appCode,
	definition,
}: Readonly<KirunBlockProps>) {
	const ctx = useContext(CraftContext);
	const [fetched, setFetched] = useState<any>();
	const [error, setError] = useState('');
	const def = definition ?? fetched;

	useEffect(() => {
		if (definition || !name) return;
		let live = true;
		setError('');
		fetchFunctionDefinition(namespace ?? '', name, !!isServer, appCode)
			.then(d => {
				if (!live) return;
				if (d) setFetched(d);
				else setError('This function could not be found.');
			})
			.catch(() => live && setError('This function could not be loaded.'));
		return () => {
			live = false;
		};
	}, [definition, namespace, name, isServer, appCode]);

	if (error) return <div className="_craftKirunNote">{error}</div>;
	if (!def) return <div className="_craftKirunNote">Loading…</div>;
	if (!ctx?.host)
		return <div className="_craftKirunNote">The technical view is not available here.</div>;
	return (
		<div className="_craftKirunEditor">
			<Suspense fallback={<div className="_craftKirunNote">Loading the editor…</div>}>
				<LazyKIRunEditor
					context={ctx.host.context as any}
					pageDefinition={ctx.host.pageDefinition}
					locationHistory={ctx.host.locationHistory}
					definition={{
						key: `craftKirun_${namespace ?? ''}_${name ?? ''}`,
						name: 'Function',
						type: 'KIRunEditor',
						properties: {
							readOnly: { value: true },
							editorType: { value: isServer ? 'core' : 'ui' },
							...(appCode ? { appCode: { value: appCode } } : {}),
						},
					}}
					functionDefinition={def}
				/>
			</Suspense>
		</div>
	);
}

export default function KirunCraftBlock(props: Readonly<KirunBlockProps>) {
	const { namespace, name, summary } = props;
	const ctx = useContext(CraftContext);
	const [tab, setTab] = useState<Tab>('summary');
	const uid = useId();
	const label = name ?? 'function';

	if (ctx?.inline) {
		return (
			<div className="_craftKirunChip">
				<span className="_craftKirunChipText">
					Function: <strong>{label}</strong>
				</span>
				{ctx.onOpenPanel && (
					<>
						<span aria-hidden="true"> · </span>
						<button
							type="button"
							className="_craftKirunView"
							onClick={ctx.onOpenPanel}
							aria-label={`View the function ${label}`}
						>
							View
						</button>
					</>
				)}
			</div>
		);
	}

	const tabs: Array<[Tab, string]> = [
		['summary', 'What this does'],
		['technical', 'Technical view'],
	];
	return (
		<div className="_craftKirun">
			<div className="_craftKirunHead">
				Function: <strong>{label}</strong>
				{namespace && <span className="_craftKirunNs">{namespace}</span>}
			</div>
			<div className="_craftKirunTabs" role="tablist" aria-label={`Function ${label}`}>
				{tabs.map(([t, text]) => (
					<button
						key={t}
						type="button"
						role="tab"
						id={`${uid}-${t}`}
						aria-selected={tab === t}
						aria-controls={`${uid}-panel`}
						tabIndex={tab === t ? 0 : -1}
						className={`_craftKirunTab${tab === t ? ' _active' : ''}`}
						onClick={() => setTab(t)}
						onKeyDown={e => {
							if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
								e.preventDefault();
								const next: Tab = tab === 'summary' ? 'technical' : 'summary';
								setTab(next);
								document.getElementById(`${uid}-${next}`)?.focus();
							}
						}}
					>
						{text}
					</button>
				))}
			</div>
			<div
				id={`${uid}-panel`}
				role="tabpanel"
				aria-labelledby={`${uid}-${tab}`}
				className="_craftKirunBody"
			>
				{tab === 'summary' ? (
					summary?.length ? (
						<ol className="_craftKirunSummary">
							{summary.map((s, i) => (
								<li key={i}>{s}</li>
							))}
						</ol>
					) : (
						<div className="_craftKirunNote">
							No summary was given. Open the technical view to see the steps.
						</div>
					)
				) : (
					<TechnicalView {...props} />
				)}
			</div>
		</div>
	);
}
