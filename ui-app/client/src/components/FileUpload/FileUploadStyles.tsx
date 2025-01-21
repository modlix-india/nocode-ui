import React, { useState, useEffect } from 'react';
import { StylePropertyDefinition, StyleResolution } from '../../types/common';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleDefaults } from './fileUploadStyleProperties';
import { lazyStylePropertyLoadFunction } from '../util/lazyStylePropertyUtil';
import { usedComponents } from '../../App/usedComponents';

const PREFIX = '.comp.compFileUpload';
const NAME = 'FileUpload';
export default function ProgressBarStyles({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
	const [styleProperties, setStyleProperties] = useState<Array<StylePropertyDefinition>>(
		window.styleProperties[NAME] ?? [],
	);

	if (window.styleProperties[NAME] && !styleDefaults.size) {
		window.styleProperties[NAME].filter((e: any) => !!e.dv)?.map(
			({ n: name, dv: defaultValue }: any) => styleDefaults.set(name, defaultValue),
		);
	}

	useEffect(() => {
		const fn = lazyStylePropertyLoadFunction(NAME, setStyleProperties, styleDefaults);

		if (usedComponents.used(NAME)) fn();
		usedComponents.register(NAME, fn);

		return () => usedComponents.deRegister(NAME);
	}, []);
	const css =
		`
	${PREFIX} {
		display: flex;
		align-items: center;
  		width: 100%;
	}
	${PREFIX} ._hidden {
		visibility: hidden;
		width: 100%;
		position: absolute;
		height: 100%;
	}

	${PREFIX} ._fileUploadText {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		text-align: center;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	${PREFIX} ._fileUploadButton {
		display: flex;
		align-items: center;
  		cursor: pointer;
		justify-content: center;
		gap: 5px;
	}

	${PREFIX}._onlyButton ._fileUploadButton {
		width: 100% !important;
	}

	${PREFIX} ._subtext {
		text-overflow: ellipsis;
    	overflow: hidden;
    	white-space: nowrap;
	}
	${PREFIX}._droparea_design3 ._subtext {
		position: absolute;
	}
	${PREFIX} ._upload_icon_1 {
		width: 100%;
	}

	${PREFIX} ._upload_icon_1 svg, ${PREFIX} ._upload_icon_2 svg {
		width: 100%;
		height: 100%;
	}

	${PREFIX} ._upload_icon_2 {
		width: 100%;
	}
    ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="FileUploadCss">{css}</style>;
}
