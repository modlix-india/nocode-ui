// Block model for the visual (drag-and-drop) template editor.
//
// A part's design is a flat, ordered list of blocks. Each block compiles to inline-styled,
// email/PDF-safe HTML (see compileBlocksToHtml). FreeMarker ${...} tokens inside block text/urls
// are preserved verbatim so server-side rendering still works.

export type BlockType =
	| 'heading'
	| 'text'
	| 'list'
	| 'button'
	| 'link'
	| 'image'
	| 'divider'
	| 'spacer'
	| 'html';

export interface Block {
	id: string;
	type: BlockType;
	props: Record<string, any>;
}

export interface BlockPropField {
	key: string;
	label: string;
	kind: 'text' | 'textarea' | 'number' | 'color' | 'select' | 'code';
	options?: { value: string; label: string }[];
	placeholder?: string;
}

export interface BlockTypeDef {
	type: BlockType;
	label: string;
	icon: string; // font-awesome class
	defaults: Record<string, any>;
	fields: BlockPropField[];
}

const ALIGN_OPTIONS = [
	{ value: 'left', label: 'Left' },
	{ value: 'center', label: 'Center' },
	{ value: 'right', label: 'Right' },
];

export const BLOCK_TYPES: Record<BlockType, BlockTypeDef> = {
	heading: {
		type: 'heading',
		label: 'Heading',
		icon: 'fa-heading',
		defaults: { text: 'Heading', level: 'h2', align: 'left', color: '#111111', fontSize: 24 },
		fields: [
			{ key: 'text', label: 'Text', kind: 'text' },
			{
				key: 'level',
				label: 'Level',
				kind: 'select',
				options: ['h1', 'h2', 'h3', 'h4'].map(v => ({ value: v, label: v.toUpperCase() })),
			},
			{ key: 'align', label: 'Align', kind: 'select', options: ALIGN_OPTIONS },
			{ key: 'fontSize', label: 'Font size (px)', kind: 'number' },
			{ key: 'color', label: 'Color', kind: 'color' },
		],
	},
	text: {
		type: 'text',
		label: 'Text',
		icon: 'fa-paragraph',
		defaults: {
			html: 'Your text here. Use ${variables} for merge fields.',
			align: 'left',
			color: '#333333',
			fontSize: 14,
		},
		fields: [
			{ key: 'html', label: 'Content', kind: 'textarea' },
			{ key: 'align', label: 'Align', kind: 'select', options: ALIGN_OPTIONS },
			{ key: 'fontSize', label: 'Font size (px)', kind: 'number' },
			{ key: 'color', label: 'Color', kind: 'color' },
		],
	},
	list: {
		type: 'list',
		label: 'List',
		icon: 'fa-list-ul',
		defaults: {
			items: 'First item\nSecond item\nThird item',
			ordered: 'false',
			align: 'left',
			color: '#333333',
			fontSize: 14,
		},
		fields: [
			{ key: 'items', label: 'Items (one per line)', kind: 'textarea' },
			{
				key: 'ordered',
				label: 'Style',
				kind: 'select',
				options: [
					{ value: 'false', label: 'Bulleted' },
					{ value: 'true', label: 'Numbered' },
				],
			},
			{ key: 'align', label: 'Align', kind: 'select', options: ALIGN_OPTIONS },
			{ key: 'fontSize', label: 'Font size (px)', kind: 'number' },
			{ key: 'color', label: 'Color', kind: 'color' },
		],
	},
	button: {
		type: 'button',
		label: 'Button',
		icon: 'fa-hand-pointer',
		defaults: {
			label: 'Click here',
			href: '${actionUrl}',
			align: 'left',
			bg: '#3b82f6',
			color: '#ffffff',
			radius: 6,
			paddingV: 12,
			paddingH: 24,
		},
		fields: [
			{ key: 'label', label: 'Label', kind: 'text' },
			{ key: 'href', label: 'Link (href)', kind: 'text' },
			{ key: 'align', label: 'Align', kind: 'select', options: ALIGN_OPTIONS },
			{ key: 'bg', label: 'Background', kind: 'color' },
			{ key: 'color', label: 'Text color', kind: 'color' },
			{ key: 'radius', label: 'Corner radius (px)', kind: 'number' },
			{ key: 'paddingV', label: 'Padding Y (px)', kind: 'number' },
			{ key: 'paddingH', label: 'Padding X (px)', kind: 'number' },
		],
	},
	link: {
		type: 'link',
		label: 'Link',
		icon: 'fa-link',
		defaults: {
			label: 'Link text',
			href: '${url}',
			align: 'left',
			color: '#1893e9',
			fontSize: 14,
			underline: 'true',
		},
		fields: [
			{ key: 'label', label: 'Text', kind: 'text' },
			{ key: 'href', label: 'Link (href)', kind: 'text' },
			{ key: 'align', label: 'Align', kind: 'select', options: ALIGN_OPTIONS },
			{ key: 'fontSize', label: 'Font size (px)', kind: 'number' },
			{ key: 'color', label: 'Color', kind: 'color' },
			{
				key: 'underline',
				label: 'Underline',
				kind: 'select',
				options: [
					{ value: 'true', label: 'Yes' },
					{ value: 'false', label: 'No' },
				],
			},
		],
	},
	image: {
		type: 'image',
		label: 'Image',
		icon: 'fa-image',
		defaults: { src: '', alt: '', width: 600, align: 'center', href: '' },
		fields: [
			{ key: 'src', label: 'Image URL', kind: 'text' },
			{ key: 'alt', label: 'Alt text', kind: 'text' },
			{ key: 'width', label: 'Width (px)', kind: 'number' },
			{ key: 'align', label: 'Align', kind: 'select', options: ALIGN_OPTIONS },
			{ key: 'href', label: 'Link (optional)', kind: 'text' },
		],
	},
	divider: {
		type: 'divider',
		label: 'Divider',
		icon: 'fa-grip-lines',
		defaults: { color: '#e0e0e0', thickness: 1, spacing: 16 },
		fields: [
			{ key: 'color', label: 'Color', kind: 'color' },
			{ key: 'thickness', label: 'Thickness (px)', kind: 'number' },
			{ key: 'spacing', label: 'Spacing (px)', kind: 'number' },
		],
	},
	spacer: {
		type: 'spacer',
		label: 'Spacer',
		icon: 'fa-arrows-up-down',
		defaults: { height: 24 },
		fields: [{ key: 'height', label: 'Height (px)', kind: 'number' }],
	},
	html: {
		type: 'html',
		label: 'Raw HTML',
		icon: 'fa-code',
		defaults: { html: '<!-- Raw HTML with ${variables} -->' },
		fields: [{ key: 'html', label: 'HTML', kind: 'code' }],
	},
};

