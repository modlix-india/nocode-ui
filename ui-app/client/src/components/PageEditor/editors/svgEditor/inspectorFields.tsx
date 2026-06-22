import React, { useEffect, useState } from 'react';
import { CommonColorPickerPropertyEditor } from '../../../../commonComponents/CommonColorPicker';

// Collapsible section.
export function Section({
	title,
	defaultOpen = true,
	children,
}: Readonly<{ title: string; defaultOpen?: boolean; children: React.ReactNode }>) {
	const [open, setOpen] = useState(defaultOpen);
	return (
		<div className="_svgSection">
			<button type="button" className="_svgSectionTitle" onClick={() => setOpen(o => !o)}>
				<i className={`fa fa-solid fa-caret-${open ? 'down' : 'right'}`} />
				{title}
			</button>
			{open && <div className="_svgSectionBody">{children}</div>}
		</div>
	);
}

// Text input that commits a local draft on blur / Enter (no per-keystroke undo).
export function CommitInput({
	value,
	placeholder,
	type = 'text',
	onCommit,
}: Readonly<{
	value: string;
	placeholder?: string;
	type?: string;
	onCommit: (v: string) => void;
}>) {
	const [draft, setDraft] = useState(value);
	useEffect(() => setDraft(value), [value]);
	return (
		<input
			className="_peInput"
			type={type}
			value={draft}
			placeholder={placeholder}
			onChange={e => setDraft(e.target.value)}
			onBlur={() => draft !== value && onCommit(draft)}
			onKeyDown={e => {
				if (e.key === 'Enter') onCommit(draft);
				else if (e.key === 'Escape') setDraft(value);
			}}
		/>
	);
}

export function TextField({
	label,
	value,
	placeholder,
	onCommit,
}: Readonly<{
	label: string;
	value: string;
	placeholder?: string;
	onCommit: (v: string) => void;
}>) {
	return (
		<label className="_svgField">
			<span>{label}</span>
			<CommitInput value={value} placeholder={placeholder} onCommit={onCommit} />
		</label>
	);
}

export function NumberField({
	label,
	value,
	onCommit,
}: Readonly<{ label: string; value: string; onCommit: (v: string) => void }>) {
	return (
		<label className="_svgField">
			<span>{label}</span>
			<CommitInput value={value} type="number" onCommit={onCommit} />
		</label>
	);
}

export function SelectField({
	label,
	value,
	options,
	onCommit,
}: Readonly<{
	label: string;
	value: string;
	options: string[];
	onCommit: (v: string) => void;
}>) {
	return (
		<label className="_svgField">
			<span>{label}</span>
			<select className="_peInput" value={value} onChange={e => onCommit(e.target.value)}>
				<option value="">--</option>
				{options.map(o => (
					<option key={o} value={o}>
						{o}
					</option>
				))}
			</select>
		</label>
	);
}

// Range + numeric readout; commits on release / blur to keep undo history sane.
export function SliderField({
	label,
	value,
	min = 0,
	max = 1,
	step = 0.05,
	onCommit,
}: Readonly<{
	label: string;
	value: string;
	min?: number;
	max?: number;
	step?: number;
	onCommit: (v: string) => void;
}>) {
	const [draft, setDraft] = useState(value);
	useEffect(() => setDraft(value), [value]);
	const num = draft === '' || Number.isNaN(Number(draft)) ? max : Number(draft);
	return (
		<label className="_svgField">
			<span>{label}</span>
			<div className="_svgSliderRow">
				<input
					type="range"
					min={min}
					max={max}
					step={step}
					value={num}
					onChange={e => setDraft(e.target.value)}
					onMouseUp={() => onCommit(draft)}
					onTouchEnd={() => onCommit(draft)}
					onKeyUp={() => onCommit(draft)}
				/>
				<input
					className="_peInput _svgSliderNum"
					type="number"
					value={draft}
					onChange={e => setDraft(e.target.value)}
					onBlur={() => draft !== value && onCommit(draft)}
				/>
			</div>
		</label>
	);
}

export function ColorField({
	label,
	value,
	onCommit,
}: Readonly<{ label: string; value: string; onCommit: (v: string) => void }>) {
	return (
		<label className="_svgField">
			<span>{label}</span>
			<div className="_svgColorRow">
				<CommonColorPickerPropertyEditor
					color={{ value }}
					variableSelection={false}
					onChange={v => onCommit(v.value ?? '')}
				/>
				<CommitInput value={value} placeholder="none" onCommit={onCommit} />
				<button
					type="button"
					className="_svgTokenBtn"
					title="currentColor"
					onClick={() => onCommit('currentColor')}
				>
					cc
				</button>
				<button
					type="button"
					className="_svgTokenBtn"
					title="none"
					onClick={() => onCommit('none')}
				>
					∅
				</button>
			</div>
		</label>
	);
}
