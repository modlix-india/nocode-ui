// ============================================================
// Slash Command Menu — appears when user types "/" in an
// empty or beginning-of-block position. Shows a filterable
// list of block types to insert, grouped by category.
// ============================================================

import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { BlockType } from '../core/types';
import { blockDefinitions, type BlockDefinition } from '../blocks/registry';
import { useT } from '../i18n/context';
import type { EditorTranslationKey } from '../i18n/keys';
import {
	Type,
	Heading1,
	Heading2,
	Heading3,
	Heading4,
	Heading5,
	Heading6,
	List,
	ListOrdered,
	CheckSquare,
	Code,
	Quote,
	Lightbulb,
	ChevronRight,
	TableOfContents,
	Minus,
	Image,
	Link,
	Table,
	Columns2,
	Component,
	LayoutDashboard,
} from 'lucide-react';

interface SlashCommandProps {
	position: { x: number; y: number };
	filter: string;
	onSelect: (type: BlockType) => void;
	onClose: () => void;
	/** Block types to offer. When omitted every entry is offered. Pseudo
	 *  entries (colors, TOC designs) follow the type they belong to. */
	allowedTypes?: readonly BlockType[];
}

// Color palette (mirrored from features/toolbar.tsx so the slash entries
// stay in lockstep with the inline color picker). Each entry below
// produces TWO virtual slash items — one for text color, one for
// background — keyed by name. The pseudo-type string carries the
// color name; the editor handler reads it as `__textColor:<name>` or
// `__bgColor:<name>` and writes `blockTextColor` / `blockHighlightColor`
// on the active block.
const COLOR_NAMES = [
	'default',
	'gray',
	'brown',
	'orange',
	'yellow',
	'green',
	'blue',
	'purple',
	'pink',
	'red',
] as const;

const TEXT_COLOR_VALUES: Record<string, string> = {
	default: 'inherit',
	gray: '#9ca3af',
	brown: '#a16207',
	orange: '#ea580c',
	yellow: '#ca8a04',
	green: '#16a34a',
	blue: '#2563eb',
	purple: '#7c3aed',
	pink: '#db2777',
	red: '#dc2626',
};

const BG_COLOR_VALUES: Record<string, string> = {
	default: 'transparent',
	gray: '#f3f4f6',
	brown: '#fef3c7',
	orange: '#ffedd5',
	yellow: '#fef9c3',
	green: '#dcfce7',
	blue: '#dbeafe',
	purple: '#ede9fe',
	pink: '#fce7f3',
	red: '#fee2e2',
};

/** Resolve a color slash pseudo-type ("__textColor:red", "__bgColor:yellow")
 *  into the actual CSS color string. Returns null when the type isn't a
 *  color pseudo-type. The editor's handleSlashSelect uses this. */
export function resolveColorSlashType(
	type: string,
): { mode: 'text' | 'bg'; cssValue: string } | null {
	if (type.startsWith('__textColor:')) {
		const name = type.slice('__textColor:'.length);
		const css = TEXT_COLOR_VALUES[name];
		return css ? { mode: 'text', cssValue: css } : null;
	}
	if (type.startsWith('__bgColor:')) {
		const name = type.slice('__bgColor:'.length);
		const css = BG_COLOR_VALUES[name];
		return css ? { mode: 'bg', cssValue: css } : null;
	}
	return null;
}

const COLOR_TEXT_TYPES = COLOR_NAMES.map(n => `__textColor:${n}` as BlockType);
const COLOR_BG_TYPES = COLOR_NAMES.map(n => `__bgColor:${n}` as BlockType);

