// ============================================================
// Find & Replace — floating bar with overlay-based highlighting.
// Triggered via Cmd+F (find) or Cmd+H (find & replace).
// Uses absolutely positioned overlay divs for highlighting so
// the contentEditable DOM is never modified (preventing model
// corruption). The find input keeps focus while typing.
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Search, Replace, ChevronUp, ChevronDown, X, GripHorizontal } from 'lucide-react';
import type { EditorDocument } from '../core/types';
import { getPlainText } from '../core/types';
import { getBlocksInOrder } from '../core/document';
import { useT } from '../i18n/context';

export interface FindReplaceProps {
	doc: EditorDocument;
	showReplace: boolean;
	onHighlight: (matches: FindMatch[]) => void;
	onNavigate: (match: FindMatch) => void;
	onReplace: (match: FindMatch, replacement: string) => void;
	onReplaceAll: (matches: FindMatch[], replacement: string) => void;
	onClose: () => void;
}

export interface FindMatch {
	blockId: string;
	blockIndex: number;
	offset: number;
	length: number;
	text: string;
}

/** Find all occurrences of a query in the document (recurses into nested
 *  containers like columns / column / toggle). `blockIndex` is the position
 *  in document order — not a flat top-level index. */
export function findInDocument(
	doc: EditorDocument,
	query: string,
	caseSensitive = false,
): FindMatch[] {
	if (!query) return [];
	const matches: FindMatch[] = [];
	const q = caseSensitive ? query : query.toLowerCase();
	const ordered = getBlocksInOrder(doc);

	for (let i = 0; i < ordered.length; i++) {
		const block = ordered[i]!;
		if (block.content.length === 0) continue;
		const text = getPlainText(block.content);
		const searchText = caseSensitive ? text : text.toLowerCase();
		let pos = 0;
		while (pos < searchText.length) {
			const idx = searchText.indexOf(q, pos);
			if (idx === -1) break;
			matches.push({
				blockId: block.id,
				blockIndex: i,
				offset: idx,
				length: q.length,
				text: text.slice(idx, idx + q.length),
			});
			pos = idx + 1;
		}
	}

	return matches;
}

// ---- Overlay-based highlight system ----
// Instead of modifying the contentEditable DOM (which corrupts the model),
// we create absolutely positioned overlay divs that sit on top of the text.

const OVERLAY_CONTAINER_ID = 'mde-find-overlay-container';

function ensureOverlayStyles() {
	if (document.getElementById('mde-find-overlay-styles')) return;
	const style = document.createElement('style');
	style.id = 'mde-find-overlay-styles';
	style.textContent = `
    .mde-find-highlight-overlay {
      position: absolute;
      background-color: rgba(255, 213, 0, 0.35);
      border-radius: 2px;
      pointer-events: none;
      z-index: 1;
      transition: background-color 100ms;
    }
    .mde-find-highlight-overlay.active {
      background-color: rgba(255, 150, 0, 0.5);
      outline: 2px solid rgba(255, 150, 0, 0.6);
      outline-offset: 0px;
    }
  `;
	document.head.appendChild(style);
}

/** Remove all overlay highlights */
function clearOverlays() {
	const container = document.getElementById(OVERLAY_CONTAINER_ID);
	if (container) container.innerHTML = '';
}

/**
 * Create a Range for a match within a block's [data-content] element.
 * Walks text nodes to find the correct position.
 */
function createRangeForMatch(blockEl: Element, offset: number, length: number): Range | null {
	const contentEl = blockEl.querySelector('[data-content]');
	if (!contentEl) return null;

	const walker = document.createTreeWalker(contentEl, NodeFilter.SHOW_TEXT);
	let currentOffset = 0;
	let startNode: Text | null = null;
	let startLocal = 0;
	let endNode: Text | null = null;
	let endLocal = 0;
	let tn: Text | null;

	while ((tn = walker.nextNode() as Text | null)) {
		const len = tn.textContent?.length ?? 0;
		const nodeEnd = currentOffset + len;

		if (!startNode && offset < nodeEnd) {
			startNode = tn;
			startLocal = offset - currentOffset;
		}
		if (startNode && offset + length <= nodeEnd) {
			endNode = tn;
			endLocal = offset + length - currentOffset;
			break;
		}
		currentOffset = nodeEnd;
	}

	if (!startNode || !endNode) return null;

	const range = document.createRange();
	range.setStart(startNode, startLocal);
	range.setEnd(endNode, endLocal);
	return range;
}

