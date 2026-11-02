// ============================================================
// TextContent — renders an array of TextSpans as inline HTML
// with marks (bold, italic, code, link, etc.)
// This is the core rendering primitive used by all text blocks.
// ============================================================

import React, { useEffect, useRef } from 'react';
import type { Mark, MentionKind, TextSpan } from '../core/types';
import { type MentionResolver, useMentionResolver } from './MentionResolverContext';
import { handleSecuredLinkClick } from '../../../util/openSecuredFile';

interface TextContentProps {
	content: TextSpan[];
}

export function TextContent({ content }: TextContentProps) {
	if (content.length === 0) {
		// Render a zero-width space so the block is focusable
		return <>{'\u200B'}</>;
	}

	// Check if the last span ends with "\n" — browsers collapse trailing newlines
	// in contentEditable, so we append a newline to make it visible
	const lastSpan = content[content.length - 1];
	const needsTrailingNewline = lastSpan && lastSpan.text.endsWith('\n');
	// Chips are contentEditable=false. When one is the last child of a paragraph,
	// browsers refuse to land the caret reliably "after" it — clicking past the
	// chip or model-side bump-out via closestNonEditable lands the caret in
	// element-offset territory, and native text input then gets routed *into*
	// the chip's interior (e.g. the X-button) instead of inserting a sibling
	// after it. Mirroring the ZWSP-pad affordance that ListBlock/TableBlock/
	// MentionInput already use: render an empty text-node sibling so the caret
	// has somewhere real to anchor and `beforeinput` fires on the parent block.
	// selection.ts treats this purely as render output (model length doesn't
	// change), and getTextOffset's fallback clamps the extra char away.
	const lastIsMention = !!lastSpan?.marks?.some(m => m.type === 'mention');
	const needsTrailingChipPad = lastIsMention && !needsTrailingNewline;

	return (
		<>
			{content.map((span, i) => (
				<SpanRenderer key={i} span={span} />
			))}
			{needsTrailingNewline && '\n'}
			{needsTrailingChipPad && '​'}
		</>
	);
}

function SpanRenderer({ span }: { span: TextSpan }) {
	const marks = span.marks ?? [];
	const resolver = useMentionResolver();

	if (marks.length === 0) {
		return <>{span.text}</>;
	}

	// Mention is atomic — if present, it wraps everything else and short-circuits.
	// Other marks (bold/italic/etc.) on a mention span are ignored at render time;
	// the chip body is fully owned by the resolver (or the snapshot label).
	const mentionMark = marks.find(m => m.type === 'mention');
	if (mentionMark) {
		return <MentionPill mark={mentionMark} snapshot={span.text} resolver={resolver} />;
	}

	let element: React.ReactNode = span.text;

	// Apply marks inside-out
	for (const mark of marks) {
		switch (mark.type) {
			case 'bold':
				element = <strong>{element}</strong>;
				break;
			case 'italic':
				element = <em>{element}</em>;
				break;
			case 'underline':
				element = <u>{element}</u>;
				break;
			case 'strikethrough':
				element = <s>{element}</s>;
				break;
			case 'code':
				element = (
					<code
						style={{
							borderRadius: 4,
							padding: '2px 6px',
							fontFamily: "'SF Mono', 'Fira Code', Menlo, monospace",
							fontSize: '0.875em',
							backgroundColor: 'var(--mde-bg-tertiary, #eee)',
							color: 'var(--mde-accent, #2563eb)',
						}}
					>
						{element}
					</code>
				);
				break;
			case 'link':
				element = (
					<a
						href={mark.attrs?.href}
						style={{ color: 'var(--mde-accent, #2563eb)', textDecoration: 'underline' }}
						target="_blank"
						rel="noopener noreferrer"
						// An attached file (secured) needs the sign in token: fetch it, then open or save it.
						onClick={e => handleSecuredLinkClick(e, mark.attrs?.href, span.text)}
					>
						{element}
					</a>
				);
				break;
			case 'superscript':
				element = <sup>{element}</sup>;
				break;
			case 'subscript':
				element = <sub>{element}</sub>;
				break;
			case 'color':
				element = <span style={{ color: mark.attrs?.color ?? 'inherit' }}>{element}</span>;
				break;
			case 'highlight':
				element = (
					<span
						style={{
							backgroundColor: mark.attrs?.color ?? 'transparent',
							borderRadius: 2,
							padding: '1px 0',
						}}
					>
						{element}
					</span>
				);
				break;
			case 'fontFamily':
				element = (
					<span style={{ fontFamily: mark.attrs?.fontFamily ?? 'inherit' }}>
						{element}
					</span>
				);
				break;
			case 'mention':
				// Handled above as an atomic wrapper; ignored here.
				break;
		}
	}

	return <>{element}</>;
}

