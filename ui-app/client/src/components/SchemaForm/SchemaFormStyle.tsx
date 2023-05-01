import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './schemaFormStyleProperies';

const PREFIX = '.comp.compSchemaForm';
export default function SchemaFormStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
		${PREFIX} { display: flex; flex-direction: column; gap: 5px;}
		${PREFIX} .singleSchema { display: flex; flex-direction: column; gap: 5px;}
		${PREFIX} .monacoEditor { flex:1; height: 100%; width: 100%; transition: none; }
		${PREFIX} > * { transition: none}
		` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="SchemaFormCss">{css}</style>;
}
