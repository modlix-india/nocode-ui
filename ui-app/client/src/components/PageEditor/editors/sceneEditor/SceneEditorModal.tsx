import React, { useMemo, useState } from 'react';
import Portal from '../../../Portal';
import { validateSceneDocument, type SceneDocument } from '../../../util/three/sceneDocument';
import {
	addInteraction,
	addKey,
	addLight,
	addObject,
	addShader,
	addTrack,
	duplicateObject,
	removeInteraction,
	removeKey,
	removeLight,
	removeObject,
	removeShader,
	removeTrack,
	renameObject,
	setKey,
	setUniform,
	updateCamera,
	updateEnvironment,
	updateInteraction,
	updateLight,
	updateObject,
	updateShader,
	updateTrack,
} from '../../../util/three/sceneEdits';
import { NOTHING, type SceneEditorModalProps, type Selection } from './common';
import type { GizmoMode } from './viewportControls';
import { Inspector } from './Inspector';
import { InteractionPanel } from './InteractionPanel';
import { ObjectTree } from './ObjectTree';
import { PresetGallery } from './PresetGallery';
import { SceneEditorStyle } from './SceneEditorStyle';
import { ScenePromptPane } from './ScenePromptPane';
import { SceneViewport } from './SceneViewport';
import { ShaderPane } from './ShaderPane';
import { TimelinePanel } from './TimelinePanel';

type Tab = 'ai' | 'inspector' | 'shader' | 'timeline' | 'interactions';

const GIZMO_LABELS: Record<GizmoMode, string> = {
	translate: 'Move',
	rotate: 'Turn',
	scale: 'Size',
};

const TAB_LABELS: Record<Tab, string> = {
	ai: 'AI',
	inspector: 'Inspector',
	shader: 'Shader',
	timeline: 'Timeline',
	interactions: 'Actions',
};

