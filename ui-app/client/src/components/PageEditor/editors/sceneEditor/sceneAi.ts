/**
 * Talking to the scene-authoring endpoint.
 *
 * Split out of the pane so the parts worth testing are testable: turning a
 * picked File into the wire shape, and turning a reply into a document plus the
 * things the user has to be told. Neither needs a DOM or a network.
 *
 * The wire shape is deliberately the Prompt component's, field for field
 * (`{type, name, mime_type, data}` with `data` as raw base64), because the
 * server handles both with the same code. A second, nearly-identical shape here
 * would be one more thing to keep in step for no gain.
 */

import { LOCAL_STORE_PREFIX, STORE_PREFIX } from '../../../../constants';
import { getDataFromPath } from '../../../../context/StoreContext';
import { normalizeSceneDocument, type SceneDocument } from '../../../util/three/sceneDocument';

/**
 * Where the pane posts. A constant rather than a property threaded down from
 * the page editor: PropertyValueEditor sits between the two and passes neither
 * a context nor an endpoint, and the page editor already hardcodes this same
 * default for its own sidekick.
 */
export const SCENE_AI_ENDPOINT = '/api/ai/appbuilder/scene';

export interface SceneAttachment {
	id: string;
	name: string;
	mimeType: string;
	/** An object URL for the thumbnail. Revoked when the attachment is dropped. */
	url: string;
	isImage: boolean;
	file: File;
}

export interface SceneAiRequest {
	prompt: string;
	scene: SceneDocument | null;
	componentType: string;
	attachments?: Array<{ type: string; name: string; mime_type: string; data: string }>;
}

export interface SceneAiReply {
	scene?: unknown;
	message?: string;
	warnings?: string[];
}

export interface SceneAiResult {
	/** Normalised and ready to commit, or null when the reply carried none. */
	doc: SceneDocument | null;
	message: string;
	warnings: string[];
}

/**
 * The three headers the AI service requires, and what each one is for.
 *
 * All three, because two of them are hard requirements and the failure for each
 * is a different unhelpful number. No `clientCode` is a flat 400 before any
 * authentication runs; an `appCode` outside appbuilder and sitezump is a 403
 * from the AI gate. Only `Authorization` has a fallback, and relying on it is
 * how the Prompt component quietly worked in the browser and 401'd anywhere the
 * cookie was absent.
 *
 * `Store.auth` carries `accessToken` and `loggedInClientCode` -- not `token`
 * and not `clientCode`. Reading those names is the mistake that sent an empty
 * Authorization on every AI call for months.
 */
export function sceneAiHeaders(): Record<string, string> {
	const token =
		(getDataFromPath('Store.auth.accessToken', []) as string) ??
		(getDataFromPath(`${LOCAL_STORE_PREFIX}.AuthToken`, []) as string) ??
		'';
	return {
		'Content-Type': 'application/json',
		Authorization: token ? `Bearer ${token}` : '',
		clientCode: (getDataFromPath('Store.auth.loggedInClientCode', []) as string) ?? '',
		appCode: (getDataFromPath(`${STORE_PREFIX}.application.appCode`, []) as string) ?? '',
	};
}

export function attachmentFor(file: File): SceneAttachment {
	return {
		id: `att_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
		name: file.name,
		mimeType: file.type,
		url: URL.createObjectURL(file),
		isImage: file.type.startsWith('image/'),
		file,
	};
}

/** The base64 body of a file, without the `data:...;base64,` prefix. */
export function fileToBase64(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			const result = reader.result as string;
			resolve(result.split(',')[1] ?? result);
		};
		reader.onerror = () => reject(reader.error ?? new Error('Could not read the file.'));
		reader.readAsDataURL(file);
	});
}

export async function serialiseAttachments(
	attachments: SceneAttachment[],
): Promise<SceneAiRequest['attachments']> {
	if (!attachments.length) return undefined;
	return Promise.all(
		attachments.map(async a => ({
			type: a.isImage ? 'image' : 'file',
			name: a.name,
			mime_type: a.mimeType,
			data: await fileToBase64(a.file),
		})),
	);
}

/**
 * A reply as the pane needs it.
 *
 * The document is normalised here rather than trusted, for the same reason
 * `normalizeSceneDocument` never throws: this is model output, and the editor
 * has to stay usable when it is wrong. A missing field would otherwise reach
 * the viewport as `undefined` and take the whole modal down with it.
 *
 * Warnings survive even when a scene comes back cleanly. Several of them are
 * things only the user can resolve -- a model URL that still has to be supplied
 * -- and dropping them because the call succeeded is how somebody ends up
 * staring at an empty canvas with nothing to read.
 */
export function readReply(raw: SceneAiReply | undefined): SceneAiResult {
	const warnings = Array.isArray(raw?.warnings) ? raw!.warnings.filter(Boolean).map(String) : [];
	const scene = raw?.scene;
	if (!scene || typeof scene !== 'object' || Array.isArray(scene)) {
		return {
			doc: null,
			message: String(raw?.message ?? ''),
			warnings: warnings.length ? warnings : ['The reply carried no scene.'],
		};
	}
	return {
		doc: normalizeSceneDocument(scene),
		message: String(raw?.message ?? 'Scene updated.'),
		warnings,
	};
}

/**
 * What went wrong, in words rather than a status code.
 *
 * The 403 case is named because it is the one that actually happens and the one
 * a bare "Request failed with status code 403" sends somebody hunting in the
 * wrong place: the AI endpoints are gated to the appbuilder and sitezump apps,
 * so editing a page in any other app reaches a working service that will not
 * answer.
 */
export function describeError(e: any): string {
	const status = e?.response?.status;
	const detail = e?.response?.data?.detail ?? e?.response?.data?.message;
	if (status === 403) {
		return (
			'The AI service refused this app. Scene prompting is available while editing in ' +
			'the AppBuilder, not in every application.'
		);
	}
	if (status === 404) {
		return 'The AI service has no scene endpoint. It may be running an older build.';
	}
	if (status === 401) {
		return 'The AI service did not accept the sign-in. Try reloading the page editor.';
	}
	if (detail) return String(detail);
	if (status) return `The AI service answered ${status}.`;
	return e?.message ? String(e.message) : 'The AI service could not be reached.';
}
