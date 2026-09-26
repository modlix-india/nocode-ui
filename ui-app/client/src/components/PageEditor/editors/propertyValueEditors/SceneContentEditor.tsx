import { duplicate } from '@fincity/kirun-js';
import React, { Suspense, useEffect, useState } from 'react';
import { ComponentDefinition } from '../../../../types/common';
import { documentForComponent } from '../../../util/three/componentScenes';
import {
	normalizeSceneDocument,
	validateSceneDocument,
	type SceneDocument,
} from '../../../util/three/sceneDocument';
import { PageOperations } from '../../functions/PageOperations';

const SceneEditorModal = React.lazy(
	() => import(/* webpackChunkName: "SceneEditor" */ '../sceneEditor/LazySceneEditor'),
);

interface SceneContentEditorProps {
	value: unknown;
	onChange: (doc: SceneDocument) => void;
	pageOperations: PageOperations;
	selectedComponent?: string;
	/** Page event function keys, for the interaction panel. */
	eventKeys?: string[];
}

/**
 * The `scene` property: a summary plus a button that opens the full editor.
 *
 * ## Why a preset becomes a document the first time this opens
 *
 * A component ships with `preset: "aurora"` and the runtime rebuilds the scene
 * from `presets.ts` on every render. That is right while nobody has touched it:
 * the agent gets an easy path, a zero-config drop works, and the page JSON stays
 * nine characters. It stops being right the moment someone edits.
 *
 * Two reasons, one of them observed rather than theoretical. During Phase 1
 * verification the aurora shader was changed between two screenshots of the same
 * unchanged page definition, and the hero's appearance changed completely; on a
 * live page that is a silent redesign nobody can trace to the deploy that caused
 * it. And a preset is a black box: an author gets three colour fields, and
 * touching anything else means switching to `custom` and starting from an empty
 * shader, throwing away the thing they liked.
 *
 * So, exactly as SvgContentEditor does for `src` and `svgContent`: on the first
 * edit, resolve the preset into a full document, write it to `scene`, and DELETE
 * `preset`. From then on the page owns its scene. The cost is several KB of page
 * JSON, which is why Track C's `get_scene` is specced with paging.
 */
export function SceneContentEditor({
	value,
	onChange,
	pageOperations,
	selectedComponent,
	eventKeys = [],
}: Readonly<SceneContentEditorProps>) {
	const [open, setOpen] = useState(false);
	const [seed, setSeed] = useState<SceneDocument | null>(null);
	const [seedType, setSeedType] = useState('');
	const [error, setError] = useState('');

	useEffect(() => setError(''), [selectedComponent]);

	const doc: SceneDocument | null = value ? normalizeSceneDocument(value) : null;
	const problems = doc ? validateSceneDocument(doc) : [];

	/**
	 * The document to open with, resolving `preset` into `scene` if this is the
	 * first edit. Returns undefined if there is no component to edit.
	 */
	const resolveForEdit = (): SceneDocument | undefined => {
		const def = selectedComponent
			? pageOperations.getComponentDefinition(selectedComponent)
			: undefined;
		if (!def) {
			setError('Select a component first.');
			return undefined;
		}

		const stored = def.properties?.scene?.value;
		if (stored) return normalizeSceneDocument(stored);

		// Built through the component's OWN builder, not from the bare preset.
		// Seeding from the preset alone silently discarded every flat override
		// beside it in the panel: a ScrollScene with a pink object opened grey,
		// and the author's only clue was that their colour had gone.
		//
		// Only literal values are available here. A property bound to an
		// expression has none, and the editor cannot evaluate a page
		// expression; guessing would bake one frame of page data into the
		// stored scene permanently, so those fall back to the preset's value.
		const literals: Record<string, unknown> = {};
		for (const [name, prop] of Object.entries(def.properties ?? {})) {
			if (prop && typeof prop === 'object' && 'value' in prop) {
				literals[name] = (prop as { value: unknown }).value;
			}
		}
		const resolved = documentForComponent(def.type, literals);

		// Written onto the component and `preset` removed in the SAME change,
		// so the two can never both be set: a document plus a preset name is
		// ambiguous, and whichever the runtime happened to prefer would be a
		// coin toss the author cannot see.
		const newDef = duplicate(def) as ComponentDefinition;
		if (!newDef.properties) newDef.properties = {};
		newDef.properties.scene = { value: resolved as any };
		delete newDef.properties.preset;
		pageOperations.componentChanged(newDef);

		return resolved;
	};

	const openEditor = () => {
		setError('');
		const resolved = resolveForEdit();
		if (!resolved) return;
		setSeed(resolved);
		setSeedType(
			(selectedComponent
				? pageOperations.getComponentDefinition(selectedComponent)?.type
				: '') ?? '',
		);
		setOpen(true);
	};

	const summary = doc
		? `${doc.objects.length} object${doc.objects.length === 1 ? '' : 's'}, ` +
			`${doc.lights.length} light${doc.lights.length === 1 ? '' : 's'}, ` +
			`${doc.timeline.tracks.length} track${doc.timeline.tracks.length === 1 ? '' : 's'}`
		: 'Using a built-in preset. Editing will copy it onto this page.';

	return (
		<div className="_sceneContentEditor">
			<div className="_sceneContentSummary">{summary}</div>
			{problems.length ? (
				<div className="_sceneContentProblems">
					{problems.map(p => (
						<div key={p}>{p}</div>
					))}
				</div>
			) : null}
			<button
				type="button"
				className="_sceneContentEditButton"
				disabled={!selectedComponent}
				onClick={openEditor}
			>
				Edit scene…
			</button>
			{error ? <div className="_sceneContentProblems">{error}</div> : null}
			{open && seed ? (
				<Suspense fallback={null}>
					<SceneEditorModal
						initialDocument={seed}
						eventKeys={eventKeys}
						componentType={seedType}
						onSave={onChange}
						onClose={() => setOpen(false)}
					/>
				</Suspense>
			) : null}
		</div>
	);
}