// TOC design pseudo-types — the plain indented design is the real `toc` block;
// these each insert a `toc` block with a specific `tocVariant`. Handled in
// BlockEditor's handleSlashSelect (`__toc:` branch), mirroring the color
// pseudo-type pattern above.
const TOC_VARIANT_NAMES = ['bulleted', 'numbered', 'card', 'accent'] as const;
const TOC_VARIANT_META: Record<string, { label: string; description: string }> = {
	bulleted: { label: 'Contents — Bulleted', description: 'Headings with bullet markers' },
	numbered: { label: 'Contents — Numbered', description: 'Headings with 1, 1.1 numbering' },
	card: { label: 'Contents — Card', description: 'Headings in a bordered panel' },
	accent: { label: 'Contents — Accent bar', description: 'Headings with a left accent bar' },
};
const TOC_VARIANT_TYPES = TOC_VARIANT_NAMES.map(n => `__toc:${n}` as BlockType);

/** Resolve a `__toc:<variant>` slash pseudo-type into its variant name.
 *  Returns null when the type isn't a TOC pseudo-type. */
export function resolveTocSlashType(type: string): string | null {
	if (typeof type === 'string' && type.startsWith('__toc:')) {
		return type.slice('__toc:'.length);
	}
	return null;
}

const CATEGORIES: { id: string; labelKey: EditorTranslationKey; types: BlockType[] }[] = [
	{
		id: 'basic',
		labelKey: 'slash.category.basic',
		types: [
			'paragraph',
			'heading1',
			'heading2',
			'heading3',
			'heading4',
			'heading5',
			'heading6',
			'toggleHeading1',
			'toggleHeading2',
			'toggleHeading3',
		],
	},
	{
		id: 'lists',
		labelKey: 'slash.category.lists',
		types: ['bulletItem', 'numberItem', 'todoItem'],
	},
	{
		id: 'advanced',
		labelKey: 'slash.category.advanced',
		types: [
			'codeBlock',
			'quote',
			'callout',
			'toggle',
			'columns',
			'tabs',
			'toc',
			...TOC_VARIANT_TYPES,
			'customComponent',
		],
	},
	{
		id: 'media',
		labelKey: 'slash.category.media',
		types: ['divider', 'image', 'embed', 'table'],
	},
	{
		id: 'color',
		labelKey: 'slash.category.color',
		types: [...COLOR_TEXT_TYPES, ...COLOR_BG_TYPES],
	},
];

/** The real block type a slash entry belongs to, for allow-list checks.
 *  Color entries map to a pseudo "color" key so hosts can opt into them. */
function slashEntryOwner(type: string): string {
	if (type.startsWith('__toc:')) return 'toc';
	if (type.startsWith('__textColor:') || type.startsWith('__bgColor:')) return '__color';
	return type;
}

const ICON_SIZE = 16;

/** Render a small "A" badge tinted with the given color — used for slash
 *  menu color entries, mirroring the screenshot 3 UI from the user spec. */
function ColorIcon({ color, bg }: { color?: string; bg?: string }) {
	return (
		<span
			style={{
				display: 'inline-flex',
				alignItems: 'center',
				justifyContent: 'center',
				width: ICON_SIZE,
				height: ICON_SIZE,
				borderRadius: 3,
				border: '1px solid var(--mde-border, #e0e0e0)',
				background: bg ?? 'transparent',
				color: color ?? 'currentColor',
				fontSize: 11,
				fontWeight: 600,
				fontFamily: 'ui-serif, Georgia, serif',
			}}
		>
			A
		</span>
	);
}

function getBlockIcon(type: BlockType): React.ReactNode {
	// Color pseudo-types: render the swatched "A" badge.
	if (typeof type === 'string' && type.startsWith('__textColor:')) {
		const name = type.slice('__textColor:'.length);
		const css = TEXT_COLOR_VALUES[name] ?? 'inherit';
		return <ColorIcon color={css === 'inherit' ? undefined : css} />;
	}
	if (typeof type === 'string' && type.startsWith('__bgColor:')) {
		const name = type.slice('__bgColor:'.length);
		const css = BG_COLOR_VALUES[name] ?? 'transparent';
		return <ColorIcon bg={css === 'transparent' ? undefined : css} />;
	}
	// TOC design pseudo-types get design-hinting icons.
	const tocVariant = resolveTocSlashType(type as string);
	if (tocVariant) {
		if (tocVariant === 'bulleted') return <List size={ICON_SIZE} />;
		if (tocVariant === 'numbered') return <ListOrdered size={ICON_SIZE} />;
		return <TableOfContents size={ICON_SIZE} />;
	}
	return getBlockIconInner(type);
}

