// ============================================================
// Floating Toolbar — appears above text selections.
// Shows formatting buttons (bold, italic, underline, etc.)
// plus color pickers for text color and highlight.
// All colors use CSS variables for theme compatibility.
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
	Bold,
	Italic,
	Underline,
	Strikethrough,
	Code,
	Link,
	Paintbrush,
	Highlighter,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Mark, MarkType } from '../core/types';
import { type CustomSwatchKind } from './custom-colors';
import {
	ColorPicker,
	TEXT_COLOR_PRESETS,
	HIGHLIGHT_COLOR_PRESETS,
	type ColorPreset,
} from '../blocks/ColorPicker';
import { useT } from '../i18n/context';
import type { EditorTranslationKey } from '../i18n/keys';

/**
 * When true, the toolbar is showing the link URL input and should NOT be
 * closed by selection changes. Read by BlockEditor's updateToolbarState.
 */
export let isToolbarLinkInputActive = false;

interface ToolbarProps {
	/** Screen position (centered above selection) */
	position: { x: number; y: number };
	/** Marks active at the current selection */
	activeMarks: MarkType[];
	/** Called when a mark button is clicked (bold/italic/… — true toggles) */
	onToggleMark: (mark: Mark) => void;
	/** Set (or clear, with no `attrs`) a "pick a value" mark like color /
	 *  highlight. Unlike `onToggleMark`, re-picking a different value REPLACES
	 *  it instead of toggling the mark off. */
	onSetMark?: (mark: Mark) => void;
	/** Set (or clear, with "") an inline font on the selection. */
	onSetFont?: (value: string) => void;
	/** Fonts to offer in the toolbar's font picker (curated + custom). */
	fonts?: { label: string; value: string }[];
	/** Called when the toolbar should close */
	onClose: () => void;
	/** Changes (Cmd+K) to open the link field for the current selection. */
	linkRequest?: number;
}

const ICON_SIZE = 15;

const markButtons: {
	mark: MarkType;
	labelKey: EditorTranslationKey;
	shortcutKey: EditorTranslationKey;
	Icon: LucideIcon;
	group: number;
}[] = [
	{
		mark: 'bold',
		labelKey: 'toolbar.bold.label',
		shortcutKey: 'toolbar.bold.shortcut',
		Icon: Bold,
		group: 0,
	},
	{
		mark: 'italic',
		labelKey: 'toolbar.italic.label',
		shortcutKey: 'toolbar.italic.shortcut',
		Icon: Italic,
		group: 0,
	},
	{
		mark: 'underline',
		labelKey: 'toolbar.underline.label',
		shortcutKey: 'toolbar.underline.shortcut',
		Icon: Underline,
		group: 0,
	},
	{
		mark: 'strikethrough',
		labelKey: 'toolbar.strikethrough.label',
		shortcutKey: 'toolbar.strikethrough.shortcut',
		Icon: Strikethrough,
		group: 0,
	},
	{
		mark: 'code',
		labelKey: 'toolbar.code.label',
		shortcutKey: 'toolbar.code.shortcut',
		Icon: Code,
		group: 1,
	},
	{
		mark: 'link',
		labelKey: 'toolbar.link.label',
		shortcutKey: 'toolbar.link.shortcut',
		Icon: Link,
		group: 1,
	},
];

type ColorDropdown = 'textColor' | 'highlight' | null;

