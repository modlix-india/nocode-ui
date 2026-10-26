// ============================================================
// ListItemBlock — single-item list block. Renders one of:
//   • bulletItem  → bulleted marker (• ◦ ▪ depending on indent)
//   • numberItem  → numbered marker (1. a. i. depending on indent)
//   • todoItem    → checkbox + struck-through text when checked
//
// Each block is a first-class editor block (vs the legacy `list` which
// owned an items array). Nesting uses `block.children`, so any nested
// item can be a different kind from its parent (bullet inside number,
// todo inside bullet, etc.) — solving the limitation of the legacy
// shape where a single list locked itself into one kind per level.
//
// The block:
//   • Renders the marker.
//   • Renders the editable text via TextContent.
//   • Recursively renders children via useRenderBlockList — the editor's
//     top-level loop handles the rest (wrappers, drag, drop, etc.).
//
// List items are NOT collapsible — they are plain nested lists. Users
// who want collapse pick the Toggle block explicitly from the slash menu.
// ============================================================

import React, { useCallback } from 'react';
import { TextContent } from './TextContent';
import { useRenderBlockList } from './EditorDocContext';
import type { Block } from '../core/types';

interface ListItemBlockProps {
	readonly block: Block;
	readonly index: number;
	readonly depth: number;
	readonly onToggleTodo?: (blockId: string) => void;
}

// Bullet rendering uses SVG instead of Unicode so the shape, size, and
// vertical centring are deterministic across fonts. Each shape draws in a
// 10×10 viewBox; `size` (px) controls the rendered box.
const DEFAULT_BULLET_CYCLE = ['disc', 'circle', 'square'] as const;

function resolveBulletKey(depth: number, override?: string): string {
	if (override) return override;
	return DEFAULT_BULLET_CYCLE[depth % DEFAULT_BULLET_CYCLE.length]!;
}

// Per-shape size multiplier. Linear shapes (dash / arrow / checkmark) and
// the star have less ink coverage than a filled disc/square at the same box
// size, so we bump them up to read with similar visual weight.
const SHAPE_SCALE: Record<string, number> = {
	disc: 1.0,
	circle: 1.0,
	square: 1.0,
	dash: 1.35,
	arrow: 1.3,
	star: 1.3,
	checkmark: 1.3,
};

function BulletShape({ shape, size }: { shape: string; size: number }): React.ReactElement {
	const scaled = size * (SHAPE_SCALE[shape] ?? 1);
	const common = {
		viewBox: '0 0 10 10' as const,
		width: scaled,
		height: scaled,
		'aria-hidden': true,
		style: { display: 'block' } as const,
	};
	switch (shape) {
		case 'circle':
			return (
				<svg {...common}>
					<circle
						cx={5}
						cy={5}
						r={3.5}
						fill="none"
						stroke="currentColor"
						strokeWidth={1.4}
					/>
				</svg>
			);
		case 'square':
			return (
				<svg {...common}>
					<rect x={1.5} y={1.5} width={7} height={7} rx={1} fill="currentColor" />
				</svg>
			);
		case 'dash':
			return (
				<svg {...common}>
					<rect x={0.5} y={4.2} width={9} height={1.6} rx={0.8} fill="currentColor" />
				</svg>
			);
		case 'arrow':
			return (
				<svg {...common}>
					<path
						d="M 1 5 L 8 5 M 5.2 2.2 L 8 5 L 5.2 7.8"
						stroke="currentColor"
						strokeWidth={1.6}
						fill="none"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			);
		case 'star':
			return (
				<svg {...common}>
					<path
						d="M 5 0.4 L 6.27 3.6 L 9.71 3.78 L 7.01 5.93 L 7.95 9.25 L 5 7.3 L 2.05 9.25 L 2.99 5.93 L 0.29 3.78 L 3.73 3.6 Z"
						fill="currentColor"
					/>
				</svg>
			);
		case 'checkmark':
			return (
				<svg {...common}>
					<path
						d="M 1 5.4 L 4 8.4 L 9 2.2"
						stroke="currentColor"
						strokeWidth={1.8}
						fill="none"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			);
		case 'disc':
		default:
			return (
				<svg {...common}>
					<circle cx={5} cy={5} r={4} fill="currentColor" />
				</svg>
			);
	}
}

// Format a number for a numbered item based on nesting depth + index.
function numberMarker(depth: number, oneBasedIndex: number, override?: string): string {
	const style = override ?? ['decimal', 'alpha-lower', 'roman-lower'][depth % 3]!;
	switch (style) {
		case 'alpha-lower':
			return `${toAlpha(oneBasedIndex).toLowerCase()}.`;
		case 'alpha-upper':
			return `${toAlpha(oneBasedIndex)}.`;
		case 'roman-lower':
			return `${toRoman(oneBasedIndex).toLowerCase()}.`;
		case 'roman-upper':
			return toRoman(oneBasedIndex) + '.';
		default:
			return `${oneBasedIndex}.`;
	}
}

