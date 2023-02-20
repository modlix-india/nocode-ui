import React from 'react';
import { StyleResolution } from '../../types/common';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './tableColumnHeaderStyleProperties';

const PREFIX = '.comp.compTableHeaderColumn';
export default function TableColumnStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`${PREFIX} { display: table-cell; vertical-align: middle;}
		
		.comp.compTable._design1 ${PREFIX} { padding: ${
			theme.get(StyleResolution.ALL)?.get('design1HeaderPadding') ??
			styleDefaults.get('design1HeaderPadding')
		}; }
		
		.comp.compTable._design3 ${PREFIX} { padding: ${
			theme.get(StyleResolution.ALL)?.get('design3HeaderPadding') ??
			styleDefaults.get('design3HeaderPadding')
		}; }

		.comp.compTable._design5 ${PREFIX} { padding: ${
			theme.get(StyleResolution.ALL)?.get('design5HeaderPadding') ??
			styleDefaults.get('design5HeaderPadding')
		}; }

		.comp.compTable._design7 ${PREFIX} { padding: ${
			theme.get(StyleResolution.ALL)?.get('design7HeaderPadding') ??
			styleDefaults.get('design7HeaderPadding')
		}; }

		.comp.compTable._design9 ${PREFIX} { padding: ${
			theme.get(StyleResolution.ALL)?.get('design9HeaderPadding') ??
			styleDefaults.get('design9HeaderPadding')
		}; }

		.comp.compTable._design2 ${PREFIX} { padding: ${
			theme.get(StyleResolution.ALL)?.get('design2HeaderPadding') ??
			styleDefaults.get('design2HeaderPadding')
		}; }
		
		.comp.compTable._design4 ${PREFIX} { padding: ${
			theme.get(StyleResolution.ALL)?.get('design4HeaderPadding') ??
			styleDefaults.get('design4HeaderPadding')
		}; }

		.comp.compTable._design6 ${PREFIX} { padding: ${
			theme.get(StyleResolution.ALL)?.get('design6HeaderPadding') ??
			styleDefaults.get('design6HeaderPadding')
		}; }

		.comp.compTable._design8 ${PREFIX} { padding: ${
			theme.get(StyleResolution.ALL)?.get('design8HeaderPadding') ??
			styleDefaults.get('design8HeaderPadding')
		}; }

		.comp.compTable._design10 ${PREFIX} { padding: ${
			theme.get(StyleResolution.ALL)?.get('design10HeaderPadding') ??
			styleDefaults.get('design10HeaderPadding')
		}; }

		` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="TableHeaderColumnCss">{css}</style>;
}
