import React from 'react';
import { StyleResolution } from '../../types/common';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './tableColumnStyleProperties';

const PREFIX = '.comp.compTableColumn';
export default function TableColumnStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`${PREFIX} { display: table-cell; vertical-align: middle;}

		.comp.compTable._design1 ${PREFIX} { padding: ${
			theme.get(StyleResolution.ALL)?.get('design1ColumnPadding') ??
			styleDefaults.get('design1ColumnPadding')
		}; }
		
		.comp.compTable._design3 ${PREFIX} { padding: ${
			theme.get(StyleResolution.ALL)?.get('design3ColumnPadding') ??
			styleDefaults.get('design3ColumnPadding')
		}; }

		.comp.compTable._design5 ${PREFIX} { padding: ${
			theme.get(StyleResolution.ALL)?.get('design5ColumnPadding') ??
			styleDefaults.get('design5ColumnPadding')
		}; }

		.comp.compTable._design7 ${PREFIX} { padding: ${
			theme.get(StyleResolution.ALL)?.get('design7ColumnPadding') ??
			styleDefaults.get('design7ColumnPadding')
		}; }

		.comp.compTable._design9 ${PREFIX} { padding: ${
			theme.get(StyleResolution.ALL)?.get('design9ColumnPadding') ??
			styleDefaults.get('design9ColumnPadding')
		}; }

		.comp.compTable._design2 ${PREFIX} { padding: ${
			theme.get(StyleResolution.ALL)?.get('design2ColumnPadding') ??
			styleDefaults.get('design2ColumnPadding')
		}; }
		
		.comp.compTable._design4 ${PREFIX} { padding: ${
			theme.get(StyleResolution.ALL)?.get('design4ColumnPadding') ??
			styleDefaults.get('design4ColumnPadding')
		}; }

		.comp.compTable._design6 ${PREFIX} { padding: ${
			theme.get(StyleResolution.ALL)?.get('design6ColumnPadding') ??
			styleDefaults.get('design6ColumnPadding')
		}; }

		.comp.compTable._design8 ${PREFIX} { padding: ${
			theme.get(StyleResolution.ALL)?.get('design8ColumnPadding') ??
			styleDefaults.get('design8ColumnPadding')
		}; }

		.comp.compTable._design10 ${PREFIX} { padding: ${
			theme.get(StyleResolution.ALL)?.get('design10ColumnPadding') ??
			styleDefaults.get('design10ColumnPadding')
		}; }
		` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="TableColumnCss">{css}</style>;
}
