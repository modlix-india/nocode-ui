import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

/**
 * What the agent has left in an app's draft, and the two ways to go and look.
 *
 * A surface with editor tabs needs none of this: the agent drafts an object, the
 * tab refetches it, and the shell already carries a Draft link, a Publish button
 * and a pending panel. The plain `ai` chat page has none of those. It drafts
 * (which is right: the change is real and reviewable) and then dead-ends. The
 * only feedback was a per-turn notice saying "waiting for Publish" with nowhere
 * to publish from, and it was component state with a dismiss button, so a
 * refresh lost it while the draft stayed pending on the server for good.
 * Somebody could leave that page believing their change had shipped.
 *
 * So this reads the truth from the server rather than remembering events, which
 * is what makes it survive a refresh, and it offers both places the change can
 * be seen, because they answer different questions:
 *
 *   Open draft         -- the app running with the change in it. Answers
 *                         "does it look right?"
 *   Open in workspace  -- the object in its editor, with the Draft pill and the
 *                         per-object Publish. Answers "what exactly changed?"
 *
 * Neither is the obvious winner for every change, so both are offered and the
 * person decides.
 */

/** One draft the server is holding, exactly as `.../publish/app/{code}/pending` returns it. */
interface PendingRow {
	name: string;
	objectId: string;
	objectType: string;
	baseVersion?: number;
	clientCode?: string;
	message?: string;
	/** Which service holds it. Added here; the response is grouped per service. */
	service: 'ui' | 'core';
}

interface PendingDraftBarProps {
	/** Apps this chat has drafted into, newest first. */
	appCodes: string[];
	getAuthHeaders: () => Record<string, string>;
	/** Called with the apps that turned out to have nothing pending. */
	onEmpty?: (appCodes: string[]) => void;
	publishIcon?: string;
	discardIcon?: string;
	openDraftIcon?: string;
	openWorkspaceIcon?: string;
}

// objectType -> the collection it lives in, per service. Discarding one draft is
// `DELETE {api}/{objectId}/draft`, and there is no app-level discard, so the api
// has to be resolved per row. Same table the workspace's pending panel uses; if
// the platform gains a type, both need it.
const PENDING_API: Record<string, string> = {
	'ui:APPLICATION': '/api/ui/applications',
	'ui:PAGE': '/api/ui/pages',
	'ui:STYLE': '/api/ui/styles',
	'ui:THEME': '/api/ui/themes',
	'ui:FUNCTION': '/api/ui/functions',
	'ui:SCHEMA': '/api/ui/schemas',
	'ui:URIPATH': '/api/ui/uripaths',
	'ui:FILLER': '/api/ui/filler',
	'core:STORAGE': '/api/core/storages',
	'core:CONNECTION': '/api/core/connections',
	'core:TEMPLATE': '/api/core/templates',
	'core:NOTIFICATION': '/api/core/notifications',
	'core:EVENTDEFINITION': '/api/core/eventDefinitions',
	'core:EVENTACTION': '/api/core/eventActions',
	'core:ACTION': '/api/core/workflow/actions',
	'core:WORKFLOW': '/api/core/workflows',
	'core:FUNCTION': '/api/core/functions',
	'core:SCHEMA': '/api/core/schemas',
	'core:FILLER': '/api/core/filler',
};

const KIND_LABEL: Record<string, string> = {
	APPLICATION: 'app definition',
	PAGE: 'page',
	STYLE: 'style',
	THEME: 'theme',
	URIPATH: 'URI path',
	EVENTDEFINITION: 'event definition',
	EVENTACTION: 'event action',
};

function kindLabel(objectType: string): string {
	return KIND_LABEL[objectType] ?? objectType.toLowerCase();
}

/** Flatten `{TYPE: [row, ...]}` into rows tagged with the service that held them. */
function rowsOf(data: any, service: 'ui' | 'core'): PendingRow[] {
	if (!data || typeof data !== 'object') return [];
	const out: PendingRow[] = [];
	for (const group of Object.values<any>(data)) {
		if (!Array.isArray(group)) continue;
		for (const row of group) if (row?.objectId) out.push({ ...row, service });
	}
	return out;
}

/**
 * The builder's own address, so a workspace link points at the right host.
 *
 * Read off the current path rather than the store: the path prefix
 * `/<appCode>/<clientCode>/page/...` is the one thing that is true whichever app
 * the conversation happens to be about, and the app being drafted is NOT the app
 * hosting this chat.
 */
