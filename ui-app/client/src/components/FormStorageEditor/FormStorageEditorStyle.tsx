import React, { useEffect, useState } from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleDefaults, styleProperties } from './formStorageEditorStyleProperties';
import { usedComponents } from '../../App/usedComponents';
import { lazyCSSURL } from '../util/lazyStylePropertyUtil';

const PREFIX = '.comp.compFormStorageEditor';
const NAME = 'FormStorageEditor';
export default function FormStorageEditorStyle({
	theme,
}: {
	theme: Map<string, Map<string, string>>;
}) {
	const [used, setUsed] = useState(false);

	useEffect(() => {
		const fn = () => setUsed(true);

		if (usedComponents.used(NAME)) fn();
		usedComponents.register(NAME, fn);

		return () => usedComponents.deRegister(NAME);
	}, [setUsed]);
	const css = processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return (
		<>
			{used ? <link key="externalCSS" rel="stylesheet" href={lazyCSSURL(NAME)} /> : <></>}
			<style id="StorageEditorCss">{css}</style>{' '}
		</>
	);
}
