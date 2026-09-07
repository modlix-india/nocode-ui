import React, { useCallback, useEffect, useRef, useState } from 'react';
import { LOCAL_STORE_PREFIX } from '../../constants';
import { getDataFromPath } from '../../context/StoreContext';
import {
	DraftGrant,
	extendDraftToken,
	heartbeatDelay,
	mintDraftToken,
	previewSrc,
} from '../util/draftToken';

/**
 * The page the agent is working on, rendered beside the chat.
 *
 * A chat that builds pages and cannot show them makes the user take the agent's
 * word for it. The agent screenshots its work, but that PNG only ever reaches the
 * MODEL: it rides inside `tool_result.content`, and the SSE event the browser
 * gets carries a text summary and nothing else. So the picture has to be made
 * here, by rendering the page for real.
 *
 * Draft is the default surface, not live. The agent writes to the draft when
 * `draftMode` is on, so live is the page as it was BEFORE this conversation --
 * useful for comparison, wrong as a default, because the change the user just
 * asked for would be missing and the preview would look broken.
 */

/** Width presets. Same intent as the page editor's device list, trimmed to three. */
const DEVICES: Array<{ key: string; label: string; width: number; icon: string }> = [
	{ key: 'desktop', label: 'Desktop', width: 0, icon: 'fa fa-desktop' },
	{ key: 'tablet', label: 'Tablet', width: 834, icon: 'fa fa-tablet-screen-button' },
	{ key: 'mobile', label: 'Mobile', width: 414, icon: 'fa fa-mobile-screen-button' },
];

export type PreviewSurface = 'draft' | 'live';

/** A path the user typed, resolved against the app the pane is already on. */
export interface PreviewPathParts {
	appCode: string;
	clientCode: string;
	pageName: string;
	/** Query and hash, kept verbatim, so a page that takes parameters can be opened. */
	suffix: string;
}

/**
 * Read whatever was typed into the path box.
 *
 * Forgiving on purpose. The three things anyone actually types are a bare page
 * name, `/name`, and a whole preview URL pasted out of a browser tab -- which
 * carries an origin and possibly a query string. All three mean "show me this",
 * so all three are accepted.
 *
 * The origin is dropped rather than honoured: the Draft/Live toggle is what
 * decides the host, and a pasted draft hostname is a token that may be dead by
 * now. Segments that are not the `/<app>/<client>/page/<name>` shape contribute
 * only the page name, because the app and the client are what the pane is
 * already pointed at.
 */