export function SceneEditorModal({
	initialDocument,
	eventKeys,
	componentType,
	onSave,
	onClose,
}: Readonly<SceneEditorModalProps>) {
	// Undo is an array of whole documents. Every edit in sceneEdits.ts returns
	// a new one and mutates nothing, which is what makes that affordable.
	const [history, setHistory] = useState<SceneDocument[]>(() => [initialDocument]);
	const [index, setIndex] = useState(0);
	const [selection, setSelection] = useState<Selection>(NOTHING);
	const [tab, setTab] = useState<Tab>('inspector');
	const [progress, setProgress] = useState(0);
	const [playing, setPlaying] = useState(true);
	const [showGallery, setShowGallery] = useState(false);
	const [gizmoMode, setGizmoMode] = useState<GizmoMode>('translate');
	const [loadErrors, setLoadErrors] = useState<string[]>([]);

	const doc = history[index];
	const problems = useMemo(() => validateSceneDocument(doc), [doc]);

	const commit = (next: SceneDocument) => {
		if (next === doc) return;
		const trimmed = [...history.slice(0, index + 1), next];
		setHistory(trimmed);
		setIndex(trimmed.length - 1);
	};

	const shaderId =
		selection.kind === 'shader'
			? selection.id
			: selection.kind === 'object'
				? (doc.objects.find(o => o.id === selection.id)?.material.shaderId ?? '')
				: (doc.shaders[0]?.id ?? '');

	const currentValue = (target: string): number => {
		// The value a new key should take: whatever the scrub position is
		// showing. A key that defaults to 0 jumps the object to the origin the
		// moment it is added, which looks like the editor breaking the scene.
		const track = doc.timeline.tracks.find(t => t.target === target);
		if (!track?.keys.length) return 0;
		const before = [...track.keys].reverse().find(k => k.t <= progress);
		return before?.v ?? track.keys[0].v;
	};

	return (
		<Portal>
			<SceneEditorStyle />
			<div className="_sceneEditorBackdrop" onClick={onClose} role="presentation">
				<div
					className="_sceneEditorModal"
					onClick={e => e.stopPropagation()}
					role="presentation"
				>
					<div className="_sceneEditorToolbar">
						<button
							type="button"
							className="_sceneToolBtn"
							disabled={index === 0}
							onClick={() => setIndex(i => Math.max(0, i - 1))}
						>
							Undo
						</button>
						<button
							type="button"
							className="_sceneToolBtn"
							disabled={index >= history.length - 1}
							onClick={() => setIndex(i => Math.min(history.length - 1, i + 1))}
						>
							Redo
						</button>
						<button
							type="button"
							className="_sceneToolBtn"
							onClick={() => setShowGallery(g => !g)}
						>
							Presets
						</button>
						<span className="_sceneToolDivider" />
						{/* The handles are only meaningful on an object, so the
						    switch says so rather than silently doing nothing. */}
						{(['translate', 'rotate', 'scale'] as GizmoMode[]).map(m => (
							<button
								type="button"
								key={m}
								className={`_sceneToolBtn ${gizmoMode === m ? '_on' : ''}`}
								disabled={selection.kind !== 'object'}
								title={
									selection.kind === 'object'
										? `Drag to ${m}`
										: 'Select an object to move it in the preview'
								}
								onClick={() => setGizmoMode(m)}
							>
								{GIZMO_LABELS[m]}
							</button>
						))}
						<span className="_spacer" />
						<button type="button" className="_sceneToolBtn" onClick={onClose}>
							Cancel
						</button>
						<button
							type="button"
							className="_sceneSaveButton"
							onClick={() => {
								onSave(doc);
								onClose();
							}}
						>
							Save
						</button>
					</div>

					{problems.length ? (
						<div className="_sceneProblems">
							{problems.map(p => (
								<div key={p}>{p}</div>
							))}
						</div>
					) : null}
					{loadErrors.length ? (
						<div className="_sceneProblems">
							{loadErrors.map(p => (
								<div key={p}>{p}</div>
							))}
						</div>
					) : null}

					<div className="_sceneEditorBody">
						<div className="_sceneEditorTreePane">
							<ObjectTree
								doc={doc}
								selection={selection}
								onSelect={setSelection}
								onAddObject={() => {
									const r = addObject(doc);
									commit(r.doc);
									setSelection({ kind: 'object', id: r.id });
								}}
								onAddLight={() => {
									const r = addLight(doc);
									commit(r.doc);
									setSelection({ kind: 'light', id: r.id });
								}}
								onAddShader={() => {
									const r = addShader(
										doc,
										selection.kind === 'object' ? selection.id : undefined,
									);
									commit(r.doc);
									setSelection({ kind: 'shader', id: r.id });
									setTab('shader');
								}}
								onDuplicate={() => {
									if (selection.kind !== 'object') return;
									const r = duplicateObject(doc, selection.id);
									commit(r.doc);
									setSelection({ kind: 'object', id: r.id });
								}}
								onDelete={() => {
									if (selection.kind === 'object') {
										commit(removeObject(doc, selection.id));
									} else if (selection.kind === 'light') {
										commit(removeLight(doc, selection.id));
									} else if (selection.kind === 'shader') {
										commit(removeShader(doc, selection.id));
									} else return;
									setSelection(NOTHING);
								}}
								onToggleVisible={id =>
									commit(
										updateObject(doc, id, {
											visible: !doc.objects.find(o => o.id === id)?.visible,
										}),
									)
								}
							/>
						</div>

						<div className="_sceneEditorCanvasPane">
							{showGallery ? (
								<PresetGallery
									onPick={next => {
										commit(next);
										setSelection(NOTHING);
										setShowGallery(false);
									}}
									onClose={() => setShowGallery(false)}
								/>
							) : (
								<SceneViewport
									doc={doc}
									progress={progress}
									playing={playing}
									selectedObjectId={
										selection.kind === 'object' ? selection.id : ''
									}
									gizmoMode={gizmoMode}
									onTransform={(id, transform) =>
										commit(updateObject(doc, id, { transform }))
									}
									onError={setLoadErrors}
								/>
							)}
						</div>

						<div className="_sceneEditorSidePane">
							<div className="_sceneTabs">
								{(
									[
										'ai',
										'inspector',
										'shader',
										'timeline',
										'interactions',
									] as Tab[]
								).map(t => (
									<button
										type="button"
										key={t}
										className={`_sceneTab ${tab === t ? '_selected' : ''}`}
										onClick={() => setTab(t)}
									>
										{/* Spelled out rather than capitalised
										    from the key: `capitalize` renders
										    'ai' as 'Ai'. */}
										{TAB_LABELS[t]}
									</button>
								))}
							</div>

							{tab === 'ai' ? (
								<ScenePromptPane
									doc={doc}
									componentType={componentType}
									// Straight onto the undo stack, like any
									// other edit. A result nobody wanted is one
									// Undo away, and the page is untouched
									// either way until Save.
									onApply={commit}
								/>
							) : null}

							{tab === 'inspector' ? (
								<Inspector
									doc={doc}
									selection={selection}
									onUpdateObject={(id, patch) =>
										commit(updateObject(doc, id, patch))
									}
									onRenameObject={(from, to) => {
										const next = renameObject(doc, from, to);
										commit(next);
										if (next !== doc) {
											setSelection({ kind: 'object', id: to.trim() });
										}
									}}
									onUpdateLight={(id, patch) =>
										commit(updateLight(doc, id, patch))
									}
									onUpdateCamera={patch => commit(updateCamera(doc, patch))}
									onUpdateEnvironment={patch =>
										commit(updateEnvironment(doc, patch))
									}
								/>
							) : null}

							{tab === 'shader' ? (
								shaderId ? (
									<ShaderPane
										doc={doc}
										shaderId={shaderId}
										onUpdateShader={(id, patch) =>
											commit(updateShader(doc, id, patch))
										}
										onSetUniform={(id, name, value) =>
											commit(setUniform(doc, id, name, value))
										}
									/>
								) : (
									<p className="_sceneNote">
										This scene has no shaders. Start from a shader preset, or
										give an object a shaderId.
									</p>
								)
							) : null}

							{tab === 'timeline' ? (
								<TimelinePanel
									doc={doc}
									progress={progress}
									playing={playing}
									onScrub={p => {
										setProgress(p);
										// Scrubbing means "show me this frame", so
										// leaving it playing would fight the drag.
										setPlaying(false);
									}}
									onTogglePlay={() => setPlaying(p => !p)}
									onAddTrack={target => commit(addTrack(doc, target))}
									onRemoveTrack={i => commit(removeTrack(doc, i))}
									onUpdateTrack={(i, patch) => commit(updateTrack(doc, i, patch))}
									onSetKey={(t, k, patch) => commit(setKey(doc, t, k, patch))}
									onAddKey={t =>
										commit(
											addKey(
												doc,
												t,
												progress,
												currentValue(doc.timeline.tracks[t].target),
											),
										)
									}
									onRemoveKey={(t, k) => commit(removeKey(doc, t, k))}
									onSetDriver={d =>
										commit({
											...doc,
											timeline: { ...doc.timeline, driver: d as any },
										})
									}
								/>
							) : null}

							{tab === 'interactions' ? (
								<InteractionPanel
									doc={doc}
									eventKeys={eventKeys}
									onAdd={() => commit(addInteraction(doc))}
									onUpdate={(i, patch) =>
										commit(updateInteraction(doc, i, patch))
									}
									onRemove={i => commit(removeInteraction(doc, i))}
								/>
							) : null}
						</div>
					</div>
				</div>
			</div>
		</Portal>
	);
}
