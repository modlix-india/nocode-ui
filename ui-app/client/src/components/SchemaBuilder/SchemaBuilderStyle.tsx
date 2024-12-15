import React, { useEffect, useState } from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './schemaBuilderStyleProperies';
import { usedComponents } from '../../App/usedComponents';
import { lazyCSSURL } from '../util/lazyStylePropertyUtil';

const PREFIX = '.comp.compSchemaBuilder';
const NAME = 'SchemaBuilder';
export default function SchemaBuilderStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
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
			{used ? <link key="externalCSS" rel="stylesheet" href={lazyCSSURL(NAME)} /> : undefined}
			<style id="SchemaBuilderCss">{css}</style>
		</>
	);
}
