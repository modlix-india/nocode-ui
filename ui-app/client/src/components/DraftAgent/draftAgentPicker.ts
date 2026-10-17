import { useCallback, useEffect, useRef, useState } from 'react';
import { PickedComponent, pickableComponents, readOnScreen } from './draftAgentContext';

/**
 * Point at a component on the running draft, the way the page editor selects one.
 *
 * Nothing new is drawn for it: the editor's own overlays (`PageEditorHelperComponent`,
 * `helper_component_key_<key>`) already sit on every component, carry its key, its
 * label and the selected outline. They render only in design mode, and design mode
 * changes far more than drawing (store writes, events, shortcuts), so a flag of its
 * own turns them on: `globalThis.draftPick`. They read what to outline from
 * `globalThis.pageEditor`, which is filled here while picking lasts and put back after.
 *
 * Which overlay is under the pointer is NOT left to the browser. A component styled
 * with a z-index or a transform (a Table with `z-index: 0` is enough) makes its own
 * stacking layer, and every overlay inside it then paints BELOW the overlays of the
 * Grids around it: the pointer only ever reached the outer Grid, so a table, its
 * columns and its cells could not be picked. So while picking the overlays take no
 * pointer events; the element under the pointer is found, and its ancestors that
 * carry an overlay are the choices, innermost first. Arrow Up steps out to the parent.
 */

const HIGHLIGHT = '#7C3AED';
const HELPER_PREFIX = 'helper_component_key_';
const HOVER_CLASS = '_mlxDAHover';

function wake() {
	// RenderEngineContainer re-renders the page on this, and with it every overlay.
	globalThis.raiseDesignModeChangeEvent?.();
}

/** Tell the overlays what is selected now. They re-render on any `EDITOR_` message. */
function echoSelection(keys: string[]) {
	if (globalThis.pageEditor)
		globalThis.pageEditor = { ...globalThis.pageEditor, selectedComponents: keys };
	// Never `EDITOR_DEFINITION` here: on a top window App.tsx would take it as the
	// editor's and write the picker's merged component map over the real page.
	window.postMessage({ type: 'EDITOR_SELECTION', payload: keys }, window.location.origin);
}

// The agent's own panel, button and menus. Not `body`: it carries `_mlxDAPicking` while
// picking, and matching it made every element on the page count as the agent's.
const inChrome = (t: EventTarget | null) =>
	!!(t as Element | null)?.closest?.('[class*="_mlxDA"]:not(body)');

/** The overlays of the components under (x, y), innermost first. */
export function overlaysAt(x: number, y: number): HTMLElement[] {
	const hit = document.elementFromPoint(x, y);
	if (!hit || inChrome(hit)) return [];
	const out: HTMLElement[] = [];
	for (let e: Element | null = hit; e && e !== document.body; e = e.parentElement) {
		const h = e.querySelector(`:scope > [id^="${HELPER_PREFIX}"]`);
		if (h) out.push(h as HTMLElement);
	}
	return out;
}

