import React, { useEffect, useRef, useState } from 'react';

// The same reading the TextBox number box uses. A whole number in plain form; a DECIMAL may lead
// with the point (".5") and carry an exponent ("1e5"). Anything else is still being typed: "-",
// "12.", "-0.".
const REGEX_DECIMAL = /^-?(\d+|\d*\.\d+)(e[-+]?\d+)?$/i;
const REGEX_INTEGER = /^-?\d+$/;

const isNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

/** The number a COMPLETE text stands for; undefined when it is empty or still being typed. */
export function completeNumber(text: string, integer: boolean = false): number | undefined {
	const t = text.trim();
	if (!(integer ? REGEX_INTEGER : REGEX_DECIMAL).test(t)) return undefined;
	const n = Number(t);
	if (!Number.isFinite(n)) return undefined; // "1e999"
	return n === 0 ? 0 : n; // -0 is 0
}

/** The number a text stands for read leniently ("12." is 12); undefined when there is none. */
function lenientNumber(text: string, integer: boolean): number | undefined {
	const n = integer ? parseInt(text) : parseFloat(text);
	if (!Number.isFinite(n)) return undefined;
	return n === 0 ? 0 : n;
}

type InputProps = Omit<
	React.InputHTMLAttributes<HTMLInputElement>,
	'value' | 'defaultValue' | 'onChange' | 'type'
>;

/**
 * A type="number" box over a number value that never rewrites what the user is typing.
 *
 * Parsing every keystroke and writing the number back breaks typing: the browser reports '' for
 * a box that is empty or holds a lone "-", Number('') is 0, and React then puts "0" in the box.
 * This box keeps the text as typed while it has focus, calls onNumber only when the text is a
 * complete number (so a live preview still follows the typing), and settles on blur: the box
 * shows the value again. An empty box is reported as undefined only with allowEmpty; otherwise a
 * box left empty or half typed goes back to the value on blur. Escape drops the typed text.
 */
export function DraftNumberInput({
	value,
	onNumber,
	integer = false,
	allowEmpty = false,
	onBlur,
	onKeyDown,
	...rest
}: Readonly<
	InputProps & {
		value: number | undefined;
		onNumber: (n: number | undefined) => void;
		/** Whole numbers only: '.', ',', 'e' and '+' are refused. */
		integer?: boolean;
		/** An emptied box reports undefined; otherwise empty is never reported. */
		allowEmpty?: boolean;
	}
>) {
	// The text as typed while the user edits; null shows the value.
	const [draft, setDraftState] = useState<string | null>(null);
	const draftRef = useRef<string | null>(null);
	const setDraft = (d: string | null) => {
		draftRef.current = d;
		setDraftState(d);
	};

	// A value that arrives while the user types replaces the text, unless it is the number the
	// text already stands for: that is the echo of what was just typed, and writing it back would
	// turn "12.30" into "12.3" before the next digit.
	useEffect(() => {
		const d = draftRef.current;
		if (d === null) return;
		const n = completeNumber(d, integer);
		if (n === undefined ? !isNumber(value) : n === value) return;
		setDraft(null);
	}, [value]); // eslint-disable-line @eslint-react/exhaustive-deps

	// A type="number" box keeps a lone "-" on screen while reporting ''. Nothing was reported
	// for it: clear it so the box shows the value.
	const dropDraft = (input: HTMLInputElement) => {
		if (input.validity?.badInput) input.value = '';
		setDraft(null);
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const raw = e.target.value;
		// '' with validity.badInput is the user typing ("-", "1e", "12." in some browsers), not
		// clearing: mirror the '' so React leaves the text alone, and report nothing.
		if (raw === '' && e.target.validity?.badInput) {
			setDraft('');
			return;
		}
		// A pasted decimal in a whole number box: leaving the draft as it was puts the text back.
		if (integer && /[.,e]/i.test(raw)) return;
		setDraft(raw);
		if (raw.trim() === '') {
			if (allowEmpty && value !== undefined) onNumber(undefined);
			return;
		}
		const n = completeNumber(raw, integer);
		if (n !== undefined && n !== value) onNumber(n);
	};

	const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
		const d = draftRef.current;
		if (d !== null) {
			const n = completeNumber(d, integer) ?? lenientNumber(d, integer);
			if (n === undefined) {
				if (allowEmpty && value !== undefined) onNumber(undefined);
			} else if (n !== value) onNumber(n);
			dropDraft(e.target);
		}
		onBlur?.(e);
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		onKeyDown?.(e);
		if (e.defaultPrevented) return;
		if (e.key === 'Escape' && draftRef.current !== null) {
			dropDraft(e.currentTarget);
			return;
		}
		if (!integer || e.ctrlKey || e.metaKey || e.altKey) return;
		if (['.', ',', 'e', 'E', '+'].includes(e.key)) e.preventDefault();
	};

	return (
		<input
			{...rest}
			type="number"
			value={draft ?? (isNumber(value) ? String(value) : '')}
			onChange={handleChange}
			onBlur={handleBlur}
			onKeyDown={handleKeyDown}
		/>
	);
}
