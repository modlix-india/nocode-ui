/**
 * The scene editor's number boxes (Inspector, ShaderPane uniforms, TimelinePanel keys) used to
 * write Number(e.target.value) on every change. The browser reports '' while a type="number" box
 * is empty or holds a lone "-" (jsdom also for "12."), Number('') is 0, so the Number.isFinite
 * guard let a 0 through: the object jumped to 0 and React put "0" in the box, wiping the minus.
 *
 * REAL: the panels and DraftNumberInput. The parent here applies each patch to the document the
 * way SceneEditorModal does. jsdom drops text that is not a valid number from a type="number"
 * box, as Chrome does; typeInto sets validity.badInput for that keystroke, as Chrome reports it.
 */
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { createSceneDocument, SceneDocument } from '../../../../util/three/sceneDocument';
import { Inspector } from '../Inspector';
import { ShaderPane } from '../ShaderPane';
import { TimelinePanel } from '../TimelinePanel';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;
let patches: any[];

beforeEach(() => {
	patches = [];
	container = document.createElement('div');
	document.body.appendChild(container);
	root = createRoot(container);
});

afterEach(() => {
	act(() => root.unmount());
	container.remove();
});

const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;

function typeInto(el: HTMLInputElement, text: string): string {
	act(() => {
		valueSetter.call(el, text);
		const badInput = text !== '' && el.value === '';
		if (badInput)
			Object.defineProperty(el, 'validity', {
				configurable: true,
				value: { badInput: true },
			});
		el.dispatchEvent(new Event('input', { bubbles: true }));
		if (badInput) delete (el as any).validity;
	});
	return el.value;
}

/** Selects all and types the text a key at a time; returns what the box showed after each. */
function typeOver(el: HTMLInputElement, text: string): string[] {
	act(() => el.focus());
	typeInto(el, '');
	const seen: string[] = [];
	for (let i = 1; i <= text.length; i++) seen.push(typeInto(el, text.substring(0, i)));
	return seen;
}

function expectNeverRewritten(text: string, seen: string[]) {
	// The typed text, or (a partial number the browser hides) an empty box; never "0".
	seen.forEach((shown, i) => expect([text.substring(0, i + 1), '']).toContain(shown));
}

describe('Inspector', () => {
	function CameraInspector() {
		const [doc, setDoc] = React.useState<SceneDocument>(() => createSceneDocument());
		return (
			<Inspector
				doc={doc}
				selection={{ kind: 'camera' }}
				onUpdateObject={() => {}}
				onRenameObject={() => {}}
				onUpdateLight={() => {}}
				onUpdateCamera={patch => {
					patches.push(patch);
					setDoc(d => ({ ...d, camera: { ...d.camera, ...patch } }));
				}}
				onUpdateEnvironment={() => {}}
			/>
		);
	}

	function positionX(): HTMLInputElement {
		// Field of view, then Position x, y, z.
		return container.querySelectorAll<HTMLInputElement>('input[type="number"]')[1];
	}

	test.each(['-33.86882', '12.3052', '0.05'])('typing %s into a position', text => {
		act(() => root.render(<CameraInspector />));
		const seen = typeOver(positionX(), text);
		expectNeverRewritten(text, seen);
		expect(positionX().value).toBe(text);
		// No 0 was written for the empty or half-typed box.
		for (const p of patches) expect(Number.isFinite(p.position[0])).toBe(true);
		expect(patches.some(p => p.position[0] === 0 && !text.startsWith('0'))).toBe(false);
		expect(patches[patches.length - 1].position[0]).toBe(Number(text));
		act(() => positionX().blur());
		expect(positionX().value).toBe(String(Number(text)));
	});

	test('an emptied box writes nothing and shows the value again on blur', () => {
		act(() => root.render(<CameraInspector />));
		const before = positionX().value;
		act(() => positionX().focus());
		typeInto(positionX(), '');
		expect(patches).toEqual([]);
		act(() => positionX().blur());
		expect(positionX().value).toBe(before);
	});
});

describe('ShaderPane', () => {
	test('a uniform gets only complete numbers', () => {
		const doc = createSceneDocument({
			shaders: [
				{
					id: 'aurora',
					vertex: '',
					fragment: 'uniform float uSpeed;',
					uniforms: [{ name: 'uSpeed', type: 'float', value: 1 }],
				},
			],
		} as any);
		function Holder() {
			const [d, setD] = React.useState(doc);
			return (
				<ShaderPane
					doc={d}
					shaderId="aurora"
					onUpdateShader={() => {}}
					onSetUniform={(_id, name, value) => {
						patches.push(value);
						setD(x => ({
							...x,
							shaders: x.shaders.map(s => ({
								...s,
								uniforms: s.uniforms.map(u =>
									u.name === name ? { ...u, value } : u,
								),
							})) as any,
						}));
					}}
				/>
			);
		}
		act(() => root.render(<Holder />));
		const box = container.querySelector<HTMLInputElement>('input[type="number"]')!;
		const seen = typeOver(box, '-0.05');
		expectNeverRewritten('-0.05', seen);
		expect(box.value).toBe('-0.05');
		expect(patches).toEqual([0, -0.05]);
	});
});

describe('TimelinePanel', () => {
	test('a key value and position get only complete numbers', () => {
		const doc = createSceneDocument({
			timeline: {
				driver: 'time',
				duration: 4000,
				loop: true,
				tracks: [
					{
						target: 'objects.hero.rotation.y',
						ease: 'linear',
						keys: [
							{ t: 0, v: 0 },
							{ t: 1, v: 1 },
						],
					},
				],
			},
		} as any);
		function Holder() {
			const [d, setD] = React.useState(doc);
			const noop = () => {};
			return (
				<TimelinePanel
					doc={d}
					progress={0}
					playing={false}
					onScrub={noop}
					onTogglePlay={noop}
					onAddTrack={noop}
					onRemoveTrack={noop}
					onUpdateTrack={noop}
					onAddKey={noop}
					onRemoveKey={noop}
					onSetDriver={noop}
					onSetKey={(ti, ki, patch) => {
						patches.push(patch);
						setD(x => {
							const tracks = x.timeline.tracks.map((t, i) =>
								i === ti
									? {
											...t,
											keys: t.keys.map((k, j) =>
												j === ki ? { ...k, ...patch } : k,
											),
										}
									: t,
							);
							return { ...x, timeline: { ...x.timeline, tracks } };
						});
					}}
				/>
			);
		}
		act(() => root.render(<Holder />));
		const boxes = () => container.querySelectorAll<HTMLInputElement>('._sceneKey input');
		// Second key: "at" then "=".
		const seenV = typeOver(boxes()[3], '-12.5');
		expectNeverRewritten('-12.5', seenV);
		expect(boxes()[3].value).toBe('-12.5');
		expect(patches).toEqual([{ v: -1 }, { v: -12 }, { v: -12.5 }]);

		patches = [];
		const seenT = typeOver(boxes()[2], '0.75');
		expectNeverRewritten('0.75', seenT);
		expect(patches).toEqual([{ t: 0 }, { t: 0.7 }, { t: 0.75 }]);
	});
});
