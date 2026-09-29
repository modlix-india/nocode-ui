import React from 'react';
import type {
	LightType,
	PrimitiveShape,
	SceneDocument,
	Vec3,
} from '../../../util/three/sceneDocument';
import type { Selection } from './common';

const SHAPES: PrimitiveShape[] = ['box', 'sphere', 'plane', 'torus', 'cylinder', 'icosahedron'];
const LIGHT_TYPES: LightType[] = ['ambient', 'directional', 'point', 'spot', 'hemisphere'];

function Num({
	label,
	value,
	step = 0.1,
	min,
	max,
	onChange,
}: Readonly<{
	label: string;
	value: number;
	step?: number;
	min?: number;
	max?: number;
	onChange: (v: number) => void;
}>) {
	return (
		<label className="_sceneField">
			<span>{label}</span>
			<input
				type="number"
				value={Number.isFinite(value) ? value : 0}
				step={step}
				min={min}
				max={max}
				onChange={e => {
					const n = Number(e.target.value);
					// An empty or half-typed box parses to NaN, and one NaN in a
					// matrix takes the whole scene with it rather than just this
					// field. Hold the previous value until the box is a number.
					if (Number.isFinite(n)) onChange(n);
				}}
			/>
		</label>
	);
}

function Vec({
	label,
	value,
	step,
	onChange,
}: Readonly<{
	label: string;
	value: Vec3;
	step?: number;
	onChange: (v: Vec3) => void;
}>) {
	return (
		<div className="_sceneVecRow">
			<span className="_sceneVecLabel">{label}</span>
			{(['x', 'y', 'z'] as const).map((axis, i) => (
				<Num
					key={axis}
					label={axis}
					value={value[i]}
					step={step}
					onChange={v => {
						const next = [...value] as Vec3;
						next[i] = v;
						onChange(next);
					}}
				/>
			))}
		</div>
	);
}

/**
 * Fields for whatever the tree has selected.
 *
 * Driven by the selection kind rather than by a descriptor table, because the
 * four kinds share almost no fields: a light has no transform, a camera has no
 * material, and a shader has neither. A table here would be four tables with a
 * dispatch on top.
 */
