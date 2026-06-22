import React, { useState } from 'react';
import { AnimationControls } from './AnimationPanel';
import { CssAnimSpec, ElementDetails, SmilSpec } from './common';
import { ExistingAnimations } from './ExistingAnimations';
import {
	ColorField,
	CommitInput,
	NumberField,
	Section,
	SelectField,
	SliderField,
	TextField,
} from './inspectorFields';
import { PathEditor } from './PathEditor';

// Geometry attribute sets per tag (these stay presentation attributes).
const GEOMETRY: Record<string, string[]> = {
	rect: ['x', 'y', 'width', 'height', 'rx', 'ry'],
	circle: ['cx', 'cy', 'r'],
	ellipse: ['cx', 'cy', 'rx', 'ry'],
	line: ['x1', 'y1', 'x2', 'y2'],
};

// Attributes surfaced in structured sections — excluded from the raw list.
const STRUCTURED_ATTRS = new Set([
	'id',
	'style',
	'transform',
	'd',
	'points',
	'x',
	'y',
	'width',
	'height',
	'rx',
	'ry',
	'cx',
	'cy',
	'r',
	'x1',
	'y1',
	'x2',
	'y2',
]);

const TEXT_TAGS = new Set(['text', 'tspan', 'textpath']);

export interface InspectorProps {
	details: ElementDetails | null;
	onSetStyle: (prop: string, value: string) => void;
	onSetAttr: (name: string, value: string) => void;
	onRenameAttr: (oldName: string, newName: string) => void;
	onRemoveAttr: (name: string) => void;
	onSetText: (text: string) => void;
	onSetPath: (d: string) => void;
	onAddCss: (spec: CssAnimSpec) => void;
	onAddSmil: (spec: SmilSpec) => void;
	onSetSmilAttr: (animEditId: string, attr: string, value: string) => void;
	onRemoveSmil: (animEditId: string) => void;
	onDelete: () => void;
}