export function parsePreviewPath(
	text: string,
	appCode: string,
	clientCode: string,
): PreviewPathParts | undefined {
	let rest = text.trim();
	if (!rest) return undefined;

	const origin = /^[a-z][a-z0-9+.-]*:\/\/[^/]*/i.exec(rest);
	if (origin) rest = rest.substring(origin[0].length);

	const cut = rest.search(/[?#]/);
	const suffix = cut === -1 ? '' : rest.substring(cut);
	const segments = (cut === -1 ? rest : rest.substring(0, cut))
		.split('/')
		.map(s => s.trim())
		.filter(s => s.length > 0);
	if (segments.length === 0) return undefined;

	const marker = segments.indexOf('page');
	if (marker >= 2 && marker < segments.length - 1)
		return {
			appCode: segments[0],
			clientCode: segments[1],
			pageName: segments[marker + 1],
			suffix,
		};

	return { appCode, clientCode, pageName: segments.at(-1)!, suffix };
}

interface PagePreviewProps {
	appCode: string;
	pageName: string;
	clientCode: string;
	surface: PreviewSurface;
	onSurfaceChange: (s: PreviewSurface) => void;
	device: string;
	onDeviceChange: (d: string) => void;
	/** Bumped by the host when a write lands on this page, to reload the frame. */
	reloadSignal?: number;
	/**
	 * Told when the path box is pointed somewhere else, so the host stays the one
	 * place that knows what is being previewed: it is what reloads the pane when a
	 * write lands, and what names the page on the button that reopens it.
	 */
	onTargetChange?: (target: { appCode: string; pageName: string }) => void;
	onClose: () => void;
	closeIcon?: string;
	reloadIcon?: string;
	openIcon?: string;
}

export function PagePreview({
	appCode,
	pageName,
	clientCode,
	surface,
	onSurfaceChange,
	device,
	onDeviceChange,
	reloadSignal = 0,
	onTargetChange,
	onClose,
	closeIcon = 'fa fa-xmark',
	reloadIcon = 'fa fa-rotate-right',
	openIcon = 'fa fa-arrow-up-right-from-square',
}: Readonly<PagePreviewProps>) {
	const frameRef = useRef<HTMLIFrameElement>(null);

	// ── The path box ────────────────────────────────────────────────────────
	// The pane follows the agent, which is right until someone wants to look at
	// the page NEXT to the one being written -- the page that links to it, the
	// list it appears in. So the path is typed as well as followed.
	//
	// `override` is where the box has been pointed; undefined means the pane is
	// still following the host. `typed` is the text mid-edit, undefined when the
	// box is just displaying.
	const [override, setOverride] = useState<PreviewPathParts | undefined>(undefined);
	const [typed, setTyped] = useState<string | undefined>(undefined);

	// The host retargeting means the agent moved on, and an override for a page
	// nobody is on any more is stale. One the host has just CAUGHT UP with is not:
	// it still carries the query string that was typed with it.
	//
	// `typed` is deliberately left alone. It is only ever set while the box has
	// focus -- committing clears it, and blur commits -- so clearing it here would
	// be taking keystrokes out from under someone mid-edit.
	useEffect(() => {
		setOverride(prev =>
			prev && prev.appCode === appCode && prev.pageName === pageName ? prev : undefined,
		);
	}, [appCode, pageName]);

	const shownApp = override?.appCode ?? appCode;
	const shownClient = override?.clientCode ?? clientCode;
	const shownPage = override?.pageName ?? pageName;
	const suffix = override?.suffix ?? '';

	// undefined  still minting; the frame must not load yet. One that boots before
	//            the grant exists renders LIVE and, since the src never changes
	//            afterwards, stays live for the rest of the session.
	// ''         no grant: refused or failed. Falls back to the relative path,
	//            which is the live surface.
	// a host     the draft surface for this app.
	const [draftOrigin, setDraftOrigin] = useState<string | undefined>(undefined);

	// Keyed on the app being SHOWN, not the one the host asked for: a path typed
	// into the box can name another app, and a grant is minted per app.
	useEffect(() => {
		if (!shownApp) return;
		// Back to "still minting" for the new app. Keeping the previous host would
		// point the frame at one app's draft origin with another app's path on it.
		setDraftOrigin(undefined);
		let cancelled = false;
		let timer: any = null;
		let grant: DraftGrant | undefined;
		const authToken = getDataFromPath(`${LOCAL_STORE_PREFIX}.AuthToken`, []);

		// Extend, never rotate: the token IS the hostname, so a new value is a new
		// origin and would reload the frame, losing scroll and anything the
		// previewed page holds in its own store.
		const beat = () => {
			timer = setTimeout(async () => {
				if (cancelled || !grant) return;
				const extended = await extendDraftToken(grant.token, authToken);
				if (cancelled) return;
				if (extended) grant = extended;
				beat();
			}, heartbeatDelay(grant?.expiresAt));
		};

		(async () => {
			grant = await mintDraftToken(shownApp, authToken);
			if (cancelled) return;
			setDraftOrigin(grant ? `https://${grant.host}` : '');
			if (grant) beat();
		})();

		return () => {
			cancelled = true;
			if (timer) clearTimeout(timer);
		};
	}, [shownApp]);

	const path =
		shownApp && shownPage ? `/${shownApp}/${shownClient}/page/${shownPage}${suffix}` : '';
	// Live is deliberately the relative path: same origin, no grant, no draft
	// header. `previewSrc` already encodes the tri-state for the draft case.
	const src = surface === 'draft' ? previewSrc(draftOrigin, path) : path || undefined;

	/**
	 * Reload by asking the frame to reload itself.
	 *
	 * `contentWindow.location.reload()` is cross-origin property access once the
	 * preview is on its own draft hostname, and throws. Every framed Modlix app
	 * installs the listener for this, because being framed at all is what sets
	 * `isDesignMode`. Targeted at the frame's own origin rather than '*': there is
	 * no reason to broadcast, and the draft origin is known here.
	 */
	const reload = useCallback(() => {
		const win = frameRef.current?.contentWindow;
		if (!win) return;
		const target = surface === 'draft' && draftOrigin ? draftOrigin : window.location.origin;
		try {
			win.postMessage({ type: 'EDITOR_RELOAD', payload: undefined }, target);
		} catch {
			// A frame mid-navigation can refuse. The next change reloads it anyway.
		}
	}, [surface, draftOrigin]);

	const seenReloadRef = useRef(reloadSignal);
	useEffect(() => {
		if (reloadSignal === seenReloadRef.current) return;
		seenReloadRef.current = reloadSignal;
		reload();
	}, [reloadSignal, reload]);

	/**
	 * Point the pane at whatever is in the box.
	 *
	 * An emptied box is not an error, it is "go back to following the agent", so
	 * it clears the override rather than being rejected.
	 */
	const commitPath = useCallback(() => {
		if (typed === undefined) return;
		setTyped(undefined);
		if (!typed.trim()) {
			setOverride(undefined);
			return;
		}
		const parsed = parsePreviewPath(typed, appCode, clientCode);
		if (!parsed) return;
		setOverride(parsed);
		if (parsed.appCode !== appCode || parsed.pageName !== pageName)
			onTargetChange?.({ appCode: parsed.appCode, pageName: parsed.pageName });
	}, [typed, appCode, clientCode, pageName, onTargetChange]);

	// The short form while the pane is on the app the host named, which is almost
	// always; the whole path once it is not, because then the app is the news.
	let shortPath = '';
	if (shownPage)
		shortPath =
			shownApp === appCode
				? `/${shownPage}${suffix}`
				: `/${shownApp}/${shownClient}/page/${shownPage}${suffix}`;

	const dev = DEVICES.find(d => d.key === device) ?? DEVICES[0];

	return (
		<div className="_promptPreview">
			<div className="_promptPreviewBar">
				<div className="_promptPreviewSurface">
					{(['draft', 'live'] as const).map(s => (
						<button
							key={s}
							type="button"
							className={`_promptPreviewTab${surface === s ? ' _active' : ''}`}
							onClick={() => onSurfaceChange(s)}
							title={
								s === 'draft'
									? 'The app with this conversation’s unpublished changes'
									: 'The published app, without the changes waiting for Publish'
							}
						>
							{s === 'draft' ? 'Draft' : 'Live'}
						</button>
					))}
				</div>

				<input
					className={`_promptPreviewPath${override ? ' _pinned' : ''}`}
					value={typed ?? shortPath}
					placeholder="No page yet"
					title={
						path
							? `${path}\nType a page name or a preview path, Enter to go. Empty follows the agent again.`
							: 'Type a page name to preview it'
					}
					aria-label="Page path"
					spellCheck={false}
					autoComplete="off"
					onChange={e => setTyped(e.target.value)}
					onKeyDown={e => {
						// The chat and the page below both bind keys. A path being
						// typed is not a shortcut for either of them.
						e.stopPropagation();
						if (e.key === 'Enter') {
							e.preventDefault();
							commitPath();
							e.currentTarget.blur();
						} else if (e.key === 'Escape') {
							e.preventDefault();
							setTyped(undefined);
							e.currentTarget.blur();
						}
					}}
					onBlur={commitPath}
				/>

				<div className="_promptPreviewTools">
					{DEVICES.map(d => (
						<button
							key={d.key}
							type="button"
							className={`_promptPreviewTool${device === d.key ? ' _active' : ''}`}
							onClick={() => onDeviceChange(d.key)}
							title={d.label}
							aria-label={d.label}
						>
							<i className={d.icon} aria-hidden="true" />
						</button>
					))}
					<button
						type="button"
						className="_promptPreviewTool"
						onClick={reload}
						title="Reload the preview"
						aria-label="Reload the preview"
					>
						<i className={reloadIcon} aria-hidden="true" />
					</button>
					{src && (
						<a
							className="_promptPreviewTool"
							href={src}
							target="_blank"
							rel="noopener noreferrer"
							title="Open in a new tab"
							aria-label="Open in a new tab"
						>
							<i className={openIcon} aria-hidden="true" />
						</a>
					)}
					<button
						type="button"
						className="_promptPreviewTool"
						onClick={onClose}
						title="Close the preview"
						aria-label="Close the preview"
					>
						<i className={closeIcon} aria-hidden="true" />
					</button>
				</div>
			</div>

			<div className="_promptPreviewBody">
				{src ? (
					<iframe
						ref={frameRef}
						className="_promptPreviewFrame"
						title={`Preview of ${shownPage}`}
						src={src}
						// Width presets only; the height always fills the pane, because a
						// device's height is the one dimension a person can just scroll.
						style={
							dev.width ? { width: `${dev.width}px`, flex: '0 0 auto' } : undefined
						}
					/>
				) : (
					<div className="_promptPreviewEmpty">
						{shownApp && shownPage
							? 'Preparing the draft surface…'
							: 'Nothing to preview yet. Ask for a page, or type one above.'}
					</div>
				)}
			</div>
		</div>
	);
}
