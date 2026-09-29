import { presetScene } from '../presets';
import { createSceneDocument, resolveSceneDocument, type SceneDocument } from '../sceneDocument';

const fromPreset = () => presetScene('aurora');

/**
 * `scene` and `preset` are meant to be mutually exclusive: SceneContentEditor
 * writes the document and deletes the preset name in one change. This pins what
 * happens when a definition carries both anyway, which a hand edit or a tool can
 * easily produce. The rule is that the document wins, and the point of the test
 * is that the rule is FIXED rather than depending on which branch ran first.
 */
describe('resolveSceneDocument', () => {
	it('uses the preset when no document is stored', () => {
		expect(resolveSceneDocument(undefined, fromPreset).shaders[0].id).toBe('aurora');
		expect(resolveSceneDocument(null, fromPreset).shaders[0].id).toBe('aurora');
		expect(resolveSceneDocument('', fromPreset).shaders[0].id).toBe('aurora');
	});

	it('prefers a stored document over the preset', () => {
		const stored = createSceneDocument({
			objects: [{ id: 'mine', name: 'Mine', source: { kind: 'primitive', shape: 'torus' } }],
		} as unknown as Partial<SceneDocument>);
		const out = resolveSceneDocument(stored, fromPreset);
		expect(out.objects.map(o => o.id)).toEqual(['mine']);
	});

	it('does not call the preset builder at all when a document is stored', () => {
		// Building a preset allocates a whole scene document per render. On a
		// page with several scenes that is real work thrown away.
		const build = jest.fn(fromPreset);
		resolveSceneDocument(createSceneDocument(), build);
		expect(build).not.toHaveBeenCalled();
	});

	it('normalises a stored document rather than trusting it', () => {
		// A stored document reaches this straight out of Mongo, where it may
		// have been hand-edited or written by an agent.
		const out = resolveSceneDocument(
			{ objects: [{ id: 'x', source: { kind: 'points', count: 9e9 } }] },
			fromPreset,
		);
		expect(out.objects[0].source.count).toBeLessThanOrEqual(200000);
		expect(out.version).toBeDefined();
	});

	it('falls back to the preset for a non-object stored value', () => {
		// A number or a stray string in the property must not produce an empty
		// scene that looks deliberately blank.
		expect(resolveSceneDocument(42, fromPreset).shaders[0].id).toBe('aurora');
		expect(resolveSceneDocument('aurora', fromPreset).shaders[0].id).toBe('aurora');
	});
});
