import React, { useEffect, useRef, useState } from 'react';
import {
	addDefault,
	addToDashboard,
	defaultsNotInLibrary,
	deleteWidget,
	DocResult,
	duplicateWidget,
	onDashboard,
	removeFromDashboard,
	resolveWidget,
} from '../dashboardModel';
import { ReportTransport } from '../reportApi';
import { describeSpec } from '../simpleForm';
import { DASHBOARD_CAPS, DashboardDoc, ReportCatalog } from '../reportTypes';
import { Icon, useDismiss } from './common';
import { EditorValue } from './ReportEditorView';
import { ReportWidgetView } from './ReportWidgetView';
import { askPlaceholder } from './AskAiBox';
import { Pop } from './portal';

/**
 * The saved reports as cards (Kiran 2026-11-21, "list first"): a small live preview (the number
 * for a KPI), the name, the report in plain words, an "On dashboard" switch and a menu with
 * Edit, Duplicate, Copy or move and Delete (Delete asks first, through the page). The app's
 * defaults the user has not kept follow as "From the app" with an Add button.
 */

/** True once the element has come near the screen (always, without IntersectionObserver). */
function useNearScreen(ref: React.RefObject<HTMLElement | null>): boolean {
	const [near, setNear] = useState(typeof IntersectionObserver === 'undefined');
	useEffect(() => {
		if (near || !ref.current || typeof IntersectionObserver === 'undefined') return;
		const io = new IntersectionObserver(
			es => {
				if (es.some(e => e.isIntersecting)) {
					setNear(true);
					io.disconnect();
				}
			},
			{ rootMargin: '200px' },
		);
		io.observe(ref.current);
		return () => io.disconnect();
	}, [near, ref]);
	return near;
}

function Mini(
	props: Readonly<{
		transport?: ReportTransport;
		runFunction: string;
		catalog: ReportCatalog;
		spec: any;
		name: string;
	}>,
) {
	const ref = useRef<HTMLDivElement>(null);
	const near = useNearScreen(ref);
	return (
		<div ref={ref} className="_rpCardMini">
			{near ? (
				<ReportWidgetView
					transport={props.transport}
					runFunction={props.runFunction}
					catalog={props.catalog}
					spec={props.spec}
					name={props.name}
					compact
					mini
				/>
			) : null}
		</div>
	);
}

