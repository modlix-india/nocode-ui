import React, { useState } from 'react';
import { ComponentDefinition } from '../../../types/common';
import { SubHelperComponent } from '../../HelperComponents/SubHelperComponent';

interface Block {
	type: string;
	[key: string]: any;
}

function HeadingBlock({ text, level = 1 }: { text: string; level?: number }) {
	const Tag = `h${Math.min(level, 3)}` as keyof JSX.IntrinsicElements;
	return <Tag className="_craftHeading">{text}</Tag>;
}

// empty block = unfilled placeholder (seeded for layout, filled later by id) — don't paint
function TextBlock({ content }: { content: string }) {
	if (!content) return null;
	return <p className="_craftText">{content}</p>;
}

function BadgeBlock({
	label,
	styleProperties,
}: {
	label: string;
	variant?: string;
	styleProperties?: any;
}) {
	return (
		<span className="_craftBadge" style={styleProperties?.craftBadge ?? {}}>
			{label}
		</span>
	);
}

function KeyValueBlock({ items }: { items: Array<{ key: string; value: string }> }) {
	const isUrl = (val: string) => val.startsWith('http://') || val.startsWith('https://');

	return (
		<div className="_craftKeyValue">
			{items.map((item, i) => (
				<div key={i} className="_craftKvRow">
					<span className="_craftKvKey">{item.key}</span>
					<span className="_craftKvValue">
						{isUrl(item.value) ? (
							<a href={item.value} target="_blank" rel="noopener noreferrer">
								{item.value}
							</a>
						) : (
							item.value
						)}
					</span>
				</div>
			))}
		</div>
	);
}

function ImageBlock({
	url,
	thumb_url,
	caption,
	size,
	background,
	fit,
}: {
	url: string;
	thumb_url?: string;
	caption?: string;
	size?: 'thumbnail';
	background?: 'dark' | 'light';
	fit?: 'cover' | 'contain';
}) {
	if (!url && !thumb_url) return null; // placeholder, no image yet
	const classes = ['_craftImage'];
	if (size === 'thumbnail') classes.push('_thumbnail');
	if (background === 'dark') classes.push('_dark');
	if (fit === 'cover') classes.push('_cover');
	// show thumb inline, link to full-res; no url → no link
	const inlineSrc = thumb_url || url;
	const img = <img src={inlineSrc} alt={caption ?? ''} loading="lazy" />;
	return (
		<div className={classes.join(' ')}>
			{url ? (
				<a
					href={url}
					target="_blank"
					rel="noopener noreferrer"
					title="Click to view full size"
				>
					{img}
				</a>
			) : (
				img
			)}
			{caption && <span className="_craftImageCaption">{caption}</span>}
		</div>
	);
}

function TableBlock({ headers, rows }: { headers: string[]; rows: string[][] }) {
	return (
		<table className="_craftTable">
			<thead>
				<tr>
					{headers.map((h, i) => (
						<th key={i}>{h}</th>
					))}
				</tr>
			</thead>
			<tbody>
				{rows.map((row, ri) => (
					<tr key={ri}>
						{row.map((cell, ci) => (
							<td key={ci}>{cell}</td>
						))}
					</tr>
				))}
			</tbody>
		</table>
	);
}

function DividerBlock() {
	return <hr className="_craftDivider" />;
}

function MetricBlock({
	label,
	value,
	detail,
	trend,
}: {
	label: string;
	value: string;
	detail?: string;
	trend?: 'up' | 'down';
}) {
	return (
		<div className="_craftMetric">
			<span className="_craftMetricLabel">{label}</span>
			<span className="_craftMetricValue">
				{value}
				{trend && (
					<span className={`_craftMetricTrend _${trend}`}>
						{trend === 'up' ? '↑' : '↓'}
					</span>
				)}
			</span>
			{detail && <span className="_craftMetricDetail">{detail}</span>}
		</div>
	);
}

function CalloutBlock({
	text,
	variant = 'info',
}: {
	text: string;
	icon?: string;
	variant?: string;
}) {
	return <div className={`_craftCallout _${variant}`}>{text}</div>;
}

function ListBlock({ items, ordered }: { items: string[]; ordered?: boolean }) {
	const Tag = ordered ? 'ol' : 'ul';
	return (
		<Tag className="_craftList">
			{items.map((item, i) => (
				<li key={i}>{item}</li>
			))}
		</Tag>
	);
}

function RowBlock({
	children = [],
	styleProperties,
}: {
	children?: Block[];
	styleProperties?: any;
}) {
	if (!children.length) return null;
	return (
		<div className="_craftRow">
			{children.map((block, i) => (
				<CraftBlockRenderer
					key={(block as any).id ?? i}
					block={block}
					styleProperties={styleProperties}
				/>
			))}
		</div>
	);
}

function CollapsibleBlock({
	summary,
	glyph,
	children = [],
	default_expanded,
	styleProperties,
}: {
	summary: string;
	glyph?: string;
	children?: Block[];
	default_expanded?: boolean;
	styleProperties?: any;
}) {
	const [expanded, setExpanded] = useState(Boolean(default_expanded));
	if (!summary && (!children || children.length === 0)) return null;

	return (
		<div className="_craftCollapsible">
			<button
				type="button"
				className="_craftCollapsibleHeader"
				onClick={() => setExpanded(prev => !prev)}
				aria-expanded={expanded}
			>
				{glyph && <span className="_craftCollapsibleGlyph">{glyph}</span>}
				<span className="_craftCollapsibleSummary">{summary}</span>
				<span
					className={`_craftCollapsibleChevron ${expanded ? '_open' : ''}`}
					aria-hidden="true"
				>
					›
				</span>
			</button>
			{expanded && (
				<div className="_craftCollapsibleBody">
					{children.map((block, i) => (
						<CraftBlockRenderer
							key={(block as any).id ?? i}
							block={block}
							styleProperties={styleProperties}
						/>
					))}
				</div>
			)}
		</div>
	);
}

const BLOCK_RENDERERS: Record<string, React.FC<any>> = {
	heading: HeadingBlock,
	text: TextBlock,
	badge: BadgeBlock,
	key_value: KeyValueBlock,
	image: ImageBlock,
	table: TableBlock,
	divider: DividerBlock,
	metric: MetricBlock,
	callout: CalloutBlock,
	list: ListBlock,
	row: RowBlock,
	collapsible: CollapsibleBlock,
};

function CraftBlockRenderer({
	block,
	styleProperties,
}: {
	block: Block;
	styleProperties?: any;
}) {
	const Component = BLOCK_RENDERERS[block.type];
	if (!Component) return null;
	return <Component {...block} styleProperties={styleProperties} />;
}

export function CraftRenderer({
	blocks,
	definition,
	styleProperties,
}: Readonly<{
	blocks: Block[];
	definition: ComponentDefinition;
	styleProperties?: any;
}>) {
	return (
		<div className="_craftContent" style={styleProperties?.craftContent ?? {}}>
			<SubHelperComponent definition={definition} subComponentName="craftContent" />
			{blocks.map((block, i) => (
				<CraftBlockRenderer
					key={(block as any).id ?? i}
					block={block}
					styleProperties={styleProperties}
				/>
			))}
		</div>
	);
}
