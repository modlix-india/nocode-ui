/**
 * The editor viewport's camera and drag handles.
 *
 * Neither the gizmo nor the orbit control can be exercised without a GPU, so
 * what is pinned here is the one decision that is pure and the one that was
 * wrong before: which cameras may be orbited, and the identity rule the rebuild
 * now hangs off.
 */
import { createSceneDocument } from '../../../../util/three/sceneDocument';
import { updateObject } from '../../../../util/three/sceneEdits';
import { canOrbit } from '../viewportControls';

describe('canOrbit', () => {
	it('allows a perspective and an orthographic camera', () => {
		expect(canOrbit(createSceneDocument({ camera: { type: 'perspective' } } as any))).toBe(
			true,
		);
		expect(canOrbit(createSceneDocument({ camera: { type: 'orthographic' } } as any))).toBe(
			true,
		);
	});

	it('refuses a fullscreen camera', () => {
		// A fullscreen camera is a fixed -1..1 frustum that a 2x2 plane fills
		// exactly. Orbiting does not show the shader from another angle, it
		// slides the quad out of frame and leaves the author with nothing on
		// screen and no way back but reopening the editor.
		expect(canOrbit(createSceneDocument({ camera: { type: 'fullscreen' } } as any))).toBe(
			false,
		);
	});
});

describe('the rebuild trigger', () => {
	it('every edit yields a new document object, so identity is a sound test', () => {
		// The viewport used to remount on a SUMMARY of the document -- object
		// count, ids, shader source lengths. A summary is always the list of
		// changes somebody thought of: changing a colour, a metalness, a light
		// intensity left it identical, the preview did not move, and the only
		// available conclusion was that the field did nothing.
		const doc = createSceneDocument({
			objects: [{ id: 'a', name: 'A', source: { kind: 'primitive', shape: 'box' } }],
		} as any);

		const recoloured = updateObject(doc, 'a', { material: { color: '#ff0000' } as any });
		expect(recoloured).not.toBe(doc);
		// And the old summary would NOT have caught it, which is the point.
		const summary = (d: typeof doc) =>
			`${d.objects.length}-${d.lights.length}-${JSON.stringify(
				d.objects.map(o => [o.id, o.source.kind, o.source.shape]),
			)}`;
		expect(summary(recoloured)).toBe(summary(doc));
	});
});
