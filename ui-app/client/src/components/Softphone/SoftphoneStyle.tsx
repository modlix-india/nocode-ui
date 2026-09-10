import { processStyleDefinition } from '../../util/styleProcessor';
import { styleDefaults, styleProperties } from './softphoneStyleProperties';

const PREFIX = '.comp.compSoftphone';

/**
 * The component renders nothing at run time, so this only styles the marker the page editor shows
 * so the component can be found and moved on a canvas.
 */
export default function SoftphoneStyle({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
	const css =
		`
		${PREFIX} {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 40px;
			height: 40px;
			top: 0px;
			left: 0px;
			position: fixed;
			background-color: white;
			padding: 5px;
			opacity: 0.5;
			z-index: 10;
		}

		${PREFIX}:hover {
			opacity: 1;
		}

	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="SoftphoneCss">{css}</style>;
}
