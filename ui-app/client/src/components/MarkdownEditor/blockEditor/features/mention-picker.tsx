// ============================================================
// MentionPicker — opens when the user types "@" in any editor block.
// Merges results from MentionProviders, groups by item kind (or
// item.section override), and inserts a mention mark on selection. UX
// mirrors slash-command and emoji-picker (capture-phase keyboard, flip-up
// positioning, click-out close).
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { MentionItem, MentionProvider } from './mention-types';
import { InlineCalendar } from './inline-calendar';
import { caretPopoverPlacement, useFixedContainingBlock } from './fixed-position';
import { consumeEscape } from './escape-guard';

interface MentionPickerProps {
	readonly position: { x: number; y: number };
	readonly filter: string;
	readonly providers: readonly MentionProvider[];
	readonly workspaceId?: string;
	readonly blockId?: string;
	readonly onSelect: (item: MentionItem) => void;
	readonly onClose: () => void;
	/** Optional kind allowlist — when non-empty, only providers whose `kind`
	 *  matches contribute results. Used by the page-link slash entry to open
	 *  the picker pre-filtered to pages. */
	readonly kinds?: readonly string[];
}

interface Group {
	/** Section heading shown in the picker (e.g. "Pages"). */
	label: string;
	items: MentionItem[];
}

interface FlatRow {
	group: Group;
	item: MentionItem;
	groupIndex: number;
	rowIndex: number;
}

/**
 * Default heading for each item kind when the item doesn't set `section`.
 * Keeps the unified suggestProvider (which emits items across multiple
 * kinds) splitting cleanly into per-kind sections.
 */
const KIND_LABELS: Record<string, string> = {
	page: 'Pages',
	contact: 'Contacts',
	person: 'People',
	user: 'Members',
	date: 'Dates',
	record: 'Records',
};

/**
 * Section render order. Anything not listed (custom `section`) lands at the
 * end in arrival order — that keeps freeform's "Quick actions" sitting
 * after real results without needing it explicitly named here.
 */
const SECTION_ORDER = ['Pages', 'Contacts', 'People', 'Members', 'Dates', 'Records'];

function sectionFor(item: MentionItem): string {
	return item.section ?? KIND_LABELS[item.kind] ?? 'Other';
}

/**
 * Bucket a flat item list into per-section groups. Sections listed in
 * SECTION_ORDER render first in that order; any unknown section (e.g.
 * freeform's "Quick actions") falls in after them in first-seen order.
 */
function groupBySection(items: readonly MentionItem[]): Group[] {
	const buckets = new Map<string, MentionItem[]>();
	for (const item of items) {
		const key = sectionFor(item);
		const existing = buckets.get(key);
		if (existing) existing.push(item);
		else buckets.set(key, [item]);
	}
	const ordered: Group[] = [];
	for (const name of SECTION_ORDER) {
		const list = buckets.get(name);
		if (list && list.length > 0) {
			ordered.push({ label: name, items: list });
			buckets.delete(name);
		}
	}
	for (const [name, list] of buckets) {
		if (list.length > 0) ordered.push({ label: name, items: list });
	}
	return ordered;
}