export function FloatingToolbar({
	position,
	activeMarks,
	onToggleMark,
	onSetMark,
	onSetFont,
	fonts,
	onClose,
	linkRequest,
}: ToolbarProps) {
	const t = useT();
	const toolbarRef = useRef<HTMLDivElement>(null);
	const [showLinkInput, setShowLinkInput] = useState(false);
	const [linkUrl, setLinkUrl] = useState('');
	const linkInputRef = useRef<HTMLInputElement>(null);
	const [openColorDropdown, setOpenColorDropdown] = useState<ColorDropdown>(null);
	// Last color / highlight the user applied this session. Fed to the shared
	// picker as its `value` so the native OS input reflects the current color
	// (instead of always resetting to #000000) AND the "+" save-to-workspace
	// button saves THAT color rather than black.
	const [textColorValue, setTextColorValue] = useState<string | undefined>(undefined);
	const [highlightColorValue, setHighlightColorValue] = useState<string | undefined>(undefined);

	// Cmd+K: open the link field straight away.
	useEffect(() => {
		if (!linkRequest) return;
		setShowLinkInput(true);
		setLinkUrl('');
		setOpenColorDropdown(null);
	}, [linkRequest]);

	// Close on outside click — but NOT when the link input is showing
	const showLinkInputRef = useRef(false);
	showLinkInputRef.current = showLinkInput;
	useEffect(() => {
		function handleMouseDown(e: MouseEvent) {
			if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
				if (!showLinkInputRef.current) {
					onClose();
				}
			}
		}
		document.addEventListener('mousedown', handleMouseDown);
		return () => document.removeEventListener('mousedown', handleMouseDown);
	}, [onClose]);

	// Save the selection when switching to link input, and focus the input
	const savedSelectionRef = useRef<Range | null>(null);
	useEffect(() => {
		isToolbarLinkInputActive = showLinkInput;
		if (showLinkInput) {
			const sel = window.getSelection();
			if (sel && sel.rangeCount > 0) {
				savedSelectionRef.current = sel.getRangeAt(0).cloneRange();
			}
			setTimeout(() => linkInputRef.current?.focus(), 0);
		}
		return () => {
			isToolbarLinkInputActive = false;
		};
	}, [showLinkInput]);

	const toolbarStyle = useMemo(() => {
		const GAP = 8;
		const flipDown = position.y < 50;
		return {
			position: 'fixed' as const,
			left: position.x,
			top: flipDown ? position.y + 28 + GAP : position.y - GAP,
			transform: flipDown ? 'translateX(-50%)' : 'translateX(-50%) translateY(-100%)',
		};
	}, [position]);

	const handleMarkClick = useCallback(
		(mark: MarkType) => {
			if (mark === 'link') {
				setShowLinkInput(true);
				setLinkUrl('');
				setOpenColorDropdown(null);
				return;
			}
			onToggleMark({ type: mark });
		},
		[onToggleMark],
	);

	const handleLinkSubmit = useCallback(() => {
		// Restore the saved selection before applying the mark
		if (savedSelectionRef.current) {
			const sel = window.getSelection();
			if (sel) {
				sel.removeAllRanges();
				sel.addRange(savedSelectionRef.current);
			}
		}
		if (linkUrl.trim()) {
			let href = linkUrl.trim();
			if (!/^https?:\/\//i.test(href) && !href.startsWith('/')) {
				href = 'https://' + href;
			}
			onToggleMark({ type: 'link', attrs: { href } });
		}
		setShowLinkInput(false);
		setLinkUrl('');
		savedSelectionRef.current = null;
	}, [linkUrl, onToggleMark]);

	const handleLinkKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === 'Enter') {
				e.preventDefault();
				handleLinkSubmit();
			} else if (e.key === 'Escape') {
				e.preventDefault();
				setShowLinkInput(false);
				setLinkUrl('');
			}
		},
		[handleLinkSubmit],
	);

	// Apply the mark but keep the picker open (pick several colors, use the
	// native picker without it unmounting mid-drag). The dropdown closes via the toolbar button toggle or
	// an outside click.
	const handleTextColor = useCallback(
		(color: string) => {
			setTextColorValue(color);
			// "inherit" is the "Default" preset — clear the mark. Any real color goes
			// through the set-mark path so re-picking a DIFFERENT color replaces it
			// rather than toggling the existing color mark off.
			onSetMark?.({
				type: 'color' as MarkType,
				attrs: color === 'inherit' ? undefined : { color },
			});
		},
		[onSetMark],
	);

	const handleHighlightColor = useCallback(
		(color: string) => {
			setHighlightColorValue(color);
			// "transparent" is the "None" preset — clear the mark. See handleTextColor.
			onSetMark?.({
				type: 'highlight' as MarkType,
				attrs: color === 'transparent' ? undefined : { color },
			});
		},
		[onSetMark],
	);

	const toggleColorDropdown = useCallback((dropdown: ColorDropdown) => {
		setOpenColorDropdown(prev => (prev === dropdown ? null : dropdown));
	}, []);

	// Shared button style helper
	const getButtonStyle = (isActive: boolean): React.CSSProperties => ({
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		width: 28,
		height: 28,
		borderRadius: 6,
		border: 'none',
		cursor: 'pointer',
		backgroundColor: isActive ? 'var(--mde-bg-active, #e0e0e0)' : 'transparent',
		color: isActive ? 'var(--mde-text-primary, #1a1a1a)' : 'var(--mde-text-muted, #999)',
		transition: 'background-color 120ms, color 120ms',
	});

	const handleButtonMouseEnter = (e: React.MouseEvent<HTMLButtonElement>, isActive: boolean) => {
		if (!isActive) e.currentTarget.style.backgroundColor = 'var(--mde-bg-hover, #eee)';
		e.currentTarget.style.color = 'var(--mde-text-primary, #1a1a1a)';
	};

	const handleButtonMouseLeave = (e: React.MouseEvent<HTMLButtonElement>, isActive: boolean) => {
		e.currentTarget.style.backgroundColor = isActive
			? 'var(--mde-bg-active, #e0e0e0)'
			: 'transparent';
		e.currentTarget.style.color = isActive
			? 'var(--mde-text-primary, #1a1a1a)'
			: 'var(--mde-text-muted, #999)';
	};

	let lastGroup = -1;

	const renderDivider = () => (
		<div
			style={{
				width: 1,
				height: 16,
				margin: '0 3px',
				backgroundColor: 'var(--mde-border-primary, #e5e5e5)',
			}}
		/>
	);

	// Color / highlight chooser — the shared ColorPicker. Wrapped in the popover chrome
	// (.mde-cp-pop), centered under the trigger button. preserveSelection keeps
	// the live text selection alive across a pick (and drops the focus-stealing
	// hex field; the native OS picker covers arbitrary colors).
	const renderColorPicker = (
		presets: ColorPreset[],
		none: ColorPreset,
		onSelect: (color: string) => void,
		swatchKind: CustomSwatchKind,
		value: string | undefined,
	) => (
		<div
			className="mde-cp-pop"
			style={{ left: '50%', right: 'auto', transform: 'translateX(-50%)' }}
			onMouseDown={e => e.stopPropagation()}
		>
			<ColorPicker
				compact
				preserveSelection
				swatchKind={swatchKind}
				presets={presets}
				none={none}
				value={value}
				onPick={onSelect}
			/>
		</div>
	);

	return (
		<div
			ref={toolbarRef}
			style={{
				...toolbarStyle,
				zIndex: 50,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
			}}
		>
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: 2,
					padding: '4px 6px',
					borderRadius: showLinkInput ? 12 : 9999,
					backgroundColor: 'var(--mde-bg-secondary, #f5f5f5)',
					border: '1px solid var(--mde-border-primary, #e5e5e5)',
					boxShadow: '0 2px 12px var(--mde-shadow, rgba(0,0,0,0.1))',
					userSelect: 'none',
					position: 'relative',
				}}
			>
				{!showLinkInput ? (
					<>
						{/* Standard mark buttons */}
						{markButtons.map(({ mark, labelKey, shortcutKey, Icon, group }) => {
							const isActive = activeMarks.includes(mark);
							const showDivider = lastGroup !== -1 && group !== lastGroup;
							lastGroup = group;
							return (
								<React.Fragment key={mark}>
									{showDivider && renderDivider()}
									<button
										type="button"
										title={`${t(labelKey)} (${t(shortcutKey)})`}
										style={getButtonStyle(isActive)}
										onMouseDown={e => {
											e.preventDefault();
											handleMarkClick(mark);
										}}
										onMouseEnter={e => handleButtonMouseEnter(e, isActive)}
										onMouseLeave={e => handleButtonMouseLeave(e, isActive)}
									>
										<Icon size={ICON_SIZE} strokeWidth={2} />
									</button>
								</React.Fragment>
							);
						})}

						{/* Group 2 divider */}
						{renderDivider()}

						{/* Superscript button */}
						<button
							type="button"
							title={t('toolbar.superscript.label')}
							style={{
								...getButtonStyle(activeMarks.includes('superscript' as MarkType)),
								fontSize: 12,
								fontWeight: 700,
								fontFamily: 'inherit',
								lineHeight: 1,
							}}
							onMouseDown={e => {
								e.preventDefault();
								onToggleMark({ type: 'superscript' as MarkType });
							}}
							onMouseEnter={e =>
								handleButtonMouseEnter(
									e,
									activeMarks.includes('superscript' as MarkType),
								)
							}
							onMouseLeave={e =>
								handleButtonMouseLeave(
									e,
									activeMarks.includes('superscript' as MarkType),
								)
							}
						>
							X<sup style={{ fontSize: 8, lineHeight: 1 }}>2</sup>
						</button>

						{/* Subscript button */}
						<button
							type="button"
							title={t('toolbar.subscript.label')}
							style={{
								...getButtonStyle(activeMarks.includes('subscript' as MarkType)),
								fontSize: 12,
								fontWeight: 700,
								fontFamily: 'inherit',
								lineHeight: 1,
							}}
							onMouseDown={e => {
								e.preventDefault();
								onToggleMark({ type: 'subscript' as MarkType });
							}}
							onMouseEnter={e =>
								handleButtonMouseEnter(
									e,
									activeMarks.includes('subscript' as MarkType),
								)
							}
							onMouseLeave={e =>
								handleButtonMouseLeave(
									e,
									activeMarks.includes('subscript' as MarkType),
								)
							}
						>
							X<sub style={{ fontSize: 8, lineHeight: 1 }}>2</sub>
						</button>

						{/* Text Color button */}
						<button
							type="button"
							title={t('toolbar.textColor.label')}
							style={getButtonStyle(openColorDropdown === 'textColor')}
							onMouseDown={e => {
								e.preventDefault();
								toggleColorDropdown('textColor');
							}}
							onMouseEnter={e =>
								handleButtonMouseEnter(e, openColorDropdown === 'textColor')
							}
							onMouseLeave={e =>
								handleButtonMouseLeave(e, openColorDropdown === 'textColor')
							}
						>
							<Paintbrush size={ICON_SIZE} strokeWidth={2} />
						</button>

						{/* Highlight Color button */}
						<button
							type="button"
							title={t('toolbar.highlight.label')}
							style={getButtonStyle(openColorDropdown === 'highlight')}
							onMouseDown={e => {
								e.preventDefault();
								toggleColorDropdown('highlight');
							}}
							onMouseEnter={e =>
								handleButtonMouseEnter(e, openColorDropdown === 'highlight')
							}
							onMouseLeave={e =>
								handleButtonMouseLeave(e, openColorDropdown === 'highlight')
							}
						>
							<Highlighter size={ICON_SIZE} strokeWidth={2} />
						</button>

						{/* Inline font picker (host-provided fonts). Controlled
                to a sentinel so every pick — including "Default" (clear) — fires
                onChange and the label stays "Font". Applies via the set-mark op
                so re-picking replaces rather than toggles. */}
						{onSetFont && fonts && fonts.length > 1 && (
							<select
								title={t('toolbar.font.label')}
								aria-label={t('toolbar.font.label')}
								value="__font__"
								onMouseDown={e => e.stopPropagation()}
								onChange={e => onSetFont(e.target.value)}
								style={{
									background: 'transparent',
									border: 'none',
									color: 'var(--mde-text-primary, #1a1a1a)',
									fontSize: 13,
									maxWidth: 96,
									cursor: 'pointer',
									outline: 'none',
									padding: '0 2px',
								}}
							>
								<option value="__font__" disabled>
									{t('toolbar.font.label')}
								</option>
								{fonts.map(f => (
									<option key={f.label} value={f.value}>
										{f.label}
									</option>
								))}
							</select>
						)}

						{/* Color dropdown (positioned absolutely below toolbar) */}
						{openColorDropdown === 'textColor' &&
							renderColorPicker(
								TEXT_COLOR_PRESETS,
								{ label: t('toolbar.color.default'), value: 'inherit' },
								handleTextColor,
								'text',
								textColorValue,
							)}
						{openColorDropdown === 'highlight' &&
							renderColorPicker(
								HIGHLIGHT_COLOR_PRESETS,
								{ label: t('toolbar.highlightColor.none'), value: 'transparent' },
								handleHighlightColor,
								'highlight',
								highlightColorValue,
							)}
					</>
				) : (
					// Link URL input
					<div
						style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 4px' }}
					>
						<Link
							size={14}
							style={{ color: 'var(--mde-text-muted, #999)', flexShrink: 0 }}
						/>
						<input
							ref={linkInputRef}
							type="url"
							value={linkUrl}
							onChange={e => setLinkUrl(e.target.value)}
							onKeyDown={handleLinkKeyDown}
							placeholder={t('toolbar.link.placeholder')}
							style={{
								border: 'none',
								outline: 'none',
								background: 'transparent',
								color: 'var(--mde-text-primary, #1a1a1a)',
								fontSize: 13,
								width: 200,
								padding: '4px 0',
								fontFamily: 'inherit',
							}}
						/>
						<button
							type="button"
							onMouseDown={e => {
								e.preventDefault();
								handleLinkSubmit();
							}}
							style={{
								border: 'none',
								background: linkUrl.trim()
									? 'var(--mde-accent, #2563eb)'
									: 'var(--mde-bg-tertiary, #eee)',
								color: linkUrl.trim() ? '#fff' : 'var(--mde-text-muted, #999)',
								borderRadius: 4,
								padding: '3px 8px',
								fontSize: 11,
								fontWeight: 600,
								cursor: linkUrl.trim() ? 'pointer' : 'default',
								transition: 'background-color 120ms',
							}}
						>
							{t('toolbar.link.apply')}
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
