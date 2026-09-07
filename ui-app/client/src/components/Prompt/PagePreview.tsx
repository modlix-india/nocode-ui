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
	onClose,
	closeIcon = 'fa fa-xmark',
	reloadIcon = 'fa fa-rotate-right',
	openIcon = 'fa fa-arrow-up-right-from-square',
}: Readonly<PagePreviewProps>) {
	const frameRef = useRef<HTMLIFrameElement>(null);

	// undefined  still minting; the frame must not load yet. One that boots before
	//            the grant exists renders LIVE and, since the src never changes
	//            afterwards, stays live for the rest of the session.
	// ''         no grant: refused or failed. Falls back to the relative path,
	//            which is the live surface.
	// a host     the draft surface for this app.
	const [draftOrigin, setDraftOrigin] = useState<string | undefined>(undefined);

	useEffect(() => {
		if (!appCode) return;
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
			grant = await mintDraftToken(appCode, authToken);
			if (cancelled) return;
			setDraftOrigin(grant ? `https://${grant.host}` : '');
			if (grant) beat();
		})();

		return () => {
			cancelled = true;
			if (timer) clearTimeout(timer);
		};
	}, [appCode]);

	const path = appCode && pageName ? `/${appCode}/${clientCode}/page/${pageName}` : '';
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

				<span className="_promptPreviewPath" title={path}>
					{pageName ? `/${pageName}` : 'No page yet'}
				</span>

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
						title={`Preview of ${pageName}`}
						src={src}
						// Width presets only; the height always fills the pane, because a
						// device's height is the one dimension a person can just scroll.
						style={dev.width ? { width: `${dev.width}px`, flex: '0 0 auto' } : undefined}
					/>
				) : (
					<div className="_promptPreviewEmpty">
						{appCode && pageName
							? 'Preparing the draft surface…'
							: 'Nothing to preview yet. Ask for a page and it will appear here.'}
					</div>
				)}
			</div>
		</div>
	);
}
