import { useEffect } from 'react';

// Key events typed inside an iframe go to the iframe's own document and never reach
// the page that holds it, so a Popup wrapping an Iframe could not be closed with
// Escape once the frame had focus. The framed side forwards the keys below and the
// holding side fires them again on the <iframe> element, from where they bubble
// through the popup to `document.body` like any key typed on the page itself.
//
// A key some handler in the frame already used (preventDefault) is not forwarded:
// Escape that closes a popup inside the frame must not also close the one around it.

const RELAYED_KEYS = new Set(['Escape']);
const MESSAGE_TYPE = 'MLX_FRAME_KEY';
const RELAY_FLAG = '__mlxFrameKeyRelay';

type RelayedKey = {
	eventType: string;
	key: string;
	code: string;
	altKey: boolean;
	ctrlKey: boolean;
	metaKey: boolean;
	shiftKey: boolean;
};

function toRelayed(e: KeyboardEvent): RelayedKey | undefined {
	if (e.defaultPrevented || !RELAYED_KEYS.has(e.key)) return undefined;
	return {
		eventType: e.type,
		key: e.key,
		code: e.code,
		altKey: e.altKey,
		ctrlKey: e.ctrlKey,
		metaKey: e.metaKey,
		shiftKey: e.shiftKey,
	};
}

function refire(iframe: HTMLIFrameElement, k: RelayedKey) {
	const { eventType, ...init } = k;
	iframe.dispatchEvent(
		new KeyboardEvent(eventType, { ...init, bubbles: true, cancelable: true }),
	);
}

/**
 * Framed side. Runs once at start-up in every app document that sits inside a frame,
 * cross-origin or not. Bubble phase on window, so handlers on body and below have
 * had their chance to preventDefault first.
 */
export function startFrameKeyRelay() {
	if (window.parent === window) return;
	(window as any)[RELAY_FLAG] = true;
	const forward = (e: KeyboardEvent) => {
		const k = toRelayed(e);
		if (k) window.parent.postMessage({ type: MESSAGE_TYPE, ...k }, '*');
	};
	window.addEventListener('keydown', forward);
	window.addEventListener('keyup', forward);
}

/**
 * Holding side. Listens for keys the framed app forwards, and for a same-origin frame
 * that is not an app (srcdoc, a blob from a secured file) reads its document directly.
 */
export function useFrameKeyRelay(iframe: HTMLIFrameElement | null) {
	useEffect(() => {
		if (!iframe) return;

		const onMessage = (e: MessageEvent) => {
			if (e.source !== iframe.contentWindow || e.data?.type !== MESSAGE_TYPE) return;
			const { eventType, key, code, altKey, ctrlKey, metaKey, shiftKey } = e.data;
			if ((eventType !== 'keydown' && eventType !== 'keyup') || !RELAYED_KEYS.has(key))
				return;
			refire(iframe, {
				eventType,
				key,
				code: String(code ?? ''),
				altKey: !!altKey,
				ctrlKey: !!ctrlKey,
				metaKey: !!metaKey,
				shiftKey: !!shiftKey,
			});
		};

		let watchedDoc: Document | undefined;
		const onInnerKey = (e: KeyboardEvent) => {
			const k = toRelayed(e);
			if (k) refire(iframe, k);
		};
		const unwatch = () => {
			watchedDoc?.removeEventListener('keydown', onInnerKey);
			watchedDoc?.removeEventListener('keyup', onInnerKey);
			watchedDoc = undefined;
		};
		const onLoad = () => {
			unwatch();
			let win: any;
			let doc: Document | null | undefined;
			try {
				win = iframe.contentWindow;
				doc = iframe.contentDocument;
			} catch (_) {
				return; // cross-origin: only the message path can help
			}
			// An app inside forwards for itself; listening here too would fire twice.
			if (!doc || win?.[RELAY_FLAG]) return;
			watchedDoc = doc;
			doc.addEventListener('keydown', onInnerKey);
			doc.addEventListener('keyup', onInnerKey);
		};

		window.addEventListener('message', onMessage);
		iframe.addEventListener('load', onLoad);
		onLoad();
		return () => {
			window.removeEventListener('message', onMessage);
			iframe.removeEventListener('load', onLoad);
			unwatch();
		};
	}, [iframe]);
}
