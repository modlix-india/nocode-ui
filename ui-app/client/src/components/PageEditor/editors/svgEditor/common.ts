// Shared types for the embedded SVG editor.

export type ShapeKind = 'rect' | 'circle' | 'ellipse' | 'line' | 'path' | 'text';

// A node in the element tree shown on the left of the editor.
export interface SvgNode {
	editId: string;
	tag: string;
	label: string;
	children: SvgNode[];
}

// One SMIL animation to append to an element.
export interface SmilSpec {
	kind: 'animate' | 'animateTransform' | 'animateMotion';
	attributeName?: string;
	type?: string; // animateTransform: rotate | scale | translate | skewX | skewY
	from?: string;
	to?: string;
	values?: string;
	dur?: string;
	begin?: string;
	repeatCount?: string; // 'indefinite' or a number
	path?: string; // animateMotion
}

// One CSS keyframe animation to embed in the SVG's <style> and apply to an element.
export interface CssAnimSpec {
	name: string; // keyframe name
	keyframes: string; // inner css, e.g. 'from{...}to{...}' or '0%{...}100%{...}'
	duration: string; // e.g. '2s'
	timingFunction?: string;
	delay?: string;
	iterationCount?: string; // '1' | 'infinite' | ...
	direction?: string;
	fillMode?: string;
	// For transform-based animations, pivot around the element's own centre
	// (sets transform-box: fill-box; transform-origin: center).
	originCenter?: boolean;
}

// A SMIL animation child of the selected element.
export interface SmilAnimRef {
	editId: string;
	tag: string;
	attr: string;
	attrs: Record<string, string>;
}

// Details of the selected element for the inspector.
export interface ElementDetails {
	tag: string;
	attrs: Array<{ name: string; value: string }>;
	styles: Record<string, string>;
	text: string;
	hasText: boolean;
	animations: { css: string[]; smil: SmilAnimRef[] };
}

export interface SvgEditorModalProps {
	initialMarkup: string;
	onSave: (markup: string) => void;
	onClose: () => void;
}
