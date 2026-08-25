import React, { useEffect, useRef, useState } from 'react';
import type { Segment } from './types';

export interface PickerKind {
	key: string;
	label: string;
}

export function SegmentPicker({
	sessionId,
	agentEndpoint,
	getAuthHeaders,
	kinds,
	busy,
	onAdd,
	onClose,
	shortPath,
}: Readonly<{
	sessionId: string;
	agentEndpoint: string;
	getAuthHeaders: () => Record<string, string>;
	kinds: PickerKind[];
	busy: boolean;
	onAdd: (seg: Segment) => void;
	onClose: () => void;
	shortPath: (category: string) => string;
}>) {
	const [tab, setTab] = useState<'search' | 'browse'>('search');
	const [query, setQuery] = useState('');
	const [results, setResults] = useState<Segment[]>([]);
	const [total, setTotal] = useState(0);
	const [searching, setSearching] = useState(false);
	const [browseKind, setBrowseKind] = useState(kinds[0]?.key ?? '');
	const [browse, setBrowse] = useState<Segment[]>([]);
	const [browsing, setBrowsing] = useState(false);
	const [open, setOpen] = useState<Record<string, boolean>>({});

	const mounted = useRef(true);
	useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, []);

	const load = async (body: Record<string, unknown>) => {
		const baseUrl = agentEndpoint.replace(/\/chat$/, '');
		const res = await fetch(`${baseUrl}/audience/search`, {
			method: 'POST',
			headers: getAuthHeaders(),
			body: JSON.stringify({ session_id: sessionId, ...body }),
		});
		if (!res.ok) return { results: [] as Segment[], total: 0 };
		const json = await res.json();
		return { results: (json?.results ?? []) as Segment[], total: json?.total ?? 0 };
	};

	const seq = useRef(0);
	useEffect(() => {
		const text = query.trim();
		if (!sessionId || text.length < 2) {
			setResults([]);
			setTotal(0);
			setSearching(false);
			return;
		}
		const mine = ++seq.current;
		setSearching(true);
		const timer = setTimeout(async () => {
			let found = { results: [] as Segment[], total: 0 };
			try {
				found = await load({ query: text });
			} catch {
				found = { results: [], total: 0 };
			}
			if (!mounted.current || mine !== seq.current) return;
			setResults(found.results);
			setTotal(found.total);
			setSearching(false);
		}, 300);
		return () => clearTimeout(timer);
	}, [query, sessionId, agentEndpoint, getAuthHeaders]);

	useEffect(() => {
		if (!sessionId || tab !== 'browse' || !browseKind) return;
		let live = true;
		setBrowsing(true);
		setOpen({});
		(async () => {
			let rows: Segment[] = [];
			try {
				rows = (await load({ kind: browseKind.toUpperCase() })).results;
			} catch {
				rows = [];
			}
			if (!live || !mounted.current) return;
			setBrowse(rows);
			setBrowsing(false);
		})();
		return () => {
			live = false;
		};
	}, [tab, browseKind, sessionId, agentEndpoint, getAuthHeaders]);

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
		};
		document.addEventListener('keydown', onKey);
		return () => document.removeEventListener('keydown', onKey);
	}, [onClose]);

	const kindLabel = (k: string) =>
		kinds.find(x => x.key === k.toLowerCase())?.label ?? k.toLowerCase().replace(/_/g, ' ');

	const row = (seg: Segment, extra: React.ReactNode) => (
		<button
			type="button"
			className={`_audPickRow${seg.targeted ? ' _added' : ''}`}
			disabled={busy || seg.targeted}
			onClick={() => onAdd(seg)}
			title={seg.path.join(' > ')}
		>
			<span className="_audPickMain">
				<span className="_audPickLabel">{seg.label}</span>
				{seg.path.length > 1 && (
					<span className="_audPickPath">
						{shortPath(seg.path.slice(0, -1).join(' > '))}
					</span>
				)}
			</span>
			{seg.targeted ? (
				<span className={`_audPickAdded${seg.recommended ? ' _rec' : ''}`}>
					{seg.recommended ? 'Recommended' : 'Added'}
				</span>
			) : (
				extra
			)}
		</button>
	);

	return (
		<div className="_audPickerPanel">
			<div className="_audPickHeader">
				<button type="button" className="_audPickBack" onClick={onClose} aria-label="Back">
					<i className="fa fa-solid fa-arrow-left" />
				</button>
				<span className="_audPickTitle">Add audience signal</span>
				<button
					type="button"
					className="_audPickClose"
					onClick={onClose}
					aria-label="Close"
				>
					<i className="fa fa-solid fa-xmark" />
				</button>
			</div>

			<div className="_audTabs">
				<button
					type="button"
					className={`_audTab${tab === 'search' ? ' _on' : ''}`}
					onClick={() => setTab('search')}
				>
					Search
				</button>
				<button
					type="button"
					className={`_audTab${tab === 'browse' ? ' _on' : ''}`}
					onClick={() => setTab('browse')}
				>
					Browse
				</button>
			</div>

			{tab === 'search' ? (
				<>
					<input
						type="text"
						className="_kwAddInput _audPickInput"
						placeholder="Search every category…"
						autoFocus
						value={query}
						onChange={e => setQuery(e.target.value)}
					/>
					{query.trim().length < 2 && (
						<div className="_audResultNote">
							Type what the audience is after — every category is searched at once, so
							you do not need to know which one holds it.
						</div>
					)}
					{searching && <div className="_audResultNote">Searching…</div>}
					{!searching && query.trim().length >= 2 && results.length === 0 && (
						<div className="_audResultNote">
							Google has no segment for that. Describe who you want in chat and one
							can be built from what people search.
						</div>
					)}
					{!searching && results.length > 0 && (
						<div className="_audResultNote">
							{total} match{total === 1 ? '' : 'es'}
						</div>
					)}
					<div className="_audPickList">
						{results.map(seg => (
							<React.Fragment key={seg.ref}>
								{row(
									seg,
									<span className="_audPickKind">{kindLabel(seg.kind)}</span>,
								)}
							</React.Fragment>
						))}
					</div>
				</>
			) : (
				<>
					<div className="_audKinds">
						{kinds.map(k => (
							<button
								type="button"
								key={k.key}
								className={`_audKind${browseKind === k.key ? ' _on' : ''}`}
								onClick={() => setBrowseKind(k.key)}
							>
								{k.label}
							</button>
						))}
					</div>
					{browsing && <div className="_audResultNote">Loading…</div>}
					{!browsing && browse.length === 0 && (
						<div className="_audResultNote">Nothing to show here.</div>
					)}
					<div className="_audPickList">
						{browse.map(seg => {
							const key = seg.path.join('>');
							const hidden = seg.path
								.slice(0, -1)
								.some((_, i) => !open[seg.path.slice(0, i + 1).join('>')]);
							if (hidden) return null;
							const hasKids = browse.some(
								o =>
									o.path.length === seg.path.length + 1 &&
									o.path.slice(0, -1).join('>') === key,
							);
							return (
								<div
									key={seg.ref}
									className="_audBrowseRow"
									style={{ paddingLeft: `${(seg.path.length - 1) * 12}px` }}
								>
									{hasKids ? (
										<button
											type="button"
											className="_audTwisty"
											onClick={() => setOpen(m => ({ ...m, [key]: !m[key] }))}
											aria-label={open[key] ? 'Collapse' : 'Expand'}
										>
											<i
												className={`fa fa-solid fa-chevron-right${
													open[key] ? ' _open' : ''
												}`}
											/>
										</button>
									) : (
										<span className="_audTwistySpacer" />
									)}
									{row(seg, null)}
								</div>
							);
						})}
					</div>
				</>
			)}

			<div className="_audPickFoot">
				<button type="button" className="_kwCancelBtn _audPickCancel" onClick={onClose}>
					Cancel
				</button>
			</div>
		</div>
	);
}
