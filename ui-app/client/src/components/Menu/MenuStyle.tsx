import React from 'react';
import { processStyleDefinition, processStyleValueWithFunction } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './menuStyleProperties';
import { StyleResolution } from '../../types/common';

const PREFIX = '.comp.compMenu';
export default function LinkStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const values = new Map([
		...Array.from(theme.get(StyleResolution.ALL) ?? []),
		...Array.from(styleDefaults),
	]);

	const css =
		`
	${PREFIX} {
		display: inline-flex;
		flex-direction: row;
		align-items: center;
		gap: 3px;
		text-decoration: none;
	}

	${PREFIX} ._externalButton {
		position: relative;
	}

	${PREFIX} ._icon {
		position: relative;
	}

	${PREFIX} ._caretIcon {
		position: relative;
		transition: transform 0.5s ease-in-out;
	}

	${PREFIX} ._caretIconContainer {
		flex: 1;
		text-align: right;
 	}

	${PREFIX}._default,
	${PREFIX}._default:visited {
		color: ${processStyleValueWithFunction(values.get('menuFontColor'), values)};
	}

	${PREFIX}._default._primary._isActive,
	${PREFIX}._default._primary:hover {
		color: ${processStyleValueWithFunction(values.get('menuLightFontColor'), values)};
		background: ${processStyleValueWithFunction(values.get('primaryMenuColor'), values)};
	}

	${PREFIX}._default._secondary._isActive,
	${PREFIX}._default._secondary:hover {
		color: ${processStyleValueWithFunction(values.get('menuLightFontColor'), values)};
		background: ${processStyleValueWithFunction(values.get('secondaryMenuColor'), values)};
	}

	${PREFIX}._default._tertiary._isActive,
	${PREFIX}._default._tertiary:hover {	
		color: ${processStyleValueWithFunction(values.get('menuDarkFontColor'), values)};
		background: ${processStyleValueWithFunction(values.get('tertiaryMenuColor'), values)};
	}

	${PREFIX}._default._quaternary._isActive,
	${PREFIX}._default._quaternary:hover {
		color: ${processStyleValueWithFunction(values.get('menuLightFontColor'), values)};
		background: ${processStyleValueWithFunction(values.get('quaternaryMenuColor'), values)};
	}

	${PREFIX}._default._quinary._isActive,
	${PREFIX}._default._quinary:hover {
		color: ${processStyleValueWithFunction(values.get('menuLightFontColor'), values)};
		background: ${processStyleValueWithFunction(values.get('quinaryMenuColor'), values)};
	}

	${PREFIX}._outlined._primary,
	${PREFIX}._outlined._primary:visited {
		color: ${processStyleValueWithFunction(values.get('primaryMenuColor'), values)};
		border: ${processStyleValueWithFunction(
			values.get('menuBorder'),
			values,
		)} ${processStyleValueWithFunction(values.get('primaryMenuColor'), values)};
	}

	${PREFIX}._outlined._secondary,
	${PREFIX}._outlined._secondary:visited {
		color: ${processStyleValueWithFunction(values.get('secondaryMenuColor'), values)};
		border: ${processStyleValueWithFunction(
			values.get('menuBorder'),
			values,
		)} ${processStyleValueWithFunction(values.get('secondaryMenuColor'), values)};
	}

	${PREFIX}._outlined._tertiary,
	${PREFIX}._outlined._tertiary:visited {
		color: ${processStyleValueWithFunction(values.get('tertiaryMenuColor'), values)};
		border: ${processStyleValueWithFunction(
			values.get('menuBorder'),
			values,
		)} ${processStyleValueWithFunction(values.get('tertiaryMenuColor'), values)};
	}

	${PREFIX}._outlined._quaternary,
	${PREFIX}._outlined._quaternary:visited {
		color: ${processStyleValueWithFunction(values.get('quaternaryMenuColor'), values)};
		border: ${processStyleValueWithFunction(
			values.get('menuBorder'),
			values,
		)} ${processStyleValueWithFunction(values.get('quaternaryMenuColor'), values)};
	}

	${PREFIX}._outlined._quinary,
	${PREFIX}._outlined._quinary:visited {
		color: ${processStyleValueWithFunction(values.get('quinaryMenuColor'), values)};
		border: ${processStyleValueWithFunction(
			values.get('menuBorder'),
			values,
		)} ${processStyleValueWithFunction(values.get('quinaryMenuColor'), values)};
	}
	
	${PREFIX}._outlined._primary._isActive,
	${PREFIX}._outlined._primary:hover {
		color: ${processStyleValueWithFunction(values.get('menuLightFontColor'), values)};
		background: ${processStyleValueWithFunction(values.get('primaryMenuColor'), values)};
	}

	${PREFIX}._outlined._secondary._isActive,
	${PREFIX}._outlined._secondary:hover {
		color: ${processStyleValueWithFunction(values.get('menuLightFontColor'), values)};
		background: ${processStyleValueWithFunction(values.get('secondaryMenuColor'), values)};
	}

	${PREFIX}._outlined._tertiary._isActive,
	${PREFIX}._outlined._tertiary:hover {
		color: ${processStyleValueWithFunction(values.get('menuDarkFontColor'), values)};
		background: ${processStyleValueWithFunction(values.get('tertiaryMenuColor'), values)};
	}

	${PREFIX}._outlined._quaternary._isActive,
	${PREFIX}._outlined._quaternary:hover {
		color: ${processStyleValueWithFunction(values.get('menuLightFontColor'), values)};
		background: ${processStyleValueWithFunction(values.get('quaternaryMenuColor'), values)};
	}

	${PREFIX}._outlined._quinary._isActive,
	${PREFIX}._outlined._quinary:hover {
		color: ${processStyleValueWithFunction(values.get('menuLightFontColor'), values)};
		background: ${processStyleValueWithFunction(values.get('quinaryMenuColor'), values)};
	}

	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="MenuCss">{css}</style>;
}
