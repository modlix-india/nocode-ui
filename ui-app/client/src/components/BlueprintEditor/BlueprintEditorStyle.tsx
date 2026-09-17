import { processStyleDefinition } from '../../util/styleProcessor';
import { styleDefaults, styleProperties } from './blueprintEditorStyleProperties';

const PREFIX = '.comp.compBlueprintEditor';

/**
 * Structural CSS for the board.
 *
 * Ported from `modlix-apps/design/blueprintUX/sitezump.html`, which is the
 * design of record. Where a number below looks arbitrary it is the mockup's,
 * and it should be changed there first.
 *
 * Every rule is written against the custom properties declared on the root,
 * never against a literal. That is the whole architecture: the ink ramp alone
 * appears in about fifty rules, so an app repoints the entire board by setting
 * the ten names in the "Board Palette" group rather than fifty per-rule
 * variables.
 *
 * The literals live HERE rather than as `dv` values in the style properties
 * file, because a `dv` is injected into the theme map as a real rule that every
 * theme would then have to restate to be rid of. A property with no `dv` and no
 * theme value emits nothing, which leaves these declarations standing and lets
 * any theme value beat them by cascade.
 *
 * If a colour ever appears literally in a rule below instead of going through a
 * var(), the theme has silently lost ownership of that part of the board.
 */
