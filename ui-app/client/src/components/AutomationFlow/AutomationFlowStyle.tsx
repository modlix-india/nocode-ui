import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleDefaults, styleProperties } from './automationFlowStyleProperties';

const PREFIX = '.comp.compAutomationFlow';

/**
 * Structural CSS for the flow. Every colour and size goes through a custom
 * property declared on the root (themeable through automationFlowStyleProperties),
 * so a theme value always beats these literals by cascade.
 *
 * Lanes: each lane draws its own rail on its left edge, and every lane but the
 * last draws the top (and, when the lanes rejoin, the bottom) bar across its
 * width, so the bars run exactly from the first lane's rail to the last one's.
 * In a narrow container (a phone, the chat) the lanes stack with an indent and
 * keep their labels, and the rail stays on the left.
 */
export default function AutomationFlowStyle({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
	const css =
		`
${PREFIX} {
	--_afSurface: #FFFFFF;
	--_afGround: #F7F8FA;
	--_afInk: #2C2E32;
	--_afInkMuted: #6B6D70;
	--_afBorder: #E4E6EA;
	--_afRail: #C9CDD3;
	--_afAccent: #1B56FD;
	--_afChip: #EEF2FF;
	--_afChipInk: #1E3A8A;
	--_afWhen: #7C3AED;
	--_afDo: #1B56FD;
	--_afWait: #D97706;
	--_afIf: #0E9F6E;
	--_afSplit: #0891B2;
	--_afEnd: #6B6D70;
	--_afDone: #26A48A;
	--_afWaiting: #006EC9;
	--_afWarning: #FF6E3D;
	--_afFailed: #E5484D;
	--_afCardRadius: 10px;
	--_afGap: 18px;
	--_afPanelWidth: 340px;
	--_afRailX: 11px;
	--_afIndent: 30px;

	display: block;
	position: relative;
	width: 100%;
	box-sizing: border-box;
	min-width: 0;
	container-type: inline-size;
	color: var(--_afInk);
	font-size: 14px;
	line-height: 1.45;
}
${PREFIX} button { font: inherit; color: inherit; }

${PREFIX} ._afRoot { display: flex; gap: 20px; align-items: flex-start; min-width: 0; }
/* The flow column is a container too: the lane rule under "narrow" then measures the
   column, so the lanes stack when the column is narrow (beside an open side panel in a
   narrow editor), while the panel rule still measures the whole component. */
${PREFIX} ._afFlow { flex: 1; min-width: 0; overflow-x: auto; padding: 4px 2px 8px; container-type: inline-size; }
${PREFIX} ._afEmpty { color: var(--_afInkMuted); padding: 12px 0; }

/* ── the rail ── */
${PREFIX} ._afSeq {
	position: relative;
	display: flex;
	flex-direction: column;
	padding-left: var(--_afIndent);
	min-width: 0;
}
${PREFIX} ._afSeq::before {
	content: '';
	position: absolute;
	left: var(--_afRailX);
	top: 0;
	bottom: 0;
	width: 2px;
	background: var(--_afRail);
}
${PREFIX} ._afMain::before { top: 18px; }
${PREFIX} ._afSeq > ._afSeq { padding-left: 0; }
${PREFIX} ._afSeq > ._afSeq::before { display: none; }

${PREFIX} ._afGap {
	position: relative;
	height: var(--_afGap);
	flex-shrink: 0;
}
${PREFIX} ._afGap._editable { height: calc(var(--_afGap) + 12px); }
${PREFIX} ._afAdd {
	position: absolute;
	left: calc(var(--_afRailX) - var(--_afIndent) - 9px);
	top: 50%;
	transform: translateY(-50%);
	width: 20px;
	height: 20px;
	border-radius: 50%;
	border: 1px solid var(--_afRail);
	background: var(--_afSurface);
	color: var(--_afAccent);
	font-weight: 600;
	line-height: 16px;
	padding: 0;
	cursor: pointer;
	z-index: 2;
}
${PREFIX} ._afAdd:hover, ${PREFIX} ._afGap._open ._afAdd { border-color: var(--_afAccent); }
${PREFIX} ._afAdd:focus-visible { outline: 2px solid var(--_afAccent); outline-offset: 2px; }
${PREFIX} ._afAddMenu {
	position: absolute;
	left: calc(var(--_afRailX) - var(--_afIndent) + 16px);
	top: 50%;
	z-index: 5;
	display: flex;
	flex-direction: column;
	min-width: 180px;
	padding: 4px;
	background: var(--_afSurface);
	border: 1px solid var(--_afBorder);
	border-radius: 8px;
	box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}
${PREFIX} ._afAddChoice {
	text-align: left;
	border: 0;
	background: none;
	padding: 6px 10px;
	border-radius: 6px;
	cursor: pointer;
}
${PREFIX} ._afAddChoice:hover, ${PREFIX} ._afAddChoice:focus-visible { background: var(--_afGround); outline: none; }

/* ── cards ── */
${PREFIX} ._afCard {
	position: relative;
	display: flex;
	align-items: flex-start;
	gap: 6px;
	background: var(--_afSurface);
	border: 1px solid var(--_afBorder);
	border-left: 3px solid var(--_afKind, var(--_afBorder));
	border-radius: var(--_afCardRadius);
	max-width: 560px;
	min-width: 0;
}
${PREFIX} ._afCard::before {
	content: '';
	position: absolute;
	/* the card's 3px left border shifts its padding box, hence the extra 3px */
	left: calc(var(--_afRailX) - var(--_afIndent) - 7px);
	top: 14px;
	width: 10px;
	height: 10px;
	border-radius: 50%;
	background: var(--_afSurface);
	border: 2px solid var(--_afKind, var(--_afRail));
	box-sizing: border-box;
}
${PREFIX} ._afCard._when { --_afKind: var(--_afWhen); }
${PREFIX} ._afCard._do { --_afKind: var(--_afDo); }
${PREFIX} ._afCard._wait { --_afKind: var(--_afWait); }
${PREFIX} ._afCard._if { --_afKind: var(--_afIf); }
${PREFIX} ._afCard._split { --_afKind: var(--_afSplit); }
${PREFIX} ._afCard._end { --_afKind: var(--_afEnd); }
${PREFIX} ._afCard._goto { border-style: dashed; border-left-style: solid; }
${PREFIX} ._afCard._selected { box-shadow: 0 0 0 2px var(--_afAccent); }
${PREFIX} ._afCard._hasError { border-color: var(--_afFailed); }
${PREFIX} ._afCardMain {
	flex: 1;
	display: flex;
	gap: 10px;
	align-items: baseline;
	text-align: left;
	padding: 9px 12px;
	border: 0;
	background: none;
	min-width: 0;
	border-radius: var(--_afCardRadius);
}
${PREFIX} button._afCardMain { cursor: pointer; }
${PREFIX} button._afCardMain:focus-visible { outline: 2px solid var(--_afAccent); outline-offset: 1px; }
${PREFIX} ._afVerb {
	flex-shrink: 0;
	min-width: 44px;
	font-size: 11px;
	font-weight: 700;
	letter-spacing: 0.06em;
	color: var(--_afKind, var(--_afInkMuted));
}
${PREFIX} ._afBody { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
${PREFIX} ._afSentence { overflow-wrap: anywhere; }
${PREFIX} ._afChip {
	display: inline-block;
	padding: 0 7px;
	margin: 0 1px;
	border-radius: 6px;
	background: var(--_afChip);
	color: var(--_afChipInk);
	font-weight: 500;
}
${PREFIX} ._afChip._empty {
	background: transparent;
	color: var(--_afInkMuted);
	border: 1px dashed var(--_afRail);
	font-weight: 400;
}
${PREFIX} ._afDetail { color: var(--_afInkMuted); font-size: 13px; }
${PREFIX} ._afBadges { display: flex; flex-wrap: wrap; gap: 6px; }
${PREFIX} ._afRunBadge, ${PREFIX} ._afChangedBadge, ${PREFIX} ._afIssue {
	font-size: 12px;
	padding: 1px 8px;
	border-radius: 9999px;
	background: var(--_afGround);
	color: var(--_afInkMuted);
}
${PREFIX} ._afRunBadge._done, ${PREFIX} ._afRunBadge._heard { color: var(--_afDone); }
${PREFIX} ._afRunBadge._waiting, ${PREFIX} ._afRunBadge._running { color: var(--_afWaiting); }
${PREFIX} ._afRunBadge._failed, ${PREFIX} ._afIssue._error { color: var(--_afFailed); }
${PREFIX} ._afRunBadge._timedOut, ${PREFIX} ._afIssue._warning { color: var(--_afWarning); }
${PREFIX} ._afChangedBadge { color: var(--_afAccent); }
${PREFIX} ._afCard._run_skipped, ${PREFIX} ._afCard._run_notYet { opacity: 0.6; }
${PREFIX} ._afCard._run_done::before, ${PREFIX} ._afCard._run_heard::before { background: var(--_afDone); border-color: var(--_afDone); }
${PREFIX} ._afCard._run_waiting::before { background: var(--_afWaiting); border-color: var(--_afWaiting); }
${PREFIX} ._afCard._run_failed::before { background: var(--_afFailed); border-color: var(--_afFailed); }

${PREFIX} ._afCardTools { display: flex; gap: 2px; padding: 6px 6px 0 0; flex-shrink: 0; }
${PREFIX} ._afTool {
	width: 26px;
	height: 26px;
	border: 0;
	background: none;
	border-radius: 6px;
	cursor: pointer;
	color: var(--_afInkMuted);
	padding: 0;
}
${PREFIX} ._afTool:hover:not(:disabled), ${PREFIX} ._afTool:focus-visible { background: var(--_afGround); color: var(--_afInk); outline: none; }
${PREFIX} ._afTool:disabled { opacity: 0.35; cursor: default; }
${PREFIX} ._afTool._remove:hover { color: var(--_afFailed); }

/* ── lanes ── */
${PREFIX} ._afBranch { display: flex; flex-direction: column; min-width: 0; }
${PREFIX} ._afLanes {
	display: flex;
	margin-left: calc(var(--_afRailX) - var(--_afIndent));
	margin-top: var(--_afGap);
	min-width: 0;
}
${PREFIX} ._afLane {
	position: relative;
	display: flex;
	flex-direction: column;
	flex: 1 1 0;
	min-width: 220px;
	padding-top: 10px;
	padding-right: 16px;
}
${PREFIX} ._afLane:not(:last-child) { border-top: 2px solid var(--_afRail); }
${PREFIX} ._afLane::before {
	content: '';
	position: absolute;
	left: 0;
	top: 0;
	bottom: 0;
	width: 2px;
	background: var(--_afRail);
}
${PREFIX} ._afLane:not(._closes)::before { bottom: auto; height: 10px; }
${PREFIX} ._afLane:not(._closes) > ._afSeq { padding-bottom: 4px; }
${PREFIX} ._afBranch._merged ._afLane:not(:last-child) { border-bottom: 2px solid var(--_afRail); }
${PREFIX} ._afBranch._merged > ._afLanes > ._afLane:not(._closes) { border-bottom-color: transparent; }
${PREFIX} ._afBranch._merged > ._afLanes { margin-bottom: 0; }
${PREFIX} ._afLane > ._afSeq { flex: 1; margin-left: calc(var(--_afRailX) * -1); }
${PREFIX} ._afLaneLabel {
	font-size: 11px;
	font-weight: 700;
	letter-spacing: 0.06em;
	text-transform: uppercase;
	color: var(--_afInkMuted);
	padding-left: calc(var(--_afIndent) - var(--_afRailX));
	margin-bottom: 2px;
}
${PREFIX} ._afLane._taken::before, ${PREFIX} ._afLane._taken > ._afSeq::before { background: var(--_afAccent); }
${PREFIX} ._afLane._taken > ._afLaneLabel { color: var(--_afAccent); }
${PREFIX} ._afLane._notTaken { opacity: 0.55; }
${PREFIX} ._afLaneStop { font-size: 12px; color: var(--_afInkMuted); padding: 4px 0 0 calc(var(--_afIndent) - var(--_afRailX)); }
${PREFIX} ._afOrphans { margin-top: 24px; display: flex; flex-direction: column; gap: 8px; }
${PREFIX} ._afLoose { padding-left: 0; gap: 8px; }
${PREFIX} ._afLoose::before, ${PREFIX} ._afLoose > ._afCard::before { display: none; }

/* ── side panel ── */
${PREFIX} ._afPanel {
	flex: 0 0 var(--_afPanelWidth);
	width: var(--_afPanelWidth);
	max-width: 100%;
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	gap: 12px;
	padding: 14px;
	background: var(--_afSurface);
	border: 1px solid var(--_afBorder);
	border-radius: var(--_afCardRadius);
	position: sticky;
	top: 8px;
}
${PREFIX} ._afPanelHead { display: flex; align-items: center; gap: 8px; }
${PREFIX} ._afPanelTitle { flex: 1; font-weight: 600; }
${PREFIX} ._afField { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
${PREFIX} ._afFieldLabel { font-size: 12px; font-weight: 600; color: var(--_afInkMuted); }
${PREFIX} ._afHint { font-size: 12px; color: var(--_afInkMuted); }
${PREFIX} ._afInput, ${PREFIX} ._afSelect {
	font: inherit;
	color: var(--_afInk);
	background: var(--_afSurface);
	border: 1px solid var(--_afBorder);
	border-radius: 6px;
	padding: 6px 8px;
	min-width: 0;
	box-sizing: border-box;
}
${PREFIX} ._afInput:focus, ${PREFIX} ._afSelect:focus { outline: 2px solid var(--_afAccent); outline-offset: -1px; }
${PREFIX} ._afVarInput { display: flex; gap: 6px; }
${PREFIX} ._afVarInput ._afInput { flex: 1; }
${PREFIX} ._afInsert { flex: 0 0 auto; max-width: 120px; }
${PREFIX} ._afPeriod { display: flex; gap: 6px; }
${PREFIX} ._afNumber { width: 80px; }
${PREFIX} ._afRadio { display: flex; gap: 6px; align-items: center; }
${PREFIX} ._afCond { display: flex; flex-direction: column; gap: 6px; }
${PREFIX} ._afCondRow { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
${PREFIX} ._afCondRow > ._afSelect, ${PREFIX} ._afCondRow > ._afInput { flex: 1 1 90px; }
${PREFIX} ._afJoiner { align-self: flex-start; }
${PREFIX} ._afMulti { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; flex: 1 1 100%; }
${PREFIX} ._afMulti ._afInput, ${PREFIX} ._afMulti ._afSelect { flex: 1 1 120px; }
${PREFIX} ._afMulti ._afChip { display: inline-flex; align-items: center; gap: 4px; }
${PREFIX} ._afChipX { border: 0; background: none; color: inherit; padding: 0 2px; cursor: pointer; font-size: 11px; line-height: 1; }
${PREFIX} ._afInput[aria-invalid='true'] { border-color: #B91C1C; }
${PREFIX} ._afCondProblem { flex: 1 1 100%; color: #B91C1C; font-size: 12px; }
${PREFIX} ._afLinkButton {
	align-self: flex-start;
	border: 0;
	background: none;
	color: var(--_afAccent);
	padding: 2px 0;
	cursor: pointer;
}

/* ── compact (the chat) ── */
${PREFIX} ._compact { font-size: 13px; }
${PREFIX} ._compact ._afCardMain { padding: 6px 10px; }
${PREFIX} ._compact { --_afGap: 12px; }

/* ── narrow: lanes stack with an indent, the rail stays on the left ── */
@container (max-width: 620px) {
	${PREFIX} ._afRoot._withAside { flex-direction: column; }
	${PREFIX} ._afPanel { width: 100%; flex-basis: auto; position: static; }
	${PREFIX} ._afLanes { flex-direction: column; margin-left: calc(var(--_afRailX) - var(--_afIndent) + 14px); gap: 6px; }
	${PREFIX} ._afLane { min-width: 0; padding-right: 0; border-top: 0 !important; border-bottom: 0 !important; }
	${PREFIX} ._afLane::before { bottom: 0 !important; height: auto !important; }
}
@media (max-width: 600px) {
	${PREFIX} ._afRoot._withAside { flex-direction: column; }
	${PREFIX} ._afPanel { width: 100%; flex-basis: auto; position: static; }
	${PREFIX} ._afLanes { flex-direction: column; margin-left: calc(var(--_afRailX) - var(--_afIndent) + 14px); gap: 6px; }
	${PREFIX} ._afLane { min-width: 0; padding-right: 0; border-top: 0 !important; border-bottom: 0 !important; }
	${PREFIX} ._afLane::before { bottom: 0 !important; height: auto !important; }
}
` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="AutomationFlowCss">{css}</style>;
}
