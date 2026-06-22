import React, { useState } from 'react';
import { shortUUID } from '../../../../util/shortUUID';
import { CssAnimSpec, SmilSpec } from './common';

const CSS_PRESETS: Record<string, string> = {
	spin: 'from { transform: rotate(0deg); } to { transform: rotate(360deg); }',
	pulse: '0%,100% { transform: scale(1); } 50% { transform: scale(1.1); }',
	fade: 'from { opacity: 0; } to { opacity: 1; }',
	'draw (stroke)': 'from { stroke-dashoffset: 1000; } to { stroke-dashoffset: 0; }',
	custom: '',
};

export function SmilForm({ onAdd }: Readonly<{ onAdd: (spec: SmilSpec) => void }>) {
	const [kind, setKind] = useState<SmilSpec['kind']>('animateTransform');
	const [attributeName, setAttributeName] = useState('opacity');
	const [type, setType] = useState('rotate');
	const [mode, setMode] = useState<'fromTo' | 'values'>('fromTo');
	const [from, setFrom] = useState('0 60 60');
	const [to, setTo] = useState('360 60 60');
	const [values, setValues] = useState('');
	const [path, setPath] = useState('');
	const [dur, setDur] = useState('2s');
	const [repeatCount, setRepeatCount] = useState('indefinite');
	const [begin, setBegin] = useState('');

	const add = () => {
		const spec: SmilSpec = { kind, dur, repeatCount, begin: begin || undefined };
		if (kind === 'animateTransform') {
			spec.attributeName = 'transform';
			spec.type = type;
		} else if (kind === 'animate') {
			spec.attributeName = attributeName;
		} else {
			spec.path = path;
		}
		if (mode === 'values' && values) spec.values = values;
		else {
			spec.from = from;
			spec.to = to;
		}
		onAdd(spec);
	};

	return (
		<div className="_svgAnimForm">
			<label className="_svgField">
				<span>Type</span>
				<select
					className="_peInput"
					value={kind}
					onChange={e => setKind(e.target.value as SmilSpec['kind'])}
				>
					<option value="animate">animate</option>
					<option value="animateTransform">animateTransform</option>
					<option value="animateMotion">animateMotion</option>
				</select>
			</label>

			{kind === 'animate' && (
				<label className="_svgField">
					<span>Attribute</span>
					<input
						className="_peInput"
						value={attributeName}
						onChange={e => setAttributeName(e.target.value)}
						placeholder="opacity, fill, r ..."
					/>
				</label>
			)}
			{kind === 'animateTransform' && (
				<label className="_svgField">
					<span>Transform</span>
					<select
						className="_peInput"
						value={type}
						onChange={e => setType(e.target.value)}
					>
						{['rotate', 'scale', 'translate', 'skewX', 'skewY'].map(t => (
							<option key={t} value={t}>
								{t}
							</option>
						))}
					</select>
				</label>
			)}
			{kind === 'animateMotion' && (
				<label className="_svgField">
					<span>Path</span>
					<input
						className="_peInput"
						value={path}
						onChange={e => setPath(e.target.value)}
						placeholder="M0 0 q 50 50 100 0"
					/>
				</label>
			)}

			{kind !== 'animateMotion' && (
				<label className="_svgField">
					<span>Mode</span>
					<select
						className="_peInput"
						value={mode}
						onChange={e => setMode(e.target.value as 'fromTo' | 'values')}
					>
						<option value="fromTo">from / to</option>
						<option value="values">values</option>
					</select>
				</label>
			)}
			{kind !== 'animateMotion' && mode === 'fromTo' && (
				<>
					<label className="_svgField">
						<span>From</span>
						<input
							className="_peInput"
							value={from}
							onChange={e => setFrom(e.target.value)}
						/>
					</label>
					<label className="_svgField">
						<span>To</span>
						<input
							className="_peInput"
							value={to}
							onChange={e => setTo(e.target.value)}
						/>
					</label>
				</>
			)}
			{kind !== 'animateMotion' && mode === 'values' && (
				<label className="_svgField">
					<span>Values</span>
					<input
						className="_peInput"
						value={values}
						onChange={e => setValues(e.target.value)}
						placeholder="0;1;0"
					/>
				</label>
			)}

			<label className="_svgField">
				<span>Duration</span>
				<input className="_peInput" value={dur} onChange={e => setDur(e.target.value)} />
			</label>
			<label className="_svgField">
				<span>Repeat</span>
				<input
					className="_peInput"
					value={repeatCount}
					onChange={e => setRepeatCount(e.target.value)}
					placeholder="indefinite | 3"
				/>
			</label>
			<label className="_svgField">
				<span>Begin</span>
				<input
					className="_peInput"
					value={begin}
					onChange={e => setBegin(e.target.value)}
					placeholder="0s | click"
				/>
			</label>

			<button type="button" className="_svgPrimaryButton" onClick={add}>
				Add SMIL animation
			</button>
		</div>
	);
}

