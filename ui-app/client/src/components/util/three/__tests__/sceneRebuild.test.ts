import { shaderBackgroundDocument } from '../componentScenes';

/**
 * The bug this pins, in full, because the shape of it is the lesson.
 *
 * `useThreeCanvas` keeps its callbacks in refs so that a re-render does not
 * tear down a pooled GL context, and its effect depends only on
 * `[alpha, antialias, dprCap]`. So `onInit` is invoked EXACTLY ONCE, when the
 * context is created.
 *
 * SceneSurface wrapped `onInit` in `useCallback(..., [doc])`. That reads as
 * "rebuild when the document changes" and does nothing of the kind: a new
 * closure is created on every document change, stored in a ref, and never
 * called again. Every scene was built once at mount and never rebuilt.
 *
 * The symptom was that the whole property panel looked broken. Picking a
 * preset highlighted the new card and wrote the definition; the canvas kept
 * drawing the first thing it ever drew. Same for every colour. Nothing errored,
 * and a page-load screenshot looked perfect, because a fresh mount builds from
 * the current properties -- which is exactly how every test and every
 * verification screenshot in this work had been taken.
 *
 * There is no jsdom test for "the canvas rebuilt": that needs a GPU. What CAN
 * be pinned is the thing the rebuild hangs off -- that a changed property
 * yields a DIFFERENT document object, so an identity check on it is a sound
 * trigger.
 */
describe('a changed property yields a new document', () => {
	it('a different preset is a different object', () => {
		const a = shaderBackgroundDocument({ preset: 'aurora' });
		const b = shaderBackgroundDocument({ preset: 'waves' });
		expect(a).not.toBe(b);
		expect(a.shaders[0].id).not.toBe(b.shaders[0].id);
	});

	it('a different colour is a different object', () => {
		const a = shaderBackgroundDocument({ preset: 'aurora', colorA: '#111111' });
		const b = shaderBackgroundDocument({ preset: 'aurora', colorA: '#222222' });
		expect(a).not.toBe(b);
		const ua = a.shaders[0].uniforms.find(u => u.name === 'uColorA')!.value;
		const ub = b.shaders[0].uniforms.find(u => u.name === 'uColorA')!.value;
		expect(ua).not.toEqual(ub);
	});

	it('even the SAME input yields a new object each call', () => {
		// The rebuild effect compares by identity against the document the live
		// handle was built from. That is only safe because every call allocates:
		// a memoised builder returning the same reference would make a genuine
		// change look like no change at all.
		expect(shaderBackgroundDocument({ preset: 'aurora' })).not.toBe(
			shaderBackgroundDocument({ preset: 'aurora' }),
		);
	});
});

describe('SceneSurface wires the rebuild, not the canvas hook', () => {
	const source = require('fs').readFileSync(
		require('path').join(__dirname, '../SceneSurface.tsx'),
		'utf8',
	) as string;

	it('has an effect that depends on doc', () => {
		// Read as source text: rendering it needs a GL context, and the point
		// is the wiring rather than the output.
		expect(source).toMatch(/useEffect\([\s\S]{0,1400}?\}, \[doc, buildInto\]\)/);
	});

	it('does NOT put doc in onInit, which would silently do nothing', () => {
		// The exact shape of the original bug.
		const onInit = source.slice(source.indexOf('const onInit'));
		const deps = onInit.slice(0, onInit.indexOf(');') + 2);
		expect(deps).not.toMatch(/\},\s*\[doc\]/);
	});

	it('keeps the GL context across a rebuild', () => {
		// Handing a pooled renderer back and taking another one on every
		// keystroke is how you exhaust a six-context budget mid-edit.
		expect(source).toMatch(/buildInto\(ctx, doc\)/);
		expect(source).not.toMatch(/releaseRenderer[\s\S]{0,200}\[doc\]/);
	});
});
