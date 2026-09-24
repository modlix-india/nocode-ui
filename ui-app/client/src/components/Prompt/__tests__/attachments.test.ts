/**
 * Turning a history row's attachments back into transcript messages.
 *
 * Before this existed, an image the user attached was gone the moment the chat
 * was reopened: the client never asked for attachments and the server never
 * stored them, so the only copy was the blob URL in the tab that uploaded it.
 * These pin the two things that are easy to get quietly wrong now that it does
 * survive — which message an attachment lands on, and what happens to a session
 * that predates the feature.
 */

import { splitTurnAttachments, HistoryAttachment } from '../attachments';

const chatImage: HistoryAttachment = {
	id: 1,
	kind: 'chat',
	type: 'image',
	name: 'hero.png',
	mime_type: 'image/png',
	url: '/api/files/secured/file/FIN/_withInClient/aichat/appbuilder/s1/t1/aaa-hero.png',
	size_bytes: 1234,
	expired: false,
};

const generatedImage: HistoryAttachment = {
	id: 2,
	kind: 'generated',
	type: 'image',
	name: 'banner.png',
	mime_type: 'image/png',
	url: '/api/files/static/file/FIN/app/global/banner.png',
	size_bytes: 4096,
};

describe('splitTurnAttachments', () => {
	it('puts what the user attached on the user message', () => {
		const { user, assistant } = splitTurnAttachments([chatImage], 0);
		expect(user).toHaveLength(1);
		expect(user[0].name).toBe('hero.png');
		expect(assistant).toHaveLength(0);
	});

	it('puts what a tool generated on the reply, not above the question', () => {
		const { user, assistant } = splitTurnAttachments([generatedImage], 0);
		expect(user).toHaveLength(0);
		expect(assistant).toHaveLength(1);
		expect(assistant[0].name).toBe('banner.png');
	});

	it('splits a turn that has both', () => {
		const { user, assistant } = splitTurnAttachments([chatImage, generatedImage], 3);
		expect(user.map(a => a.name)).toEqual(['hero.png']);
		expect(assistant.map(a => a.name)).toEqual(['banner.png']);
	});

	it('gives every attachment a key unique across turns and roles', () => {
		const first = splitTurnAttachments([chatImage, generatedImage], 0);
		const second = splitTurnAttachments([chatImage, generatedImage], 1);
		const ids = [...first.user, ...first.assistant, ...second.user, ...second.assistant].map(
			a => a.id,
		);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it('carries expiry through so the render can stand something in its place', () => {
		const { user } = splitTurnAttachments([{ ...chatImage, expired: true }], 0);
		expect(user[0].expired).toBe(true);
	});

	it('leaves a generated image with no expiry — those are stored to last', () => {
		const { assistant } = splitTurnAttachments([generatedImage], 0);
		expect(assistant[0].expired).toBeUndefined();
	});

	it('is empty for a session that predates the feature', () => {
		// Sessions older than the attachments table return no field at all.
		// Nothing to backfill: those bytes only ever existed in memory.
		expect(splitTurnAttachments(undefined, 0)).toEqual({ user: [], assistant: [] });
		expect(splitTurnAttachments([], 0)).toEqual({ user: [], assistant: [] });
	});

	it('keeps non-image attachments rather than dropping them', () => {
		// The model still cannot read a PDF — `build_image_blocks` drops those
		// before they reach it. The file is kept so the user does not lose it.
		const pdf: HistoryAttachment = {
			id: 9,
			kind: 'chat',
			type: 'file',
			name: 'contract.pdf',
			mime_type: 'application/pdf',
			url: '/api/files/secured/file/FIN/_withInClient/aichat/appbuilder/s1/t1/bbb-contract.pdf',
		};
		const { user } = splitTurnAttachments([pdf], 0);
		expect(user[0].type).toBe('file');
		expect(user[0].name).toBe('contract.pdf');
	});
});
