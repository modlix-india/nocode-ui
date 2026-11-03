import axios from 'axios';
import { LOCAL_STORE_PREFIX } from '../../constants';
import { getDataFromPath } from '../../context/StoreContext';
import { shortUUID } from '../../util/shortUUID';

/**
 * Video attachments (ADZ-1326), off unless the page gives the Prompt a `videoUploadPath`.
 *
 * Every other attachment travels inside the chat request as base64. A video is too big for
 * that, so it is uploaded to the files service first, the moment it is picked, and the chat
 * gets only its path (the same shape as a file picked from the files browser). A file over
 * the size limit is refused before any byte is sent.
 */

/** The video types the attach button adds when videos are on. */
export const VIDEO_ACCEPT = 'video/mp4,video/quicktime,.mp4,.mov';

const DEFAULT_ACCEPT = 'image/*,.pdf,.txt,.csv,.json,.xml,.doc,.docx,.xls,.xlsx';

const VIDEO_MIME_BY_EXT: Record<string, string> = {
	mp4: 'video/mp4',
	m4v: 'video/mp4',
	mov: 'video/quicktime',
};

/** The attach button's accept list: the usual files, plus MP4 and MOV when videos are on. */
export function attachAccept(videosOn: boolean): string {
	return videosOn ? `${DEFAULT_ACCEPT},${VIDEO_ACCEPT}` : DEFAULT_ACCEPT;
}

/** The video MIME type of an MP4 or MOV file (by its type, else its extension); undefined for anything else. */
export function videoMimeType(file: { name: string; type: string }): string | undefined {
	const type = (file.type || '').toLowerCase();
	if (type === 'video/mp4' || type === 'video/quicktime') return type;
	const ext = (file.name.split('.').pop() || '').toLowerCase();
	return file.name.includes('.') ? VIDEO_MIME_BY_EXT[ext] : undefined;
}

/** "1.2 GB" or "350 MB". */
export function sizeWords(bytes: number): string {
	const gb = bytes / 1024 ** 3;
	if (gb >= 1) return `${gb.toFixed(1).replace(/\.0$/, '')} GB`;
	return `${Math.max(1, Math.round(bytes / 1024 ** 2))} MB`;
}

/** Why a video cannot be attached because of its size, or undefined when it fits. */
export function videoTooLargeMessage(
	file: { name: string; size: number },
	maxSizeMB: number,
): string | undefined {
	if (!maxSizeMB || maxSizeMB <= 0) return undefined;
	const max = maxSizeMB * 1024 * 1024;
	if (file.size <= max) return undefined;
	return `${file.name} is ${sizeWords(file.size)}. Videos can be up to ${sizeWords(max)}; export a shorter or smaller file.`;
}

/** `/api/files/<path>` for a folder given as `secured/...` or `static/...` (slashes trimmed). */
export function videoUploadUrl(path: string): string {
	const folder = path
		.trim()
		.replace(/^\/+/, '')
		.replace(/\/+$/, '')
		.replace(/^api\/files\//, '');
	return `/api/files/${folder}`;
}

/** A unique stored name that keeps the file's own name readable: `chat_<id>_<name>` (the service keeps the extension). */
export function uniqueVideoName(fileName: string): string {
	const base = fileName.replace(/\.[^.]+$/, '');
	const slug = base
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 40);
	return `chat_${shortUUID()}_${slug || 'video'}`;
}

/**
 * Upload a video to the files folder and answer the stored file's path (`/api/files/...`).
 * `onProgress` gets 0 to 100. Aborts with `signal`.
 */
export async function uploadVideo(
	file: File,
	path: string,
	onProgress?: (percent: number) => void,
	signal?: AbortSignal,
): Promise<string> {
	const formData = new FormData();
	formData.append('file', file);
	formData.append('name', uniqueVideoName(file.name));
	const headers: Record<string, string> = {
		Authorization: getDataFromPath(`${LOCAL_STORE_PREFIX}.AuthToken`, []),
	};
	if (globalThis.isDebugMode)
		headers['x-debug'] = (globalThis.isFullDebugMode ? 'full-' : '') + shortUUID();
	const response = await axios.post(videoUploadUrl(path), formData, {
		headers,
		signal,
		onUploadProgress: e => {
			if (onProgress && e.total)
				onProgress(Math.min(100, Math.round((e.loaded / e.total) * 100)));
		},
	});
	const url: string | undefined = response?.data?.url;
	if (!url) throw new Error('The upload returned no file.');
	return url.startsWith('/') || /^https?:/.test(url) ? url : `/${url}`;
}
