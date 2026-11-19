import React, { CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import { usedComponents } from '../../App/usedComponents';
import {
	AutomationDoc,
	AutomationRun,
	Catalog,
	CheckReport,
	TRIGGER_KEY,
	Variable,
} from './automationTypes';
import { canEndAt, canMove, insertAt, InsertKind, moveNode, removeNode } from './editOps';
import { BranchItem, FlowItem, Gap, Lane, layoutAutomation, Seq } from './layout';
import { CardRun, cardRun, issuesByNode, runView, RunView, runWords } from './runState';
import {
	allVariables,
	CardText,
	cardPlainText,
	nodeCard,
	nodeTitle,
	OptionLabeller,
	triggerCard,
} from './sentences';
import { useOptionLabels } from './useOptions';

/**
 * The automation drawn as sentence cards on a rail.
 *
 * Pure presentation over the layout and sentence modules: it holds no store
 * binding, so the page component and the chat's `flow` craft block draw the
 * same cards from the same code. Edits come back through `onDocChange` as a
 * whole new document.
 */

export type FlowMode = 'view' | 'edit' | 'run';

export interface FlowViewProps {
	doc?: AutomationDoc;
	catalog?: Catalog;
	run?: AutomationRun;
	check?: CheckReport;
	mode?: FlowMode;
	/** Smaller type and spacing, for the chat. */
	compact?: boolean;
	selectedKey?: string;
	/** Node keys to badge as changed (the chat marks what the agent just edited). */
	changed?: string[];
	appCode?: string;
	/** A card was clicked (edit mode, or any mode when given). `title` is its plain sentence. */
	onCardClick?: (key: string, title: string) => void;
	/** Edit mode: the new document after an insert, move or remove; `select` is a new node to select. */
	onDocChange?: (doc: AutomationDoc, select?: string) => void;
	/** Resolved style slots from the host component. */
	styles?: Record<string, CSSProperties | undefined>;
	/** Renders the host's design-mode helper for a slot. */
	slot?: (name: string) => React.ReactNode;
	className?: string;
	/** Placed beside the flow (the edit panel). */
	aside?: React.ReactNode;
	emptyMessage?: string;
}

const INSERT_CHOICES: Array<{ kind: InsertKind; label: string }> = [
	{ kind: 'ACTION', label: 'Do something' },
	{ kind: 'WAIT', label: 'Wait' },
	{ kind: 'CHECK', label: 'Check' },
	{ kind: 'SPLIT', label: 'Do at the same time' },
	{ kind: 'END', label: 'End' },
];

const VERB_CLASS: Record<string, string> = {
	WHEN: '_when',
	DO: '_do',
	WAIT: '_wait',
	IF: '_if',
	'AT THE SAME TIME': '_split',
	END: '_end',
};

function gapId(g: Gap): string {
	return `${g.start ? 's' : ''}${g.indices.join(',')}|${g.from ?? ''}|${g.branch ?? ''}|${g.to ?? ''}|${g.laneEnd ? 'e' : ''}`;
}

interface Ctx {
	doc: AutomationDoc;
	catalog?: Catalog;
	mode: FlowMode;
	vars: Variable[];
	labeller: OptionLabeller;
	run?: RunView;
	errors: Record<string, string[]>;
	warnings: Record<string, string[]>;
	changed: Set<string>;
	selectedKey?: string;
	openGap: string;
	setOpenGap: (id: string) => void;
	onCardClick?: (key: string, title: string) => void;
	onDocChange?: (doc: AutomationDoc, select?: string) => void;
	styles: Record<string, CSSProperties | undefined>;
	slot?: (name: string) => React.ReactNode;
}

function Sentence({ card }: { card: CardText }) {
	return (
		<span className="_afSentence">
			{card.segments.map((s, i) =>
				s.chip ? (
					<span key={i} className={`_afChip${s.empty ? ' _empty' : ''}`}>
						{s.text}
					</span>
				) : (
					<React.Fragment key={i}>{s.text}</React.Fragment>
				),
			)}
		</span>
	);
}

function RunBadge({ r }: { r?: CardRun }) {
	if (!r) return null;
	return <span className={`_afRunBadge _${r.state}`}>{runWords(r)}</span>;
}

function Card({
	ctx,
	nodeKey,
	card,
	removable,
}: {
	ctx: Ctx;
	nodeKey: string;
	card: CardText;
	removable?: boolean;
}) {
	const isTrigger = nodeKey === TRIGGER_KEY;
	const plain = cardPlainText(card);
	const errors = ctx.errors[nodeKey] ?? (isTrigger ? ctx.errors[''] : undefined);
	const warnings = ctx.warnings[nodeKey];
	const r =
		ctx.mode === 'run'
			? isTrigger
				? triggerRun(ctx.run)
				: cardRun(ctx.run, nodeKey)
			: undefined;
	const clickable =
		!!ctx.onCardClick && (ctx.mode === 'edit' || ctx.mode === 'view' || ctx.mode === 'run');
	const selected = ctx.selectedKey === nodeKey;
	const classes = [
		'_afCard',
		VERB_CLASS[card.verb] ?? '',
		selected ? '_selected' : '',
		errors?.length ? '_hasError' : '',
		r ? `_run_${r.state}` : '',
		ctx.changed.has(nodeKey) ? '_changed' : '',
	]
		.filter(Boolean)
		.join(' ');

	const body = (
		<>
			<span className="_afVerb">{card.verb}</span>
			<span className="_afBody">
				<Sentence card={card} />
				{card.detail && <span className="_afDetail">{card.detail}</span>}
				{(r || errors?.length || warnings?.length || ctx.changed.has(nodeKey)) && (
					<span className="_afBadges">
						<RunBadge r={r} />
						{ctx.changed.has(nodeKey) && (
							<span className="_afChangedBadge">changed</span>
						)}
						{errors?.map((e, i) => (
							<span key={`e${i}`} className="_afIssue _error">
								{e}
							</span>
						))}
						{warnings?.map((w, i) => (
							<span key={`w${i}`} className="_afIssue _warning">
								{w}
							</span>
						))}
					</span>
				)}
			</span>
		</>
	);

	const doc = ctx.doc;
	const edit = ctx.mode === 'edit' && !isTrigger && ctx.onDocChange;
	return (
		<div className={classes} style={ctx.styles.card} data-node={nodeKey}>
			{ctx.slot?.('card')}
			{clickable ? (
				<button
					type="button"
					className="_afCardMain"
					aria-pressed={ctx.mode === 'edit' ? selected : undefined}
					aria-label={plain}
					onClick={() => ctx.onCardClick?.(nodeKey, plain)}
				>
					{body}
				</button>
			) : (
				<div className="_afCardMain">{body}</div>
			)}
			{edit && (
				<span className="_afCardTools">
					<button
						type="button"
						className="_afTool"
						title="Move up"
						aria-label={`Move up: ${plain}`}
						disabled={!canMove(doc, nodeKey, -1)}
						onClick={() => ctx.onDocChange!(moveNode(doc, nodeKey, -1))}
					>
						<i className="fa fa-solid fa-arrow-up" aria-hidden="true" />
					</button>
					<button
						type="button"
						className="_afTool"
						title="Move down"
						aria-label={`Move down: ${plain}`}
						disabled={!canMove(doc, nodeKey, 1)}
						onClick={() => ctx.onDocChange!(moveNode(doc, nodeKey, 1))}
					>
						<i className="fa fa-solid fa-arrow-down" aria-hidden="true" />
					</button>
					{removable !== false && (
						<button
							type="button"
							className="_afTool _remove"
							title="Remove"
							aria-label={`Remove: ${plain}`}
							onClick={() => ctx.onDocChange!(removeNode(doc, nodeKey))}
						>
							<i className="fa fa-solid fa-xmark" aria-hidden="true" />
						</button>
					)}
				</span>
			)}
		</div>
	);
}

function triggerRun(view: RunView | undefined): CardRun | undefined {
	if (!view) return undefined;
	return { state: 'done', at: view.startedAt };
}

function RailGap({ ctx, gap }: { ctx: Ctx; gap?: Gap }) {
	const ref = useRef<HTMLDivElement>(null);
	const id = gap ? gapId(gap) : '';
	const open = !!gap && ctx.openGap === id;
	const setOpenGap = ctx.setOpenGap;
	useEffect(() => {
		if (!open) return;
		const close = (e: MouseEvent) => {
			if (!ref.current?.contains(e.target as Node)) setOpenGap('');
		};
		document.addEventListener('mousedown', close);
		return () => document.removeEventListener('mousedown', close);
	}, [open, setOpenGap]);

	if (ctx.mode !== 'edit' || !gap || !ctx.onDocChange)
		return <div className="_afGap" aria-hidden="true" />;
	const choices = INSERT_CHOICES.filter(c => c.kind !== 'END' || canEndAt(gap));
	return (
		<div className={`_afGap _editable${open ? ' _open' : ''}`} ref={ref}>
			<button
				type="button"
				className="_afAdd"
				aria-label="Add a step here"
				aria-haspopup="menu"
				aria-expanded={open}
				onClick={() => ctx.setOpenGap(open ? '' : id)}
			>
				+
			</button>
			{open && (
				<div className="_afAddMenu" role="menu" style={ctx.styles.addMenu}>
					{choices.map(c => (
						<button
							key={c.kind}
							type="button"
							role="menuitem"
							className="_afAddChoice"
							onClick={() => {
								ctx.setOpenGap('');
								const r = insertAt(ctx.doc, gap, c.kind);
								ctx.onDocChange!(r.doc, r.key);
							}}
							onKeyDown={e => {
								if (e.key === 'Escape') ctx.setOpenGap('');
							}}
						>
							{c.label}
						</button>
					))}
				</div>
			)}
		</div>
	);
}

function GotoCard({ ctx, target }: { ctx: Ctx; target: string }) {
	return (
		<div className="_afCard _goto" style={ctx.styles.card}>
			<div className="_afCardMain">
				<span className="_afVerb">GO BACK</span>
				<span className="_afBody">
					<span className="_afSentence">
						Go back to{' '}
						<span className="_afChip">{nodeTitle(ctx.doc, ctx.catalog, target)}</span>
					</span>
				</span>
			</div>
		</div>
	);
}

function laneEndsInItself(lane: Lane): boolean {
	const last = lane.seq.items[lane.seq.items.length - 1];
	if (!last) return false;
	return last.kind === 'goto' || (last.kind === 'card' && last.node.type === 'END');
}

function BranchBlock({ ctx, item }: { ctx: Ctx; item: BranchItem }) {
	const card = nodeCard(ctx.doc, ctx.catalog, item.key, ctx.vars, ctx.labeller);
	const taken = ctx.mode === 'run' ? ctx.run?.branches[item.key] : undefined;
	const reached = ctx.mode === 'run' && !!ctx.run?.byNode[item.key];
	const plain = cardPlainText(card);
	return (
		<div className={`_afBranch${item.mergeKey ? ' _merged' : ''}`}>
			<Card ctx={ctx} nodeKey={item.key} card={card} />
			<div
				className="_afLanes"
				role="group"
				aria-label={`Paths after: ${plain}`}
				style={ctx.styles.lanes}
			>
				{ctx.slot?.('lanes')}
				{item.lanes.map((lane, i) => {
					const isTaken =
						item.type === 'SPLIT'
							? reached
							: !!taken &&
								String(taken).toLowerCase() === String(lane.branch).toLowerCase();
					const notTaken = ctx.mode === 'run' && reached && !isTaken;
					return (
						<div
							key={`${lane.label}-${i}`}
							className={`_afLane${lane.closes ? ' _closes' : ''}${isTaken ? ' _taken' : ''}${notTaken ? ' _notTaken' : ''}`}
							role="group"
							aria-label={`${lane.label} path${isTaken ? ', taken' : ''}`}
						>
							<div className="_afLaneLabel" style={ctx.styles.laneLabel}>
								{lane.label}
							</div>
							<SeqView ctx={ctx} seq={lane.seq} />
							{!lane.closes && !laneEndsInItself(lane) && (
								<div className="_afLaneStop">Stops here</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}

function ItemView({ ctx, item }: { ctx: Ctx; item: FlowItem }) {
	if (item.kind === 'goto') return <GotoCard ctx={ctx} target={item.target} />;
	if (item.kind === 'branch') return <BranchBlock ctx={ctx} item={item} />;
	const card = nodeCard(ctx.doc, ctx.catalog, item.key, ctx.vars, ctx.labeller);
	return <Card ctx={ctx} nodeKey={item.key} card={card} />;
}

function SeqView({ ctx, seq }: { ctx: Ctx; seq: Seq }) {
	return (
		<div className="_afSeq">
			{seq.items.map((item, i) => (
				<React.Fragment key={item.kind === 'goto' ? `goto-${item.target}-${i}` : item.key}>
					<RailGap ctx={ctx} gap={item.before} />
					<ItemView ctx={ctx} item={item} />
				</React.Fragment>
			))}
			{seq.tail && <RailGap ctx={ctx} gap={seq.tail} />}
		</div>
	);
}

export function FlowView(props: Readonly<FlowViewProps>) {
	const {
		doc: rawDoc,
		catalog,
		run,
		check,
		mode = 'view',
		compact,
		selectedKey,
		changed,
		appCode,
		onCardClick,
		onDocChange,
		styles = {},
		slot,
		className,
		aside,
		emptyMessage = 'Nothing to show yet.',
	} = props;

	// The style block is emitted once something reports the component as used.
	// The chat draws this view without the page component, so it reports here.
	useEffect(() => usedComponents.using('AutomationFlow'), []);

	const doc = rawDoc ?? {};
	const layout = useMemo(() => layoutAutomation(doc), [doc]);
	const vars = useMemo(() => allVariables(doc, catalog), [doc, catalog]);
	const labeller = useOptionLabels(doc, catalog, appCode ?? doc.appCode);
	const rv = useMemo(() => runView(run), [run]);
	const issues = useMemo(() => issuesByNode(check), [check]);
	const changedSet = useMemo(() => new Set(changed ?? []), [changed]);
	const [openGap, setOpenGap] = useState('');

	const ctx: Ctx = {
		doc,
		catalog,
		mode,
		vars,
		labeller,
		run: rv,
		errors: issues.errors,
		warnings: issues.warnings,
		changed: changedSet,
		selectedKey,
		openGap,
		setOpenGap,
		onCardClick,
		onDocChange,
		styles,
		slot,
	};

	// Edit mode always draws the WHEN card and the first "+", so a new automation starts from nothing.
	const hasAnything =
		mode === 'edit' || (!!rawDoc && (!!doc.trigger || !!Object.keys(doc.nodes ?? {}).length));

	return (
		<div
			className={`_afRoot _${mode}${compact ? ' _compact' : ''}${aside ? ' _withAside' : ''}${className ? ` ${className}` : ''}`}
		>
			<div className="_afFlow" style={styles.flow} role="group" aria-label="Automation steps">
				{slot?.('flow')}
				{!hasAnything ? (
					<div className="_afEmpty">{emptyMessage}</div>
				) : (
					<div className="_afSeq _afMain">
						<Card
							ctx={ctx}
							nodeKey={TRIGGER_KEY}
							card={triggerCard(doc, catalog, vars, labeller)}
							removable={false}
						/>
						<SeqView ctx={ctx} seq={layout.seq} />
					</div>
				)}
				{layout.orphans.length > 0 && (
					<div className="_afOrphans" role="group" aria-label="Steps not connected">
						<div className="_afLaneLabel">Not connected to the flow</div>
						<div className="_afSeq _afLoose">
							{layout.orphans.map(k => (
								<Card
									key={k}
									ctx={ctx}
									nodeKey={k}
									card={nodeCard(doc, catalog, k, vars, labeller)}
								/>
							))}
						</div>
					</div>
				)}
			</div>
			{aside}
		</div>
	);
}
