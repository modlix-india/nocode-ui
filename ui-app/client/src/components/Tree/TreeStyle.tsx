import { useEffect, useState } from 'react';
import { usedComponents } from '../../App/usedComponents';
import { processStyleDefinition } from '../../util/styleProcessor';
import {
	findPropertyDefinitions,
	lazyStylePropertyLoadFunction,
} from '../util/lazyStylePropertyUtil';
import { propertiesDefinition } from './treeProperties';
import { styleDefaults, styleProperties, stylePropertiesForTheme } from './treeStyleProperties';

const PREFIX = '.comp.compTree';
const NAME = 'Tree';

/**
 * Structural CSS is written here rather than in a `dist/css/Tree.css` artifact so the tree is
 * never geometrically broken while the CDN copy of a theme file is missing. Only the
 * themeable values live in `dist/styleProperties/Tree.json`.
 *
 * All geometry flows through the custom properties declared on the root below. Design-scoped
 * theme props override those single values, which is what lets one set of static rules serve
 * every design without the indent width and the guide-line offset drifting apart.
 */
export default function TreeStyle({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
	const [, setReRender] = useState<number>(Date.now());

	if (globalThis.styleProperties[NAME] && !styleProperties.length && !styleDefaults.size) {
		styleProperties.splice(0, 0, ...globalThis.styleProperties[NAME]);
		styleProperties
			.filter((e: any) => !!e.dv)
			?.map(({ n: name, dv: defaultValue }: any) => styleDefaults.set(name, defaultValue));
	}

	useEffect(() => {
		const { treeDesign, colorScheme } = findPropertyDefinitions(
			propertiesDefinition,
			'treeDesign',
			'colorScheme',
		);
		const fn = lazyStylePropertyLoadFunction(
			NAME,
			(props, originalStyleProps) => {
				styleProperties.splice(0, 0, ...props);
				if (originalStyleProps) stylePropertiesForTheme.splice(0, 0, ...originalStyleProps);
				setReRender(Date.now());
			},
			styleDefaults,
			[treeDesign, colorScheme],
		);

		if (usedComponents.used(NAME)) fn();
		usedComponents.register(NAME, fn);

		return () => usedComponents.deRegister(NAME);
	}, [setReRender]);

	const css =
		`
	${PREFIX} {
		--_treeIndent: 16px;
		--_treeToggleSize: 18px;
		--_treeRowGap: 6px;
		--_treeRowAnchor: calc(var(--_treeToggleSize) / 2 + 4px);
		--_treeGuideWidth: 1px;
		--_treeGuideStyle: solid;
		--_treeGuideColor: #E5E5E5;
		--_treeOrgHGap: 24px;
		--_treeOrgVGap: 32px;
		--_treeConnectorRadius: 0px;
		--_treeColumnWidth: 240px;
		--_treeAnimDuration: 0.2s;
		--_treeAccentColor: #52BD94;

		display: flex;
		flex-direction: column;
		position: relative;
		min-width: 0;
	}

	${PREFIX} ._treeViewport { flex: 1; min-height: 0; min-width: 0; position: relative; }
	${PREFIX} ._nodes, ${PREFIX} ._children { display: flex; flex-direction: column; min-width: 0; }
	${PREFIX} ._node { position: relative; min-width: 0; }
	${PREFIX} ._nodeRow {
		display: flex; align-items: center; gap: var(--_treeRowGap);
		position: relative; min-width: 0; box-sizing: border-box;
		cursor: pointer; user-select: none;
	}
	${PREFIX} ._nodeContent {
		flex: 1; min-width: 0; display: flex; align-items: center;
		overflow: hidden; text-overflow: ellipsis; position: relative;
	}

	${PREFIX} button._toggle {
		display: inline-flex; align-items: center; justify-content: center;
		width: var(--_treeToggleSize); height: var(--_treeToggleSize);
		flex: 0 0 auto; padding: 0; margin: 0; background: none; border: none;
		color: inherit; cursor: pointer; position: relative; z-index: 1;
	}
	${PREFIX} ._leafSpacer {
		width: var(--_treeToggleSize); min-width: var(--_treeToggleSize); flex: 0 0 auto;
	}

	/* One icon rotated, rather than two swapped: free animation and no layout shift. */
	${PREFIX} ._toggle ._toggleIcon {
		display: inline-block; line-height: 1;
		transition: transform var(--_treeAnimDuration) ease;
	}
	${PREFIX} ._toggle._collapsed ._toggleIcon { transform: rotate(-90deg); }

	/* CSS-drawn plus/minus, so no icon font is required. */
	${PREFIX}._plusMinus ._toggle ._toggleIcon { display: none; }
	${PREFIX}._plusMinus ._toggle::before, ${PREFIX}._plusMinus ._toggle::after {
		content: ''; position: absolute; background: currentColor;
		transition: transform var(--_treeAnimDuration) ease, opacity var(--_treeAnimDuration) ease;
	}
	${PREFIX}._plusMinus ._toggle::before { width: 60%; height: 1.5px; }
	${PREFIX}._plusMinus ._toggle::after { height: 60%; width: 1.5px; }
	${PREFIX}._plusMinus ._toggle._expanded::after { transform: scaleY(0); opacity: 0; }

	${PREFIX} ._nodeActions {
		display: inline-flex; align-items: center; gap: 4px; flex: 0 0 auto;
		opacity: 0; transition: opacity var(--_treeAnimDuration) ease; position: relative;
	}
	${PREFIX} ._nodeRow:hover ._nodeActions,
	${PREFIX} ._node:focus-visible ._nodeActions,
	${PREFIX} ._nodeRow._selected ._nodeActions { opacity: 1; }
	${PREFIX} ._buttonAdd, ${PREFIX} ._buttonDelete {
		position: relative; cursor: pointer; background: none; border: none; color: inherit; padding: 0;
	}
	${PREFIX} ._dragHandle { position: relative; cursor: grab; }
	${PREFIX} ._checkBox { flex: 0 0 auto; position: relative; cursor: pointer; }

	${PREFIX}._dragging { cursor: grabbing; }
	${PREFIX}._dragging ._nodeRow { transition: none; }
	${PREFIX} ._nodeRow._dragSource { opacity: 0.4; }
	${PREFIX} ._nodeRow._dragSource * { pointer-events: none; }
	${PREFIX} ._dropIndicator { position: absolute; pointer-events: none; z-index: 2; }
	${PREFIX} ._dropIndicator._before { left: 0; right: 0; top: -1px; height: 0;
		border-top: 2px solid var(--_treeAccentColor); }
	${PREFIX} ._dropIndicator._after { left: 0; right: 0; bottom: -1px; height: 0;
		border-top: 2px solid var(--_treeAccentColor); }
	${PREFIX} ._dropIndicator._into { inset: 0; border: 2px solid var(--_treeAccentColor);
		border-radius: inherit; background: rgba(0,0,0,0.03); }

	${PREFIX}._readOnly ._nodeActions, ${PREFIX}._readOnly ._dragHandle { display: none; }
	${PREFIX} ._nodeRow._disabled { opacity: 0.55; cursor: default; }
	${PREFIX} ._treeEmpty { display: flex; align-items: center; justify-content: center; position: relative; }

	${PREFIX} ._node:focus, ${PREFIX} ._node:focus-visible { outline: none; }
	${PREFIX} ._node:focus-visible > ._nodeRow {
		outline: 2px solid var(--_treeAccentColor); outline-offset: 1px;
	}

	/* ---------------------------------------------------- design: indented list */
	${PREFIX}._indented ._children { padding-left: var(--_treeIndent); }
	${PREFIX}._indented ._node._collapsed > ._children { display: none; }
	${PREFIX}._indented ._children { content-visibility: auto; contain-intrinsic-block-size: auto 200px; }

	/*
	 * Guide lines are pseudo-elements on the node and its row, not extra spans per depth per
	 * row. On a tree that may hold thousands of nodes that is the difference between two DOM
	 * nodes and 2n per row.
	 */
	${PREFIX}._indented._showGuides ._children > ._node::before {
		content: ''; position: absolute;
		left: calc(-1 * var(--_treeIndent) / 2); top: 0; bottom: 0;
		border-left: var(--_treeGuideWidth) var(--_treeGuideStyle) var(--_treeGuideColor);
	}
	${PREFIX}._indented._showGuides ._children > ._node:last-child::before {
		bottom: auto; height: var(--_treeRowAnchor);
	}
	${PREFIX}._indented._showGuides ._children > ._node > ._nodeRow::before {
		content: ''; position: absolute;
		left: calc(-1 * var(--_treeIndent) / 2);
		width: calc(var(--_treeIndent) / 2 - 2px);
		top: var(--_treeRowAnchor); height: 0;
		border-top: var(--_treeGuideWidth) var(--_treeGuideStyle) var(--_treeGuideColor);
		border-bottom-left-radius: var(--_treeConnectorRadius);
		pointer-events: none;
	}
	${PREFIX}._indented ._nodes > ._node::before,
	${PREFIX}._indented ._nodes > ._node > ._nodeRow::before { display: none; }

	/* ---------------------------------------------------- design: accordion */
	${PREFIX}._accordion ._children { padding-left: 0; }
	${PREFIX}._accordion ._node::before, ${PREFIX}._accordion ._nodeRow::before { display: none; }
	${PREFIX}._accordion ._node { overflow: hidden; }
	${PREFIX}._accordion ._nodeRow { width: 100%; }
	${PREFIX}._accordion ._toggle { order: 99; margin-left: auto; }

	/*
	 * height:auto is not animatable, so the panel animates grid-template-rows 0fr -> 1fr.
	 * Pure CSS, no measurement, and it eases to the natural content height. Where the browser
	 * lacks support it simply snaps open.
	 */
	${PREFIX}._accordion ._node {
		display: grid; grid-template-rows: auto 0fr;
		transition: grid-template-rows var(--_treeAnimDuration) ease;
	}
	${PREFIX}._accordion ._node._expanded { grid-template-rows: auto 1fr; }
	${PREFIX}._accordion ._children { overflow: hidden; min-height: 0; }
	${PREFIX}._accordion ._children > ._node > ._nodeRow { padding-left: 28px; }
	${PREFIX}._accordion ._children ._children > ._node > ._nodeRow { padding-left: 44px; }

	/* ---------------------------------------------------- design: org chart */
	${PREFIX}._orgChart ._treeViewport { overflow: auto; }
	${PREFIX}._orgChart ._nodes {
		flex-direction: row; justify-content: center; gap: 0; flex-wrap: nowrap;
	}
	/*
	 * Sibling spacing is half a gap of padding on each node, not a flex gap on the container. The
	 * horizontal connector bus is drawn as one segment per child, and a flex gap leaves a hole
	 * between every pair of segments; padding keeps the child boxes touching, so the segments
	 * join into one continuous line. Padding is symmetric, so every 50% offset below still lands
	 * on the node's centre.
	 */
	${PREFIX}._orgChart ._node {
		display: flex; flex-direction: column; align-items: center;
		padding-left: calc(var(--_treeOrgHGap) / 2);
		padding-right: calc(var(--_treeOrgHGap) / 2);
	}
	${PREFIX}._orgChart ._nodeRow {
		flex: 0 0 auto; justify-content: center; text-align: center; white-space: nowrap;
	}
	${PREFIX}._orgChart ._children {
		flex-direction: row; justify-content: center; align-items: flex-start;
		gap: 0; padding-top: var(--_treeOrgVGap);
		position: relative; flex-wrap: nowrap;
	}
	${PREFIX}._orgChart ._node._collapsed > ._children { display: none; }

	/*
	 * Three pieces meet at the bus, half a level-gap below the parent row: a trunk down from the
	 * parent, the bus itself, and a drop down to each child. Guide lines are centred with a
	 * half-width offset so the trunk and the drops sit on exactly the same pixel column.
	 */
	${PREFIX}._orgChart:not(._horizontal)._showGuides ._children > ._node::before,
	${PREFIX}._orgChart:not(._horizontal)._showGuides ._children > ._node::after {
		content: ''; position: absolute; box-sizing: border-box;
		top: calc(-1 * var(--_treeOrgVGap) / 2);
	}
	${PREFIX}._orgChart:not(._horizontal)._showGuides
		._node._hasChildren._expanded > ._children::before {
		content: ''; position: absolute; box-sizing: border-box;
		top: 0; left: 50%; margin-left: calc(var(--_treeGuideWidth) / -2);
		height: calc(var(--_treeOrgVGap) / 2); width: 0;
		border-left: var(--_treeGuideWidth) var(--_treeGuideStyle) var(--_treeGuideColor);
	}
	${PREFIX}._orgChart:not(._horizontal)._showGuides ._children > ._node::before {
		left: 50%; margin-left: calc(var(--_treeGuideWidth) / -2);
		width: 0; height: calc(var(--_treeOrgVGap) / 2);
		border-left: var(--_treeGuideWidth) var(--_treeGuideStyle) var(--_treeGuideColor);
	}
	${PREFIX}._orgChart:not(._horizontal)._showGuides ._children > ._node::after {
		left: 0; right: 0; height: 0;
		border-top: var(--_treeGuideWidth) var(--_treeGuideStyle) var(--_treeGuideColor);
	}
	/*
	 * The outermost children turn a corner instead of running on to the edge, so their drop and
	 * their half of the bus are folded into one rounded elbow and the bus segment is dropped.
	 */
	${PREFIX}._orgChart:not(._horizontal)._showGuides ._children > ._node:first-child::before {
		left: calc(50% - var(--_treeGuideWidth) / 2); right: 0; width: auto; margin-left: 0;
		border-top: var(--_treeGuideWidth) var(--_treeGuideStyle) var(--_treeGuideColor);
		border-top-left-radius: var(--_treeConnectorRadius);
	}
	${PREFIX}._orgChart:not(._horizontal)._showGuides ._children > ._node:last-child::before {
		left: 0; right: calc(50% - var(--_treeGuideWidth) / 2); width: auto; margin-left: 0;
		border-left: none;
		border-right: var(--_treeGuideWidth) var(--_treeGuideStyle) var(--_treeGuideColor);
		border-top: var(--_treeGuideWidth) var(--_treeGuideStyle) var(--_treeGuideColor);
		border-top-right-radius: var(--_treeConnectorRadius);
	}
	/* An only child needs no bus: trunk and drop are a single straight line. */
	${PREFIX}._orgChart:not(._horizontal)._showGuides ._children > ._node:only-child::before {
		left: 50%; right: auto; width: 0; margin-left: calc(var(--_treeGuideWidth) / -2);
		border-right: none; border-top: none; border-radius: 0;
		border-left: var(--_treeGuideWidth) var(--_treeGuideStyle) var(--_treeGuideColor);
	}
	${PREFIX}._orgChart._showGuides ._children > ._node:first-child::after,
	${PREFIX}._orgChart._showGuides ._children > ._node:last-child::after { display: none; }
	${PREFIX}._orgChart ._nodes > ._node::before,
	${PREFIX}._orgChart ._nodes > ._node::after { display: none; }

	/* Left to right: the same three pieces, rotated a quarter turn. */
	${PREFIX}._orgChart._horizontal ._nodes { flex-direction: column; align-items: center; gap: 0; }
	${PREFIX}._orgChart._horizontal ._node {
		flex-direction: row; align-items: center;
		padding-left: 0; padding-right: 0;
		padding-top: calc(var(--_treeOrgHGap) / 2);
		padding-bottom: calc(var(--_treeOrgHGap) / 2);
	}
	${PREFIX}._orgChart._horizontal ._children {
		flex-direction: column; padding-top: 0; padding-left: var(--_treeOrgVGap);
		justify-content: center; gap: 0;
	}
	${PREFIX}._orgChart._horizontal._showGuides ._children > ._node::before,
	${PREFIX}._orgChart._horizontal._showGuides ._children > ._node::after {
		content: ''; position: absolute; box-sizing: border-box;
		left: calc(-1 * var(--_treeOrgVGap) / 2); right: auto;
	}
	${PREFIX}._orgChart._horizontal._showGuides
		._node._hasChildren._expanded > ._children::before {
		content: ''; position: absolute; box-sizing: border-box;
		top: 50%; margin-top: calc(var(--_treeGuideWidth) / -2); margin-left: 0;
		left: 0; width: calc(var(--_treeOrgVGap) / 2); height: 0;
		border-left: none;
		border-top: var(--_treeGuideWidth) var(--_treeGuideStyle) var(--_treeGuideColor);
	}
	${PREFIX}._orgChart._horizontal._showGuides ._children > ._node::before {
		top: 50%; bottom: auto; margin-top: calc(var(--_treeGuideWidth) / -2);
		width: calc(var(--_treeOrgVGap) / 2); height: 0;
		border-left: none; border-right: none; border-radius: 0;
		border-top: var(--_treeGuideWidth) var(--_treeGuideStyle) var(--_treeGuideColor);
	}
	${PREFIX}._orgChart._horizontal._showGuides ._children > ._node::after {
		top: 0; bottom: 0; width: 0; height: auto;
		border-top: none;
		border-left: var(--_treeGuideWidth) var(--_treeGuideStyle) var(--_treeGuideColor);
	}
	${PREFIX}._orgChart._horizontal._showGuides ._children > ._node:first-child::before {
		top: calc(50% - var(--_treeGuideWidth) / 2); bottom: 0; height: auto; margin-top: 0;
		border-left: var(--_treeGuideWidth) var(--_treeGuideStyle) var(--_treeGuideColor);
		border-top-left-radius: var(--_treeConnectorRadius);
	}
	${PREFIX}._orgChart._horizontal._showGuides ._children > ._node:last-child::before {
		top: 0; bottom: calc(50% - var(--_treeGuideWidth) / 2); height: auto; margin-top: 0;
		border-top: none;
		border-left: var(--_treeGuideWidth) var(--_treeGuideStyle) var(--_treeGuideColor);
		border-bottom: var(--_treeGuideWidth) var(--_treeGuideStyle) var(--_treeGuideColor);
		border-bottom-left-radius: var(--_treeConnectorRadius);
	}
	${PREFIX}._orgChart._horizontal._showGuides ._children > ._node:only-child::before {
		top: 50%; bottom: auto; height: 0; margin-top: calc(var(--_treeGuideWidth) / -2);
		border-left: none; border-bottom: none; border-radius: 0;
		border-top: var(--_treeGuideWidth) var(--_treeGuideStyle) var(--_treeGuideColor);
	}

	/* ---------------------------------------------------- design: columns */
	${PREFIX}._columns { overflow: hidden; }
	${PREFIX}._columns ._columnsViewport {
		display: flex; flex-direction: row; align-items: stretch;
		overflow-x: auto; overflow-y: hidden; height: 100%;
		scroll-snap-type: x proximity; scroll-behavior: smooth;
	}
	${PREFIX}._columns ._column {
		flex: 0 0 var(--_treeColumnWidth);
		display: flex; flex-direction: column; min-height: 0;
		scroll-snap-align: start; position: relative;
	}
	${PREFIX}._columns ._columnList {
		flex: 1; overflow-y: auto; min-height: 0; display: flex; flex-direction: column;
	}
	${PREFIX}._columns ._columnHeader {
		flex: 0 0 auto; position: sticky; top: 0; z-index: 1;
	}
	${PREFIX}._columns ._columnDivider { flex: 0 0 1px; align-self: stretch; position: relative; }
	${PREFIX}._columns ._toggle, ${PREFIX}._columns ._leafSpacer,
	${PREFIX}._columns ._node::before,
	${PREFIX}._columns ._nodeRow::before { display: none; }
	${PREFIX}._columns ._columnChevron { flex: 0 0 auto; opacity: 0.5; font-size: 10px; }
	${PREFIX}._columns ._nodeRow._leaf ._columnChevron { visibility: hidden; }
	${PREFIX}._columns ._nodeRow { width: 100%; }
	${PREFIX}._columns ._column:last-child { flex: 1 1 var(--_treeColumnWidth); }

	@keyframes _treeColumnIn { from { opacity: 0; transform: translateX(-12px); } }
	${PREFIX}._columns ._column:last-child { animation: _treeColumnIn var(--_treeAnimDuration) ease; }

	/* One column at a time on narrow screens, for free, from the flat column DOM. */
	@media screen and (max-width: 640px) {
		${PREFIX}._columns ._column:not(:last-child),
		${PREFIX}._columns ._columnDivider { display: none; }
		${PREFIX}._columns ._column:last-child { flex: 1 1 100%; }
	}

	@media (prefers-reduced-motion: reduce) {
		${PREFIX} *, ${PREFIX} *::before, ${PREFIX} *::after {
			transition-duration: 0.01ms !important; animation-duration: 0.01ms !important;
		}
	}
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="TreeCss">{css}</style>;
}
