import { StylePropertyDefinition } from '../../types/common';

/**
 * Looks for the report components (ReportWidget, Dashboard, ReportEditor). Every colour and
 * font is a theme variable (defaults point at the app's own theme colours), passed to the CSS
 * as custom properties on the component root, so a Dashboard's tiles look like a ReportWidget
 * without either needing the other's style sheet. The chart canvas reads the same variables
 * (reportTheme.ts).
 *
 * This file is on the page load path: every report entry's Style component imports it, and the
 * entries are registered eagerly. Keep it to theme variable definitions and CSS text; anything
 * that runs (hooks, colour probes, chart code) belongs in a module only the lazy parts import.
 */

/**
 * Defaults come from the theme's own text and card colours: muted text, borders and soft
 * backgrounds are mixes of the two, and the accent is the text colour on the card colour.
 * That pair reads in every theme (an app's mono theme maps several numbered colours to the same
 * grey, so a numbered accent and its text could come out identical and a button unreadable).
 * Every one stays a theme variable, so a theme can set its own.
 */
export const REPORT_VARS: Array<{ n: string; dn: string; dv: string; cp: string }> = [
	{
		n: 'reportSurfaceColor',
		dn: 'Card Background',
		dv: '<backgroundColorSeven>',
		cp: '--rp-surface',
	},
	{ n: 'reportCanvasColor', dn: 'Dashboard Background', dv: 'transparent', cp: '--rp-canvas' },
	{
		n: 'reportBorderColor',
		dn: 'Border Color',
		dv: 'color-mix(in srgb, <fontColorOne> 14%, <backgroundColorSeven>)',
		cp: '--rp-border',
	},
	{ n: 'reportTextColor', dn: 'Text Color', dv: '<fontColorOne>', cp: '--rp-text' },
	{
		n: 'reportMutedColor',
		dn: 'Muted Text Color',
		dv: 'color-mix(in srgb, <fontColorOne> 62%, <backgroundColorSeven>)',
		cp: '--rp-muted',
	},
	{ n: 'reportAccentColor', dn: 'Accent Color', dv: '<fontColorOne>', cp: '--rp-accent' },
	{
		n: 'reportAccentTextColor',
		dn: 'Text On Accent',
		dv: '<backgroundColorSeven>',
		cp: '--rp-accent-text',
	},
	{
		n: 'reportSoftColor',
		dn: 'Soft Background',
		dv: 'color-mix(in srgb, <fontColorOne> 5%, <backgroundColorSeven>)',
		cp: '--rp-soft',
	},
	{ n: 'reportErrorColor', dn: 'Error Color', dv: '<errorColor>', cp: '--rp-error' },
	{ n: 'reportFont', dn: 'Font', dv: '<primaryFont>', cp: '--rp-font' },
	{ n: 'reportTitleFont', dn: 'Title Font', dv: '<tertiaryFont>', cp: '--rp-title-font' },
	{ n: 'reportNumberFont', dn: 'Big Number Font', dv: '<senaryFont>', cp: '--rp-kpi-font' },
	{ n: 'reportSmallFont', dn: 'Small Font', dv: '<quaternaryFont>', cp: '--rp-small-font' },
	{ n: 'reportRadius', dn: 'Card Corner Radius', dv: '8px', cp: '--rp-radius' },
];

/**
 * The theme variable that draws report widget charts in a chart look (Chart/chartjs/chartLook.ts):
 * `default` (as before), `dotMatrix`, `isometric` or `wave`. It is read from the theme by the
 * chart code (reportTheme.ts), never written to the CSS, so it has no custom property.
 */
export const REPORT_CHART_LOOK_VAR = 'reportChartLook';

/**
 * Whether report charts spread their series across the palette (`true`, the default: palettes that
 * run in families of one hue, so neighbours look alike) or take it in order (`false`: a palette
 * already ordered by priority, where the second colour is the one meant for the second series).
 * Read by the chart code, never written to the CSS.
 */
