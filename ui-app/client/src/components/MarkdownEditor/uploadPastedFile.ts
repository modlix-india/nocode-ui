import axios from 'axios';
import { LOCAL_STORE_PREFIX } from '../../constants';
import { getDataFromPath } from '../../context/StoreContext';
import { shortUUID } from '../../util/shortUUID';

export type PastedFilesStorage = 'STATIC' | 'SECURED';

export const DEFAULT_PASTED_FILES_PATH = '/mdPastedFiles';

/** The upload endpoint for a storage and folder, e.g. `/api/files/secured/loopzump/items`. */
export function pastedFilesUploadUrl(
	storage: PastedFilesStorage | string | undefined,
	path: string | undefined,
): string {
	const kind = storage === 'SECURED' ? 'secured' : 'static';
	const folder = (path || DEFAULT_PASTED_FILES_PATH)
		.trim()
		.replace(/^\/+/, '')
		.replace(/\/+$/, '');
	return `/api/files/${kind}/${folder}`;
}

/**
 * Upload a picture added to the editor (pasted, dropped or picked) and return
 * the URL to write into the markdown. A STATIC file is public; a SECURED one is
 * served only to signed in users who may read that folder, and is shown through
 * `secureImage` because a plain `<img src>` cannot send the token.
 */
export async function uploadPastedFile(
	file: File,
	storage: PastedFilesStorage | string | undefined,
	path: string | undefined,
): Promise<string> {
	const formData = new FormData();
	formData.append('file', file);
	formData.append('name', `pasted_${shortUUID()}_`);
	const headers: Record<string, string> = {
		Authorization: getDataFromPath(`${LOCAL_STORE_PREFIX}.AuthToken`, []),
	};
	if (globalThis.isDebugMode)
		headers['x-debug'] = (globalThis.isFullDebugMode ? 'full-' : '') + shortUUID();
	const response = await axios.post(pastedFilesUploadUrl(storage, path), formData, { headers });
	const url = response?.data?.url;
	if (!url) throw new Error('Upload returned no url');
	return url;
}
