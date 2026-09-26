import type { SceneDocument } from '../../../util/three/sceneDocument';

export interface SceneEditorModalProps {
	/** The document to open with, already resolved from any preset. */
	initialDocument: SceneDocument;
	/** Event function keys on the page, for the interaction panel. */
	eventKeys: string[];
	/**
	 * Which of the four scene components this document belongs to.
	 *
	 * The AI pane briefs the model differently for each: the same document
	 * renders in all four, but a full-bleed shader backdrop and a product on a
	 * turntable are not the same brief, and a model told only "a scene" writes
	 * the average of them.
	 */
	componentType: string;
	onSave: (doc: SceneDocument) => void;
	onClose: () => void;
}

/** What the tree selects: one object, one light, the camera, or a shader. */
export type Selection =
	| { kind: 'object'; id: string }
	| { kind: 'light'; id: string }
	| { kind: 'shader'; id: string }
	| { kind: 'camera' }
	| { kind: 'none' };

export const NOTHING: Selection = { kind: 'none' };

export const sameSelection = (a: Selection, b: Selection): boolean =>
	a.kind === b.kind && (a as any).id === (b as any).id;