export const REPORT_PALETTE_SPREAD_VAR = 'reportPaletteSpread';

/** The theme variables for one report component (all share the same names and defaults). */
export function reportStyleProperties(prefix: string): StylePropertyDefinition[] {
	return [
		...REPORT_VARS.map(v => ({
			gn: 'Reports',
			dn: v.dn,
			n: v.n,
			dv: v.dv,
			cp: v.cp,
			sel: prefix,
			np: true,
		})),
		// No selector and no CSS property: the style sheet skips it, the chart code reads it.
		{
			gn: 'Reports',
			dn: 'Chart Look',
			de:
				'How report charts are drawn: default, dotMatrix (dots), isometric (3D bars) or ' +
				'wave (ridges). Only vertical bar charts take dotMatrix and isometric, and vertical ' +
				'bar or line charts take wave; every other chart draws as before.',
			n: REPORT_CHART_LOOK_VAR,
			dv: 'default',
			np: true,
		},
		{
			gn: 'Reports',
			dn: 'Spread Palette',
			de:
				'true: series take colours spread across the chart palette (palettes in families of ' +
				'one hue). false: series take the palette in order (a palette ordered by priority).',
			n: REPORT_PALETTE_SPREAD_VAR,
			dv: 'true',
			np: true,
		},
	];
}