interface MentionPillProps {
	readonly mark: Mark;
	readonly snapshot: string;
	readonly resolver: MentionResolver | null;
}

function MentionPill({ mark, snapshot, resolver }: MentionPillProps) {
	const kind: MentionKind = mark.attrs?.kind ?? 'page';
	const id = mark.attrs?.id ?? '';
	// `snapshot` is the chip's TextSpan.text — the authoritative label for the
	// model. The legacy mark.attrs.label snapshot is ignored: kept on read for
	// backward compatibility, never used to override the live text. The sync
	// effect below keeps `snapshot` in lockstep with the resolver's output, so
	// date chips re-label across days and page chips track renames.
	const resolved = resolver ? resolver(kind, id) : undefined;
	const deleted = resolved === null;
	const label = resolved?.label ?? snapshot;
	const body = resolved?.body ?? <>{label}</>;

	const chipRef = useRef<HTMLSpanElement>(null);
	useEffect(() => {
		// Skip when the resolver hasn't returned yet (pending) or the target was
		// deleted — preserve the snapshot so the strikethrough copy stays usable.
		if (!resolved?.label) return;
		if (resolved.label === snapshot) return;
		const chipEl = chipRef.current;
		if (!chipEl) return;
		globalThis.dispatchEvent(
			new CustomEvent('mde-mention-sync', {
				detail: { element: chipEl, label: resolved.label },
			}),
		);
	}, [resolved?.label, snapshot]);

	// Hover preview is a host concern (needs router, summary fetches). The
	// chip just dispatches `mde-mention-hover` / `-end` window events with
	// a 1s delay; the host renders the card. Delay state lives per-chip so
	// hovering quickly across many
	// chips never fires the card; cleared on leave.
	const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
	const hoverActiveRef = useRef(false);
	const onMouseEnter = () => {
		if (deleted) return; // no preview for deleted targets — snapshot is all we have
		if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
		hoverTimerRef.current = setTimeout(() => {
			hoverTimerRef.current = undefined;
			hoverActiveRef.current = true;
			const chipEl = chipRef.current;
			if (!chipEl) return;
			globalThis.dispatchEvent(
				new CustomEvent('mde-mention-hover', {
					detail: { element: chipEl, kind, id, label, snapshot },
				}),
			);
		}, 1000);
	};
	const onMouseLeave = () => {
		if (hoverTimerRef.current) {
			clearTimeout(hoverTimerRef.current);
			hoverTimerRef.current = undefined;
		}
		if (hoverActiveRef.current) {
			hoverActiveRef.current = false;
			globalThis.dispatchEvent(new CustomEvent('mde-mention-hover-end'));
		}
	};

	return (
		<span
			ref={chipRef}
			className={`mde-mention mde-mention-${kind}${deleted ? ' mde-mention-deleted' : ''}`}
			contentEditable={false}
			data-mention="true"
			data-mention-kind={kind}
			data-mention-id={id}
			data-mention-label={snapshot}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
		>
			{body}
			{deleted && <span className="mde-mention-deleted-suffix"> (deleted)</span>}
			<RemoveMentionButton />
		</span>
	);
}

/**
 * Small X button rendered inside every chip. Hidden via CSS in read-only
 * contexts (no [contenteditable] ancestor). Dispatches a window event the
 * owning surface (BlockEditor, ListBlock, TableBlock, MentionInput) listens
 * for to splice the chip out of its model. Using a window event keeps the
 * chip renderer surface-agnostic — TextContent doesn't need to know whether
 * it lives inside a list, table, or paragraph.
 */
function RemoveMentionButton() {
	return (
		<button
			type="button"
			className="mde-mention-remove"
			contentEditable={false}
			aria-label="Remove mention"
			tabIndex={-1}
			onMouseDown={e => e.preventDefault()}
			onClick={e => {
				e.preventDefault();
				e.stopPropagation();
				const chip = (e.currentTarget as HTMLElement).closest("[data-mention='true']");
				if (!chip) return;
				globalThis.dispatchEvent(
					new CustomEvent('mde-mention-remove', { detail: { element: chip } }),
				);
			}}
		>
			×
		</button>
	);
}