export function MentionPicker({
	position,
	filter,
	providers,
	workspaceId,
	blockId,
	onSelect,
	onClose,
	kinds,
}: MentionPickerProps) {
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [groups, setGroups] = useState<Group[]>([]);
	const [loading, setLoading] = useState(false);
	const [datePrompt, setDatePrompt] = useState<{ base: MentionItem } | null>(null);
	// Tracks the "Add as page/contact" sub-flow. While `status === "creating"`
	// the picker renders an inline progress row; on "error" it shows a retry
	// affordance. `null` = no creation in flight.
	const [pendingCreate, setPendingCreate] = useState<{
		base: MentionItem;
		kind: 'create_page' | 'create_contact';
		status: 'creating' | 'error';
	} | null>(null);
	const menuRef = useRef<HTMLDivElement>(null);

	/** Decide whether to insert the item directly or open a sub-prompt first. */
	const commit = useCallback(
		(item: MentionItem) => {
			if (item.prompt === 'date') {
				setDatePrompt({ base: item });
				return;
			}
			if (item.prompt === 'create_page' || item.prompt === 'create_contact') {
				startCreation(item, item.prompt);
				return;
			}
			onSelect(item);
		},
		// startCreation is defined below — referenced after; React handles the
		// forward-ref via useCallback identity. Adding it here would require a
		// re-order; instead keep deps slim and rely on closures (startCreation
		// itself depends only on onSelect which is stable from props).
		// eslint-disable-next-line @eslint-react/exhaustive-deps
		[onSelect],
	);

	/**
	 * Run the "Add as page" / "Add as contact" sub-flow. Dispatches a
	 * `mde-mention-create` window event so the host can fire the real
	 * mutation, then waits for
	 * `mde-mention-create-result` keyed by reqId. On success the picker
	 * commits the item with the freshly minted resource id; on failure it
	 * flips to an error state and lets the user retry.
	 */
	const startCreation = useCallback(
		(base: MentionItem, kind: 'create_page' | 'create_contact') => {
			setPendingCreate({ base, kind, status: 'creating' });
			const reqId =
				typeof crypto !== 'undefined' && 'randomUUID' in crypto
					? crypto.randomUUID()
					: `${Date.now()}-${Math.random().toString(36).slice(2)}`;
			const onResult = (e: Event) => {
				const detail = (e as CustomEvent).detail as
					{ reqId: string; result: { id?: string; error?: string } } | undefined;
				if (!detail || detail.reqId !== reqId) return;
				globalThis.removeEventListener('mde-mention-create-result', onResult);
				if (detail.result.id) {
					setPendingCreate(null);
					// Strip the prompt + description so the inserted chip has the
					// shape of a regular resource mention. The base item already
					// carries the right `kind` ("page" / "contact") from the
					// freeform provider — only id needs swapping.
					onSelect({
						...base,
						id: detail.result.id,
						description: undefined,
						prompt: undefined,
					});
				} else {
					setPendingCreate(p => (p ? { ...p, status: 'error' } : null));
				}
			};
			globalThis.addEventListener('mde-mention-create-result', onResult);
			globalThis.dispatchEvent(
				new CustomEvent('mde-mention-create', {
					detail: { reqId, kind, label: base.label, workspaceId },
				}),
			);
		},
		[onSelect, workspaceId],
	);

	/** Resolve a date prompt selection. The chosen ISO becomes the mention id;
	 *  the label is humanised so the inserted chip reads as "Mar 5, 2026"
	 *  rather than the raw "2026-03-05". */
	const completeDatePrompt = useCallback(
		(iso: string) => {
			if (!datePrompt) return;
			const dt = new Date(iso + 'T00:00:00');
			const label = Number.isNaN(dt.getTime())
				? iso
				: dt.toLocaleDateString(undefined, {
						month: 'short',
						day: 'numeric',
						year: 'numeric',
					});
			onSelect({
				...datePrompt.base,
				id: iso,
				label,
				description: undefined,
				prompt: undefined,
			});
			setDatePrompt(null);
		},
		[datePrompt, onSelect],
	);

	// While a sub-prompt is open the picker must NOT be unmounted by any
	// upstream close path (cell blur, click-out, selectionchange-driven cleanup,
	// etc.). The native date input's calendar popup lives outside the picker
	// DOM and can produce mousedowns and focus moves that ripple back into our
	// close logic. Broadcasting a pin/unpin signal lets the owning surface
	// (BlockEditor's bridge state) swallow those close requests until the
	// sub-prompt resolves.
	useEffect(() => {
		if (!datePrompt && !pendingCreate) return;
		globalThis.dispatchEvent(new CustomEvent('mde-mention-pin'));
		return () => {
			globalThis.dispatchEvent(new CustomEvent('mde-mention-unpin'));
		};
	}, [datePrompt, pendingCreate]);

	// Run providers whenever the filter changes. Each filter change aborts the
	// previous in-flight searches so stale results can't overwrite fresh ones.
	// The optional `kinds` allowlist narrows providers (page-link entry) and
	// ALSO filters results post-fetch so a provider that returns mixed kinds
	// (e.g. the unified suggest provider) is still trimmed to the allowlist.
	useEffect(() => {
		const controller = new AbortController();
		const kindSet = kinds && kinds.length > 0 ? new Set(kinds) : null;
		const kindGated = kindSet ? providers.filter(p => kindSet.has(p.kind)) : providers;
		const active = kindGated.filter(p => !p.match || p.match(filter));
		if (active.length === 0) {
			setGroups([]);
			setLoading(false);
			return () => controller.abort();
		}
		setLoading(true);
		const ctx = { workspaceId, blockId, signal: controller.signal };
		let cancelled = false;
		Promise.all(
			active.map(async provider => {
				try {
					return await provider.search(filter, ctx);
				} catch {
					return [] as MentionItem[];
				}
			}),
		).then(results => {
			if (cancelled) return;
			let items = results.flat();
			if (kindSet) items = items.filter(it => kindSet.has(it.kind));
			setGroups(groupBySection(items));
			setLoading(false);
		});
		return () => {
			cancelled = true;
			controller.abort();
		};
	}, [filter, providers, workspaceId, blockId, kinds]);

	// Flatten for keyboard navigation
	const flat = useMemo<FlatRow[]>(() => {
		const rows: FlatRow[] = [];
		groups.forEach((group, groupIndex) => {
			group.items.forEach((item, rowIndex) => {
				rows.push({ group, item, groupIndex, rowIndex });
			});
		});
		return rows;
	}, [groups]);

	useEffect(() => {
		setSelectedIndex(0);
	}, [filter]);

	// Clamp selection when results shrink
	useEffect(() => {
		if (selectedIndex >= flat.length && flat.length > 0) {
			setSelectedIndex(flat.length - 1);
		}
	}, [flat.length, selectedIndex]);

	// Keyboard navigation (capture phase, same pattern as the other pickers)
	useEffect(() => {
		function handleKeyDown(e: KeyboardEvent) {
			switch (e.key) {
				case 'ArrowDown':
					e.preventDefault();
					e.stopImmediatePropagation();
					setSelectedIndex(i => Math.min(i + 1, flat.length - 1));
					break;
				case 'ArrowUp':
					e.preventDefault();
					e.stopImmediatePropagation();
					setSelectedIndex(i => Math.max(i - 1, 0));
					break;
				case 'Enter':
				case 'Tab': {
					if (datePrompt) return; // date input handles its own Enter
					if (pendingCreate) {
						// Mutation is in flight (or has errored). Swallow Enter so it
						// can't split the block beneath the picker — the user picks
						// Retry/Back from the buttons, not keyboard.
						e.preventDefault();
						e.stopImmediatePropagation();
						return;
					}
					if (flat.length === 0) return;
					e.preventDefault();
					e.stopImmediatePropagation();
					const row = flat[selectedIndex];
					if (row) commit(row.item);
					break;
				}
				case 'Escape':
					e.stopImmediatePropagation();
					consumeEscape(e); // only the picker reacts, not a popup around the editor
					if (datePrompt) {
						setDatePrompt(null);
					} else if (pendingCreate) {
						// Cancel a failed create — the in-flight mutation can't be
						// cancelled mid-flight but a successful result will be
						// ignored once pendingCreate is null.
						setPendingCreate(null);
					} else {
						onClose();
					}
					break;
			}
		}
		document.addEventListener('keydown', handleKeyDown, true);
		return () => document.removeEventListener('keydown', handleKeyDown, true);
	}, [flat, selectedIndex, commit, onClose, datePrompt, pendingCreate]);

	// Close on outside click — disabled while a sub-prompt is open (date
	// picker's popup, or an in-flight create_page/create_contact mutation).
	// The mutation listener still needs the picker mounted to receive the
	// `mde-mention-create-result` event when it eventually lands.
	useEffect(() => {
		if (datePrompt || pendingCreate) return;
		function handleClick(e: MouseEvent) {
			if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
				onClose();
			}
		}
		document.addEventListener('mousedown', handleClick);
		return () => document.removeEventListener('mousedown', handleClick);
	}, [onClose, datePrompt, pendingCreate]);

	// Scroll selected row into view
	useEffect(() => {
		const el = menuRef.current?.querySelector('[data-selected=true]');
		el?.scrollIntoView({ block: 'nearest' });
	}, [selectedIndex]);

	// `position` is the caret in viewport coordinates; inside a popup with a
	// blurred, scrolled backdrop `fixed` is measured from that backdrop, so
	// convert (including the flipped-up `bottom`) for the real containing block.
	const fixedBox = useFixedContainingBlock(menuRef, [position.x, position.y]);
	const menuPos = useMemo(
		() => ({
			position: 'fixed' as const,
			...caretPopoverPlacement(position, 320, fixedBox, globalThis.innerHeight),
			zIndex: 50,
		}),
		[position, fixedBox],
	);

	const shellStyle = {
		...menuPos,
		width: 320,
		maxHeight: 320,
		overflowY: 'auto' as const,
		overflowX: 'hidden' as const,
		scrollbarWidth: 'thin' as const,
		scrollbarColor: 'rgba(0,0,0,0.15) transparent',
		borderRadius: 10,
		padding: '4px 0',
		backgroundColor: 'var(--mde-bg-secondary, #f5f5f5)',
		border: '1px solid var(--mde-border-primary, #e5e5e5)',
		boxShadow: '0 4px 20px var(--mde-shadow, rgba(0,0,0,0.12))',
	};

	if (datePrompt) {
		return (
			<div
				ref={menuRef}
				data-testid="mention-picker"
				data-mention-prompt="date"
				style={{ ...shellStyle, maxHeight: undefined, padding: 12, width: 260 }}
			>
				<InlineCalendar
					onPick={iso => completeDatePrompt(iso)}
					onBack={() => setDatePrompt(null)}
				/>
			</div>
		);
	}

	// While a "Add as page" / "Add as contact" mutation is in flight (or has
	// errored), show a compact inline status row instead of the regular list.
	// The picker stays pinned (via the effect above) so the result event has
	// a live listener when it arrives.
	if (pendingCreate) {
		const noun = pendingCreate.kind === 'create_page' ? 'page' : 'contact';
		return (
			<div
				ref={menuRef}
				data-testid="mention-picker"
				data-mention-prompt={pendingCreate.kind}
				style={{ ...shellStyle, maxHeight: undefined, padding: 12, width: 260 }}
			>
				{pendingCreate.status === 'creating' ? (
					<p
						style={{
							margin: 0,
							fontSize: 13,
							color: 'var(--mde-text-secondary, #4a4a4a)',
						}}
					>
						Creating {noun}…
					</p>
				) : (
					<div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
						<p
							style={{
								margin: 0,
								fontSize: 13,
								color: 'var(--mde-text-secondary, #4a4a4a)',
							}}
						>
							Couldn't create {noun}. Try again.
						</p>
						<div style={{ display: 'flex', gap: 8 }}>
							<button
								type="button"
								onMouseDown={e => e.preventDefault()}
								onClick={() => setPendingCreate(null)}
								style={{
									padding: '4px 10px',
									fontSize: 12,
									borderRadius: 6,
									border: '1px solid var(--mde-border-primary, #e5e5e5)',
									backgroundColor: 'transparent',
									cursor: 'pointer',
								}}
							>
								Back
							</button>
							<button
								type="button"
								onMouseDown={e => e.preventDefault()}
								onClick={() =>
									startCreation(pendingCreate.base, pendingCreate.kind)
								}
								style={{
									padding: '4px 10px',
									fontSize: 12,
									borderRadius: 6,
									border: '1px solid var(--mde-accent, #2563eb)',
									backgroundColor: 'var(--mde-accent, #2563eb)',
									color: 'white',
									cursor: 'pointer',
								}}
							>
								Retry
							</button>
						</div>
					</div>
				)}
			</div>
		);
	}

	if (flat.length === 0) {
		return (
			<div
				ref={menuRef}
				data-testid="mention-picker"
				style={{ ...shellStyle, maxHeight: undefined, padding: 8 }}
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
					{loading ? 'Searching…' : filter ? 'No matches' : 'Type to search'}
				</p>
			</div>
		);
	}

	return (
		<div ref={menuRef} data-testid="mention-picker" style={shellStyle}>
			{/* The list is searched by what is typed after "@"; say so, since there
			    is no separate search box (the caret stays in the text). */}
			<div
				data-testid="mention-picker-hint"
				style={{
					padding: '6px 12px 2px',
					fontSize: 12,
					color: 'var(--mde-text-muted, #999)',
					whiteSpace: 'nowrap',
					overflow: 'hidden',
					textOverflow: 'ellipsis',
				}}
			>
				{filter.trim() ? `Matching "${filter.trim()}"` : 'Type a name to search'}
			</div>
			{groups.map((group, groupIndex) => {
				const baseIndex = flat.findIndex(r => r.groupIndex === groupIndex);
				return (
					<div key={group.label}>
						<div
							style={{
								padding: '6px 12px 4px',
								fontSize: 10,
								fontWeight: 500,
								textTransform: 'uppercase',
								letterSpacing: '0.05em',
								color: 'var(--mde-text-muted, #999)',
							}}
						>
							{group.label}
						</div>
						{group.items.map((item, rowIndex) => {
							const flatIndex = baseIndex + rowIndex;
							const isSelected = flatIndex === selectedIndex;
							return (
								<button
									// Key on (section, kind, id) so freeform's three rows —
									// same id-namespace but different item.kind (person /
									// page / contact) — get distinct React keys and don't
									// share state across filter changes.
									key={`${group.label}:${item.kind}:${item.id}`}
									type="button"
									data-selected={isSelected}
									data-mention-kind={item.kind}
									data-mention-id={item.id}
									onMouseDown={e => e.preventDefault()}
									onClick={() => commit(item)}
									onMouseEnter={() => setSelectedIndex(flatIndex)}
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
									<DefaultRow item={item} />
								</button>
							);
						})}
					</div>
				);
			})}
		</div>
	);
}