export function CssForm({ onAdd }: Readonly<{ onAdd: (spec: CssAnimSpec) => void }>) {
	const [preset, setPreset] = useState('spin');
	const [keyframes, setKeyframes] = useState(CSS_PRESETS.spin);
	const [duration, setDuration] = useState('2s');
	const [timingFunction, setTimingFunction] = useState('linear');
	const [delay, setDelay] = useState('0s');
	const [iterationCount, setIterationCount] = useState('infinite');
	const [direction, setDirection] = useState('normal');
	const [fillMode, setFillMode] = useState('none');

	const choosePreset = (p: string) => {
		setPreset(p);
		setKeyframes(CSS_PRESETS[p] ?? '');
	};

	const add = () => {
		const base = preset === 'custom' ? 'anim' : preset.replace(/[^a-z]/gi, '');
		onAdd({
			name: `svgedit-${base}-${shortUUID().slice(0, 4)}`,
			keyframes,
			duration,
			timingFunction,
			delay,
			iterationCount,
			direction,
			fillMode,
		});
	};

	return (
		<div className="_svgAnimForm">
			<label className="_svgField">
				<span>Preset</span>
				<select
					className="_peInput"
					value={preset}
					onChange={e => choosePreset(e.target.value)}
				>
					{Object.keys(CSS_PRESETS).map(p => (
						<option key={p} value={p}>
							{p}
						</option>
					))}
				</select>
			</label>
			<label className="_svgField _svgFieldWide">
				<span>Keyframes</span>
				<textarea
					className="_peInput"
					rows={3}
					value={keyframes}
					onChange={e => setKeyframes(e.target.value)}
					placeholder="from { ... } to { ... }"
				/>
			</label>
			<label className="_svgField">
				<span>Duration</span>
				<input
					className="_peInput"
					value={duration}
					onChange={e => setDuration(e.target.value)}
				/>
			</label>
			<label className="_svgField">
				<span>Timing</span>
				<input
					className="_peInput"
					value={timingFunction}
					onChange={e => setTimingFunction(e.target.value)}
				/>
			</label>
			<label className="_svgField">
				<span>Delay</span>
				<input
					className="_peInput"
					value={delay}
					onChange={e => setDelay(e.target.value)}
				/>
			</label>
			<label className="_svgField">
				<span>Iterations</span>
				<input
					className="_peInput"
					value={iterationCount}
					onChange={e => setIterationCount(e.target.value)}
				/>
			</label>
			<label className="_svgField">
				<span>Direction</span>
				<select
					className="_peInput"
					value={direction}
					onChange={e => setDirection(e.target.value)}
				>
					{['normal', 'reverse', 'alternate', 'alternate-reverse'].map(d => (
						<option key={d} value={d}>
							{d}
						</option>
					))}
				</select>
			</label>
			<label className="_svgField">
				<span>Fill mode</span>
				<select
					className="_peInput"
					value={fillMode}
					onChange={e => setFillMode(e.target.value)}
				>
					{['none', 'forwards', 'backwards', 'both'].map(f => (
						<option key={f} value={f}>
							{f}
						</option>
					))}
				</select>
			</label>
			<button
				type="button"
				className="_svgPrimaryButton"
				onClick={add}
				disabled={!keyframes.trim()}
			>
				Add CSS animation
			</button>
		</div>
	);
}