export function ReportCards({
	doc,
	catalog,
	editable,
	apply,
	transport,
	runFunction,
	onEdit,
	onDelete,
	onTransfer,
}: Readonly<{
	doc: DashboardDoc;
	catalog: ReportCatalog;
	editable?: boolean;
	apply: (fn: (d: DashboardDoc) => DocResult | DashboardDoc) => void;
	transport?: ReportTransport;
	runFunction: string;
	onEdit: (id: string, v: EditorValue) => void;
	/** Asks before deleting; without it Delete acts at once. */
	onDelete?: (id: string, name: string) => void;
	/** Copy or move to another group (only when there is one). */
	onTransfer?: (id: string, name: string) => void;
}>) {
	const ids = Object.keys(doc.widgets);
	const defaults = defaultsNotInLibrary(doc, catalog);
	const [menu, setMenu] = useState<string | undefined>(undefined);
	const anchor = useRef<HTMLElement | null>(null);
	const menuRef = useDismiss(!!menu, () => setMenu(undefined));

	return (
		<div className="_rpLib">
			<div className="_rpMuted">
				{ids.length} of {DASHBOARD_CAPS.saved} saved · {doc.layout.length} of{' '}
				{DASHBOARD_CAPS.onDashboard} on the dashboard
			</div>
			{ids.length ? (
				<div className="_rpCards">
					{ids.map(id => {
						const r = resolveWidget(doc, id, catalog);
						if (!r) return null;
						const on = onDashboard(doc, id);
						const importError = doc.widgets[id]?.importError;
						return (
							<div key={id} className="_rpCard" data-widget={id}>
								<Mini
									transport={transport}
									runFunction={runFunction}
									catalog={catalog}
									spec={r.spec}
									name={r.name}
								/>
								<div className="_rpCardBody">
									<div className="_rpCardName" title={r.name}>
										{r.name}
									</div>
									<div className="_rpMuted">{describeSpec(r.spec, catalog)}</div>
									{importError ? (
										<div className="_rpMuted _rpError">
											Not available: {importError}
										</div>
									) : null}
								</div>
								{editable ? (
									<div className="_rpCardFoot">
										<label className="_rpSwitch">
											<input
												type="checkbox"
												role="switch"
												checked={on}
												onChange={() =>
													apply(d =>
														on
															? removeFromDashboard(d, id)
															: addToDashboard(d, id),
													)
												}
											/>
											<span aria-hidden="true" />
											On dashboard
										</label>
										<button
											type="button"
											className="_rpIconBtn"
											aria-label={`More for ${r.name}`}
											title="More"
											aria-haspopup="menu"
											aria-expanded={menu === id}
											onClick={e => {
												anchor.current = e.currentTarget;
												setMenu(m => (m === id ? undefined : id));
											}}
										>
											<Icon name="fa-ellipsis" />
										</button>
										{menu === id ? (
											<Pop
												anchor={anchor.current}
												popRef={menuRef}
												align="right"
												role="menu"
											>
												<button
													type="button"
													role="menuitem"
													className="_rpMenuItem"
													onClick={() => {
														setMenu(undefined);
														onEdit(id, {
															name: r.name,
															spec: r.spec,
															refreshMin: r.refreshMin ?? 0,
														});
													}}
												>
													<Icon name="fa-pen" /> Edit
												</button>
												<button
													type="button"
													role="menuitem"
													className="_rpMenuItem"
													onClick={() => {
														setMenu(undefined);
														apply(d => duplicateWidget(d, id, catalog));
													}}
												>
													<Icon name="fa-clone" /> Duplicate
												</button>
												{onTransfer ? (
													<button
														type="button"
														role="menuitem"
														className="_rpMenuItem"
														onClick={() => {
															setMenu(undefined);
															onTransfer(id, r.name);
														}}
													>
														<Icon name="fa-share-from-square" /> Copy or
														move
													</button>
												) : null}
												<div className="_rpMenuSep" />
												<button
													type="button"
													role="menuitem"
													className="_rpMenuItem"
													onClick={() => {
														setMenu(undefined);
														if (onDelete) onDelete(id, r.name);
														else apply(d => deleteWidget(d, id));
													}}
												>
													<Icon name="fa-trash" /> Delete
												</button>
											</Pop>
										) : null}
									</div>
								) : null}
							</div>
						);
					})}
				</div>
			) : (
				<div className="_rpMuted">No saved reports yet.</div>
			)}
			{defaults.length ? (
				<>
					<div className="_rpGroupTitle">From the app</div>
					{defaults.map(d => (
						<div key={d.id} className="_rpLibRow">
							<div className="_rpLibName">
								<span>{d.name}</span>
								<span className="_rpMuted">{describeSpec(d.spec, catalog)}</span>
							</div>
							{editable ? (
								<button
									type="button"
									className="_rpBtn"
									onClick={() => apply(doc2 => addDefault(doc2, d, true))}
								>
									Add to dashboard
								</button>
							) : null}
						</div>
					))}
				</>
			) : null}
		</div>
	);
}

/** "Describe the report you want" on the list: the prompt opens the builder, which asks the AI. */
export function ListAsk({
	onAsk,
	example,
}: Readonly<{ onAsk: (prompt: string) => void; example?: string }>) {
	const [text, setText] = useState('');
	const send = () => {
		const t = text.trim();
		if (!t) return;
		setText('');
		onAsk(t);
	};
	return (
		<div className="_rpAsk">
			<form
				onSubmit={e => {
					e.preventDefault();
					send();
				}}
			>
				<textarea
					className="_rpInput"
					rows={1}
					aria-label="Describe the report you want"
					placeholder={askPlaceholder(example)}
					value={text}
					onChange={e => setText(e.target.value)}
					onKeyDown={e => {
						if (e.key === 'Enter' && !e.shiftKey) {
							e.preventDefault();
							send();
						}
					}}
				/>
				<button type="submit" className="_rpBtn _primary" disabled={!text.trim()}>
					<Icon name="fa-wand-magic-sparkles" /> Ask AI
				</button>
			</form>
		</div>
	);
}