export function Inspector({
	doc,
	selection,
	onUpdateObject,
	onRenameObject,
	onUpdateLight,
	onUpdateCamera,
	onUpdateEnvironment,
}: Readonly<{
	doc: SceneDocument;
	selection: Selection;
	onUpdateObject: (id: string, patch: any) => void;
	onRenameObject: (from: string, to: string) => void;
	onUpdateLight: (id: string, patch: any) => void;
	onUpdateCamera: (patch: any) => void;
	onUpdateEnvironment: (patch: any) => void;
}>) {
	if (selection.kind === 'camera') {
		const c = doc.camera;
		return (
			<div className="_sceneInspector">
				<div className="_sceneInspectorTitle">Camera</div>
				<label className="_sceneField">
					<span>Type</span>
					<select value={c.type} onChange={e => onUpdateCamera({ type: e.target.value })}>
						<option value="perspective">Perspective</option>
						<option value="orthographic">Orthographic</option>
						<option value="fullscreen">Fullscreen backdrop</option>
					</select>
				</label>
				{c.type === 'fullscreen' ? (
					<p className="_sceneNote">
						A fullscreen camera keeps a fixed -1 to 1 frame at any aspect, so a 2x2 quad
						fills the box exactly. Its position, target and field of view are ignored.
					</p>
				) : (
					<>
						<Num
							label="Field of view"
							value={c.fov}
							step={1}
							min={5}
							max={140}
							onChange={v => onUpdateCamera({ fov: v })}
						/>
						<Vec
							label="Position"
							value={c.position}
							onChange={v => onUpdateCamera({ position: v })}
						/>
						<Vec
							label="Looks at"
							value={c.target}
							onChange={v => onUpdateCamera({ target: v })}
						/>
						<label className="_sceneCheck">
							<input
								type="checkbox"
								checked={c.controls}
								onChange={e => onUpdateCamera({ controls: e.target.checked })}
							/>
							<span>Let the visitor orbit</span>
						</label>
					</>
				)}
				<div className="_sceneInspectorTitle">Environment</div>
				<label className="_sceneField">
					<span>Background</span>
					<input
						type="color"
						value={doc.environment.backgroundColor || '#000000'}
						onChange={e => onUpdateEnvironment({ backgroundColor: e.target.value })}
					/>
				</label>
				<button
					type="button"
					className="_sceneToolBtn"
					onClick={() => onUpdateEnvironment({ backgroundColor: '' })}
				>
					Clear background
				</button>
				<p className="_sceneNote">
					Cleared means transparent, so whatever is behind the component shows through.
					That is usually what a scene layered over a page wants.
				</p>
			</div>
		);
	}

	if (selection.kind === 'light') {
		const l = doc.lights.find(x => x.id === selection.id);
		if (!l) return <div className="_sceneInspector">This light no longer exists.</div>;
		return (
			<div className="_sceneInspector">
				<div className="_sceneInspectorTitle">Light · {l.id}</div>
				<label className="_sceneField">
					<span>Type</span>
					<select
						value={l.type}
						onChange={e => onUpdateLight(l.id, { type: e.target.value })}
					>
						{LIGHT_TYPES.map(t => (
							<option key={t} value={t}>
								{t}
							</option>
						))}
					</select>
				</label>
				<label className="_sceneField">
					<span>Colour</span>
					<input
						type="color"
						value={l.color || '#ffffff'}
						onChange={e => onUpdateLight(l.id, { color: e.target.value })}
					/>
				</label>
				<Num
					label="Intensity"
					value={l.intensity}
					step={0.1}
					min={0}
					max={10}
					onChange={v => onUpdateLight(l.id, { intensity: v })}
				/>
				{l.type === 'ambient' ? (
					<p className="_sceneNote">
						An ambient light has no position: it lifts everything evenly.
					</p>
				) : (
					<Vec
						label="Position"
						value={l.position}
						step={0.5}
						onChange={v => onUpdateLight(l.id, { position: v })}
					/>
				)}
			</div>
		);
	}

	if (selection.kind === 'object') {
		const o = doc.objects.find(x => x.id === selection.id);
		if (!o) return <div className="_sceneInspector">This object no longer exists.</div>;
		return (
			<div className="_sceneInspector">
				<div className="_sceneInspectorTitle">Object</div>
				<label className="_sceneField">
					<span>Name</span>
					<input
						type="text"
						value={o.name}
						onChange={e => onUpdateObject(o.id, { name: e.target.value })}
					/>
				</label>
				<label className="_sceneField">
					<span>Id</span>
					<input
						type="text"
						defaultValue={o.id}
						key={o.id}
						onBlur={e => onRenameObject(o.id, e.target.value)}
					/>
				</label>
				<p className="_sceneNote">
					The id is what timeline tracks address. Renaming it here rewrites every track
					and interaction that used it.
				</p>

				<label className="_sceneField">
					<span>Source</span>
					<select
						value={o.source.kind}
						onChange={e => onUpdateObject(o.id, { source: { kind: e.target.value } })}
					>
						<option value="primitive">Primitive shape</option>
						<option value="gltf">Model file</option>
						<option value="points">Points</option>
						<option value="quad">Fullscreen quad</option>
					</select>
				</label>

				{o.source.kind === 'primitive' ? (
					<label className="_sceneField">
						<span>Shape</span>
						<select
							value={o.source.shape}
							onChange={e =>
								onUpdateObject(o.id, { source: { shape: e.target.value } })
							}
						>
							{SHAPES.map(s => (
								<option key={s} value={s}>
									{s}
								</option>
							))}
						</select>
					</label>
				) : null}

				{o.source.kind === 'gltf' ? (
					<label className="_sceneField">
						<span>Model URL</span>
						<input
							type="text"
							value={o.source.url ?? ''}
							placeholder="api/files/static/file/..."
							onChange={e =>
								onUpdateObject(o.id, { source: { url: e.target.value } })
							}
						/>
					</label>
				) : null}

				{o.source.kind === 'points' ? (
					<>
						<Num
							label="Count"
							value={o.source.count ?? 2000}
							step={100}
							min={1}
							onChange={v => onUpdateObject(o.id, { source: { count: v } })}
						/>
						<label className="_sceneField">
							<span>Distribution</span>
							<select
								value={o.source.distribution ?? 'sphere'}
								onChange={e =>
									onUpdateObject(o.id, {
										source: { distribution: e.target.value },
									})
								}
							>
								{['sphere', 'shell', 'disc', 'box'].map(d => (
									<option key={d} value={d}>
										{d}
									</option>
								))}
							</select>
						</label>
					</>
				) : null}

				<div className="_sceneInspectorTitle">Transform</div>
				<Vec
					label="Position"
					value={o.transform.position}
					onChange={v => onUpdateObject(o.id, { transform: { position: v } })}
				/>
				<Vec
					label="Rotation"
					value={o.transform.rotation}
					step={5}
					onChange={v => onUpdateObject(o.id, { transform: { rotation: v } })}
				/>
				<Vec
					label="Scale"
					value={o.transform.scale}
					onChange={v => onUpdateObject(o.id, { transform: { scale: v } })}
				/>

				{/* Assigning a shader used to be impossible from here: the
				    Inspector could tell you an object was painted by one and
				    offered no way to change it, and nothing anywhere could
				    point an object at a different shader or take it off one
				    again. */}
				<div className="_sceneInspectorTitle">Painted by</div>
				<label className="_sceneField">
					<span>Surface</span>
					<select
						value={o.material.shaderId}
						onChange={e =>
							onUpdateObject(o.id, { material: { shaderId: e.target.value } })
						}
					>
						<option value="">Material</option>
						{doc.shaders.map(sh => (
							<option key={sh.id} value={sh.id}>
								Shader · {sh.id}
							</option>
						))}
					</select>
				</label>

				{o.material.shaderId ? (
					<p className="_sceneNote">
						This object is painted by the shader “{o.material.shaderId}”, so the
						material fields below do nothing. Edit the shader instead.
					</p>
				) : (
					<>
						<div className="_sceneInspectorTitle">Material</div>
						<label className="_sceneField">
							<span>Colour</span>
							<input
								type="color"
								value={o.material.color || '#888888'}
								onChange={e =>
									onUpdateObject(o.id, { material: { color: e.target.value } })
								}
							/>
						</label>
						<Num
							label="Metalness"
							value={o.material.metalness}
							step={0.05}
							min={0}
							max={1}
							onChange={v => onUpdateObject(o.id, { material: { metalness: v } })}
						/>
						<Num
							label="Roughness"
							value={o.material.roughness}
							step={0.05}
							min={0}
							max={1}
							onChange={v => onUpdateObject(o.id, { material: { roughness: v } })}
						/>
						<Num
							label="Opacity"
							value={o.material.opacity}
							step={0.05}
							min={0}
							max={1}
							onChange={v => onUpdateObject(o.id, { material: { opacity: v } })}
						/>
					</>
				)}
			</div>
		);
	}

	return (
		<div className="_sceneInspector _sceneInspectorEmpty">
			Select something in the tree to edit it.
		</div>
	);
}