// One-click presets cover the common cases. Each is a self-contained CSS
// keyframe animation; transform-based ones pivot around the element centre.
const QUICK_PRESETS: Array<{
	label: string;
	base: string;
	keyframes: string;
	iterationCount?: string;
	fillMode?: string;
	timing?: string;
	transform?: boolean;
}> = [
	{
		label: 'Spin',
		base: 'spin',
		keyframes: 'from{transform:rotate(0)}to{transform:rotate(360deg)}',
		iterationCount: 'infinite',
		timing: 'linear',
		transform: true,
	},
	{
		label: 'Pulse',
		base: 'pulse',
		keyframes: '0%,100%{transform:scale(1)}50%{transform:scale(1.12)}',
		iterationCount: 'infinite',
		transform: true,
	},
	{
		label: 'Float',
		base: 'float',
		keyframes: '0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}',
		iterationCount: 'infinite',
		transform: true,
	},
	{
		label: 'Fade in',
		base: 'fade',
		keyframes: 'from{opacity:0}to{opacity:1}',
		iterationCount: '1',
		fillMode: 'forwards',
	},
	{
		label: 'Blink',
		base: 'blink',
		keyframes: '0%,100%{opacity:1}50%{opacity:0}',
		iterationCount: 'infinite',
	},
	{
		label: 'Draw',
		base: 'draw',
		keyframes: 'from{stroke-dashoffset:1000}to{stroke-dashoffset:0}',
		iterationCount: '1',
		fillMode: 'forwards',
	},
];

// Simple animation controls: one-click presets + a single duration, with the
// full CSS and SMIL forms tucked behind an Advanced disclosure.
export function AnimationControls({
	onAddCss,
	onAddSmil,
}: Readonly<{ onAddCss: (spec: CssAnimSpec) => void; onAddSmil: (spec: SmilSpec) => void }>) {
	const [duration, setDuration] = useState('2s');
	const [advanced, setAdvanced] = useState(false);

	const addPreset = (p: (typeof QUICK_PRESETS)[number]) =>
		onAddCss({
			name: `svgedit-${p.base}-${shortUUID().slice(0, 4)}`,
			keyframes: p.keyframes,
			duration,
			timingFunction: p.timing ?? 'ease-in-out',
			iterationCount: p.iterationCount ?? '1',
			fillMode: p.fillMode ?? 'none',
			originCenter: p.transform,
		});

	return (
		<div className="_svgSimpleAnim">
			<div className="_svgPresetGrid">
				{QUICK_PRESETS.map(p => (
					<button
						key={p.base}
						type="button"
						className="_svgPresetBtn"
						onClick={() => addPreset(p)}
					>
						{p.label}
					</button>
				))}
			</div>
			<label className="_svgField">
				<span>Duration</span>
				<input
					className="_peInput"
					value={duration}
					onChange={e => setDuration(e.target.value)}
				/>
			</label>
			<button
				type="button"
				className="_svgAdvancedToggle"
				onClick={() => setAdvanced(a => !a)}
			>
				<i className={`fa fa-solid fa-caret-${advanced ? 'down' : 'right'}`} /> Advanced
			</button>
			{advanced && (
				<div className="_svgAdvancedAnim">
					<div className="_svgSectionTitle">Custom CSS</div>
					<CssForm onAdd={onAddCss} />
					<div className="_svgSectionTitle">SMIL</div>
					<SmilForm onAdd={onAddSmil} />
				</div>
			)}
		</div>
	);
}