function workspaceUrl(appCode: string): string {
	const parts = globalThis.window?.location?.pathname?.split('/').filter(Boolean) ?? [];
	const prefix = parts.length >= 2 ? `/${parts[0]}/${parts[1]}` : '';
	return `${prefix}/page/workspace/${appCode}`;
}

export function PendingDraftBar({
	appCodes,
	getAuthHeaders,
	onEmpty,
	publishIcon = 'fa fa-cloud-arrow-up',
	discardIcon = 'fa fa-trash-can',
	openDraftIcon = 'fa fa-flask',
	openWorkspaceIcon = 'fa fa-table-columns',
}: Readonly<PendingDraftBarProps>) {
	const [pending, setPending] = useState<Record<string, PendingRow[]>>({});
	const [busy, setBusy] = useState<string>('');
	const [confirming, setConfirming] = useState<string>('');
	const [error, setError] = useState<string>('');

	const key = useMemo(() => appCodes.join(','), [appCodes]);

	const refresh = useCallback(async () => {
		const headers = getAuthHeaders();
		const found: Record<string, PendingRow[]> = {};
		const empty: string[] = [];

		for (const appCode of appCodes) {
			if (!appCode) continue;
			try {
				// Both services, because an app's pending work is split across them
				// and a count from one of them is a wrong count, not a partial one.
				const [ui, core] = await Promise.all([
					axios
						.get(`/api/ui/publish/app/${appCode}/pending`, { headers })
						.catch(() => ({ data: null })),
					axios
						.get(`/api/core/publish/app/${appCode}/pending`, { headers })
						.catch(() => ({ data: null })),
				]);
				const rows = [...rowsOf(ui.data, 'ui'), ...rowsOf(core.data, 'core')];
				if (rows.length) found[appCode] = rows;
				else empty.push(appCode);
			} catch {
				// Leave the app out rather than claiming it is clean.
			}
		}

		setPending(found);
		// Reported so the caller can stop asking about apps that are published or
		// discarded, including from somewhere else entirely.
		if (empty.length) onEmpty?.(empty);
	}, [appCodes, getAuthHeaders, onEmpty]);

	useEffect(() => {
		if (!appCodes.length) {
			setPending({});
			return;
		}
		refresh();
		// `key` rather than the array: a new array with the same apps in it is the
		// normal case on re-render and must not re-fetch.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [key]);

	const openDraft = useCallback(
		async (appCode: string) => {
			setError('');
			setBusy(`draft:${appCode}`);
			try {
				const headers = getAuthHeaders();
				// GET before POST, always. Minting ROTATES the link, which revokes
				// whatever was handed out before, and this button is not the place to
				// take somebody's shared review link away from them.
				let host = '';
				try {
					const got = await axios.get('/api/security/clienturls/draft', {
						headers,
						params: { appCode },
					});
					host = got.data?.urlPattern || got.data?.url || '';
				} catch {
					host = '';
				}
				if (!host) {
					const made = await axios.post('/api/security/clienturls/draft', null, {
						headers,
						params: { appCode },
					});
					host = made.data?.urlPattern || made.data?.url || '';
				}
				if (!host) {
					setError('No draft link for this app yet, and one could not be minted.');
					return;
				}
				globalThis.window?.open(
					host.startsWith('http') ? host : `https://${host}`,
					'_blank',
					'noopener',
				);
			} catch (e: any) {
				setError(e?.message ?? 'Could not open the draft.');
			} finally {
				setBusy('');
			}
		},
		[getAuthHeaders],
	);

	const publish = useCallback(
		async (appCode: string) => {
			setError('');
			setBusy(`publish:${appCode}`);
			try {
				const headers = getAuthHeaders();
				// Both services again, and sequentially: the second is not a retry of
				// the first and a failure in either leaves the other's work published,
				// which the refresh below then shows honestly.
				const ui = await axios.post(`/api/ui/publish/app/${appCode}`, {}, { headers });
				const core = await axios.post(`/api/core/publish/app/${appCode}`, {}, { headers });

				// A partial publish answers 200. Both services report `attempted` and
				// `published`, and when they disagree the difference is the whole
				// story: the refresh below re-lists what is left, but without this
				// the person sees a shorter list and no reason for it.
				const attempted = (ui.data?.attempted ?? 0) + (core.data?.attempted ?? 0);
				const published = (ui.data?.published ?? 0) + (core.data?.published ?? 0);
				if (attempted > published) {
					setError(
						`Published ${published} of ${attempted}. What is still listed below did not go live.`,
					);
				}
				await refresh();
			} catch (e: any) {
				setError(e?.response?.data?.message ?? e?.message ?? 'Publish failed.');
				await refresh();
			} finally {
				setBusy('');
			}
		},
		[getAuthHeaders, refresh],
	);

	const discard = useCallback(
		async (appCode: string) => {
			setError('');
			setBusy(`discard:${appCode}`);
			setConfirming('');
			try {
				const headers = getAuthHeaders();
				const rows = pending[appCode] ?? [];
				// One DELETE per draft: the platform has no app-level discard, only
				// `DELETE {api}/{id}/draft`.
				for (const row of rows) {
					const api = PENDING_API[`${row.service}:${row.objectType}`];
					if (!api) continue;
					await axios
						.delete(`${api}/${row.objectId}/draft`, { headers })
						.catch(() => undefined);
				}
				await refresh();
			} catch (e: any) {
				setError(e?.message ?? 'Discard failed.');
				await refresh();
			} finally {
				setBusy('');
			}
		},
		[getAuthHeaders, pending, refresh],
	);

	const apps = Object.keys(pending);
	if (!apps.length) return <></>;

	return (
		<>
			{apps.map(appCode => {
				const rows = pending[appCode];
				const isConfirming = confirming === appCode;
				return (
					<div className="_promptPendingBar" key={appCode}>
						<div className="_promptPendingHead">
							<i className="fa fa-flask" aria-hidden="true" />
							<span className="_promptPendingCount">
								{rows.length} {rows.length === 1 ? 'change' : 'changes'} waiting in
								the <strong>{appCode}</strong> draft
							</span>
						</div>
						<div className="_promptPendingList">
							{rows
								.map(r => `${kindLabel(r.objectType)} ${r.name}`.trim())
								.join(' · ')}
						</div>
						{error && <div className="_promptPendingError">{error}</div>}
						{isConfirming ? (
							<div className="_promptPendingActions">
								<span className="_promptPendingConfirmText">
									Discard all {rows.length} and go back to what is published?
								</span>
								<button
									type="button"
									className="_promptPendingBtn _danger"
									onClick={() => discard(appCode)}
									disabled={!!busy}
								>
									Discard them
								</button>
								<button
									type="button"
									className="_promptPendingBtn"
									onClick={() => setConfirming('')}
									disabled={!!busy}
								>
									Keep them
								</button>
							</div>
						) : (
							<div className="_promptPendingActions">
								{/* Both, deliberately. One shows the app running with the
								    change in it; the other shows what changed, in the editor
								    that can publish it on its own. */}
								<button
									type="button"
									className="_promptPendingBtn"
									onClick={() => openDraft(appCode)}
									disabled={busy === `draft:${appCode}`}
									title="Open the app running with these changes"
								>
									<i className={openDraftIcon} aria-hidden="true" />
									<span>
										{busy === `draft:${appCode}` ? 'Opening…' : 'Open draft'}
									</span>
								</button>
								<a
									className="_promptPendingBtn"
									href={workspaceUrl(appCode)}
									target="_blank"
									rel="noopener noreferrer"
									title="Open the workspace for this app, where each object has its own editor"
								>
									<i className={openWorkspaceIcon} aria-hidden="true" />
									<span>Open in workspace</span>
								</a>
								<button
									type="button"
									className="_promptPendingBtn _primary"
									onClick={() => publish(appCode)}
									disabled={busy === `publish:${appCode}`}
									title="Make these changes live"
								>
									<i className={publishIcon} aria-hidden="true" />
									<span>
										{busy === `publish:${appCode}` ? 'Publishing…' : 'Publish'}
									</span>
								</button>
								<button
									type="button"
									className="_promptPendingBtn"
									onClick={() => setConfirming(appCode)}
									disabled={!!busy}
									title="Throw these changes away"
								>
									<i className={discardIcon} aria-hidden="true" />
									<span>Discard</span>
								</button>
							</div>
						)}
					</div>
				);
			})}
		</>
	);
}