/** Base CSS for every report piece, under one component's prefix. */
export function reportCss(prefix: string): string {
	const P = prefix;
	return `
	${P} { font: var(--rp-font); color: var(--rp-text); min-width: 0; box-sizing: border-box; }
	${P}._rpPortal { display: contents; min-height: 0; }
	${P} *, ${P} *::before, ${P} *::after { box-sizing: border-box; }
	${P} button { font: inherit; color: inherit; }
	${P} ._rpBtn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; min-height: 30px; padding: 4px 10px; border-radius: 6px; border: 1px solid var(--rp-border); background: var(--rp-surface); cursor: pointer; white-space: nowrap; }
	${P} ._rpBtn:hover:not(:disabled) { background: var(--rp-soft); }
	${P} ._rpBtn:disabled { opacity: 0.45; cursor: default; }
	${P} ._rpBtn._primary { background: var(--rp-accent); color: var(--rp-accent-text); border-color: var(--rp-accent); }
	${P} ._rpBtn._primary:hover:not(:disabled) { background: var(--rp-accent); opacity: 0.9; }
	${P} ._rpIconBtn { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border: none; border-radius: 6px; background: transparent; cursor: pointer; color: var(--rp-muted); flex: none; }
	${P} ._rpIconBtn:hover:not(:disabled), ${P} ._rpIconBtn._on { background: var(--rp-soft); color: var(--rp-text); }
	${P} ._rpIconBtn:disabled { opacity: 0.4; cursor: default; }
	${P} ._rpInput, ${P} ._rpSelect { font: inherit; color: var(--rp-text); background: var(--rp-surface); border: 1px solid var(--rp-border); border-radius: 6px; min-height: 32px; padding: 4px 8px; min-width: 0; max-width: 100%; }
	${P} ._rpLabel { display: flex; flex-direction: column; gap: 4px; font: var(--rp-small-font); color: var(--rp-muted); min-width: 0; }
	${P} ._rpRow { display: flex; flex-wrap: wrap; gap: 8px; align-items: flex-end; }
	${P} ._rpMuted { color: var(--rp-muted); font: var(--rp-small-font); }
	${P} ._rpError { color: var(--rp-error); }

	${P} ._rpWidget { position: relative; display: flex; flex-direction: column; height: 100%; min-height: 160px; background: var(--rp-surface); border: 1px solid var(--rp-border); border-radius: var(--rp-radius); }
	${P} ._rpWidget._compact { min-height: 120px; }
	${P} ._rpWidget._full { position: fixed; inset: 12px; z-index: 10001; height: auto; box-shadow: 0 8px 40px var(--rp-border); }
	${P} ._rpBackdrop { position: fixed; inset: 0; z-index: 10000; background: var(--rp-text); opacity: 0.35; }
	${P} ._rpHead { display: flex; align-items: center; gap: 4px; padding: 8px 8px 4px 12px; min-height: 40px; }
	${P} ._rpHead._drag { cursor: grab; touch-action: none; user-select: none; }
	${P} ._rpTitle { flex: 1; min-width: 0; font: var(--rp-title-font); font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	/* A page or group heading takes the width its words need (the spacer beside it took half and cut long names to "My nu..."); only a name wider than the line wraps. */
	${P} ._rpTitle._rpPageTitle { flex: 0 1 auto; max-width: 100%; overflow: visible; text-overflow: clip; white-space: normal; overflow-wrap: anywhere; }
	${P} ._rpBadge { flex: none; font: var(--rp-small-font); padding: 2px 8px; border-radius: 10px; background: var(--rp-accent); color: var(--rp-accent-text); }
	${P} ._rpNewBar { display: flex; align-items: center; gap: 8px; padding: 6px 12px; background: var(--rp-soft); font: var(--rp-small-font); }
	${P} ._rpNewBar span { flex: 1; }
	${P} ._rpSub { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; padding: 0 12px 4px; min-height: 18px; }
	${P} ._rpChip { display: inline-flex; align-items: center; gap: 4px; padding: 2px 4px 2px 8px; border-radius: 12px; background: var(--rp-soft); font: var(--rp-small-font); }
	${P} ._rpChip button { border: none; background: transparent; cursor: pointer; padding: 0 4px; color: var(--rp-muted); }
	${P} ._rpCrumbs { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; font: var(--rp-small-font); }
	${P} ._rpCrumbs button { border: none; background: transparent; padding: 0; cursor: pointer; color: var(--rp-accent); }
	${P} ._rpBody { position: relative; flex: 1; min-height: 0; padding: 4px 12px 12px; display: flex; flex-direction: column; }
	${P} ._rpTile:has(._rpPop), ${P} ._rpTile:focus-within { z-index: 25; }
	${P} ._rpNewBar { border-radius: var(--rp-radius) var(--rp-radius) 0 0; }
	${P} ._rpCanvas { position: relative; flex: 1; min-height: 80px; overflow: hidden; }
	${P} ._rpKpi, ${P} ._rpBullet, ${P} ._rpGauge, ${P} ._rpState { overflow: hidden; }
	${P} ._rpCanvas canvas { position: absolute; inset: 0; }
	${P} ._rpKpi { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 4px; min-width: 0; }
	${P} ._rpKpiValue { font: var(--rp-kpi-font); font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	${P} ._rpKpiMore { display: flex; flex-wrap: wrap; gap: 4px 16px; }
	${P} ._rpGauge { position: relative; flex: 1; min-height: 80px; display: flex; flex-direction: column; }
	${P} ._rpGaugeValue { position: absolute; left: 0; right: 0; bottom: 8%; text-align: center; font: var(--rp-title-font); font-weight: 700; pointer-events: none; }
	${P} ._rpBullet { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 8px; }
	${P} ._rpBulletTrack { position: relative; height: 18px; border-radius: 4px; background: var(--rp-soft); }
	${P} ._rpBulletFill { position: absolute; left: 0; top: 3px; bottom: 3px; border-radius: 3px; }
	${P} ._rpBulletTarget { position: absolute; top: -3px; bottom: -3px; width: 3px; border-radius: 1px; background: var(--rp-text); }
	${P} ._rpTableWrap { flex: 1; min-height: 0; overflow: auto; }
	${P} ._rpTable { width: 100%; border-collapse: collapse; }
	${P} ._rpTable th, ${P} ._rpTable td { padding: 6px 8px; border-bottom: 1px solid var(--rp-border); text-align: left; white-space: nowrap; }
	${P} ._rpTable th { position: sticky; top: 0; background: var(--rp-surface); font: var(--rp-small-font); color: var(--rp-muted); font-weight: 600; cursor: pointer; user-select: none; }
	${P} ._rpTable td._num, ${P} ._rpTable th._num { text-align: right; font-variant-numeric: tabular-nums; }
	${P} ._rpTable tr._total td { font-weight: 600; }
	${P} ._rpCompactRows ._rpTable th, ${P} ._rpCompactRows ._rpTable td { padding: 3px 6px; }
	${P} ._rpList { list-style: none; margin: 0; padding: 0; overflow: auto; flex: 1; min-height: 0; }
	${P} ._rpList li { display: flex; align-items: center; gap: 8px; padding: 8px 0; border-bottom: 1px solid var(--rp-border); }
	${P} ._rpList li > span:first-child { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	${P} ._rpSkeleton { flex: 1; border-radius: 6px; background: linear-gradient(90deg, var(--rp-soft) 25%, var(--rp-surface) 50%, var(--rp-soft) 75%); background-size: 200% 100%; animation: _rpShimmer 1.4s infinite linear; min-height: 40px; }
	@keyframes _rpShimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }
	${P} ._rpState { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; text-align: center; padding: 8px; }
	${P} ._rpSpin { position: absolute; top: 6px; right: 12px; }
	${P} ._rpPop { position: absolute; z-index: 30; min-width: 180px; max-width: min(360px, calc(100vw - 32px)); background: var(--rp-surface); border: 1px solid var(--rp-border); border-radius: 8px; box-shadow: 0 6px 24px var(--rp-border); padding: 4px; max-height: min(70vh, 520px); overflow: auto; }
	${P} ._rpPop._right { right: 8px; }
	${P} ._rpPop._rpPopFixed { position: fixed; z-index: 10002; }
	${P} ._rpDrawer:focus, ${P} ._rpModal:focus { outline: none; }
	${P} ._rpMenuItem { display: flex; width: 100%; align-items: center; gap: 8px; padding: 7px 10px; border: none; background: transparent; border-radius: 6px; cursor: pointer; text-align: left; }
	${P} ._rpMenuItem:hover:not(:disabled), ${P} ._rpMenuItem._on { background: var(--rp-soft); }
	${P} ._rpMenuItem:disabled { opacity: 0.45; cursor: default; }
	${P} ._rpMenuItem small { margin-left: auto; color: var(--rp-muted); }
	${P} ._rpMenuItem._rpNoData { color: var(--rp-muted); }
	${P} ._rpMenuItem._rpNoData small { flex-shrink: 0; white-space: nowrap; }
	${P} ._rpMenuSep { height: 1px; margin: 4px 0; background: var(--rp-border); }
	${P} ._rpTypes { display: grid; grid-template-columns: repeat(auto-fill, minmax(104px, 1fr)); gap: 4px; width: min(360px, calc(100vw - 48px)); }
	${P} ._rpType { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 8px 4px; border: 1px solid transparent; border-radius: 6px; background: transparent; cursor: pointer; font: var(--rp-small-font); text-align: center; }
	${P} ._rpType i { font-size: 16px; color: var(--rp-accent); }
	${P} ._rpType:hover, ${P} ._rpType._on { border-color: var(--rp-border); background: var(--rp-soft); }
	${P} ._rpType._off { opacity: 0.4; cursor: not-allowed; }
	${P} ._rpType._off i { color: var(--rp-muted); }
	${P} ._rpReason { min-height: 18px; padding: 6px 4px 2px; font: var(--rp-small-font); color: var(--rp-muted); }
	${P} ._rpDrawer { position: fixed; z-index: 10001; top: 0; right: 0; bottom: 0; width: min(380px, 100vw); background: var(--rp-surface); border-left: 1px solid var(--rp-border); box-shadow: -8px 0 32px var(--rp-border); display: flex; flex-direction: column; }
	${P} ._rpDrawerHead { display: flex; align-items: center; gap: 8px; padding: 12px 16px; border-bottom: 1px solid var(--rp-border); font: var(--rp-title-font); font-weight: 600; }
	${P} ._rpDrawerHead span { flex: 1; }
	${P} ._rpDrawerBody { flex: 1; overflow: auto; padding: 12px 16px; display: flex; flex-direction: column; gap: 12px; }
	${P} ._rpDrawerFoot { display: flex; justify-content: flex-end; gap: 8px; padding: 12px 16px; border-top: 1px solid var(--rp-border); }
	${P} ._rpGroup { display: flex; flex-direction: column; gap: 8px; }
	${P} ._rpGroupTitle { font-weight: 600; }
	${P} ._rpCheck { display: flex; align-items: center; gap: 8px; cursor: pointer; }
	${P} ._rpModal { position: fixed; z-index: 10001; inset: 5vh 50% auto auto; transform: translateX(50%); width: min(960px, calc(100vw - 32px)); max-height: 90vh; background: var(--rp-surface); border: 1px solid var(--rp-border); border-radius: 10px; box-shadow: 0 8px 40px var(--rp-border); display: flex; flex-direction: column; }
	${P} ._rpModal ._rpDrawerBody { min-height: 0; }

	${P} ._rpDash { display: flex; flex-direction: column; gap: 12px; background: var(--rp-canvas); min-width: 0; }
	${P} ._rpBar { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 8px; }
	${P} ._rpBar ._rpSpacer { flex: 1; }
	${P} ._rpGroups { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; border-bottom: 1px solid var(--rp-border); }
	${P} ._rpTabs { display: flex; gap: 2px; min-width: 0; flex: 1; overflow-x: auto; scrollbar-width: thin; }
	${P} ._rpTab { flex: none; font: inherit; color: var(--rp-muted); background: transparent; border: none; border-bottom: 2px solid transparent; padding: 8px 12px; cursor: pointer; white-space: nowrap; }
	${P} ._rpTab:hover { color: var(--rp-text); }
	${P} ._rpTab[aria-selected="true"] { color: var(--rp-text); border-bottom-color: var(--rp-accent); font-weight: 600; }
	${P} ._rpGroupTools { display: flex; flex-wrap: wrap; gap: 8px; padding-bottom: 6px; margin-left: auto; }
	${P} ._rpGrid { position: relative; display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); grid-auto-rows: var(--rp-row, 72px); gap: var(--rp-gap, 12px); }
	${P} ._rpTile { position: relative; min-width: 0; min-height: 0; }
	${P} ._rpTile._dragging { z-index: 20; opacity: 0.92; }
	${P} ._rpTile._dragging ._rpWidget { box-shadow: 0 10px 30px var(--rp-border); }
	${P} ._rpGhost { border: 2px dashed var(--rp-accent); border-radius: var(--rp-radius); opacity: 0.6; pointer-events: none; }
	${P} ._rpResize { position: absolute; right: 2px; bottom: 2px; width: 16px; height: 16px; cursor: nwse-resize; touch-action: none; z-index: 5; border-right: 2px solid var(--rp-muted); border-bottom: 2px solid var(--rp-muted); border-bottom-right-radius: 4px; opacity: 0.6; }
	${P} ._rpColumn { display: flex; flex-direction: column; gap: 12px; }
	${P} ._rpColumn ._rpTile { height: var(--rp-tile-h, 260px); }
	${P} ._rpMove { display: flex; justify-content: flex-end; gap: 4px; padding-top: 4px; }
	${P} ._rpPick { position: relative; }
	${P} ._rpPickList { max-height: 260px; overflow: auto; display: flex; flex-direction: column; }
	${P} ._rpLib { display: flex; flex-direction: column; gap: 8px; }
	${P} ._rpLibRow { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; padding: 10px 12px; background: var(--rp-surface); border: 1px solid var(--rp-border); border-radius: var(--rp-radius); }
	${P} ._rpLibName { flex: 1; min-width: 160px; display: flex; flex-direction: column; gap: 2px; }
	${P} ._rpEditor { display: grid; grid-template-columns: minmax(280px, 380px) minmax(0, 1fr); gap: 16px; align-items: start; }
	${P} ._rpEditorForm { display: flex; flex-direction: column; gap: 14px; }
	${P} ._rpEditorPreview { position: sticky; top: 8px; height: 420px; display: flex; flex-direction: column; gap: 8px; min-width: 0; }
	${P} ._rpLine { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
	${P} ._rpLine > ._rpSelect, ${P} ._rpLine > ._rpInput { flex: 1 1 120px; }
	${P} ._rpLinkRow, ${P} ._rpLinkTile { cursor: pointer; }
	${P} ._rpLinkRow:hover td, ${P} li._rpLinkRow:hover { background: var(--rp-soft); }
	${P} ._rpLinkRow:focus-visible, ${P} ._rpLinkTile:focus-visible { outline: 2px solid var(--rp-accent); outline-offset: -2px; }
	${P} ._rpLinkTile { border-radius: 6px; }
	${P} ._rpLinkTile:hover ._rpKpiValue { text-decoration: underline; text-decoration-thickness: 2px; text-underline-offset: 4px; }
	${P} ._rpDelta { display: inline-flex; align-self: flex-start; align-items: center; gap: 6px; padding: 2px 8px; border-radius: 10px; background: var(--rp-soft); font: var(--rp-small-font); }
	${P} ._rpDelta._down { color: var(--rp-error); }
	${P} ._rpFoot { display: flex; align-items: center; justify-content: flex-end; flex-wrap: wrap; gap: 8px; padding: 0 12px 10px; }
	${P} ._rpLinkBtn { display: inline-flex; align-items: center; gap: 6px; border: none; background: transparent; padding: 4px 2px; cursor: pointer; color: var(--rp-accent); font: var(--rp-small-font); font-weight: 600; }
	${P} ._rpLinkBtn:hover { text-decoration: underline; }
	${P} ._rpLinkBtn:focus-visible { outline: 2px solid var(--rp-accent); border-radius: 4px; }
	${P} ._rpZoomReset { position: absolute; top: 4px; right: 4px; z-index: 2; min-height: 26px; padding: 2px 8px; font: var(--rp-small-font); }
	${P} ._rpEditor._shelves { grid-template-columns: minmax(180px, 220px) minmax(260px, 1fr) minmax(300px, 1.2fr); }
	${P} ._rpFields { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
	${P} ._rpFieldGroup { display: flex; flex-direction: column; gap: 4px; }
	${P} ._rpField { display: flex; align-items: center; gap: 6px; padding: 5px 8px; border: 1px solid var(--rp-border); border-radius: 6px; background: var(--rp-surface); cursor: grab; touch-action: none; user-select: none; text-align: left; width: 100%; }
	${P} ._rpField:hover, ${P} ._rpField:focus-visible { background: var(--rp-soft); }
	${P} ._rpField i { color: var(--rp-muted); width: 14px; text-align: center; }
	${P} ._rpShelf { display: flex; align-items: flex-start; gap: 8px; padding: 6px 8px; min-height: 40px; border: 1px dashed var(--rp-border); border-radius: 8px; }
	${P} ._rpShelf._over { border-color: var(--rp-accent); background: var(--rp-soft); }
	${P} ._rpShelfName { flex: none; width: 64px; padding-top: 5px; font: var(--rp-small-font); color: var(--rp-muted); }
	${P} ._rpShelfItems { flex: 1; display: flex; flex-wrap: wrap; gap: 6px; min-width: 0; }
	${P} ._rpShelfHint { padding-top: 5px; font: var(--rp-small-font); color: var(--rp-muted); }
	${P} ._rpPill { position: relative; display: inline-flex; align-items: center; gap: 4px; padding: 3px 4px 3px 10px; border-radius: 14px; background: var(--rp-soft); border: 1px solid var(--rp-border); font: var(--rp-small-font); max-width: 100%; }
	${P} ._rpPill._measure { background: var(--rp-accent); color: var(--rp-accent-text); border-color: var(--rp-accent); }
	${P} ._rpPill._measure ._rpIconBtn { color: var(--rp-accent-text); }
	${P} ._rpPill > button:first-child { border: none; background: transparent; padding: 0; cursor: pointer; color: inherit; font: inherit; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	${P} ._rpPill ._rpIconBtn { width: 20px; height: 20px; }
	${P} ._rpDragPill { position: fixed; z-index: 10003; pointer-events: none; padding: 4px 10px; border-radius: 14px; background: var(--rp-accent); color: var(--rp-accent-text); font: var(--rp-small-font); box-shadow: 0 6px 18px var(--rp-border); }
	${P} ._rpEditorSide { display: flex; flex-direction: column; gap: 12px; min-width: 0; }
	${P} ._rpEditorSide ._rpEditorPreview { position: relative; top: 0; height: 340px; }
	${P} ._rpHistory { display: flex; gap: 2px; }
	${P} ._rpDrop { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; min-height: 120px; padding: 16px; border: 2px dashed var(--rp-border); border-radius: var(--rp-radius); background: var(--rp-soft); cursor: pointer; text-align: center; }
	${P} ._rpDrop:hover, ${P} ._rpDrop:focus-within { border-color: var(--rp-accent); }
	${P} ._rpDrop i { font-size: 24px; color: var(--rp-muted); }
	${P} ._rpDrop input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
	${P} ._rpProgress { width: 100%; height: 10px; accent-color: var(--rp-accent); }
	${P} ._rpImport { max-height: 46vh; border: 1px solid var(--rp-border); border-radius: 6px; }
	${P} ._rpImport th { cursor: default; vertical-align: top; min-width: 150px; }
	${P} ._rpImport ._skip { opacity: 0.45; }
	${P} ._rpImportHead { display: flex; flex-direction: column; gap: 4px; font-weight: 400; }
	${P} ._rpAsk { display: flex; flex-direction: column; gap: 8px; padding: 10px 12px; border: 1px solid var(--rp-border); border-radius: var(--rp-radius); background: var(--rp-soft); }
	${P} ._rpAsk form { display: flex; gap: 8px; align-items: flex-start; }
	${P} ._rpAsk textarea { flex: 1; resize: vertical; min-height: 36px; }
	${P} ._rpAskChoices { display: flex; flex-wrap: wrap; gap: 6px; }
	${P} ._rpSummary { padding: 6px 10px; border-left: 3px solid var(--rp-accent); background: var(--rp-soft); border-radius: 4px; }
	${P} ._rpBuilder { display: flex; flex-direction: column; gap: 14px; min-width: 0; }
	${P} ._rpBuilderTop { display: flex; align-items: center; gap: 12px; }
	${P} ._rpBuilderTitle { font: var(--rp-title-font); font-weight: 600; }
	${P} ._rpBuilderMain { display: grid; grid-template-columns: minmax(260px, 360px) minmax(0, 1fr); gap: 20px; align-items: start; }
	${P} ._rpBuilderForm { display: flex; flex-direction: column; gap: 14px; min-width: 0; }
	${P} ._rpQuestions { display: flex; flex-direction: column; gap: 14px; }
	${P} ._rpBuilder ._rpEditorSide ._rpEditorPreview { height: 420px; }
	${P} ._rpSuggest { display: flex; flex-wrap: wrap; gap: 4px; }
	${P} ._rpSuggest ._rpType { flex: 0 0 auto; min-width: 84px; }
	${P} ._rpMoreOptions { border-top: 1px solid var(--rp-border); padding-top: 10px; }
	${P} ._rpMoreOptions > summary { cursor: pointer; font-weight: 600; padding: 4px 0; }
	${P} ._rpMoreOptions[open] > summary { margin-bottom: 12px; }
	${P} ._rpBuilderFoot { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; padding-top: 12px; border-top: 1px solid var(--rp-border); }
	${P} ._rpListHead { align-items: center; }
	${P} ._rpCards { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; }
	${P} ._rpCard { display: flex; flex-direction: column; min-width: 0; background: var(--rp-surface); border: 1px solid var(--rp-border); border-radius: var(--rp-radius); overflow: hidden; }
	${P} ._rpCardMini { height: 128px; padding: 8px 12px 0; pointer-events: none; overflow: hidden; }
	${P} ._rpCardMini ._rpTableWrap, ${P} ._rpCardMini ._rpList { pointer-events: auto; overscroll-behavior: contain; }
	${P} ._rpCardMini ._rpWidget._mini { min-height: 0; height: 100%; border: none; border-radius: 0; background: transparent; }
	${P} ._rpCardMini ._rpWidget._mini ._rpBody { padding: 0; }
	${P} ._rpCardMini:has(._rpKpi) { height: 88px; }
	${P} ._rpCardBody { flex: 1; display: flex; flex-direction: column; gap: 4px; padding: 8px 12px; min-width: 0; }
	${P} ._rpCardName { font: var(--rp-title-font); font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	${P} ._rpCardFoot { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 6px 8px 8px 12px; border-top: 1px solid var(--rp-border); }
	${P} ._rpSwitch { display: inline-flex; align-items: center; gap: 8px; cursor: pointer; font: var(--rp-small-font); user-select: none; }
	${P} ._rpSwitch input { position: absolute; opacity: 0; width: 1px; height: 1px; }
	${P} ._rpSwitch span { position: relative; width: 32px; height: 18px; border-radius: 9px; background: var(--rp-border); transition: background 0.15s; flex: none; }
	${P} ._rpSwitch span::after { content: ''; position: absolute; top: 2px; left: 2px; width: 14px; height: 14px; border-radius: 50%; background: var(--rp-surface); transition: transform 0.15s; }
	${P} ._rpSwitch input:checked + span { background: var(--rp-accent); }
	${P} ._rpSwitch input:checked + span::after { transform: translateX(14px); }
	${P} ._rpSwitch input:focus-visible + span { outline: 2px solid var(--rp-accent); outline-offset: 2px; }
	@media (max-width: 1100px) {
		${P} ._rpEditor._shelves { grid-template-columns: minmax(180px, 220px) minmax(0, 1fr); }
		${P} ._rpEditor._shelves ._rpEditorSide { grid-column: 1 / -1; }
	}
	@media (max-width: 720px) {
		${P} ._rpBuilderMain { grid-template-columns: minmax(0, 1fr); }
		${P} ._rpBuilder ._rpEditorSide ._rpEditorPreview { height: 320px; }
		${P} ._rpCards { grid-template-columns: minmax(0, 1fr); gap: 16px; }
		${P} ._rpColumn { gap: 16px; }
		${P} ._rpEditor { grid-template-columns: minmax(0, 1fr); }
		${P} ._rpEditor._shelves { grid-template-columns: minmax(0, 1fr); }
		${P} ._rpEditorPreview { position: relative; height: 320px; }
		${P} ._rpWidget._full { inset: 0; border-radius: 0; }
		${P} ._rpDrawer { top: auto; height: 80vh; width: 100vw; border-left: none; border-top: 1px solid var(--rp-border); }
	}
	`;
}
