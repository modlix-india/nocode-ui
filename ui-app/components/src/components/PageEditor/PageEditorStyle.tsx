import { useEffect, useState } from 'react';
import { usedComponents } from '../../App/usedComponents';
import { processStyleDefinition, StyleResolutionDefinition } from '../../util/styleProcessor';
import { lazyCSSURL } from '../util/lazyStylePropertyUtil';
import { styleDefaults, styleProperties } from './pageEditorStyleProperties';

const PREFIX = '.comp.compPageEditor';
const NAME = 'PageEditor';
export default function PageEditorStyle({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
	const [used, setUsed] = useState(usedComponents.used(NAME));

	useEffect(() => {
		const fn = () => setTimeout(() => setUsed(true), 100);

		if (usedComponents.used(NAME)) fn();
		usedComponents.register(NAME, fn);

		return () => usedComponents.deRegister(NAME);
	}, [setUsed]);
	const css =
		`
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
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return (
		<>
			{used ? <link key="externalCSS" rel="stylesheet" href={lazyCSSURL(NAME)} /> : <></>}
			<style id="PageEditorCss">{css}</style>
		</>
	);
}
