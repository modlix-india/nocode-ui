import React, { useEffect, useState } from 'react';
import { StylePropertyDefinition } from '../../types/common';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './fileUploadStyleProperties';
import { lazyStylePropertyLoadFunction } from '../util/lazyStylePropertyUtil';
import { usedComponents } from '../../App/usedComponents';

const PREFIX = '.comp.compFileUpload';
const NAME = 'FileUpload';
export default function ProgressBarStyles({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
	const [_, setReRender] = useState<number>(Date.now());

	if (globalThis.styleProperties[NAME] && !styleProperties.length && !styleDefaults.size) {
		styleProperties.splice(0, 0, ...globalThis.styleProperties[NAME]);
		styleProperties
			.filter((e: any) => !!e.dv)
			?.map(({ n: name, dv: defaultValue }: any) => styleDefaults.set(name, defaultValue));
	}

	useEffect(() => {
		const fn = lazyStylePropertyLoadFunction(
			NAME,
			props => {
				styleProperties.splice(0, 0, ...props);
				setReRender(Date.now());
			},
			styleDefaults,
		);

		if (usedComponents.used(NAME)) fn();
		usedComponents.register(NAME, fn);

		return () => usedComponents.deRegister(NAME);
	}, [setReRender]);
	const css =
		`
	${PREFIX} {
		display: flex;
		align-items: center;
  		width: 100%;
		position: relative;
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
		white-space: nowrap;
		flex-shrink: 0;
	}

	${PREFIX}._onlyButton ._fileUploadButton {
		width: 100% !important;
	}

	${PREFIX}._outlinedSmall ._fileUploadButton {
		height: 34px;
		min-height: 34px;
		padding: 0 12px;
		gap: 6px;
		border-radius: 8px;
		font-size: 13px;
		font-weight: 500;
		line-height: 18px;
		color: inherit !important;
		background: transparent !important;
		border: 1px solid color-mix(in srgb, currentColor 22%, transparent) !important;
		box-shadow: none !important;
	}

	${PREFIX}._outlinedSmall._onlyButton ._fileUploadButton {
		width: auto !important;
	}

	${PREFIX}._outlinedSmall ._fileUploadButton:hover {
		background: color-mix(in srgb, currentColor 6%, transparent) !important;
	}

	${PREFIX}._outlinedSmall ._fileUploadButton:focus-within {
		outline: 2px solid currentColor;
		outline-offset: 2px;
	}

	${PREFIX}._outlinedSmall ._uploadIcon {
		font-size: 16px;
		color: inherit !important;
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
	
	${PREFIX} ._label {
		position: absolute;
		user-select: none;
		pointer-events: none;
		bottom: 50%;
		transform: translateY(50%);
		transition: transform 0.2s ease-in-out, left 0.2s ease-in-out, bottom 0.2s ease-in-out;
	}
	
	${PREFIX} ._mandatory {
		color: red;
		margin-left: 2px;
	}
	
	${PREFIX}._isActive ._label,
	${PREFIX} ._label._noFloat {
		transform: translateY(-50%);
		bottom: 100%;
	}
	
	${PREFIX}._hasValue ._label {
		transform: translateY(-50%);
		bottom: 100%;
	}
	
	${PREFIX} ._supportText {
		position: absolute;
		z-index: 1;
		left: 0;
		top: 100%;
		margin-top: 5px;
	}
	
	${PREFIX}._bigDesign1 ._label {
		margin-top: 0px;
	}
	
	${PREFIX}._bigDesign1._hasValue ._label,
	${PREFIX}._bigDesign1._isActive ._label,
	${PREFIX}._bigDesign1 ._label._noFloat {
		margin-top: -30px;
		bottom: auto;
		transform: none;
	}
    ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="FileUploadCss">{css}</style>;
}
