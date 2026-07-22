// Compiles a block list into inline-styled, email/PDF-safe HTML. FreeMarker ${...} tokens inside
// text / href / src are preserved verbatim so server-side rendering still substitutes them.

import { Block, BlockType } from './blockTypes';

export interface CompileOptions {
	maxWidth?: number;
	bodyBg?: string;
	contentBg?: string;
	fontFamily?: string;
	forPdf?: boolean;
}

// Escapes double quotes so a value is safe inside an HTML attribute (keeps ${...} intact).
function attr(v: any): string {
	return `${v ?? ''}`.replace(/"/g, '&quot;');
}

// Per-block default wrapper padding [vertical, horizontal] in px. The common style fields override
// these; keeping them here preserves each block's original spacing when the user sets nothing.
const DEFAULT_PAD: Record<BlockType, [number, number]> = {
	heading: [16, 24],
	text: [8, 24],
	list: [8, 24],
	button: [16, 24],
	link: [8, 24],
	image: [8, 24],
	divider: [0, 24],
	spacer: [0, 0],
	html: [0, 0],
};

// Builds the block's outer-wrapper style from the shared style props (see COMMON_STYLE_FIELDS),
// falling back to the block type's default padding. Empty string -> unset -> default.
function wrapperStyle(b: Block): string {
	const p = b.props ?? {};
	const [dV, dH] = DEFAULT_PAD[b.type] ?? [0, 0];
	const padV = p.padV === undefined || p.padV === '' ? dV : Number(p.padV);
	const padH = p.padH === undefined || p.padH === '' ? dH : Number(p.padH);
	const parts = [`padding:${padV}px ${padH}px`];
	if (p.background) parts.push(`background:${p.background}`);
	if (p.blockRadius) parts.push(`border-radius:${p.blockRadius}px`);
	if (p.blockBorder) parts.push(`border:${p.blockBorder}`);
	return parts.join(';');
}

// The block's inner content, WITHOUT the wrapper padding/background (those come from wrapperStyle).
function renderInner(b: Block): string {
	const p = b.props ?? {};
	switch (b.type) {
		case 'heading': {
			const tag = p.level ?? 'h2';
			return `<${tag} style="margin:0;font-size:${p.fontSize ?? 24}px;color:${p.color ?? '#111111'};text-align:${p.align ?? 'left'};line-height:1.3;">${p.text ?? ''}</${tag}>`;
		}
		case 'text':
			return `<div style="font-size:${p.fontSize ?? 14}px;color:${p.color ?? '#333333'};text-align:${p.align ?? 'left'};line-height:1.6;">${p.html ?? ''}</div>`;
		case 'list': {
			const ordered = `${p.ordered}` === 'true';
			const tag = ordered ? 'ol' : 'ul';
			const items = `${p.items ?? ''}`
				.split('\n')
				.map(s => s.trim())
				.filter(Boolean)
				.map(it => `<li style="margin:4px 0;">${it}</li>`)
				.join('');
			return `<div style="font-size:${p.fontSize ?? 14}px;color:${p.color ?? '#333333'};text-align:${p.align ?? 'left'};line-height:1.6;"><${tag} style="margin:0;padding-left:24px;">${items}</${tag}></div>`;
		}
		case 'button': {
			const align = p.align ?? 'left';
			return `<div style="text-align:${align};"><a href="${attr(p.href)}" style="display:inline-block;background:${p.bg ?? '#3b82f6'};color:${p.color ?? '#ffffff'};padding:${p.paddingV ?? 12}px ${p.paddingH ?? 24}px;border-radius:${p.radius ?? 6}px;font-size:14px;font-weight:600;text-decoration:none;">${p.label ?? 'Button'}</a></div>`;
		}
		case 'link': {
			const decoration = `${p.underline}` === 'false' ? 'none' : 'underline';
			return `<div style="text-align:${p.align ?? 'left'};"><a href="${attr(p.href)}" style="color:${p.color ?? '#1893e9'};font-size:${p.fontSize ?? 14}px;text-decoration:${decoration};">${p.label ?? ''}</a></div>`;
		}
		case 'image': {
			const align = p.align ?? 'center';
			const margin = align === 'center' ? '0 auto' : align === 'right' ? '0 0 0 auto' : '0';
			const img = `<img src="${attr(p.src)}" alt="${attr(p.alt)}" width="${p.width ?? 600}" style="display:block;max-width:100%;height:auto;margin:${margin};border:0;"/>`;
			const inner = p.href ? `<a href="${attr(p.href)}">${img}</a>` : img;
			return `<div style="text-align:${align};">${inner}</div>`;
		}
		case 'divider':
			return `<div style="border-top:${p.thickness ?? 1}px solid ${p.color ?? '#e0e0e0'};margin:${p.spacing ?? 16}px 0;"></div>`;
		case 'spacer':
			return `<div style="height:${p.height ?? 24}px;line-height:${p.height ?? 24}px;font-size:0;">&nbsp;</div>`;
		case 'html':
			return `${p.html ?? ''}`;
		default:
			return '';
	}
}

// Renders a single block to an HTML fragment. Exported so the canvas can preview blocks in place.
export function renderBlock(b: Block): string {
	const inner = renderInner(b);
	// Spacer is pure vertical space; wrapping it in a padded box would distort its height.
	if (b.type === 'spacer') return inner;
	return `<div style="${wrapperStyle(b)}">${inner}</div>`;
}

export function compileBlocksToHtml(blocks: Block[], opts: CompileOptions = {}): string {
	const maxWidth = opts.maxWidth ?? 600;
	const bodyBg = opts.bodyBg ?? '#f4f4f4';
	const contentBg = opts.contentBg ?? '#ffffff';
	const font =
		opts.fontFamily ?? "-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

	const rows = (blocks ?? [])
		.map(b => `<tr><td style="padding:0;">${renderBlock(b)}</td></tr>`)
		.join('\n');

	const pageCss = opts.forPdf ? '@page { size: A4; margin: 20mm; }' : '';

	return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<style>
${pageCss}
body { margin:0; padding:0; background:${bodyBg}; font-family:${font}; }
img { border:0; outline:none; }
a { text-decoration:none; }
</style>
</head>
<body>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${bodyBg};">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="${maxWidth}" cellpadding="0" cellspacing="0" style="max-width:${maxWidth}px;width:100%;background:${contentBg};border-radius:8px;overflow:hidden;">
${rows}
</table>
</td></tr>
</table>
</body>
</html>`;
}
