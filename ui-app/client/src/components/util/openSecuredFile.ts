import secureImage, { isSecuredUrl } from './secureImage';

/**
 * Open a link to a secured file (`/api/files/secured/file/...`).
 *
 * A browser following that link sends no Authorization header, so the files service answers 401
 * and the reader sees an error page instead of the PDF or Word file someone attached. The file is
 * fetched with the sign in token instead (through `secureImage`, which caches one blob per URL)
 * and then shown: a PDF, picture, text or video opens in a new tab, anything else (Word, Excel,
 * zip) is saved under `name`.
 *
 * The tab is opened before the fetch, while the click still counts as the user's gesture: a
 * window opened after an await is blocked as a popup.
 */
const VIEWABLE = /\.(pdf|png|jpe?g|gif|webp|svg|txt|csv|json|mp4|webm|mov)(\?|#|$)/i;

export function openSecuredFile(url: string, name?: string): void {
	const viewable = VIEWABLE.test(url);
	const tab = viewable ? window.open('', '_blank') : null;
	secureImage(url)
		.then(blobUrl => {
			if (tab) {
				tab.location.href = blobUrl;
				return;
			}
			const a = document.createElement('a');
			a.href = blobUrl;
			a.download = downloadName(url, name);
			a.rel = 'noopener';
			document.body.appendChild(a);
			a.click();
			a.remove();
		})
		.catch(err => {
			tab?.close();
			console.warn('Could not open the file', url, err);
		});
}

/** The name to save under: the link text, with the stored file's extension when it lacks one. */
export function downloadName(url: string, name?: string): string {
	const stored = decodeURIComponent(url.split(/[?#]/)[0].split('/').pop() ?? 'file');
	const ext = /\.[a-z0-9]{1,8}$/i.exec(stored)?.[0] ?? '';
	const given = (name ?? '').trim();
	if (!given) return stored;
	return ext && !given.toLowerCase().endsWith(ext.toLowerCase()) ? given + ext : given;
}

/**
 * onClick for an anchor that may point at a secured file. Returns true when it handled the click.
 * Inside an editor being edited a plain click places the caret, so there only Cmd/Ctrl click opens
 * the file; anywhere else a click opens it. Followed as a plain link it would answer 401.
 */
export function handleSecuredLinkClick(
	e: {
		preventDefault: () => void;
		stopPropagation: () => void;
		metaKey: boolean;
		ctrlKey: boolean;
		button: number;
		currentTarget: EventTarget | null;
	},
	url: string | undefined,
	name?: string,
): boolean {
	if (!url || !isSecuredUrl(url) || e.button !== 0) return false;
	const el = e.currentTarget as HTMLElement | null;
	const editing = !!el?.closest?.('[contenteditable="true"]');
	if (editing && !e.metaKey && !e.ctrlKey) return false;
	e.preventDefault();
	e.stopPropagation();
	openSecuredFile(url, name);
	return true;
}
