import React from 'react';
import type { SceneDocument } from '../../../util/three/sceneDocument';
import { sameSelection, type Selection } from './common';

/**
 * The scene graph: camera, lights, objects, shaders.
 *
 * Flat rather than nested. A SceneDocument has no parent/child relationship
 * between objects, so a tree with one level of indentation under fixed headings
 * is the honest shape; drawing collapsible nodes would imply a hierarchy that
 * does not exist and that nothing can create.
 */
export function ObjectTree({
	doc,
	selection,
	onSelect,
	onAddObject,
	onAddLight,
	onAddShader,
	onDuplicate,
	onDelete,
	onToggleVisible,
}: Readonly<{
	doc: SceneDocument;
	selection: Selection;
	onSelect: (s: Selection) => void;
	onAddObject: () => void;
	onAddLight: () => void;
	onAddShader: () => void;
	onDuplicate: () => void;
	onDelete: () => void;
	onToggleVisible: (id: string) => void;
}>) {
	/**
	 * A row is a div, not a button, because the visibility toggle inside it IS
	 * a button and a button cannot contain one. React reported it as a
	 * hydration error and the browser silently reparented the markup, which is
	 * the kind of thing that works until the day it does not.
	 *
	 * The keyboard behaviour a button would have given is written out instead
	 * rather than dropped: the row is focusable, and Enter or Space selects it.
	 */
	const row = (s: Selection, label: string, extra?: React.ReactNode) => (
		<div
			key={`${s.kind}-${(s as any).id ?? ''}`}
			className={`_sceneTreeRow ${sameSelection(s, selection) ? '_selected' : ''}`}
			role="button"
			tabIndex={0}
			aria-pressed={sameSelection(s, selection)}
			onClick={() => onSelect(s)}
			onKeyDown={e => {
				if (e.key !== 'Enter' && e.key !== ' ') return;
				e.preventDefault();
				onSelect(s);
			}}
		>
			<span className="_sceneTreeLabel">{label}</span>
			{extra}
		</div>
	);

	const deletable =
		selection.kind === 'object' || selection.kind === 'light' || selection.kind === 'shader';

	return (
		<div className="_sceneTree">
			<div className="_sceneTreeActions">
				<button type="button" className="_sceneToolBtn" onClick={onAddObject}>
					+ Shape
				</button>
				<button type="button" className="_sceneToolBtn" onClick={onAddLight}>
					+ Light
				</button>
				<button
					type="button"
					className="_sceneToolBtn"
					onClick={onAddShader}
					title="Add a shader and point the selected object at it"
				>
					+ Shader
				</button>
				<button
					type="button"
					className="_sceneToolBtn"
					onClick={onDuplicate}
					disabled={selection.kind !== 'object'}
					title={
						selection.kind === 'object'
							? 'Copy it, with its animation and its actions'
							: 'Select an object to copy it'
					}
				>
					Duplicate
				</button>
				<button
					type="button"
					className="_sceneToolBtn _danger"
					onClick={onDelete}
					disabled={!deletable}
					title={
						deletable
							? 'Delete, along with its tracks and interactions'
							: 'Select an object, a light or a shader to delete it'
					}
				>
					Delete
				</button>
			</div>

			<div className="_sceneTreeGroup">Camera</div>
			{row({ kind: 'camera' }, `${doc.camera.type} · fov ${doc.camera.fov}`)}

			<div className="_sceneTreeGroup">Lights ({doc.lights.length})</div>
			{doc.lights.map(l => row({ kind: 'light', id: l.id }, `${l.id} · ${l.type}`))}
			{!doc.lights.length ? (
				<div className="_sceneTreeEmpty">
					No lights. A shader or a points object needs none; anything else renders black
					without one.
				</div>
			) : null}

			<div className="_sceneTreeGroup">Objects ({doc.objects.length})</div>
			{doc.objects.map(o =>
				row(
					{ kind: 'object', id: o.id },
					`${o.name || o.id} · ${o.source.kind === 'primitive' ? o.source.shape : o.source.kind}`,
					<button
						type="button"
						className="_sceneEyeBtn"
						title={o.visible ? 'Hide' : 'Show'}
						aria-label={o.visible ? `Hide ${o.name}` : `Show ${o.name}`}
						onClick={e => {
							e.stopPropagation();
							onToggleVisible(o.id);
						}}
					>
						{o.visible ? '◉' : '○'}
					</button>,
				),
			)}
			{!doc.objects.length ? (
				<div className="_sceneTreeEmpty">No objects, so the canvas is empty.</div>
			) : null}

			<div className="_sceneTreeGroup">Shaders ({doc.shaders.length})</div>
			{doc.shaders.map(s =>
				row(
					{ kind: 'shader', id: s.id },
					`${s.id}${
						doc.objects.some(o => o.material.shaderId === s.id) ? '' : ' · unused'
					}`,
				),
			)}
			{!doc.shaders.length ? (
				<div className="_sceneTreeEmpty">
					No shaders. Add one to paint an object with GLSL instead of a material.
				</div>
			) : null}
		</div>
	);
}
