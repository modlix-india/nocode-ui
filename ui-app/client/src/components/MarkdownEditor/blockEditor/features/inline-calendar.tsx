// ============================================================
// InlineCalendar — small month-grid date picker rendered inside the mention
// picker's DOM. Replaces the native <input type="date"> because the native
// calendar popup lives in a top-layer overlay outside the picker's container,
// and any interaction with it (month nav, year nav) was producing focus /
// outside-click events that dismissed the picker mid-interaction. By rendering
// the calendar inline, every click stays inside the picker tree and the
// editor's pin-lock + outside-click logic stays happy.
//
// No external date library. All math is plain Date arithmetic in local time
// (the same TZ the user sees), with output normalised to YYYY-MM-DD.
// ============================================================

import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface InlineCalendarProps {
	/** Initial month to show. Defaults to today. */
	readonly initial?: Date;
	/** Fires once the user clicks a day. ISO is YYYY-MM-DD in local time. */
	readonly onPick: (iso: string) => void;
	/** Back button — returns to the picker's list view. */
	readonly onBack: () => void;
}

const WEEKDAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

function startOfDay(d: Date): Date {
	const n = new Date(d);
	n.setHours(0, 0, 0, 0);
	return n;
}

function toISO(d: Date): string {
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${y}-${m}-${day}`;
}

function isSameDay(a: Date, b: Date): boolean {
	return (
		a.getFullYear() === b.getFullYear() &&
		a.getMonth() === b.getMonth() &&
		a.getDate() === b.getDate()
	);
}

/** Locale-aware month + year heading, e.g. "March 2027". */
function monthHeading(d: Date): string {
	return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

/** Days that should appear in the grid for the given month — pads with the
 *  trailing days of the previous month and the leading days of the next so
 *  the grid is always 6 rows × 7 cols. ISO-weeks start Monday. */
function monthGrid(anchor: Date): Date[] {
	const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
	// 0=Sun … 6=Sat. Shift so Monday=0.
	const startDow = (first.getDay() + 6) % 7;
	const cells: Date[] = [];
	for (let i = 0; i < 42; i++) {
		const d = new Date(first);
		d.setDate(d.getDate() - startDow + i);
		cells.push(d);
	}
	return cells;
}

export function InlineCalendar({ initial, onPick, onBack }: InlineCalendarProps) {
	const today = useMemo(() => startOfDay(new Date()), []);
	const [view, setView] = useState<Date>(() => {
		const d = initial ? new Date(initial) : new Date();
		d.setDate(1);
		return startOfDay(d);
	});

	const cells = useMemo(() => monthGrid(view), [view]);

	const stepMonth = (delta: number) => {
		setView(prev => {
			const next = new Date(prev);
			next.setMonth(next.getMonth() + delta);
			return next;
		});
	};

	const stepYear = (delta: number) => {
		setView(prev => {
			const next = new Date(prev);
			next.setFullYear(next.getFullYear() + delta);
			return next;
		});
	};

	return (
		<div
			style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
			onMouseDown={e => {
				// Critical: every mousedown inside the calendar must NOT bubble to
				// the editor's outside-click handlers. The picker already gates its
				// own listener while datePrompt is set, but other surfaces (the
				// floating toolbar, etc.) may have their own.
				e.stopPropagation();
			}}
		>
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					gap: 4,
				}}
			>
				<button
					type="button"
					aria-label="Previous year"
					data-testid="mention-calendar-prev-year"
					onMouseDown={e => e.preventDefault()}
					onClick={() => stepYear(-1)}
					style={iconBtnStyle}
				>
					«
				</button>
				<button
					type="button"
					aria-label="Previous month"
					data-testid="mention-calendar-prev-month"
					onMouseDown={e => e.preventDefault()}
					onClick={() => stepMonth(-1)}
					style={iconBtnStyle}
				>
					<ChevronLeft size={14} />
				</button>
				<span
					style={{
						flex: 1,
						textAlign: 'center',
						fontSize: 13,
						fontWeight: 500,
						color: 'var(--mde-text-primary, #1a1a1a)',
					}}
				>
					{monthHeading(view)}
				</span>
				<button
					type="button"
					aria-label="Next month"
					data-testid="mention-calendar-next-month"
					onMouseDown={e => e.preventDefault()}
					onClick={() => stepMonth(1)}
					style={iconBtnStyle}
				>
					<ChevronRight size={14} />
				</button>
				<button
					type="button"
					aria-label="Next year"
					data-testid="mention-calendar-next-year"
					onMouseDown={e => e.preventDefault()}
					onClick={() => stepYear(1)}
					style={iconBtnStyle}
				>
					»
				</button>
			</div>

			<div
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(7, 1fr)',
					gap: 2,
				}}
			>
				{WEEKDAY_LABELS.map(wd => (
					<span
						key={wd}
						style={{
							textAlign: 'center',
							fontSize: 10,
							fontWeight: 500,
							textTransform: 'uppercase',
							letterSpacing: '0.04em',
							color: 'var(--mde-text-muted, #999)',
							padding: '2px 0',
						}}
					>
						{wd}
					</span>
				))}
				{cells.map(cell => {
					const inMonth = cell.getMonth() === view.getMonth();
					const isToday = isSameDay(cell, today);
					return (
						<button
							key={toISO(cell)}
							type="button"
							data-testid="mention-calendar-day"
							data-iso={toISO(cell)}
							onMouseDown={e => e.preventDefault()}
							onClick={() => onPick(toISO(cell))}
							style={{
								...dayBtnStyle,
								color: inMonth
									? 'var(--mde-text-primary, #1a1a1a)'
									: 'var(--mde-text-muted, #b5b5b5)',
								backgroundColor: isToday
									? 'var(--mde-bg-tertiary, #eef2ff)'
									: 'transparent',
								fontWeight: isToday ? 600 : 400,
							}}
						>
							{cell.getDate()}
						</button>
					);
				})}
			</div>

			<button
				type="button"
				onMouseDown={e => e.preventDefault()}
				onClick={onBack}
				style={{
					alignSelf: 'flex-end',
					padding: '4px 10px',
					fontSize: 12,
					border: 'none',
					borderRadius: 6,
					backgroundColor: 'transparent',
					color: 'var(--mde-text-muted, #999)',
					cursor: 'pointer',
				}}
			>
				Back
			</button>
		</div>
	);
}

const iconBtnStyle: React.CSSProperties = {
	display: 'inline-flex',
	alignItems: 'center',
	justifyContent: 'center',
	width: 24,
	height: 24,
	padding: 0,
	border: 'none',
	borderRadius: 4,
	backgroundColor: 'transparent',
	color: 'var(--mde-text-secondary, #4a4a4a)',
	cursor: 'pointer',
	fontSize: 12,
};

const dayBtnStyle: React.CSSProperties = {
	display: 'inline-flex',
	alignItems: 'center',
	justifyContent: 'center',
	height: 28,
	border: 'none',
	borderRadius: 4,
	fontSize: 12,
	cursor: 'pointer',
	backgroundColor: 'transparent',
};