export default function BlueprintEditorStyle({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
	const css =
		`
${PREFIX} {
	/* palette — the ten names a theme sets */
	--_bpSurface: #FFFFFF;
	--_bpGround: #F9FAFB;
	--_bpHairline: #F2F2F2;
	--_bpBorder: #EEEEEF;
	--_bpInk: #2C2E32;
	--_bpInk2: #56585B;
	--_bpInkMuted: #808284;
	--_bpOnInk: #FFFFFF;
	--_bpAccent: #1B56FD;
	--_bpChromeInk: #26A48A;

	/* derived ink steps, so a rule never reaches for a one-off grey */
	--_bpInkBody: #6B6D70;
	--_bpInk30: #C0C0C1;
	--_bpInk10: #EAEAEA;

	/* Surface with the picture behind it still showing through, for the label
	   over a site tile. An alpha and not a mix, because what is behind it is a
	   screenshot of a whole web page rather than a known colour. */
	--_bpSurfaceVeil: #FFFFFF99;

	/* status — pending and drifted point OPPOSITE ways and must never match */
	--_bpStatusClean: #26A48A;
	--_bpStatusPending: #006EC9;
	--_bpStatusDrifted: #FF6E3D;
	--_bpStatusFailed: #FF4954;
	--_bpWarnWash: #FEF4DB;
	--_bpWarnInk: #8A3A16;

	/* geometry */
	--_bpColumnWidth: 326px;
	--_bpRailGutter: 20px;
	--_bpBoardInset: 28px;
	--_bpCardRadius: 10px;
	/* A site tile is rounder than a plan card by 2px, which is what the
	   account screen's tiles use. Kept as its own name so matching that
	   screen does not mean rounding every card on the board. */
	--_bpTileRadius: 8px;
	--_bpControlRadius: 6px;
	--_bpPillRadius: 9999px;

	display: flex;
	flex-direction: column;
	min-width: 0;
	position: relative;
	font-weight: 500;
	font-size: 14px;
	background: var(--_bpSurface);
	color: var(--_bpInk);
}

${PREFIX} button { font: inherit; color: inherit; border: 0; background: none; cursor: pointer; }
${PREFIX} ._grow { flex: 1; }

/* ───────────────────────────── header ───────────────────────────── */
${PREFIX} ._boardHeader {
	display: flex;
	flex-direction: column;
	gap: 8px;
	padding: 26px var(--_bpBoardInset) 0;
	max-width: 820px;
}
${PREFIX} ._boardTitle {
	margin: 0;
	font-size: 25px;
	line-height: 32px;
	font-weight: 600;
	letter-spacing: -0.022em;
}
${PREFIX} ._boardDescription {
	margin: 0;
	font-weight: 400;
	font-size: 15px;
	line-height: 24px;
	color: var(--_bpInkBody);
}

/* ───────────────────────────── lens ─────────────────────────────── */
/* Features cut ACROSS bands, so they filter rather than occupy one. */
${PREFIX} ._lensRow {
	display: flex;
	align-items: center;
	gap: 8px;
	flex-wrap: wrap;
	padding: 20px var(--_bpBoardInset) 4px;
}
${PREFIX} ._lensLabel {
	font-size: 11px;
	font-weight: 600;
	text-transform: uppercase;
	letter-spacing: 0.1em;
	color: var(--_bpInkMuted);
	margin-right: 3px;
}
${PREFIX} ._lensChip {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	height: 30px;
	padding: 0 13px;
	border-radius: var(--_bpPillRadius);
	border: 1px solid var(--_bpInk10);
	font-size: 13px;
	font-weight: 500;
	color: var(--_bpInk2);
	background: var(--_bpSurface);
}
${PREFIX} ._lensChip:hover { border-color: var(--_bpInk30); }
${PREFIX} ._lensChip._selected {
	border-color: var(--_bpInk);
	background: var(--_bpInk);
	color: var(--_bpOnInk);
	font-weight: 600;
}
${PREFIX} ._lensChipCount { font-size: 11.5px; opacity: 0.6; }

/* ───────────────────────────── a band ───────────────────────────── */
${PREFIX} ._band { padding: 22px 0 4px; }
${PREFIX} ._bandHeading {
	margin: 0 0 4px;
	padding: 0 var(--_bpBoardInset);
	font-size: 11px;
	line-height: 11px;
	font-weight: 600;
	text-transform: uppercase;
	letter-spacing: 0.1em;
	color: var(--_bpInkMuted);
}
${PREFIX} ._bandSubLine {
	margin: 0 0 14px;
	padding: 0 var(--_bpBoardInset);
	font-weight: 400;
	font-size: 13.5px;
	line-height: 20px;
	color: var(--_bpInkMuted);
}
${PREFIX} ._bandHeading + ._rail { margin-top: 14px; }

/* ONLY the rail scrolls sideways. The page itself never does, which is what
   keeps a forty-page app legible instead of a single endless row. */
${PREFIX} ._rail {
	display: flex;
	align-items: flex-start;
	gap: var(--_bpRailGutter);
	overflow-x: auto;
	overflow-y: hidden;
	padding: 2px var(--_bpBoardInset) 16px;
	scroll-padding-left: var(--_bpBoardInset);
	scrollbar-width: thin;
}
${PREFIX} ._rail::-webkit-scrollbar { height: 9px; }
${PREFIX} ._rail::-webkit-scrollbar-thumb {
	background: var(--_bpInk10);
	border-radius: var(--_bpPillRadius);
	border: 3px solid var(--_bpSurface);
}
${PREFIX} ._rail::-webkit-scrollbar-track { background: transparent; }

/* ──────────────────── a column: one object ──────────────────────── */
${PREFIX} ._railColumn {
	flex: 0 0 var(--_bpColumnWidth);
	width: var(--_bpColumnWidth);
	display: flex;
	flex-direction: column;
	gap: 9px;
}
${PREFIX} ._columnHeader {
	display: flex;
	align-items: center;
	gap: 9px;
	height: 42px;
	padding: 0 13px;
	border-radius: var(--_bpCardRadius);
	background: var(--_bpGround);
	border: 1px solid transparent;
	text-align: left;
	width: 100%;
}
${PREFIX} ._columnHeader:hover { border-color: var(--_bpBorder); }
${PREFIX} ._columnHeader._selected {
	border-color: var(--_bpInk);
	box-shadow: 0 0 0 1px var(--_bpInk);
	background: var(--_bpSurface);
}
${PREFIX} ._columnIcon { color: var(--_bpInk30); font-size: 15px; }
${PREFIX} ._columnName {
	font-weight: 600;
	font-size: 14px;
	flex: 1;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
${PREFIX} ._columnRollup { font-size: 11.5px; font-weight: 500; color: var(--_bpInkMuted); }
${PREFIX} ._columnMenu { color: var(--_bpInk30); opacity: 0; font-size: 15px; }
${PREFIX} ._railColumn:hover ._columnMenu { opacity: 1; }

/* ─────────── a card: one entry of that object's plan ───────────── */
${PREFIX} ._planCard {
	border: 1px solid var(--_bpBorder);
	border-radius: var(--_bpCardRadius);
	background: var(--_bpSurface);
	padding: 11px 13px;
	cursor: pointer;
	position: relative;
	text-align: left;
	width: 100%;
	display: block;
}
${PREFIX} ._planCard:hover { border-color: var(--_bpInk30); }
${PREFIX} ._cardTitle {
	font-weight: 600;
	font-size: 13.5px;
	line-height: 19px;
	padding-right: 18px;
}
${PREFIX} ._cardDescription {
	font-weight: 400;
	font-size: 12.5px;
	line-height: 18px;
	color: var(--_bpInkMuted);
	margin-top: 2px;
}
${PREFIX} ._cardMenu {
	position: absolute;
	right: 9px;
	top: 10px;
	color: var(--_bpInk30);
	opacity: 0;
	font-size: 13px;
}
${PREFIX} ._planCard:hover ._cardMenu { opacity: 1; }
${PREFIX} ._planCard._expanded {
	border-color: var(--_bpInk30);
	cursor: default;
	box-shadow: 0 2px 14px rgba(0, 0, 0, 0.055);
}
${PREFIX} ._planCard._expanded ._cardMenu { opacity: 1; }

/* SELECTED is an ink ring, deliberately not a colour: pending and drifted
   already spend blue and amber, and a selection must not be mistaken for
   either of them. */
${PREFIX} ._planCard._selected {
	border-color: var(--_bpInk);
	box-shadow: 0 0 0 1px var(--_bpInk);
	/* Square where the marker lands, rounded everywhere else, so the bar and
	   the card share one straight edge instead of a rounded corner cutting
	   across a straight one. */
	border-radius: 0 var(--_bpCardRadius) var(--_bpCardRadius) 0;
}
${PREFIX} ._planCard._selected::before {
	content: '';
	position: absolute;
	left: -1px;
	top: -1px;
	bottom: -1px;
	width: 3px;
	/* No radius at all. A 3px bar with rounded ends reads as a bent hairline,
	   and the card is what squares off to meet it: see the rule below. */
	border-radius: 0;
	background: var(--_bpInk);
}

/* Shared chrome reads differently: no description, and its own ink. A nav bar
   is on every page and is not a decision anybody made about this one. */
${PREFIX} ._planCard._chrome {
	padding: 9px 13px;
	background: var(--_bpGround);
	border-color: transparent;
}
${PREFIX} ._planCard._chrome ._cardTitle {
	font-weight: 500;
	font-size: 13px;
	color: var(--_bpInk2);
	display: flex;
	align-items: center;
	gap: 8px;
}
${PREFIX} ._chromeCardIcon { color: var(--_bpChromeInk); font-size: 15px; }
${PREFIX} ._planCard._chrome:hover { border-color: var(--_bpInk10); }
${PREFIX} ._planCard._chrome._selected { background: var(--_bpSurface); }

/* A planned card nothing is built for: dashed, because it is a promise. */
${PREFIX} ._planCard._notBuilt { border-style: dashed; }

${PREFIX} ._addCardBox {
	border: 1px dashed var(--_bpInk10);
	border-radius: var(--_bpCardRadius);
	padding: 10px;
	text-align: center;
	color: var(--_bpInkMuted);
	font-size: 12.5px;
	font-weight: 500;
	width: 100%;
}
${PREFIX} ._addColumnBox {
	flex: 0 0 42px;
	width: 42px;
	height: 42px;
	border-radius: var(--_bpCardRadius);
	border: 1px dashed var(--_bpInk10);
	display: flex;
	align-items: center;
	justify-content: center;
	color: var(--_bpInkMuted);
}
${PREFIX} ._addCardBox:hover,
${PREFIX} ._addColumnBox:hover { border-color: var(--_bpInk30); color: var(--_bpInk2); }

/* ───────────── the expansion, inside the card ──────────────────── */
${PREFIX} ._cardDetail {
	padding-top: 12px;
	margin-top: 11px;
	border-top: 1px solid var(--_bpHairline);
}
${PREFIX} ._fieldRow { margin-bottom: 12px; }
${PREFIX} ._fieldLabel {
	display: block;
	font-size: 10.5px;
	line-height: 11px;
	font-weight: 600;
	text-transform: uppercase;
	letter-spacing: 0.09em;
	color: var(--_bpInkMuted);
	margin-bottom: 5px;
}
${PREFIX} ._fieldValue {
	background: var(--_bpGround);
	border: 1px solid var(--_bpBorder);
	border-radius: var(--_bpControlRadius);
	padding: 8px 10px;
	font-weight: 400;
	font-size: 13px;
	line-height: 19px;
}
${PREFIX} ._fieldValue._placeholder { color: var(--_bpInkMuted); }
${PREFIX} ._fieldHint {
	display: block;
	font-weight: 400;
	font-size: 12px;
	line-height: 18px;
	color: var(--_bpInkMuted);
	margin-top: 5px;
}
${PREFIX} ._optionChipRow { display: flex; flex-wrap: wrap; gap: 5px; }
${PREFIX} ._optionChip {
	height: 26px;
	padding: 0 10px;
	border-radius: var(--_bpControlRadius);
	border: 1px solid var(--_bpInk10);
	font-size: 12px;
	font-weight: 500;
	display: inline-flex;
	align-items: center;
	color: var(--_bpInk2);
	background: var(--_bpSurface);
}
${PREFIX} ._optionChip._selected {
	border-color: var(--_bpInk);
	background: var(--_bpInk);
	color: var(--_bpOnInk);
	font-weight: 600;
}

/* A wireframe, not a render. It says "roughly this shape" and cannot be
   mistaken for the page, which a real screenshot here would be. */
${PREFIX} ._previewFrame {
	border: 1px solid var(--_bpBorder);
	border-radius: var(--_bpControlRadius);
	overflow: hidden;
	background: var(--_bpSurface);
	margin-bottom: 12px;
}
${PREFIX} ._previewBody { padding: 12px; }
${PREFIX} ._previewCaption {
	padding: 6px 10px;
	border-top: 1px solid var(--_bpHairline);
	font-size: 11px;
	font-weight: 500;
	color: var(--_bpInkMuted);
}
${PREFIX} ._phHead { height: 11px; border-radius: 3px; background: var(--_bpInk10); width: 58%; }
${PREFIX} ._phText { height: 6px; border-radius: 3px; background: var(--_bpHairline); margin-top: 6px; }
${PREFIX} ._phButton {
	height: 18px;
	width: 74px;
	border-radius: var(--_bpPillRadius);
	background: var(--_bpInk);
	margin-top: 10px;
}
${PREFIX} ._phGrid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 6px;
	margin-top: 9px;
}
${PREFIX} ._phCell { height: 34px; border-radius: 4px; background: var(--_bpGround); }

${PREFIX} ._actionRow { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 13px; }
${PREFIX} ._actionButton {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: 6px;
	height: 28px;
	padding: 0 12px;
	border-radius: var(--_bpPillRadius);
	border: 1px solid rgba(0, 0, 0, 0.09);
	background: var(--_bpSurface);
	font-weight: 600;
	font-size: 13px;
	white-space: nowrap;
}
${PREFIX} ._actionButton:hover { border-color: var(--_bpInk30); }
${PREFIX} ._actionButton._primary {
	background: var(--_bpInk);
	border-color: var(--_bpInk);
	color: var(--_bpOnInk);
}
${PREFIX} ._actionButton._quiet {
	border-color: transparent;
	font-weight: 500;
	color: var(--_bpInk2);
}
${PREFIX} ._actionButton._quiet:hover { background: var(--_bpGround); }

/* ───────────────────────────── marks ───────────────────────────── */
${PREFIX} ._statusMark {
	font-size: 11.5px;
	font-weight: 500;
	white-space: nowrap;
	display: inline-flex;
	align-items: center;
	gap: 5px;
	margin-top: 6px;
}
${PREFIX} ._statusDot { width: 6px; height: 6px; border-radius: 50%; flex: none; }
${PREFIX} ._statusMark._pending { color: var(--_bpStatusPending); }
${PREFIX} ._statusMark._pending ._statusDot { background: var(--_bpStatusPending); }
/* Drifted is a dashed ring, not a filled dot: the difference has to survive
   being printed, screenshotted and looked at by someone who cannot tell blue
   from amber. */
${PREFIX} ._statusMark._drifted { color: var(--_bpStatusDrifted); }
${PREFIX} ._statusMark._drifted ._statusDot {
	background: transparent;
	border: 1.5px dashed var(--_bpStatusDrifted);
}
${PREFIX} ._statusMark._clean { color: var(--_bpStatusClean); }
${PREFIX} ._statusMark._clean ._statusDot { background: var(--_bpStatusClean); }

/* ───────────────────── notes and banners ───────────────────────── */
/* ─────────────── a planning sweep, while it runs ──────────────── */
/* The bar is the mockup's: 3px, no chrome, ink on the border wash. The line
   under it is the part that matters, because it names the object being read.
   A percentage alone tells somebody how long to wait; a name tells them what
   they are waiting for, and whether it is stuck on one thing. */
${PREFIX} ._planProgress { margin-top: 16px; max-width: 820px; }
${PREFIX} ._progressBar {
	height: 3px;
	border-radius: var(--_bpPillRadius);
	background: var(--_bpBorder);
	overflow: hidden;
}
${PREFIX} ._progressBar i {
	display: block;
	height: 100%;
	background: var(--_bpInk);
	transition: width 0.3s ease;
}
${PREFIX} ._progressLine {
	display: flex;
	align-items: center;
	gap: 8px;
	margin-top: 9px;
	font-size: 12.5px;
	font-weight: 500;
	color: var(--_bpInkMuted);
}
${PREFIX} ._progressFailed { color: var(--_bpStatusFailed); }
/* One pill per object, in the order they will be read. Capped and scrollable
   rather than allowed to grow: a site with sixty-four pages would otherwise
   push the board off the screen with a list of what it is about to do. */
${PREFIX} ._progressSteps {
	display: flex;
	flex-wrap: wrap;
	gap: 5px;
	margin-top: 10px;
	max-height: 96px;
	overflow-y: auto;
}
${PREFIX} ._progressStep {
	height: 24px;
	padding: 0 9px;
	display: inline-flex;
	align-items: center;
	border-radius: var(--_bpControlRadius);
	border: 1px solid var(--_bpBorder);
	font-size: 11.5px;
	font-weight: 500;
	color: var(--_bpInk30);
	white-space: nowrap;
}
${PREFIX} ._progressStep._working {
	border-color: var(--_bpInk);
	color: var(--_bpInk);
	font-weight: 600;
}
${PREFIX} ._progressStep._done { color: var(--_bpInk2); }
${PREFIX} ._progressStep._failed {
	border-color: var(--_bpStatusFailed);
	color: var(--_bpStatusFailed);
}
${PREFIX} ._spinner {
	width: 10px;
	height: 10px;
	border-radius: 50%;
	border: 2px solid var(--_bpInk10);
	border-top-color: var(--_bpInk);
	animation: _bpSpin 0.8s linear infinite;
	flex: none;
}
@keyframes _bpSpin { to { transform: rotate(360deg); } }

${PREFIX} ._noteAside {
	margin: 20px var(--_bpBoardInset) 0;
	padding-left: 12px;
	max-width: 760px;
	border-left: 2px solid var(--_bpInk10);
	font-weight: 400;
	font-size: 12.5px;
	line-height: 19px;
	color: var(--_bpInkMuted);
}
${PREFIX} ._noteAside b { font-weight: 600; color: var(--_bpInk2); }
${PREFIX} ._banner {
	margin: 0 var(--_bpBoardInset);
	padding: 11px 14px;
	max-width: 820px;
	border-radius: 8px;
	background: var(--_bpWarnWash);
	color: var(--_bpWarnInk);
	font-weight: 400;
	font-size: 13.5px;
	line-height: 21px;
}

/* ───────── the two screens before the board exists ─────────────── */
/* Neither is an edge case. On day one nothing has a plan, and someone who
   opens AI Studio from the account rail has not named a site yet, so these
   are what most people meet first. Both must read as an offer. */
${PREFIX} ._soloState { max-width: 660px; padding: 70px var(--_bpBoardInset) 0; }
${PREFIX} ._soloTitle {
	margin: 0 0 10px;
	font-size: 27px;
	line-height: 34px;
	font-weight: 600;
	letter-spacing: -0.022em;
}
${PREFIX} ._soloText {
	margin: 0;
	font-weight: 400;
	font-size: 15.5px;
	line-height: 25px;
	color: var(--_bpInkBody);
}

${PREFIX} ._appSearchRow {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 24px var(--_bpBoardInset) 0;
	max-width: 660px;
}
/* No rules for the search field itself, deliberately.
   It renders as "comp compTextBox" and is styled by the platform's TextBox
   stylesheet, so it looks like whatever a text box looks like in the app this
   component has been dropped into. Restyling it here would bake one product's
   look into a component meant to be reused, which is exactly the mistake the
   first version of this made. The layout below still belongs to us. */
${PREFIX} ._appSearchRow > .comp.compTextBox { flex: 1; max-width: 420px; }
${PREFIX} ._appSearchCount {
	font-size: 12px;
	font-weight: 500;
	color: var(--_bpInkMuted);
	white-space: nowrap;
}
${PREFIX} ._appSearchRow._recentLabel { padding-top: 22px; padding-bottom: 0; }

/* The site tiles, which are the account screen's project tiles.
   Square, 260px at the narrowest, in a wrapping grid three across at the
   width this screen is usually read at. Geometry only — the tile carries
   "comp compGrid _noAnchorGrid _LIGHTLOW" as well, so its shadow is the host
   theme's Grid shadow and not a number from a screenshot.

   Selectors go through ._appPickerRow > deliberately. A rule written as
   "PREFIX ._appPickerCard" has exactly the same specificity as the platform's
   ".comp.compGrid._noAnchorGrid", so which one won would come down to the
   order two independent stylesheets happened to mount in. The child selector
   settles it. */
${PREFIX} ._appPickerRow {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
	gap: 20px;
	padding: 20px var(--_bpBoardInset) 0;
	max-width: 940px;
}
${PREFIX} ._appPickerRow > ._appPickerCard {
	position: relative;
	display: block;
	width: 100%;
	min-width: 0;
	aspect-ratio: 1 / 1;
	padding: 0;
	border: none;
	border-radius: var(--_bpTileRadius);
	overflow: hidden;
	font: inherit;
	color: inherit;
	text-align: left;
	cursor: pointer;
	/* Behind the picture, and what shows when there is no picture: the same
	   near-white the board uses everywhere else, rather than a hole. */
	background-color: var(--_bpGround);
	background-repeat: no-repeat;
	background-size: 95% auto;
	background-position: center 10px;
}
/* Frosted glass over the foot of the picture, so a name stays readable on top
   of whatever the site's own page happens to look like. */
${PREFIX} ._appPickerRow > ._appPickerCard > ._appPickerFoot {
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	min-height: 25%;
	display: flex;
	flex-direction: column;
	justify-content: center;
	gap: 4px;
	padding: 8px 12px;
	background: var(--_bpSurfaceVeil);
	backdrop-filter: blur(12px);
}
/* The hover affordance. The account screen answers a hover with a row of
   action buttons; there is only one thing to do with a tile here, so the
   glass going solid is the whole gesture. */
${PREFIX} ._appPickerRow > ._appPickerCard:hover > ._appPickerFoot {
	background: var(--_bpSurface);
}
${PREFIX} ._appPickerName {
	font-size: 14px;
	font-weight: 600;
	line-height: 14px;
	color: var(--_bpInk);
}
${PREFIX} ._appPickerMeta {
	font-size: 12px;
	font-weight: 500;
	line-height: 12px;
	color: var(--_bpInkMuted);
}

/* ── the band that is a boundary, not a list ── */
/* Dashed, as the mockup has it: this is a thing that was asked for and is not
   going to be built here, so it must not look like the cards next to it that
   are. The column is wider because the answer is a paragraph, not a name. */
${PREFIX} ._railColumn._boundary { flex-basis: 420px; width: 420px; }
${PREFIX} ._railColumn._boundary ._planCard {
	border-style: dashed;
	cursor: default;
}
${PREFIX} ._railColumn._boundary ._planCard:hover { border-color: var(--_bpBorder); }
${PREFIX} ._railColumn._delivery ._planCard { cursor: default; }
${PREFIX} ._railColumn._delivery ._planCard:hover { border-color: var(--_bpBorder); }

/* ─────────────── two panes, with a grab strip ─────────────────── */
/* The board and the conversation side by side, each scrolling on its own.
   Before this the chat was a strip across the foot, and the agent's answers
   are paragraphs: a considered reply grew the strip until it had covered the
   board it was describing. Width is the thing a long answer costs now.

   Only the board state splits. The two screens before it are a column of
   prose with a box under it, and there is nothing to put beside them. */
${PREFIX}._split {
	flex-direction: row;
	align-items: stretch;
	/* The height is set inline, measured from the window: nothing above this
	   component has a definite height for a percentage to resolve against.
	   This is only the floor for the moment before the first measurement. */
	min-height: 420px;
	overflow: hidden;
}
${PREFIX}._split > ._boardPane {
	flex: 1 1 auto;
	min-width: 0;
	display: flex;
	flex-direction: column;
	overflow-y: auto;
	overflow-x: hidden;
}
${PREFIX}._split > ._chatPane {
	flex: 0 0 auto;
	min-width: 0;
	display: flex;
	flex-direction: column;
	/* Top, not bottom. The box is the first thing in the pane now, so the
	   column packs from the top and the answer fills downwards under it. */
	justify-content: flex-start;
	overflow-y: auto;
	/* No divider. Two panes of the same paper do not need a rule drawn between
	   them — the gap and the alignment already say where one ends. The edge
	   only needs to be findable when somebody goes looking for it, which is
	   what the handle below is for. */
	background: var(--_bpSurface);
}
/* Invisible until wanted, then unmistakable.
   9px of grab so it is easy to hit, nothing painted at rest, and on hover a
   rounded bar down the middle — drawn as a pseudo element so the strip can be
   wide for the pointer while the paint stays narrow for the eye. */
${PREFIX}._split > ._splitHandle {
	position: relative;
	flex: 0 0 9px;
	align-self: stretch;
	margin: 0 -4px;
	padding: 0;
	border: 0;
	background: transparent;
	cursor: col-resize;
	z-index: 20;
}
${PREFIX}._split > ._splitHandle::before {
	content: '';
	position: absolute;
	top: 14px;
	bottom: 14px;
	left: 50%;
	width: 3px;
	transform: translateX(-50%);
	border-radius: var(--_bpPillRadius);
	background: var(--_bpInk30);
	opacity: 0;
	transition: opacity 0.12s ease;
}
${PREFIX}._split > ._splitHandle:hover::before,
${PREFIX}._split > ._splitHandle:focus-visible::before,
${PREFIX}._split._dragging > ._splitHandle::before {
	opacity: 1;
}
/* Held: darker, so the thing under the pointer is the thing that is moving. */
${PREFIX}._split._dragging > ._splitHandle::before { background: var(--_bpInk); }
${PREFIX}._split > ._splitHandle:focus-visible { outline: none; }
/* Inside the pane the prompt is no longer a fixed overlay: the pane is its
   own scroller and the box sits at the bottom of it, so none of the fade or
   the spacer that kept a board clear of it applies. */
${PREFIX}._split > ._chatPane > ._promptFoot {
	position: static;
	background: none;
	padding: 16px 18px 18px;
}
${PREFIX}._split > ._chatPane > ._promptFoot > ._promptInner { max-width: none; }
${PREFIX}._split > ._boardPane > ._promptSpacer { display: none; }
/* The plan is the right pane now, so its inset comes off the left edge of
   the pane rather than the component. Nothing to change: the inset is
   padding inside the pane either way. */
/* The reply, which is markdown and can be long. It scrolls with the pane. */
${PREFIX} ._replyBody { min-width: 0; }
${PREFIX} ._replyBody ._markdown { font-size: 13px; line-height: 20px; }
${PREFIX} ._replyBody p { margin: 0 0 9px; }
${PREFIX} ._replyBody p:last-child { margin-bottom: 0; }
${PREFIX} ._replyBody ul,
${PREFIX} ._replyBody ol { margin: 6px 0; padding-left: 18px; }
${PREFIX} ._replyBody li { margin-bottom: 3px; }
${PREFIX} ._replyBody strong { font-weight: 600; color: var(--_bpInk); }
${PREFIX} ._replyBody code {
	background: var(--_bpGround);
	border-radius: 4px;
	padding: 1px 4px;
	font-size: 0.9em;
}
${PREFIX} ._replyBody pre {
	background: var(--_bpGround);
	border-radius: var(--_bpControlRadius);
	padding: 10px;
	overflow-x: auto;
	margin: 8px 0;
}
${PREFIX} ._replyBody pre code { background: none; padding: 0; }
${PREFIX} ._replyBody h1,
${PREFIX} ._replyBody h2,
${PREFIX} ._replyBody h3 {
	font-size: 13.5px;
	font-weight: 600;
	color: var(--_bpInk);
	margin: 10px 0 5px;
}

/* ──────────────── the prompt, fixed at the foot ────────────────── */
/* Fixed rather than in flow, because the board scrolls under it and the
   thing you type into must not leave with the cards. */
${PREFIX} ._promptSpacer { height: 150px; flex: none; }
${PREFIX} ._promptFoot {
	position: sticky;
	bottom: 0;
	padding: 24px var(--_bpBoardInset) 18px;
	/* Opaque by 24px, which is the padding above the first thing in here.
	   A percentage fade looked right in the mockup, where this strip is
	   usually empty, and wrong the moment it carries anything: the selection
	   chips sat in the translucent part with a band heading showing through
	   them. The fade is now only over the padding, so every child of the foot
	   stands on solid surface and the board still slides under it.
	   "transparent" rather than a white with zero alpha: the surface is a
	   theme value, and the top of this gradient has to be that colour with no
	   alpha rather than white. */
	background: linear-gradient(to bottom, transparent 0, var(--_bpSurface) 24px);
	z-index: 30;
}
${PREFIX} ._promptFoot._gate { position: static; background: none; padding-top: 34px; }
${PREFIX} ._promptInner { max-width: 780px; }
${PREFIX} ._exchangeLine {
	display: flex;
	gap: 8px;
	padding: 0 2px 8px;
	font-weight: 400;
	font-size: 13px;
	line-height: 20px;
	color: var(--_bpInkMuted);
}
${PREFIX} ._exchangeLine b { font-weight: 600; color: var(--_bpInk2); }
${PREFIX} ._exchangeDash { color: var(--_bpInk30); }
${PREFIX} ._exchangeLine._failed { color: var(--_bpStatusFailed); }
${PREFIX} ._doing { font-style: normal; color: var(--_bpInk30); margin-left: 4px; }

/* What the prompt is talking about. Chips rather than prose, because the
   selection changes with every click and a sentence would not keep up. */
${PREFIX} ._contextRow {
	display: flex;
	align-items: center;
	gap: 6px;
	flex-wrap: wrap;
	/* 9px under, which is the gap above the ask box on the gate. In the pane
	   the row sits BELOW the box instead, and inherited only the bottom
	   padding: the chips ended up touching the box they belong to while
	   floating well clear of the answer underneath. The rhythm is the same
	   either way now — one gap above, one below. */
	padding: 9px 2px;
}
${PREFIX} ._contextLabel { font-size: 11.5px; font-weight: 500; color: var(--_bpInkMuted); }
${PREFIX} ._contextChip {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	height: 26px;
	padding: 0 7px 0 10px;
	border-radius: var(--_bpPillRadius);
	background: var(--_bpInk);
	color: var(--_bpOnInk);
	font-size: 12px;
	font-weight: 500;
	max-width: 240px;
}
${PREFIX} ._contextChipText { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
${PREFIX} ._contextChipParent { font-size: 11px; opacity: 0.55; flex: none; }
${PREFIX} ._contextChipClose {
	opacity: 0.6;
	font-size: 14px;
	line-height: 1;
	flex: none;
	color: inherit;
	padding: 0;
}
${PREFIX} ._contextChipClose:hover { opacity: 1; }
${PREFIX} ._contextClear {
	font-size: 11.5px;
	font-weight: 500;
	color: var(--_bpInkMuted);
	padding: 0;
}
${PREFIX} ._contextClear:hover { color: var(--_bpInk2); }

${PREFIX} ._askBox {
	border: 1px solid var(--_bpInk10);
	border-radius: 14px;
	background: var(--_bpSurface);
	box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06);
	padding: 11px 13px 8px;
}
${PREFIX} ._askInput {
	width: 100%;
	border: 0;
	outline: 0;
	resize: none;
	background: transparent;
	min-height: 24px;
	font: 400 14.5px/22px inherit;
	font-family: inherit;
	color: var(--_bpInk);
}
${PREFIX} ._askInput::placeholder { color: var(--_bpInkMuted); }
${PREFIX} ._askRow { display: flex; align-items: center; gap: 8px; margin-top: 5px; }
${PREFIX} ._askSpacer { flex: 1; }
${PREFIX} ._askHint { font-size: 12px; font-weight: 500; color: var(--_bpInkMuted); }
${PREFIX} ._askAttach,
${PREFIX} ._askStop {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 28px;
	padding: 0 12px;
	border-radius: var(--_bpPillRadius);
	color: var(--_bpInk2);
	font-size: 13px;
	font-weight: 500;
}
${PREFIX} ._askAttach { width: 28px; padding: 0; }
${PREFIX} ._askAttach:hover,
${PREFIX} ._askStop:hover { background: var(--_bpGround); }
${PREFIX} ._askSend {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: 6px;
	height: 28px;
	width: 28px;
	border-radius: var(--_bpPillRadius);
	background: var(--_bpInk);
	color: var(--_bpOnInk);
	font-weight: 600;
	font-size: 13px;
}
${PREFIX} ._askSend._primary { width: auto; height: 32px; padding: 0 15px; }
${PREFIX} ._askSend:disabled { opacity: 0.35; cursor: default; }

/* ── what the paperclip opens ── */
${PREFIX} ._askAttachWrap { position: relative; display: inline-flex; }
${PREFIX} ._askAttachMenu {
	position: absolute;
	bottom: calc(100% + 6px);
	left: 0;
	z-index: 40;
	display: flex;
	flex-direction: column;
	min-width: 190px;
	padding: 4px;
	border-radius: var(--_bpControlRadius);
	border: 1px solid var(--_bpBorder);
	background: var(--_bpSurface);
	box-shadow: 0 6px 24px rgba(0, 0, 0, 0.1);
}
${PREFIX} ._askAttachMenu button {
	text-align: left;
	padding: 7px 9px;
	border-radius: var(--_bpControlRadius);
	font-size: 13px;
	font-weight: 500;
	color: var(--_bpInk2);
}
${PREFIX} ._askAttachMenu button:hover { background: var(--_bpGround); color: var(--_bpInk); }

/* ── what it left in the box ── */
${PREFIX} ._attachRow { display: flex; flex-wrap: wrap; gap: 6px; padding: 0 2px 8px; }
${PREFIX} ._attachChip {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	max-width: 240px;
	height: 26px;
	padding: 0 7px 0 10px;
	border-radius: var(--_bpPillRadius);
	border: 1px solid var(--_bpBorder);
	background: var(--_bpSurface);
	font-size: 12px;
	font-weight: 500;
	color: var(--_bpInk2);
}
${PREFIX} ._attachChipText { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
${PREFIX} ._attachChipClose { color: var(--_bpInk30); font-size: 14px; line-height: 1; }
${PREFIX} ._attachChipClose:hover { color: var(--_bpInk); }

/* ── the app's own files, borrowed whole ── */
/* FileBrowser is the platform's file browser, the one the page editor opens.
   Only the frame around it belongs to this component. */
${PREFIX} ._browserBackdrop {
	position: fixed;
	inset: 0;
	z-index: 60;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(0, 0, 0, 0.35);
}
${PREFIX} ._browserPanel {
	width: min(920px, 92vw);
	height: min(620px, 82vh);
	display: flex;
	overflow: hidden;
	border-radius: var(--_bpCardRadius);
	background: var(--_bpSurface);
	box-shadow: 0 18px 60px rgba(0, 0, 0, 0.25);
}
${PREFIX} ._browserPanel > * { flex: 1; min-width: 0; }

/* Advanced reveals, it does not rearrange: nothing moves when it is on. */
${PREFIX} ._advMeta {
	display: block;
	margin-top: 4px;
	font-family: monospace;
	font-size: 10.5px;
	color: var(--_bpInkMuted);
	opacity: 0.85;
}

/* The board is a wide surface by nature, but the two screens before it and
   the prompt are ordinary reading width and must hold up on a phone. */
@media (max-width: 560px) {
	${PREFIX} {
		--_bpColumnWidth: 84vw;
		--_bpBoardInset: 16px;
	}
	${PREFIX} ._soloState { padding-top: 40px; }
	${PREFIX} ._soloTitle { font-size: 22px; line-height: 28px; }
}
` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="BlueprintEditorCss">{css}</style>;
}
