/**
 * The client half of the scene AI pane.
 *
 * What is worth pinning is the handling of a reply that is not what was asked
 * for. This sits behind a text box somebody is typing into, and a model's
 * output reaches the viewport: a missing field arriving as `undefined` takes
 * the whole modal down, and a warning quietly dropped because the call
 * succeeded leaves someone staring at an empty canvas with nothing to read.
 */
import { attachmentFor, describeError, readReply, serialiseAttachments } from '../sceneAi';

const DOC = {
	version: 1,
	objects: [{ id: 'hero', name: 'Hero', source: { kind: 'primitive', shape: 'box' } }],
};

describe('readReply', () => {
	it('normalises the document rather than trusting it', () => {
		// Model output reaches the viewport. A scene missing `lights` or
		// `timeline` would arrive there as undefined and take the modal down.
		const { doc } = readReply({ scene: DOC as any });
		expect(doc).not.toBeNull();
		expect(Array.isArray(doc!.lights)).toBe(true);
		expect(doc!.timeline.tracks).toEqual([]);
		expect(doc!.objects[0].transform.position).toEqual([0, 0, 0]);
	});

	it('keeps warnings even when a scene came back cleanly', () => {
		// "You still need a model URL" is only actionable by the person
		// reading it, and it arrives on a successful call.
		const r = readReply({ scene: DOC as any, warnings: ['You still need a model URL.'] });
		expect(r.doc).not.toBeNull();
		expect(r.warnings).toEqual(['You still need a model URL.']);
	});

	it('changes nothing and says so when the reply carried no scene', () => {
		const r = readReply({ message: 'I could not do that.' });
		expect(r.doc).toBeNull();
		expect(r.warnings.length).toBeGreaterThan(0);
	});

	it('is not fooled by a scene that is not an object', () => {
		expect(readReply({ scene: 'a string' as any }).doc).toBeNull();
		expect(readReply({ scene: [] as any }).doc).toBeNull();
		expect(readReply(undefined).doc).toBeNull();
	});

	it('drops empty warnings rather than rendering blank rows', () => {
		expect(readReply({ scene: DOC as any, warnings: ['', 'real'] as any }).warnings).toEqual([
			'real',
		]);
	});
});

describe('describeError', () => {
	it('explains a 403 as the app gate it is', () => {
		// The one that actually happens, and the one where the status code
		// alone sends somebody hunting in the wrong place: AI endpoints are
		// gated to appbuilder and sitezump, not to every application.
		const msg = describeError({ response: { status: 403 } });
		expect(msg).toMatch(/AppBuilder/);
	});

	it('names a stale service on a 404', () => {
		expect(describeError({ response: { status: 404 } })).toMatch(/older build/);
	});

	it('prefers the service own detail when there is one', () => {
		expect(
			describeError({ response: { status: 400, data: { detail: 'prompt is required' } } }),
		).toBe('prompt is required');
	});

	it('still says something when there is no response at all', () => {
		expect(describeError({ message: 'Network Error' })).toBe('Network Error');
		expect(describeError({})).toMatch(/could not be reached/);
	});
});

describe('attachments', () => {
	beforeAll(() => {
		(URL as any).createObjectURL = jest.fn(() => 'blob:x');
		(URL as any).revokeObjectURL = jest.fn();
	});

	it('tells an image apart from any other file', () => {
		const img = attachmentFor(new File(['x'], 'ref.png', { type: 'image/png' }));
		const glb = attachmentFor(new File(['x'], 'chair.glb', { type: 'model/gltf-binary' }));
		expect(img.isImage).toBe(true);
		expect(glb.isImage).toBe(false);
		expect(glb.name).toBe('chair.glb');
	});

	it('sends nothing at all rather than an empty list', () => {
		return expect(serialiseAttachments([])).resolves.toBeUndefined();
	});

	it('serialises to the shape the chat endpoint already takes', async () => {
		const out = await serialiseAttachments([
			attachmentFor(new File(['hello'], 'a.txt', { type: 'text/plain' })),
		]);
		expect(out).toEqual([
			{ type: 'file', name: 'a.txt', mime_type: 'text/plain', data: expect.any(String) },
		]);
		// Raw base64, with no data: prefix — the server decodes it directly.
		expect(out![0].data).not.toMatch(/^data:/);
		expect(Buffer.from(out![0].data, 'base64').toString()).toBe('hello');
	});
});