export function AttributeInspector({
	details,
	onSetStyle,
	onSetAttr,
	onRenameAttr,
	onRemoveAttr,
	onSetText,
	onSetPath,
	onAddCss,
	onAddSmil,
	onSetSmilAttr,
	onRemoveSmil,
	onDelete,
}: Readonly<InspectorProps>) {
	const [newName, setNewName] = useState('');
	const [newValue, setNewValue] = useState('');

	if (!details) return <div className="_svgEditorEmpty">Select an element</div>;

	const attr = (name: string) => details.attrs.find(a => a.name === name)?.value ?? '';
	// Effective value: inline style wins over presentation attribute.
	const eff = (prop: string) => details.styles[prop] ?? attr(prop) ?? '';

	const geometryAttrs = GEOMETRY[details.tag];
	const isText = TEXT_TAGS.has(details.tag) || details.hasText;

	const rawAttrs = details.attrs.filter(a => !STRUCTURED_ATTRS.has(a.name));

	const addAttribute = () => {
		if (!newName.trim()) return;
		onSetAttr(newName.trim(), newValue);
		setNewName('');
		setNewValue('');
	};

	const appendTransform = (t: string) => {
		const cur = attr('transform');
		onSetAttr('transform', cur ? `${cur} ${t}` : t);
	};

	return (
		<div className="_svgEditorInspector">
			<div className="_svgInspectorHeader">
				<span className="_tag">&lt;{details.tag}&gt;</span>
				<button type="button" className="_svgDangerButton" onClick={onDelete}>
					<i className="fa fa-solid fa-trash" /> Delete
				</button>
			</div>

			<label className="_svgField">
				<span>id</span>
				<CommitInput value={attr('id')} onCommit={v => onSetAttr('id', v)} />
			</label>

			<Section title="Fill">
				<ColorField
					label="Fill"
					value={eff('fill')}
					onCommit={v => onSetStyle('fill', v)}
				/>
				<SliderField
					label="Fill opacity"
					value={eff('fill-opacity')}
					onCommit={v => onSetStyle('fill-opacity', v)}
				/>
				<SelectField
					label="Fill rule"
					value={eff('fill-rule')}
					options={['nonzero', 'evenodd']}
					onCommit={v => onSetStyle('fill-rule', v)}
				/>
			</Section>

			<Section title="Stroke">
				<ColorField
					label="Stroke"
					value={eff('stroke')}
					onCommit={v => onSetStyle('stroke', v)}
				/>
				<NumberField
					label="Stroke width"
					value={eff('stroke-width')}
					onCommit={v => onSetStyle('stroke-width', v)}
				/>
				<SliderField
					label="Stroke opacity"
					value={eff('stroke-opacity')}
					onCommit={v => onSetStyle('stroke-opacity', v)}
				/>
				<SelectField
					label="Line cap"
					value={eff('stroke-linecap')}
					options={['butt', 'round', 'square']}
					onCommit={v => onSetStyle('stroke-linecap', v)}
				/>
				<SelectField
					label="Line join"
					value={eff('stroke-linejoin')}
					options={['miter', 'round', 'bevel']}
					onCommit={v => onSetStyle('stroke-linejoin', v)}
				/>
				<TextField
					label="Dash array"
					value={eff('stroke-dasharray')}
					placeholder="e.g. 4 2"
					onCommit={v => onSetStyle('stroke-dasharray', v)}
				/>
				<NumberField
					label="Dash offset"
					value={eff('stroke-dashoffset')}
					onCommit={v => onSetStyle('stroke-dashoffset', v)}
				/>
			</Section>

			{(geometryAttrs ||
				details.tag === 'path' ||
				details.tag === 'polygon' ||
				details.tag === 'polyline') && (
				<Section title="Geometry">
					{geometryAttrs?.map(name => (
						<NumberField
							key={name}
							label={name}
							value={attr(name)}
							onCommit={v => onSetAttr(name, v)}
						/>
					))}
					{(details.tag === 'polygon' || details.tag === 'polyline') && (
						<TextField
							label="points"
							value={attr('points')}
							onCommit={v => onSetAttr('points', v)}
						/>
					)}
					{details.tag === 'path' && <PathEditor d={attr('d')} onChange={onSetPath} />}
				</Section>
			)}

			{isText && (
				<Section title="Text & Font">
					<label className="_svgField">
						<span>Text</span>
						<CommitInput value={details.text} onCommit={onSetText} />
					</label>
					<TextField
						label="Font family"
						value={eff('font-family')}
						onCommit={v => onSetStyle('font-family', v)}
					/>
					<TextField
						label="Font size"
						value={eff('font-size')}
						onCommit={v => onSetStyle('font-size', v)}
					/>
					<SelectField
						label="Font weight"
						value={eff('font-weight')}
						options={['normal', 'bold', '100', '300', '500', '700', '900']}
						onCommit={v => onSetStyle('font-weight', v)}
					/>
					<SelectField
						label="Font style"
						value={eff('font-style')}
						options={['normal', 'italic', 'oblique']}
						onCommit={v => onSetStyle('font-style', v)}
					/>
					<SelectField
						label="Text anchor"
						value={eff('text-anchor')}
						options={['start', 'middle', 'end']}
						onCommit={v => onSetStyle('text-anchor', v)}
					/>
					<TextField
						label="Letter spacing"
						value={eff('letter-spacing')}
						onCommit={v => onSetStyle('letter-spacing', v)}
					/>
				</Section>
			)}

			<Section title="Transform" defaultOpen={false}>
				<label className="_svgField">
					<span>transform</span>
					<CommitInput
						value={attr('transform')}
						onCommit={v => onSetAttr('transform', v)}
					/>
				</label>
				<div className="_svgQuickRow">
					<button
						type="button"
						className="_svgToolButton"
						onClick={() => appendTransform('translate(0,0)')}
					>
						+translate
					</button>
					<button
						type="button"
						className="_svgToolButton"
						onClick={() => appendTransform('rotate(0)')}
					>
						+rotate
					</button>
					<button
						type="button"
						className="_svgToolButton"
						onClick={() => appendTransform('scale(1)')}
					>
						+scale
					</button>
				</div>
			</Section>

			<Section title="Effects" defaultOpen={false}>
				<SliderField
					label="Opacity"
					value={eff('opacity')}
					onCommit={v => onSetStyle('opacity', v)}
				/>
				<SelectField
					label="Visibility"
					value={eff('visibility')}
					options={['visible', 'hidden', 'collapse']}
					onCommit={v => onSetStyle('visibility', v)}
				/>
				<SelectField
					label="Display"
					value={eff('display')}
					options={['inline', 'block', 'none']}
					onCommit={v => onSetStyle('display', v)}
				/>
				<SelectField
					label="Blend mode"
					value={eff('mix-blend-mode')}
					options={['normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten']}
					onCommit={v => onSetStyle('mix-blend-mode', v)}
				/>
				<TextField
					label="Filter"
					value={eff('filter')}
					onCommit={v => onSetStyle('filter', v)}
				/>
				<TextField
					label="Clip path"
					value={eff('clip-path')}
					onCommit={v => onSetStyle('clip-path', v)}
				/>
			</Section>

			<Section title="Animation" defaultOpen={false}>
				<ExistingAnimations
					animationValue={details.styles.animation ?? ''}
					onSetAnimation={v => onSetStyle('animation', v)}
					smil={details.animations.smil}
					onSetSmilAttr={onSetSmilAttr}
					onRemoveSmil={onRemoveSmil}
				/>
				<AnimationControls onAddCss={onAddCss} onAddSmil={onAddSmil} />
			</Section>

			<Section title="All attributes" defaultOpen={false}>
				{rawAttrs.map(a => (
					<div className="_svgAttrRow" key={a.name}>
						<CommitInput value={a.name} onCommit={n => onRenameAttr(a.name, n)} />
						<CommitInput value={a.value} onCommit={v => onSetAttr(a.name, v)} />
						<button
							type="button"
							className="_svgIconButton"
							title="Remove"
							onClick={() => onRemoveAttr(a.name)}
						>
							<i className="fa fa-solid fa-xmark" />
						</button>
					</div>
				))}
				<div className="_svgAttrRow">
					<input
						className="_peInput"
						placeholder="name"
						value={newName}
						onChange={e => setNewName(e.target.value)}
					/>
					<input
						className="_peInput"
						placeholder="value"
						value={newValue}
						onChange={e => setNewValue(e.target.value)}
						onKeyDown={e => e.key === 'Enter' && addAttribute()}
					/>
					<button
						type="button"
						className="_svgIconButton"
						title="Add attribute"
						onClick={addAttribute}
					>
						<i className="fa fa-solid fa-plus" />
					</button>
				</div>
			</Section>
		</div>
	);
}