/**
 * Apply overlay highlights for all matches.
 * Uses Range.getClientRects() to position overlay divs without modifying the DOM.
 */
function applyOverlays(matches: FindMatch[], activeIndex: number, editorEl: HTMLElement | null) {
	clearOverlays();
	ensureOverlayStyles();

	if (!editorEl || matches.length === 0) return;

	// Create or find the overlay container
	let container = document.getElementById(OVERLAY_CONTAINER_ID);
	if (!container) {
		container = document.createElement('div');
		container.id = OVERLAY_CONTAINER_ID;
		container.style.cssText =
			'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1;overflow:hidden;';
		// Insert into the mde-editor-container (parent of mde-editor)
		const editorContainer = editorEl.closest('.mde-editor-container');
		if (editorContainer) {
			(editorContainer as HTMLElement).style.position = 'relative';
			editorContainer.appendChild(container);
		}
	}

	const containerRect = container.getBoundingClientRect();
	let activeOverlay: HTMLElement | null = null;

	for (let i = 0; i < matches.length; i++) {
		const match = matches[i];
		const blockEl = editorEl.querySelector(`[data-block-id="${match.blockId}"]`);
		if (!blockEl) continue;

		const range = createRangeForMatch(blockEl, match.offset, match.length);
		if (!range) continue;

		// A single match can span multiple lines, so we use getClientRects()
		const rects = range.getClientRects();
		const isActive = i === activeIndex;

		for (const rect of rects) {
			const overlay = document.createElement('div');
			overlay.className = `mde-find-highlight-overlay${isActive ? ' active' : ''}`;
			overlay.style.top = `${rect.top - containerRect.top}px`;
			overlay.style.left = `${rect.left - containerRect.left}px`;
			overlay.style.width = `${rect.width}px`;
			overlay.style.height = `${rect.height}px`;
			container.appendChild(overlay);

			if (isActive && !activeOverlay) activeOverlay = overlay;
		}
	}

	// Scroll active match into view
	if (activeOverlay) {
		activeOverlay.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
	}
}

// ---- Component ----

