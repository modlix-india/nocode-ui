import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './schemaFormV2StyleProperties';

const PREFIX = '.comp.compSchemaForm';
export default function SchemaFormStyle({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
	const css =
		`
        ${PREFIX} { display: flex; flex-direction: column; gap: 5px;}
       

        ${PREFIX} > * { transition: width 0s, height 0s;}
        ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="SchemaFormCss">{css}</style>;
}