export function usePicker(pageKey: string, enabled: boolean) {
	const [picking, setPicking] = useState(false);
	const [picked, setPicked] = useState<PickedComponent[]>([]);
	const pickedRef = useRef(picked);
	pickedRef.current = picked;

	// A selection belongs to the page it was made on.
	useEffect(() => {
		setPicked([]);
		setPicking(false);
	}, [pageKey]);

	useEffect(() => {
		if (!enabled) setPicking(false);
	}, [enabled]);

	useEffect(() => {
		if (!picking) return;
		const on = readOnScreen();
		const comps = pickableComponents(on);
		const componentDefinition = Object.fromEntries(
			Object.entries(comps).map(([k, v]) => [k, v.def]),
		);

		const prevEditor = globalThis.pageEditor;
		globalThis.pageEditor = {
			// The overlay draws only when this name is the page the URL names.
			editingPageDefinition: { name: on.urlPage, componentDefinition } as any,
			selectedComponents: pickedRef.current.map(p => p.key),
			selectedSubComponent: '',
			personalization: { slave: { highlightColor: HIGHLIGHT } },
		};
		globalThis.draftPick = true;
		document.body.classList.add('_mlxDAPicking');
		wake();

		const toPicked = (key: string): PickedComponent | undefined => {
			const c = comps[key];
			if (!c) return undefined;
			return { key, type: c.def.type, name: c.def.name ?? '', page: c.page };
		};

		const choose = (key: string, multi: boolean) => {
			const hit = toPicked(key);
			if (!hit) return;
			const cur = pickedRef.current;
			let next: PickedComponent[];
			if (!multi) next = [hit];
			else if (cur.some(p => p.key === key)) next = cur.filter(p => p.key !== key);
			else next = [...cur, hit];
			pickedRef.current = next;
			setPicked(next);
			echoSelection(next.map(p => p.key));
			// One plain click picks and is done; Cmd/Ctrl-click keeps adding.
			if (!multi) setPicking(false);
		};

		// The choices under the pointer and how far out from the innermost one we are.
		let chain: HTMLElement[] = [];
		let depth = 0;
		let shown: HTMLElement | null = null;
		const show = (h: HTMLElement | null) => {
			if (shown === h) return;
			shown?.classList.remove(HOVER_CLASS);
			shown = h;
			h?.classList.add(HOVER_CLASS);
		};
		const showDepth = () => show(chain[Math.min(depth, chain.length - 1)] ?? null);

		const onMove = (e: MouseEvent) => {
			const next = overlaysAt(e.clientX, e.clientY);
			if (next[0] !== chain[0]) depth = 0;
			chain = next;
			showDepth();
		};

		// The app must not see any of the pointer: picking a button must not press it.
		const swallow = (e: Event) => {
			if (inChrome(e.target)) return;
			e.preventDefault();
			e.stopPropagation();
		};
		// Chosen on `click`, not `mouseup`: `pointerdown` is cancelled above, and a
		// cancelled pointerdown means the browser never sends mousedown or mouseup at all
		// (Pointer Events "compatibility mouse events"). `click` still comes.
		const onClick = (e: MouseEvent) => {
			if (inChrome(e.target) || e.button !== 0) return;
			swallow(e);
			const h = shown ?? overlaysAt(e.clientX, e.clientY)[0];
			if (h) choose(h.id.slice(HELPER_PREFIX.length), e.metaKey || e.ctrlKey);
		};
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setPicking(false);
			else if (e.key === 'ArrowUp' && chain.length)
				depth = Math.min(depth + 1, chain.length - 1);
			else if (e.key === 'ArrowDown' && chain.length) depth = Math.max(depth - 1, 0);
			else return;
			e.preventDefault();
			e.stopPropagation();
			showDepth();
		};

		const opts = { capture: true };
		window.addEventListener('mousemove', onMove, opts);
		window.addEventListener('pointerdown', swallow, opts);
		window.addEventListener('mousedown', swallow, opts);
		window.addEventListener('mouseup', swallow, opts);
		window.addEventListener('click', onClick, opts);
		window.addEventListener('dblclick', swallow, opts);
		window.addEventListener('contextmenu', swallow, opts);
		window.addEventListener('keydown', onKey, opts);
		return () => {
			window.removeEventListener('mousemove', onMove, opts);
			window.removeEventListener('pointerdown', swallow, opts);
			window.removeEventListener('mousedown', swallow, opts);
			window.removeEventListener('mouseup', swallow, opts);
			window.removeEventListener('click', onClick, opts);
			window.removeEventListener('dblclick', swallow, opts);
			window.removeEventListener('contextmenu', swallow, opts);
			window.removeEventListener('keydown', onKey, opts);
			show(null);
			globalThis.draftPick = undefined;
			globalThis.pageEditor = prevEditor;
			document.body.classList.remove('_mlxDAPicking');
			wake();
		};
	}, [picking]);

	const toggle = useCallback(() => setPicking(p => !p), []);
	const clear = useCallback(() => setPicked([]), []);
	const remove = useCallback(
		(key: string) => setPicked(prev => prev.filter(p => p.key !== key)),
		[],
	);

	return { picking, picked, toggle, clear, remove };
}