function DefaultRow({ item }: { readonly item: MentionItem }) {
	return (
		<>
			<span
				style={{
					width: 24,
					height: 24,
					flexShrink: 0,
					display: 'inline-flex',
					alignItems: 'center',
					justifyContent: 'center',
					borderRadius: 4,
					backgroundColor: 'var(--mde-bg-tertiary, #eee)',
					fontSize: 14,
					overflow: 'hidden',
				}}
			>
				{item.iconUrl ? (
					<img
						src={item.iconUrl}
						alt=""
						style={{ width: '100%', height: '100%', objectFit: 'cover' }}
					/>
				) : (
					<span>{item.iconChar ?? '•'}</span>
				)}
			</span>
			<span
				style={{
					flex: 1,
					minWidth: 0,
					display: 'flex',
					flexDirection: 'column',
				}}
			>
				<span
					style={{
						overflow: 'hidden',
						textOverflow: 'ellipsis',
						whiteSpace: 'nowrap',
					}}
				>
					{item.label}
				</span>
				{item.description && (
					<span
						style={{
							fontSize: 11,
							color: 'var(--mde-text-muted, #999)',
							overflow: 'hidden',
							textOverflow: 'ellipsis',
							whiteSpace: 'nowrap',
						}}
					>
						{item.description}
					</span>
				)}
			</span>
		</>
	);
}
