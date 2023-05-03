import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './schemaBuilderStyleProperies';

const PREFIX = '.comp.compSchemaBuilder';
export default function SchemaBuilderStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
		
		` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="SchemaBuilderCss">{css}</style>;
}
