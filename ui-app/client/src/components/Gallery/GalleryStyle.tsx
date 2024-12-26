import React, { useEffect, useState } from 'react';
import { StyleResolution } from '../../types/common';
import { processStyleDefinition, processStyleValueWithFunction } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './galleryStyleProperties';
import { usedComponents } from '../../App/usedComponents';
import { lazyCSSURL } from '../util/lazyStylePropertyUtil';

const PREFIX = '.comp.compGallery';
const NAME = 'Gallery';
export default function GalleryStyle({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
	const values = new Map<string, string>([
		...Array.from(theme.get(StyleResolution.ALL) ?? []),
		...Array.from(styleDefaults),
	]);

	const [used, setUsed] = useState(false);

	useEffect(() => {
		const fn = () => setUsed(true);

		if (usedComponents.used(NAME)) fn();
		usedComponents.register(NAME, fn);

		return () => usedComponents.deRegister(NAME);
	}, [setUsed]);

	const css =
		`${PREFIX} {
    z-index: 8;
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;  
    backdrop-filter: blur(${processStyleValueWithFunction(values.get('backdropFilter'), values)}) 
  }` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return (
		<>
			{used ? <link key="externalCSS" rel="stylesheet" href={lazyCSSURL(NAME)} /> : <></>}
			<style id="GalleryCss">{css}</style>
		</>
	);
}
