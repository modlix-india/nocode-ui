import React from 'react';
import type { Block, EditorDocument } from '../core/types';

export const EditorDocContext = React.createContext<EditorDocument | null>(null);

export function useEditorDoc(): EditorDocument | null {
	return React.useContext(EditorDocContext);
}

/**
 * Set of currently whole-block-selected top-level block IDs. Empty when no
 * block selection is active (the normal case — selection is a text range).
 * `BlockWrapper` reads this to paint the highlight; a stable empty-set
 * default keeps the common no-selection path from re-rendering.
 */
export const EMPTY_BLOCK_SELECTION: ReadonlySet<string> = new Set();

export const BlockSelectionContext =
	React.createContext<ReadonlySet<string>>(EMPTY_BLOCK_SELECTION);

export function useBlockSelection(): ReadonlySet<string> {
	return React.useContext(BlockSelectionContext);
}

/**
 * Set of image block IDs whose upload to host storage is currently in
 * flight. While a block is in this set, ImageBlock shows the local
 * data-URL preview behind a loading overlay until `onImageUpload` resolves
 * and the durable URL is swapped in. This is transient editor state — it is
 * never written to the document, so a reload mid-upload can't strand a block
 * behind a spinner. A stable empty-set default keeps the common
 * nothing-uploading path from re-rendering every block.
 */
export const EMPTY_IMAGE_UPLOADING: ReadonlySet<string> = new Set();

export const ImageUploadingContext =
	React.createContext<ReadonlySet<string>>(EMPTY_IMAGE_UPLOADING);

export function useImageUploading(): ReadonlySet<string> {
	return React.useContext(ImageUploadingContext);
}

/**
 * Function the editor provides for rendering a list of child blocks. Each
 * child is rendered with the same block-wrapper (drop indicators, drag
 * opacity, BlockRenderer) used at the document root. Container blocks
 * (`columns`, `column`, future `toggle`) read this via context to recursively
 * paint their children without duplicating the top-level loop.
 */
export type RenderBlockList = (blocks: Block[], depth?: number) => React.ReactNode;

export const BlockChildrenRendererContext = React.createContext<RenderBlockList | null>(null);

export function useRenderBlockList(): RenderBlockList | null {
	return React.useContext(BlockChildrenRendererContext);
}

/** Side of a block that a drag is currently targeting. "above"/"below" stack,
 *  "left"/"right" create columns (or insert a new sibling column). */
export type DropEdge = 'above' | 'below' | 'left' | 'right';

export interface DropTarget {
	blockId: string;
	edge: DropEdge;
}

export interface EditorBlockEnvironment {
	readOnly: boolean;
	/**
	 * Rendering for paper (print / PDF export) rather than the screen. Blocks
	 * that conditionally unmount content — collapsed toggles, inactive tabs —
	 * must render ALL of it when this is set, otherwise that content silently
	 * disappears from the printout.
	 *
	 * This is a RENDER-ONLY override: it never writes back to the document, so
	 * a print run must leave `doc` byte-identical.
	 */
	printMode: boolean;
	draggingBlockId: string | null;
	dropTarget: DropTarget | null;
	onToggleTodo: (blockId: string) => void;
	onToggleCollapse: (blockId: string) => void;
	onDragStart: (e: React.DragEvent, blockId: string) => void;
}

export const EditorBlockEnvContext = React.createContext<EditorBlockEnvironment | null>(null);

export function useEditorBlockEnv(): EditorBlockEnvironment | null {
	return React.useContext(EditorBlockEnvContext);
}

/** True while the tree is being rendered for paper. See `EditorBlockEnvironment.printMode`. */
export function useIsPrintMode(): boolean {
	return React.useContext(EditorBlockEnvContext)?.printMode ?? false;
}

/** A pickable font offered in the editor's font controls. `value` is the CSS
 *  font-family ("" = inherit / theme default). Host-provided so the workspace's
 *  curated + custom (uploaded) fonts appear in the editor. */
export interface EditorFontOption {
	label: string;
	value: string;
}

/** Host-provided callbacks the editor surfaces to specific block types
 *  (image upload, fonts). Threaded via context so deep
 *  block renderers can use them without prop drilling. */
export interface EditorHostCallbacks {
	/** Fonts to offer in the editor's font pickers. */
	fonts?: EditorFontOption[];
	/** Upload an image file and return a durable URL. Mirrors the top-level
	 *  `onImageUpload` prop. When absent, callers embed a data URL. */
	onImageUpload?: (file: File) => Promise<string>;
}

export const EditorHostCallbacksContext = React.createContext<EditorHostCallbacks>({});

export function useEditorHostCallbacks(): EditorHostCallbacks {
	return React.useContext(EditorHostCallbacksContext);
}
