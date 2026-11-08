import React, { useEffect, useRef } from 'react';
import { formatValue, parseToken, valueAt } from './docModel';

// Text with fields, edited in place on the page. The value is FreeMarker text ("Dear ${name!'-'},");
// every ${...} shows as a named chip that cannot be typed into, so a field cannot be broken by a typo.
// A field goes in at the cursor through insertFieldAtCursor (the Fields list, or Insert field).

export interface ChipContext {
	labelOf: (path: string) => string;
	// With data, chips show the value for the record in use instead of the field's name.
	data?: any;
	scope?: Record<string, any>;
	showData?: boolean;
	// Changes when the data shown changes (another record), so chips refresh then and only then:
	// the template object is copied on every edit, so identity cannot be used.
	dataKey?: string;
	// Inside a repeating block: its list and loop name, so a picked item field is written for the row.
	list?: string;
	alias?: string;
}

interface ChipTextProps {
	value: string;
	onChange: (v: string) => void;
	ctx: ChipContext;
	className?: string;
	placeholder?: string;
	singleLine?: boolean;
	onChipClick?: (token: string, replace: (next: string) => void) => void;
	onFocusText?: () => void;
}

const MARK = '\u0000';

function escapeAttr(s: string) {
	return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function escapeText(s: string) {
	return s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
}

export function chipHtml(token: string, ctx: ChipContext): string {
	const f = parseToken(token.slice(2, -1))!;
	const name = ctx.labelOf(f.path);
	let text = name;
	let cls = '_chip';
	if (ctx.showData && ctx.data !== undefined) {
		const v = valueAt(ctx.data, f.path, ctx.scope);
		const shown = formatValue(v, f);
		text = shown === '' ? `${name}: empty` : shown;
		cls += shown === '' ? ' _chipEmpty' : ' _chipValue';
	}
	return `<span class="${cls}" contenteditable="false" data-token="${escapeAttr(token)}" title="${escapeAttr(`${name} (${f.path})`)}">${escapeText(text)}</span>`;
}

// FreeMarker text -> editable HTML with chips.
// Only fields in the text become chips; a field inside a tag (href="${link}") stays as written.
export function toEditable(value: string, ctx: ChipContext): string {
	return (value ?? '')
		.split(/(<[^>]*>)/)
		.map(part =>
			part.startsWith('<') ? part : part.replace(/\$\{[^}]*\}/g, t => chipHtml(t, ctx)),
		)
		.join('');
}

// Editable HTML -> FreeMarker text (chips back to their tokens).
export function fromEditable(el: HTMLElement): string {
	const clone = el.cloneNode(true) as HTMLElement;
	const tokens: string[] = [];
	clone.querySelectorAll('span[data-token]').forEach(s => {
		tokens.push(s.getAttribute('data-token') ?? '');
		s.replaceWith(document.createTextNode(MARK));
	});
	let html = clone.innerHTML.replace(/&nbsp;/g, ' ');
	let i = 0;
	html = html.replace(new RegExp(MARK, 'g'), () => tokens[i++] ?? '');
	return html.replace(/<br>/g, '<br/>');
}

// The text box the cursor was last in, so a field picked elsewhere lands there.
let active: { el: HTMLElement; range?: Range; emit: () => void; ctx: ChipContext } | undefined;

export function hasActiveText(): boolean {
	return !!active && document.body.contains(active.el);
}

export function insertFieldAtCursor(token: string): boolean {
	if (!active || !document.body.contains(active.el)) return false;
	const { el, emit, ctx } = active;
	if (ctx.list && ctx.alias) token = token.split(`${ctx.list}[0].`).join(`${ctx.alias}.`);
	const holder = document.createElement('span');
	holder.innerHTML = chipHtml(token, ctx);
	const chip = holder.firstChild as Node;
	let range = active.range;
	if (!range || !el.contains(range.startContainer)) {
		range = document.createRange();
		range.selectNodeContents(el);
		range.collapse(false);
	}
	range.deleteContents();
	range.insertNode(chip);
	const after = document.createRange();
	after.setStartAfter(chip);
	after.collapse(true);
	active.range = after;
	const sel = window.getSelection();
	sel?.removeAllRanges();
	sel?.addRange(after);
	emit();
	return true;
}

export default function ChipText({
	value,
	onChange,
	ctx,
	className,
	placeholder,
	singleLine,
	onChipClick,
	onFocusText,
}: Readonly<ChipTextProps>) {
	const ref = useRef<HTMLDivElement>(null);
	// The latest handlers: the text box remembered for "insert at cursor" may emit after re-renders.
	const onChangeRef = useRef(onChange);
	onChangeRef.current = onChange;
	const valueRef = useRef(value);
	valueRef.current = value;
	const lastEmitted = useRef<string | undefined>(undefined);
	const ctxKey = `${ctx.showData ? 1 : 0}|${ctx.dataKey ?? ''}`;
	const lastCtx = useRef('');

	// Re-render only for outside changes (or when the data shown changes), never under the cursor.
	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		if (value === lastEmitted.current && lastCtx.current === ctxKey) return;
		el.innerHTML = toEditable(value ?? '', ctx);
		lastEmitted.current = value;
		lastCtx.current = ctxKey;
	});

	const emit = () => {
		const el = ref.current;
		if (!el) return;
		const next = fromEditable(el);
		lastEmitted.current = next;
		if (next !== valueRef.current) onChangeRef.current(next);
	};

	const remember = () => {
		const el = ref.current;
		if (!el) return;
		const sel = window.getSelection();
		const range = sel && sel.rangeCount ? sel.getRangeAt(0) : undefined;
		active = {
			el,
			range: range && el.contains(range.startContainer) ? range.cloneRange() : undefined,
			emit,
			ctx,
		};
	};

	return (
		<div
			ref={ref}
			className={`_chipText ${className ?? ''}`}
			contentEditable
			suppressContentEditableWarning
			data-placeholder={placeholder}
			onInput={() => {
				emit();
				remember();
			}}
			onKeyUp={remember}
			onMouseUp={remember}
			onFocus={() => {
				remember();
				onFocusText?.();
			}}
			onKeyDown={e => {
				if (singleLine && e.key === 'Enter') e.preventDefault();
			}}
			onClick={e => {
				const t = (e.target as HTMLElement).closest?.(
					'span[data-token]',
				) as HTMLElement | null;
				if (t && onChipClick) {
					const token = t.getAttribute('data-token') ?? '';
					onChipClick(token, next => {
						const holder = document.createElement('span');
						holder.innerHTML = chipHtml(next, ctx);
						t.replaceWith(holder.firstChild as Node);
						emit();
					});
				}
			}}
		/>
	);
}