function toAlpha(n: number): string {
	let out = '';
	let v = n;
	while (v > 0) {
		const rem = (v - 1) % 26;
		out = String.fromCharCode(65 + rem) + out;
		v = Math.floor((v - 1) / 26);
	}
	return out;
}

function toRoman(n: number): string {
	const table: Array<[number, string]> = [
		[1000, 'M'],
		[900, 'CM'],
		[500, 'D'],
		[400, 'CD'],
		[100, 'C'],
		[90, 'XC'],
		[50, 'L'],
		[40, 'XL'],
		[10, 'X'],
		[9, 'IX'],
		[5, 'V'],
		[4, 'IV'],
		[1, 'I'],
	];
	let v = n;
	let out = '';
	for (const [val, sym] of table) {
		while (v >= val) {
			out += sym;
			v -= val;
		}
	}
	return out;
}

export function ListItemBlock({ block, index, depth, onToggleTodo }: ListItemBlockProps) {
	const renderChildren = useRenderBlockList();
	const hasChildren = block.children.length > 0;

	const style = block.props.style as
		| {
				kind?: string;
				bulletStyle?: string;
				numberStyle?: string;
				color?: string;
				size?: string;
		  }
		| undefined;

	const handleCheckbox = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();
			onToggleTodo?.(block.id);
		},
		[block.id, onToggleTodo],
	);

	const markerColor = style?.color ?? 'var(--mde-text-muted, #888)';
	// Marker dimensions per style.size. Default ("medium") gives a confident
	// bullet that anchors the line; "small" / "large" let users tune.
	// `bulletPx` is the rendered SVG size; `bulletW` is the slot width so the
	// text column stays aligned even when the shape is narrower than its slot.
	const markerSize = (() => {
		switch (style?.size) {
			case 'small':
				return { bulletPx: 7, bulletW: 14, number: 14, numberW: 16 };
			case 'large':
				return { bulletPx: 13, bulletW: 22, number: 19, numberW: 22 };
			default:
				return { bulletPx: 10, bulletW: 18, number: 16, numberW: 18 };
		}
	})();

	// ----- Marker -----
	let marker: React.ReactNode;
	if (block.type === 'todoItem') {
		const checked = (block.props.checked as boolean | undefined) ?? false;
		marker = (
			<button
				type="button"
				onClick={handleCheckbox}
				aria-checked={checked}
				role="checkbox"
				contentEditable={false}
				style={{
					marginTop: '0.35em',
					width: 16,
					height: 16,
					flexShrink: 0,
					borderRadius: 3,
					border: '1.5px solid',
					borderColor: checked
						? 'var(--mde-accent, #3b82f6)'
						: 'var(--mde-text-muted, #aaa)',
					backgroundColor: checked ? 'var(--mde-accent, #3b82f6)' : 'transparent',
					display: 'inline-flex',
					alignItems: 'center',
					justifyContent: 'center',
					padding: 0,
					cursor: 'pointer',
				}}
			>
				{checked && (
					<svg viewBox="0 0 16 16" width={12} height={12} fill="none">
						<path
							d="M3 8.5 L6.5 12 L13 4.5"
							stroke="white"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				)}
			</button>
		);
	} else if (block.type === 'numberItem') {
		marker = (
			<span
				contentEditable={false}
				style={{
					marginTop: '0.05em',
					minWidth: markerSize.numberW,
					textAlign: 'right',
					color: markerColor,
					userSelect: 'none',
					fontSize: markerSize.number,
					fontVariantNumeric: 'tabular-nums',
				}}
			>
				{numberMarker(depth, index + 1, style?.numberStyle)}
			</span>
		);
	} else {
		// bulletItem (default). Outer span is exactly one line of text high
		// (1.625em — matches the data-content line-height below) so the shape
		// can be vertically centred against the first text line via inline-flex,
		// independent of size or shape.
		const bulletKey = resolveBulletKey(depth, style?.bulletStyle);
		marker = (
			<span
				contentEditable={false}
				style={{
					display: 'inline-flex',
					alignItems: 'center',
					justifyContent: 'center',
					height: '1.625em',
					width: markerSize.bulletW,
					flexShrink: 0,
					color: markerColor,
					userSelect: 'none',
				}}
			>
				<BulletShape shape={bulletKey} size={markerSize.bulletPx} />
			</span>
		);
	}

	const checkedLine =
		block.type === 'todoItem' && (block.props.checked as boolean | undefined)
			? { textDecoration: 'line-through' as const, color: 'var(--mde-text-muted, #888)' }
			: {};

	return (
		<div style={{ display: 'flex', flexDirection: 'column' }}>
			<div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
				{marker}
				<div
					data-content
					style={{
						flex: 1,
						minHeight: '1.5em',
						lineHeight: 1.625,
						...checkedLine,
					}}
				>
					<TextContent content={block.content} />
				</div>
			</div>
			{hasChildren && renderChildren && (
				<div style={{ marginLeft: 22, marginTop: 2 }}>
					{/* Bump depth so nested list-item markers rotate (• → ◦ → ▪,
              1. → a. → i.) as list nesting deepens. */}
					{renderChildren(block.children, depth + 1)}
				</div>
			)}
		</div>
	);
}
