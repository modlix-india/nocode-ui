import { StyleResolution } from '../../types/common';
import { useEffect, useState } from 'react';
import { usedComponents } from '../../App/usedComponents';
import { processStyleDefinition, StyleResolutionDefinition, processStyleValueWithFunction } from '../../util/styleProcessor';
import { lazyCSSURL } from '../util/lazyStylePropertyUtil';
import { styleDefaults, styleProperties } from './pageEditorStyleProperties';

const PREFIX = '.comp.compPageEditor';
const NAME = 'PageEditor';
export default function PageEditorStyle({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
	// Theme value for this component's own chrome, falling back to the literal it
	// replaced. The fallback is what makes this safe on a theme that predates the
	// variable: an absent value renders exactly as the hardcoded CSS did. Resolved
	// through processStyleValueWithFunction so a theme value that is itself a
	// `<var>` reference still resolves.
	const all = theme.get(StyleResolution.ALL) ?? new Map<string, string>();
	const t = (variable: string, fallback: string) =>
		all.get(variable) ? processStyleValueWithFunction(`<${variable}>`, all) : fallback;

	const [used, setUsed] = useState(usedComponents.used(NAME));
	usedComponents.using('KIRun Editor');

	useEffect(() => {
		const fn = () => setTimeout(() => setUsed(true), 100);

		if (usedComponents.used(NAME)) fn();
		usedComponents.register(NAME, fn);

		return () => usedComponents.deRegister(NAME);
	}, [setUsed]);
	const css =
		`
	/* The canvas is the page being designed, not editor chrome. It is deliberately
	   left out of the editor's Panel Background variable so a dark editor theme
	   never tints a page whose own body is transparent. */
	.comp.compPageEditor ._iframe iframe{
		background-color: #FFFFFF;
	}

	.comp.compPageEditor ._iframe.MOBILE_POTRAIT_SCREEN iframe{
		width: ${StyleResolutionDefinition.get('MOBILE_POTRAIT_SCREEN')?.minWidth}px;
		min-width: ${StyleResolutionDefinition.get('MOBILE_POTRAIT_SCREEN')?.minWidth}px;
	}

	.comp.compPageEditor ._iframe.MOBILE_LANDSCAPE_SCREEN iframe{
		width: ${StyleResolutionDefinition.get('MOBILE_LANDSCAPE_SCREEN')?.minWidth}px;
		min-width: ${StyleResolutionDefinition.get('MOBILE_LANDSCAPE_SCREEN')?.minWidth}px;
	}

	.comp.compPageEditor ._iframe.TABLET_POTRAIT_SCREEN iframe{
		width: ${StyleResolutionDefinition.get('TABLET_POTRAIT_SCREEN')?.minWidth}px;
		min-width: ${StyleResolutionDefinition.get('TABLET_POTRAIT_SCREEN')?.minWidth}px;
	}

	.comp.compPageEditor ._iframe.TABLET_LANDSCAPE_SCREEN iframe{
		width: ${StyleResolutionDefinition.get('TABLET_LANDSCAPE_SCREEN')?.minWidth}px;
		min-width: ${StyleResolutionDefinition.get('TABLET_LANDSCAPE_SCREEN')?.minWidth}px;
	}

	.comp.compPageEditor ._iframe.DESKTOP_SCREEN iframe{
		width: 100%;
		min-width: ${StyleResolutionDefinition.get('DESKTOP_SCREEN')?.minWidth}px;
	}

	.comp.compPageEditor ._iframe.WIDE_SCREEN iframe{
		width: 100%;
		min-width: ${StyleResolutionDefinition.get('WIDE_SCREEN')?.minWidth}px;
	}

	.comp.compPageEditor ._iframe.MOBILE_POTRAIT_SCREEN {
		width: ${StyleResolutionDefinition.get('MOBILE_POTRAIT_SCREEN')?.minWidth}px;
		min-width: ${StyleResolutionDefinition.get('MOBILE_POTRAIT_SCREEN')?.minWidth}px;
	}

	.comp.compPageEditor ._iframe.MOBILE_LANDSCAPE_SCREEN {
		width: ${StyleResolutionDefinition.get('MOBILE_LANDSCAPE_SCREEN')?.minWidth}px;
		min-width: ${StyleResolutionDefinition.get('MOBILE_LANDSCAPE_SCREEN')?.minWidth}px;
	}

	.comp.compPageEditor ._iframe.TABLET_POTRAIT_SCREEN{
		width: ${StyleResolutionDefinition.get('TABLET_POTRAIT_SCREEN')?.minWidth}px;
		min-width: ${StyleResolutionDefinition.get('TABLET_POTRAIT_SCREEN')?.minWidth}px;
	}

	.comp.compPageEditor ._iframe.TABLET_LANDSCAPE_SCREEN{
		width: ${StyleResolutionDefinition.get('TABLET_LANDSCAPE_SCREEN')?.minWidth}px;
		min-width: ${StyleResolutionDefinition.get('TABLET_LANDSCAPE_SCREEN')?.minWidth}px;
	}

	.comp.compPageEditor ._iframe.DESKTOP_SCREEN{
		width: 100%;
		min-width: ${StyleResolutionDefinition.get('DESKTOP_SCREEN')?.minWidth}px;
	}

	.comp.compPageEditor ._iframe.WIDE_SCREEN{
		width: 100%;
		min-width: ${StyleResolutionDefinition.get('WIDE_SCREEN')?.minWidth}px;
	}

	.comp.compPageEditor ._shortcutKeyEditor {
		display: flex;
		flex-direction: column;
		gap: 4px;
		width: 100%;
	}

	.comp.compPageEditor ._shortcutKeyRow {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.comp.compPageEditor ._shortcutKeyCapture {
		flex: 1;
		min-height: 24px;
		padding: 4px 8px;
		border: 1px solid rgba(127, 127, 127, 0.3);
		border-radius: 4px;
		background: transparent;
		color: inherit;
		font: inherit;
		text-align: left;
		cursor: pointer;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.comp.compPageEditor ._shortcutKeyCapture._recording {
		border-color: #2680EB;
		box-shadow: 0 0 0 2px rgba(38, 128, 235, 0.2);
	}

	.comp.compPageEditor ._shortcutKeyCapture._blocked {
		border-color: ${t('colorTwelve', '#C62828')};
	}

	.comp.compPageEditor ._shortcutKeyClear,
	.comp.compPageEditor ._shortcutKeyModeToggle {
		flex-shrink: 0;
		width: 24px;
		height: 24px;
		border: none;
		border-radius: 4px;
		background: transparent;
		color: inherit;
		opacity: 0.6;
		cursor: pointer;
	}

	.comp.compPageEditor ._shortcutKeyClear:hover,
	.comp.compPageEditor ._shortcutKeyModeToggle:hover {
		opacity: 1;
		background: rgba(127, 127, 127, 0.15);
	}

	.comp.compPageEditor ._shortcutKeyFeedback {
		font-size: 10px;
		line-height: 1.3;
	}

	.comp.compPageEditor ._shortcutKeyFeedback._shortcutKeyBlocked {
		color: ${t('colorTwelve', '#C62828')};
	}

	.comp.compPageEditor ._shortcutKeyFeedback._shortcutKeyRisky {
		color: #B26A00;
	}
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return (
		<>
			{used ? <link key="externalCSS" rel="stylesheet" href={lazyCSSURL(NAME)} /> : <></>}
			<style id="PageEditorCss">{css}</style>
		</>
	);
}