function getBlockIconInner(type: BlockType): React.ReactNode {
	const icons: Record<string, React.ReactNode> = {
		paragraph: <Type size={ICON_SIZE} />,
		heading1: <Heading1 size={ICON_SIZE} />,
		heading2: <Heading2 size={ICON_SIZE} />,
		heading3: <Heading3 size={ICON_SIZE} />,
		toggleHeading1: <Heading1 size={ICON_SIZE} />,
		toggleHeading2: <Heading2 size={ICON_SIZE} />,
		toggleHeading3: <Heading3 size={ICON_SIZE} />,
		heading4: <Heading4 size={ICON_SIZE} />,
		heading5: <Heading5 size={ICON_SIZE} />,
		heading6: <Heading6 size={ICON_SIZE} />,
		list: <List size={ICON_SIZE} />,
		todo: <CheckSquare size={ICON_SIZE} />,
		bulletItem: <List size={ICON_SIZE} />,
		numberItem: <List size={ICON_SIZE} />,
		todoItem: <CheckSquare size={ICON_SIZE} />,
		tabs: <LayoutDashboard size={ICON_SIZE} />,
		tab: <LayoutDashboard size={ICON_SIZE} />,
		codeBlock: <Code size={ICON_SIZE} />,
		quote: <Quote size={ICON_SIZE} />,
		callout: <Lightbulb size={ICON_SIZE} />,
		toggle: <ChevronRight size={ICON_SIZE} />,
		divider: <Minus size={ICON_SIZE} />,
		image: <Image size={ICON_SIZE} />,
		embed: <Link size={ICON_SIZE} />,
		table: <Table size={ICON_SIZE} />,
		toc: <TableOfContents size={ICON_SIZE} />,
		columns: <Columns2 size={ICON_SIZE} />,
		customComponent: <Component size={ICON_SIZE} />,
	};
	return icons[type] ?? <Type size={ICON_SIZE} />;
}

