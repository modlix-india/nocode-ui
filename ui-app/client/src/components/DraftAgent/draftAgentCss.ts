/**
 * The draft agent's own chrome. Platform UI laid over someone else's app, so it
 * is deliberately self-contained: it takes nothing from the app's theme, and every
 * class is prefixed so the app's styles cannot reach it by accident. The chat
 * inside the docked panel is the Prompt component and keeps Prompt's own styles.
 */
export const DRAFT_AGENT_CSS = `
._mlxDAButton, ._mlxDACompact, ._mlxDADock, ._mlxDAConnect {
	--mlxda-bg: #ffffff;
	--mlxda-fg: #111827;
	--mlxda-muted: #6b7280;
	--mlxda-line: rgba(17, 24, 39, 0.12);
	--mlxda-accent: #4f46e5;
	--mlxda-shadow: 0 10px 30px rgba(17, 24, 39, 0.18), 0 2px 6px rgba(17, 24, 39, 0.08);
	--mlxda-ring: conic-gradient(from 0deg, #6366f1, #06b6d4, #22c55e, #eab308, #f43f5e, #a855f7, #6366f1);
	font: 400 14px/1.45 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
	color: var(--mlxda-fg);
	box-sizing: border-box;
	z-index: 2147482000;
}
@media (prefers-color-scheme: dark) {
	._mlxDAButton, ._mlxDACompact, ._mlxDADock, ._mlxDAConnect {
		--mlxda-bg: #1f2430;
		--mlxda-fg: #f3f4f6;
		--mlxda-muted: #9ca3af;
		--mlxda-line: rgba(243, 244, 246, 0.14);
		--mlxda-accent: #818cf8;
		--mlxda-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
	}
}
._mlxDAButton *, ._mlxDACompact *, ._mlxDADock *, ._mlxDAConnect * { box-sizing: border-box; }

@keyframes mlxdaSpin {
	from { transform: translate(-50%, -50%) rotate(0deg); }
	to { transform: translate(-50%, -50%) rotate(360deg); }
}
@keyframes mlxdaShine {
	0%, 70% { transform: translateX(-120%) rotate(25deg); }
	100% { transform: translateX(220%) rotate(25deg); }
}
@keyframes mlxdaBreath {
	0%, 100% { opacity: 0.55; }
	50% { opacity: 0.95; }
}

/* The ring: a spinning conic gradient behind the face, seen as a border. */
._mlxDARing {
	position: absolute;
	inset: -2.5px;
	border-radius: inherit;
	overflow: hidden;
	pointer-events: none;
	opacity: 0;
	transition: opacity 0.3s ease;
}
/* A square, centred and wider than the box's diagonal, so the sweep covers the
   whole border of a wide prompt as well as the round button. */
._mlxDARing::before {
	content: "";
	position: absolute;
	left: 50%;
	top: 50%;
	width: 160%;
	aspect-ratio: 1;
	transform: translate(-50%, -50%);
	background: var(--mlxda-ring);
	animation: mlxdaSpin 1.8s linear infinite;
}
._busy > ._mlxDARing { opacity: 1; }

/* ── Floating button ───────────────────────────────────────────── */
._mlxDAButton {
	position: fixed;
	width: 52px;
	height: 52px;
	padding: 0;
	border: 0;
	border-radius: 50%;
	background: transparent;
	cursor: grab;
	touch-action: none;
	user-select: none;
}
._mlxDAButton:active { cursor: grabbing; }
._mlxDAButton > ._mlxDARing { opacity: 0.75; animation: mlxdaBreath 3.2s ease-in-out infinite; }
._mlxDAButton > ._mlxDARing::before { animation-duration: 6s; }
._mlxDAButton._busy > ._mlxDARing { opacity: 1; animation: none; }
._mlxDAButton._busy > ._mlxDARing::before { animation-duration: 1.2s; }
._mlxDAButton._dim > ._mlxDARing { opacity: 0.25; animation: none; }
._mlxDAButtonFace {
	position: absolute;
	inset: 1px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
	background: var(--mlxda-bg);
	color: var(--mlxda-accent);
	font-size: 20px;
	box-shadow: var(--mlxda-shadow);
	overflow: hidden;
}
/* The shine: a soft highlight that sweeps across now and then. */
._mlxDAButtonFace::after {
	content: "";
	position: absolute;
	top: -40%;
	left: 0;
	width: 40%;
	height: 180%;
	background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.75), transparent);
	animation: mlxdaShine 4.5s ease-in-out infinite;
	pointer-events: none;
}
._mlxDAButton._dim ._mlxDAButtonFace { color: var(--mlxda-muted); }
._mlxDAButton._dim ._mlxDAButtonFace::after { display: none; }
._mlxDAButton._away ._mlxDAButtonFace { outline: 2px dashed var(--mlxda-accent); outline-offset: -6px; }
._mlxDAButton:focus-visible { outline: 2px solid var(--mlxda-accent); outline-offset: 3px; }

/* ── Compact prompt ────────────────────────────────────────────── */
._mlxDACompact {
	position: fixed;
	border-radius: 18px;
	max-width: calc(100vw - 8px);
}
._mlxDACompactInner {
	position: relative;
	border-radius: 16px;
	background: var(--mlxda-bg);
	box-shadow: var(--mlxda-shadow);
	border: 1px solid var(--mlxda-line);
	padding: 6px;
}
/* The same ring as the FAB: always there, breathing and turning slowly; full and fast
   while the agent works. The inner border gives way to it. */
._mlxDACompact ._mlxDACompactInner { border-color: transparent; }
._mlxDACompact > ._mlxDARing { opacity: 0.75; animation: mlxdaBreath 3.2s ease-in-out infinite; }
._mlxDACompact > ._mlxDARing::before { animation-duration: 6s; }
._mlxDACompact._busy > ._mlxDARing { opacity: 1; animation: none; }
._mlxDACompact._busy > ._mlxDARing::before { animation-duration: 1.2s; }
._mlxDACompactRow { display: flex; align-items: flex-end; gap: 4px; }
._mlxDAGrip {
	flex: none;
	width: 22px;
	height: 36px;
	border: 0;
	background: transparent;
	color: var(--mlxda-muted);
	cursor: grab;
	touch-action: none;
	border-radius: 8px;
}
._mlxDAGrip:active { cursor: grabbing; }
._mlxDAInput {
	flex: 1;
	min-width: 0;
	resize: none;
	border: 0;
	outline: none;
	background: transparent;
	color: inherit;
	font: inherit;
	padding: 8px 4px;
	max-height: 120px;
}
._mlxDAInput::placeholder { color: var(--mlxda-muted); }
._mlxDAInput { overflow-y: hidden; scrollbar-width: thin; }
._mlxDACompact._dragging ._mlxDACompactInner { outline: 2px dashed var(--mlxda-accent); outline-offset: 2px; }
._mlxDAAttachments { display: flex; flex-wrap: wrap; gap: 6px; padding: 4px 6px 2px 30px; }
._mlxDAAttachment {
	position: relative;
	display: inline-flex;
	align-items: center;
	height: 44px;
	max-width: 180px;
	border: 1px solid var(--mlxda-line);
	border-radius: 8px;
	overflow: hidden;
	background: var(--mlxda-bg);
}
._mlxDAAttachment img { height: 100%; width: auto; max-width: 80px; object-fit: cover; display: block; }
._mlxDAAttachmentFile { padding: 0 22px 0 8px; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
._mlxDAAttachmentRemove {
	position: absolute;
	top: 2px;
	right: 2px;
	width: 18px;
	height: 18px;
	border: 0;
	border-radius: 50%;
	background: rgba(17, 24, 39, 0.65);
	color: #fff;
	font-size: 10px;
	cursor: pointer;
	display: inline-flex;
	align-items: center;
	justify-content: center;
}
._mlxDAIconBtn {
	flex: none;
	width: 32px;
	height: 32px;
	margin: 2px 0;
	border: 0;
	border-radius: 10px;
	background: transparent;
	color: var(--mlxda-muted);
	cursor: pointer;
	display: inline-flex;
	align-items: center;
	justify-content: center;
}
._mlxDAIconBtn:hover { background: var(--mlxda-line); color: var(--mlxda-fg); }
._mlxDAIconBtn._send { background: var(--mlxda-accent); color: #fff; }
._mlxDAIconBtn._send:disabled { opacity: 0.35; cursor: default; }
._mlxDAStatus {
	margin: 2px 8px 4px 30px;
	font-size: 12.5px;
	color: var(--mlxda-muted);
	display: flex;
	gap: 8px;
	align-items: baseline;
}
._mlxDAStatus._error { color: #dc2626; }
._mlxDAStatus._queued { opacity: 0.75; }
._mlxDAQueuedText { font-weight: 600; }
._mlxDALink {
	border: 0;
	background: none;
	padding: 0;
	color: inherit;
	text-decoration: underline;
	cursor: pointer;
	font: inherit;
}
._mlxDAConfirm {
	margin: 4px 6px 4px 30px;
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 6px;
	font-size: 13px;
}
._mlxDAConfirm > span { flex: 1 1 100%; }
._mlxDAConfirmBtn {
	border: 1px solid var(--mlxda-line);
	background: transparent;
	color: inherit;
	border-radius: 8px;
	padding: 4px 12px;
	cursor: pointer;
	font: inherit;
}
._mlxDAConfirmBtn._yes { background: var(--mlxda-accent); border-color: var(--mlxda-accent); color: #fff; }
._mlxDAReload {
	margin: 4px 6px 2px 30px;
	border: 0;
	background: none;
	color: var(--mlxda-accent);
	cursor: pointer;
	font: 500 12.5px/1.4 inherit;
	padding: 0;
}
._mlxDAReloadFloat {
	position: fixed;
	right: 16px;
	bottom: 16px;
	z-index: 2147482000;
	background: #fff;
	border-radius: 10px;
	box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
	padding: 6px 10px 6px 0;
}

/* ── Menu ──────────────────────────────────────────────────────── */
._mlxDAMenuWrap { position: absolute; right: 6px; z-index: 2; }
._mlxDAMenuWrap._up { bottom: calc(100% + 8px); }
._mlxDAMenuWrap._down { top: calc(100% + 4px); }
._mlxDAMenu {
	min-width: 230px;
	background: var(--mlxda-bg);
	color: var(--mlxda-fg);
	border: 1px solid var(--mlxda-line);
	border-radius: 12px;
	box-shadow: var(--mlxda-shadow);
	padding: 4px;
}
._mlxDAMenuItem {
	display: flex;
	gap: 10px;
	align-items: center;
	width: 100%;
	border: 0;
	background: none;
	color: inherit;
	font: inherit;
	text-align: left;
	padding: 7px 10px;
	border-radius: 8px;
	cursor: pointer;
}
._mlxDAMenuItem > i { width: 16px; text-align: center; color: var(--mlxda-muted); }
._mlxDAMenuItem:hover { background: var(--mlxda-line); }
._mlxDAMenuItem._active { color: var(--mlxda-accent); }
._mlxDAMenuItem._active > i { color: var(--mlxda-accent); }
._mlxDAMenuSep { height: 1px; margin: 4px 6px; background: var(--mlxda-line); }

/* ── Docked panel ──────────────────────────────────────────────── */
._mlxDADock {
	position: fixed;
	top: 0;
	bottom: 0;
	display: flex;
	flex-direction: column;
	background: var(--mlxda-bg);
	box-shadow: var(--mlxda-shadow);
}
._mlxDADock._left { left: 0; border-right: 1px solid var(--mlxda-line); }
._mlxDADock._right { right: 0; border-left: 1px solid var(--mlxda-line); }
._mlxDADock._windowed { position: fixed; inset: 0; width: auto; box-shadow: none; border: 0; }
._mlxDAResizer {
	position: absolute;
	top: 0;
	bottom: 0;
	width: 8px;
	cursor: col-resize;
	touch-action: none;
	z-index: 3;
}
._mlxDADock._right ._mlxDAResizer { left: -4px; }
._mlxDADock._left ._mlxDAResizer { right: -4px; }
._mlxDAResizer:hover { background: linear-gradient(90deg, transparent 3px, var(--mlxda-accent) 3px, var(--mlxda-accent) 5px, transparent 5px); }
._mlxDAHeader {
	position: relative;
	display: flex;
	align-items: center;
	gap: 6px;
	padding: 8px 8px 8px 14px;
	border-bottom: 1px solid var(--mlxda-line);
	flex: none;
}
._mlxDAHeaderIcon { color: var(--mlxda-accent); display: inline-flex; }
._mlxDATitle { font-weight: 600; }
._mlxDAWho {
	flex: 1;
	min-width: 0;
	color: var(--mlxda-muted);
	font-size: 12px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}
._mlxDADockNotice { flex: none; border-bottom: 1px solid var(--mlxda-line); padding: 4px 0 6px; }
._mlxDABody { flex: 1; min-height: 0; display: flex; flex-direction: column; }
._mlxDABody > * { flex: 1; min-height: 0; }

/* ── Connect card ──────────────────────────────────────────────── */
._mlxDAConnect {
	position: fixed;
	width: 320px;
	max-width: calc(100vw - 16px);
	background: var(--mlxda-bg);
	border: 1px solid var(--mlxda-line);
	border-radius: 14px;
	box-shadow: var(--mlxda-shadow);
	padding: 14px;
}
._mlxDAConnectTitle { font-weight: 600; margin-bottom: 4px; }
._mlxDAConnectText { margin: 0 0 10px; color: var(--mlxda-muted); font-size: 13px; }
._mlxDAConnectRow { display: flex; flex-direction: column; gap: 4px; margin-top: 8px; }
._mlxDAConnectBtn {
	border: 1px solid var(--mlxda-line);
	background: transparent;
	color: inherit;
	font: 500 14px/1.4 inherit;
	padding: 8px 12px;
	border-radius: 10px;
	cursor: pointer;
	text-align: left;
}
._mlxDAConnectBtn:hover { border-color: var(--mlxda-accent); color: var(--mlxda-accent); }
._mlxDAConnectNote { font-size: 12px; color: var(--mlxda-muted); }

/* Picking a component: the page editor's own overlays, shown on hover. */
body._mlxDAPicking, body._mlxDAPicking * { cursor: crosshair !important; }
body._mlxDAPicking [class*="_mlxDA"], body._mlxDAPicking [class*="_mlxDA"] * { cursor: auto !important; }
/* The overlays take no pointer: the picker finds the innermost one itself (draftAgentPicker). */
body._mlxDAPicking ._helper { pointer-events: none !important; }
body._mlxDAPicking ._helper._mlxDAHover { opacity: 1 !important; }
._mlxDAIconBtn._picking { background: var(--mlxda-accent); color: #fff; }
._mlxDAPicked {
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
	padding: 0 2px 6px;
}
._mlxDAPickedChip {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	max-width: 100%;
	padding: 3px 4px 3px 9px;
	border: 1px solid var(--mlxda-line);
	border-radius: 999px;
	font: 500 12px/1.3 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
	color: var(--mlxda-fg, #111827);
	background: var(--mlxda-bg, #fff);
}
._mlxDAPickedChip > span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
._mlxDAPickedChip > i { color: var(--mlxda-accent); font-size: 11px; }
._mlxDAPickedChip > button {
	all: unset;
	cursor: pointer;
	width: 18px;
	height: 18px;
	border-radius: 50%;
	display: inline-grid;
	place-items: center;
	color: var(--mlxda-muted, #6b7280);
}
._mlxDAPickedChip > button:hover { background: var(--mlxda-line); color: var(--mlxda-fg); }
._mlxDAPickHint { font-size: 12px; color: var(--mlxda-muted, #6b7280); padding: 0 2px 6px; }

@media (prefers-reduced-motion: reduce) {
	._mlxDARing::before, ._mlxDAButtonFace::after, ._mlxDAButton > ._mlxDARing, ._mlxDACompact > ._mlxDARing { animation: none; }
}
`;