// Style fields shared by every block. They apply to the block's outer wrapper (padding, background,
// border) via compileBlocksToHtml, on top of the type-specific fields above. Kept separate so a new
// block type gets spacing/background controls for free.
export const COMMON_STYLE_FIELDS: BlockPropField[] = [
	{ key: 'padV', label: 'Padding top/bottom (px)', kind: 'number', placeholder: 'auto' },
	{ key: 'padH', label: 'Padding left/right (px)', kind: 'number', placeholder: 'auto' },
	{ key: 'background', label: 'Block background', kind: 'color' },
	{ key: 'blockRadius', label: 'Block corner radius (px)', kind: 'number' },
	{ key: 'blockBorder', label: 'Border (e.g. 1px solid #eeeeee)', kind: 'text' },
];

// Blocks whose wrapper the common style fields do not meaningfully apply to.
export const NO_STYLE_WRAPPER: ReadonlySet<BlockType> = new Set<BlockType>(['spacer']);

export const BLOCK_TYPE_LIST: BlockTypeDef[] = Object.values(BLOCK_TYPES);

// Drag payload prefix for palette items (native HTML5 DnD), mirroring the page editor's convention.
export const TEMPLATE_BLOCK_DRAG = 'TEMPLATE_BLOCK_DRAG_';