export function SlashCommandMenu({
	position,
	filter,
	onSelect,
	onClose,
	allowedTypes,
}: SlashCommandProps) {
	const t = useT();
	const [selectedIndex, setSelectedIndex] = useState(0);
	const menuRef = useRef<HTMLDivElement>(null);

	// Virtual definitions — slash entries that aren't real block types.
	//   Color rows — text color / background color one entry per name; on
	//                select, the editor's handleSlashSelect writes
	//                blockTextColor / blockHighlightColor on the active
	//                block and the BlockWrapper paints them.
	const allDefs = useMemo<BlockDefinition[]>(() => {
		const textColorEntries: BlockDefinition[] = COLOR_NAMES.map(name => ({
			type: `__textColor:${name}` as BlockType,
			label: `${name.charAt(0).toUpperCase() + name.slice(1)} text`,
			description: name === 'default' ? 'Reset text color' : `Color text ${name}`,
			labelKey: `slash.color.text.${name}` as EditorTranslationKey,
			descriptionKey: 'block.paragraph.description',
			shortcut: undefined,
			keywords: ['color', 'text', name],
			hasContent: false,
		}));
		const bgColorEntries: BlockDefinition[] = COLOR_NAMES.map(name => ({
			type: `__bgColor:${name}` as BlockType,
			label: `${name.charAt(0).toUpperCase() + name.slice(1)} background`,
			description: name === 'default' ? 'Reset background' : `Color background ${name}`,
			labelKey: `slash.color.bg.${name}` as EditorTranslationKey,
			descriptionKey: 'block.paragraph.description',
			shortcut: undefined,
			keywords: ['color', 'background', 'highlight', 'bg', name],
			hasContent: false,
		}));
		const tocVariantEntries: BlockDefinition[] = TOC_VARIANT_NAMES.map(name => ({
			type: `__toc:${name}` as BlockType,
			label: TOC_VARIANT_META[name]!.label,
			description: TOC_VARIANT_META[name]!.description,
			labelKey: `block.toc.${name}.label` as EditorTranslationKey,
			descriptionKey: `block.toc.${name}.description` as EditorTranslationKey,
			shortcut: undefined,
			keywords: ['toc', 'table of contents', 'outline', 'contents', 'index', name],
			hasContent: false,
		}));
		const all = [
			...blockDefinitions,
			...tocVariantEntries,
			...textColorEntries,
			...bgColorEntries,
		];
		if (!allowedTypes) return all;
		const allowed = new Set<string>(allowedTypes);
		return all.filter(def => allowed.has(slashEntryOwner(def.type as string)));
	}, [allowedTypes]);

	const filtered = useMemo(() => {
		if (!filter) return allDefs;
		const lower = filter.toLowerCase();
		return allDefs.filter(
			def =>
				def.label.toLowerCase().includes(lower) ||
				def.description.toLowerCase().includes(lower) ||
				t(def.labelKey).toLowerCase().includes(lower) ||
				t(def.descriptionKey).toLowerCase().includes(lower) ||
				def.keywords.some(k => k.includes(lower)),
		);
	}, [filter, t, allDefs]);

	const grouped = useMemo(() => {
		if (filter) {
			return [{ id: 'results', label: t('slash.results'), items: filtered }];
		}
		return CATEGORIES.map(cat => ({
			id: cat.id,
			label: t(cat.labelKey),
			items: cat.types
				.map(bt => filtered.find(d => d.type === bt))
				.filter(Boolean) as BlockDefinition[],
		})).filter(g => g.items.length > 0);
	}, [filtered, filter, t]);

	const flatItems = useMemo(() => grouped.flatMap(g => g.items), [grouped]);

	useEffect(() => {
		setSelectedIndex(0);
	}, [filter]);

	// Keyboard navigation
	useEffect(() => {
		function handleKeyDown(e: KeyboardEvent) {
			switch (e.key) {
				case 'ArrowDown':
					e.preventDefault();
					e.stopImmediatePropagation();
					setSelectedIndex(i => (i + 1) % flatItems.length);
					break;
				case 'ArrowUp':
					e.preventDefault();
					e.stopImmediatePropagation();
					setSelectedIndex(i => (i - 1 + flatItems.length) % flatItems.length);
					break;
				case 'Enter': {
					e.preventDefault();
					e.stopImmediatePropagation();
					const item = flatItems[selectedIndex];
					if (item) onSelect(item.type);
					break;
				}
				case 'Escape':
					e.preventDefault();
					e.stopImmediatePropagation();
					onClose();
					break;
			}
		}
		document.addEventListener('keydown', handleKeyDown, true);
		return () => document.removeEventListener('keydown', handleKeyDown, true);
	}, [flatItems, selectedIndex, onSelect, onClose]);

	// Close on outside click
	useEffect(() => {
		function handleClick(e: MouseEvent) {
			if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
				onClose();
			}
		}
		document.addEventListener('mousedown', handleClick);
		return () => document.removeEventListener('mousedown', handleClick);
	}, [onClose]);

	// Scroll selected into view
	useEffect(() => {
		const el = menuRef.current?.querySelector('[data-selected=true]');
		el?.scrollIntoView({ block: 'nearest' });
	}, [selectedIndex]);

	const menuPos = useMemo(() => {
		const flipUp = position.y + 340 > globalThis.innerHeight - 20;
		return {
			position: 'fixed' as const,
			left: position.x,
			top: flipUp ? undefined : position.y,
			bottom: flipUp ? globalThis.innerHeight - position.y + 8 : undefined,
			zIndex: 50,
		};
	}, [position]);

	if (flatItems.length === 0) {
		return (
			<div
				ref={menuRef}
				style={{
					...menuPos,
					width: 240,
					borderRadius: 10,
					padding: 8,
					backgroundColor: 'var(--mde-bg-secondary, #f5f5f5)',
					border: '1px solid var(--mde-border-primary, #e5e5e5)',
					boxShadow: '0 4px 20px var(--mde-shadow, rgba(0,0,0,0.12))',
				}}
			>
				<p
					style={{
						padding: '12px 8px',
						textAlign: 'center',
						fontSize: 13,
						color: 'var(--mde-text-muted, #999)',
						margin: 0,
					}}
				>
					{t('slash.empty')}
				</p>
			</div>
		);
	}

	let flatIndex = 0;

	return (
		<div
			ref={menuRef}
			data-testid="slash-command-menu"
			style={{
				...menuPos,
				width: 240,
				maxHeight: 340,
				overflowY: 'auto',
				overflowX: 'hidden',
				scrollbarWidth: 'thin',
				scrollbarColor: 'rgba(0,0,0,0.15) transparent',
				borderRadius: 10,
				padding: '4px 0',
				backgroundColor: 'var(--mde-bg-secondary, #f5f5f5)',
				border: '1px solid var(--mde-border-primary, #e5e5e5)',
				boxShadow: '0 4px 20px var(--mde-shadow, rgba(0,0,0,0.12))',
			}}
		>
			{grouped.map(group => (
				<div key={group.id}>
					{/* Category label */}
					<div
						style={{
							padding: '8px 12px 4px',
							fontSize: 10,
							fontWeight: 500,
							textTransform: 'uppercase',
							letterSpacing: '0.05em',
							color: 'var(--mde-text-muted, #999)',
							opacity: 0.8,
						}}
					>
						{group.label}
					</div>
					{/* Items */}
					{group.items.map(def => {
						const idx = flatIndex++;
						const isSelected = idx === selectedIndex;
						return (
							<button
								key={def.type}
								type="button"
								data-selected={isSelected}
								onMouseDown={e => e.preventDefault()}
								onClick={() => onSelect(def.type)}
								onMouseEnter={() => setSelectedIndex(idx)}
								style={{
									display: 'flex',
									alignItems: 'center',
									gap: 10,
									width: '100%',
									padding: '6px 10px',
									margin: '0 2px',
									border: 'none',
									borderRadius: 6,
									cursor: 'pointer',
									textAlign: 'left',
									backgroundColor: isSelected
										? 'var(--mde-bg-tertiary, #eee)'
										: 'transparent',
									color: isSelected
										? 'var(--mde-text-primary, #1a1a1a)'
										: 'var(--mde-text-secondary, #4a4a4a)',
									transition: 'background-color 80ms',
									fontFamily: 'inherit',
									fontSize: 13,
									boxSizing: 'border-box',
								}}
							>
								{/* Icon */}
								<span
									style={{
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										width: 28,
										height: 28,
										borderRadius: 6,
										backgroundColor: 'var(--mde-bg-tertiary, #eee)',
										color: 'var(--mde-text-primary, #1a1a1a)',
										flexShrink: 0,
									}}
								>
									{getBlockIcon(def.type)}
								</span>
								{/* Label + description */}
								<div style={{ flex: 1, minWidth: 0 }}>
									<div
										style={{
											fontWeight: 500,
											fontSize: 13,
											color: 'var(--mde-text-primary, #1a1a1a)',
										}}
									>
										{t(def.labelKey)}
									</div>
									<div
										style={{
											fontSize: 11,
											color: 'var(--mde-text-muted, #999)',
											overflow: 'hidden',
											textOverflow: 'ellipsis',
											whiteSpace: 'nowrap',
										}}
									>
										{t(def.descriptionKey)}
									</div>
								</div>
							</button>
						);
					})}
				</div>
			))}
		</div>
	);
}
