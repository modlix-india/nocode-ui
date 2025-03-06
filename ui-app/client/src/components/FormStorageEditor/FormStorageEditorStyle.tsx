import { useEffect, useState } from 'react';
import { usedComponents } from '../../App/usedComponents';
import { processStyleDefinition } from '../../util/styleProcessor';
import { lazyCSSURL } from '../util/lazyStylePropertyUtil';
import { styleDefaults, styleProperties } from './formStorageEditorStyleProperties';

const PREFIX = '.comp.compFormStorageEditor';
const NAME = 'FormStorageEditor';
export default function FormStorageEditorStyle({
	theme,
}: Readonly<{
	theme: Map<string, Map<string, string>>;
}>) {
	const [used, setUsed] = useState(usedComponents.used(NAME));

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