export function FindReplaceBar({
	doc,
	showReplace: initialShowReplace,
	onHighlight,
	onNavigate,
	onReplace,
	onReplaceAll,
	onClose,
}: FindReplaceProps) {
	const t = useT();
	const [query, setQuery] = useState('');
	const [replacement, setReplacement] = useState('');
	const [showReplace, setShowReplace] = useState(initialShowReplace);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [matches, setMatches] = useState<FindMatch[]>([]);
	const inputRef = useRef<HTMLInputElement>(null);
	const panelRef = useRef<HTMLDivElement>(null);

	// Drag-to-move state
	const [panelPos, setPanelPos] = useState<{ x: number; y: number } | null>(null);

	// Focus on mount
	useEffect(() => {
		inputRef.current?.focus();
	}, []);

	// Drag handle — use native listener so it fires before the panel's stopPropagation
	const dragHandleRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const handle = dragHandleRef.current;
		const panel = panelRef.current;
		if (!handle || !panel) return;

		const onMouseDown = (e: MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();
			const rect = panel.getBoundingClientRect();
			const startX = e.clientX;
			const startY = e.clientY;
			// For fixed positioning, use viewport coordinates directly
			const origX = rect.left;
			const origY = rect.top;

			const onMouseMove = (ev: MouseEvent) => {
				setPanelPos({
					x: origX + (ev.clientX - startX),
					y: origY + (ev.clientY - startY),
				});
			};
			const onMouseUp = () => {
				document.removeEventListener('mousemove', onMouseMove);
				document.removeEventListener('mouseup', onMouseUp);
			};
			document.addEventListener('mousemove', onMouseMove);
			document.addEventListener('mouseup', onMouseUp);
		};

		handle.addEventListener('mousedown', onMouseDown);
		return () => handle.removeEventListener('mousedown', onMouseDown);
	}, []);

	// Prevent mousedown in panel from propagating to editor (steals focus)
	useEffect(() => {
		const el = panelRef.current;
		if (!el) return;
		const stop = (e: Event) => e.stopPropagation();
		el.addEventListener('mousedown', stop);
		return () => el.removeEventListener('mousedown', stop);
	}, []);

	// Clean up overlays on unmount
	useEffect(() => {
		return () => {
			clearOverlays();
			const container = document.getElementById(OVERLAY_CONTAINER_ID);
			container?.remove();
		};
	}, []);

	// Search when query or doc changes
	useEffect(() => {
		const found = findInDocument(doc, query);
		setMatches(found);
		setCurrentIndex(0);
		onHighlight(found);
	}, [query, doc, onHighlight]);

	// Apply overlay highlights when matches or active index changes
	useEffect(() => {
		// Find the editor element
		const editor = panelRef.current
			?.closest('.mde-editor-container')
			?.querySelector('.mde-editor') as HTMLElement | null;
		applyOverlays(matches, currentIndex, editor);
	}, [matches, currentIndex]);

	// Re-position overlays on scroll or resize
	useEffect(() => {
		if (matches.length === 0) return;
		const editor = panelRef.current
			?.closest('.mde-editor-container')
			?.querySelector('.mde-editor') as HTMLElement | null;
		const reposition = () => applyOverlays(matches, currentIndex, editor);

		const editorContainer = panelRef.current?.closest('.mde-editor-container');
		editorContainer?.addEventListener('scroll', reposition, true);
		window.addEventListener('resize', reposition);
		return () => {
			editorContainer?.removeEventListener('scroll', reposition, true);
			window.removeEventListener('resize', reposition);
		};
	}, [matches, currentIndex]);

	// Notify parent of current match
	useEffect(() => {
		if (matches.length > 0 && matches[currentIndex]) {
			onNavigate(matches[currentIndex]);
		}
	}, [currentIndex, matches, onNavigate]);

	const goNext = useCallback(() => {
		if (matches.length === 0) return;
		setCurrentIndex(i => (i + 1) % matches.length);
	}, [matches.length]);

	const goPrev = useCallback(() => {
		if (matches.length === 0) return;
		setCurrentIndex(i => (i - 1 + matches.length) % matches.length);
	}, [matches.length]);

	const handleReplace = useCallback(() => {
		if (matches.length === 0 || !matches[currentIndex]) return;
		clearOverlays();
		onReplace(matches[currentIndex], replacement);
	}, [matches, currentIndex, replacement, onReplace]);

	const handleReplaceAll = useCallback(() => {
		if (matches.length === 0) return;
		clearOverlays();
		onReplaceAll(matches, replacement);
	}, [matches, replacement, onReplaceAll]);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === 'Escape') {
				e.preventDefault();
				onClose();
			} else if (e.key === 'Enter' && !e.shiftKey) {
				e.preventDefault();
				goNext();
			} else if (e.key === 'Enter' && e.shiftKey) {
				e.preventDefault();
				goPrev();
			}
		},
		[onClose, goNext, goPrev],
	);

	const btnStyle = (enabled: boolean): React.CSSProperties => ({
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		width: 28,
		height: 28,
		borderRadius: 6,
		border: 'none',
		cursor: enabled ? 'pointer' : 'default',
		backgroundColor: 'transparent',
		color: enabled ? 'var(--mde-text-secondary, #4a4a4a)' : 'var(--mde-text-muted, #ccc)',
		transition: 'background-color 80ms',
	});

	const inputStyle: React.CSSProperties = {
		border: '1px solid var(--mde-border-primary, #e0e0e0)',
		borderRadius: 6,
		outline: 'none',
		background: 'var(--mde-bg-primary, white)',
		color: 'var(--mde-text-primary, #1a1a1a)',
		fontSize: 13,
		padding: '5px 8px',
		fontFamily: 'inherit',
		flex: 1,
		minWidth: 0,
	};

	return (
		<div
			ref={panelRef}
			style={{
				position: 'fixed',
				...(panelPos
					? { top: panelPos.y, left: panelPos.x, right: 'auto' }
					: { top: 60, right: 16 }),
				zIndex: 9999,
				display: 'flex',
				flexDirection: 'column',
				gap: 6,
				padding: '10px 12px',
				borderRadius: 10,
				backgroundColor: 'var(--mde-bg-secondary, #f8f8f8)',
				border: '1px solid var(--mde-border-primary, #e0e0e0)',
				boxShadow: '0 4px 16px var(--mde-shadow, rgba(0,0,0,0.12))',
				fontSize: 13,
			}}
		>
			{/* Find row */}
			<div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
				{/* Drag handle */}
				<div
					ref={dragHandleRef}
					style={{
						cursor: 'grab',
						color: 'var(--mde-text-muted, #bbb)',
						display: 'flex',
						alignItems: 'center',
						flexShrink: 0,
						padding: '0 2px',
						borderRadius: 4,
					}}
					title={t('findReplace.drag')}
				>
					<GripHorizontal size={14} />
				</div>
				<Search size={14} style={{ color: 'var(--mde-text-muted, #999)', flexShrink: 0 }} />
				<input
					ref={inputRef}
					type="text"
					value={query}
					onChange={e => setQuery(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder={t('findReplace.findPlaceholder')}
					style={{ ...inputStyle, width: 180 }}
				/>
				<span
					style={{
						fontSize: 11,
						color: 'var(--mde-text-muted, #999)',
						flexShrink: 0,
						minWidth: 40,
						textAlign: 'center',
						fontVariantNumeric: 'tabular-nums',
					}}
				>
					{matches.length > 0 ? `${currentIndex + 1}/${matches.length}` : '0/0'}
				</span>
				<button
					type="button"
					onClick={goPrev}
					style={btnStyle(matches.length > 0)}
					title={t('findReplace.previous')}
				>
					<ChevronUp size={14} />
				</button>
				<button
					type="button"
					onClick={goNext}
					style={btnStyle(matches.length > 0)}
					title={t('findReplace.next')}
				>
					<ChevronDown size={14} />
				</button>
				<button
					type="button"
					onClick={() => setShowReplace(!showReplace)}
					style={{
						...btnStyle(true),
						backgroundColor: showReplace
							? 'var(--mde-bg-active, #e0e0e0)'
							: 'transparent',
					}}
					title={t('findReplace.toggleReplace')}
				>
					<Replace size={14} />
				</button>
				<button
					type="button"
					onClick={onClose}
					style={btnStyle(true)}
					title={t('findReplace.close')}
				>
					<X size={14} />
				</button>
			</div>

			{/* Replace row */}
			{showReplace && (
				<div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 20 }}>
					<input
						type="text"
						value={replacement}
						onChange={e => setReplacement(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder={t('findReplace.replacePlaceholder')}
						style={{ ...inputStyle, width: 180 }}
					/>
					<button
						type="button"
						onClick={handleReplace}
						style={{
							border: '1px solid var(--mde-border-primary, #e0e0e0)',
							borderRadius: 6,
							padding: '4px 10px',
							fontSize: 12,
							fontWeight: 500,
							cursor: matches.length > 0 ? 'pointer' : 'default',
							backgroundColor:
								matches.length > 0 ? 'var(--mde-bg-primary, white)' : 'transparent',
							color:
								matches.length > 0
									? 'var(--mde-text-primary, #1a1a1a)'
									: 'var(--mde-text-muted, #ccc)',
						}}
						title={t('findReplace.replace')}
					>
						{t('findReplace.replaceButton')}
					</button>
					<button
						type="button"
						onClick={handleReplaceAll}
						style={{
							border: '1px solid var(--mde-border-primary, #e0e0e0)',
							borderRadius: 6,
							padding: '4px 10px',
							fontSize: 12,
							fontWeight: 500,
							cursor: matches.length > 0 ? 'pointer' : 'default',
							backgroundColor:
								matches.length > 0 ? 'var(--mde-bg-primary, white)' : 'transparent',
							color:
								matches.length > 0
									? 'var(--mde-text-primary, #1a1a1a)'
									: 'var(--mde-text-muted, #ccc)',
						}}
						title={t('findReplace.replaceAll')}
					>
						{t('findReplace.allButton')}
					</button>
				</div>
			)}
		</div>
	);
}
