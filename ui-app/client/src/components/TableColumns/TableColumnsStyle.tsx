import React from 'react';
import { StyleResolution } from '../../types/common';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './tableColumnsStyleProperties';

const PREFIX = '.comp.compTableColumns';
export default function TableColumnsStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`${PREFIX} { display: table; flex-direction: column; flex: 1; }
		 ${PREFIX} ._row { display: table-row; }
		
		.comp.compTable._design1 ._row { height: ${
			theme.get(StyleResolution.ALL)?.get('design1RowHeight') ??
			styleDefaults.get('design1RowHeight')
		};
			background-color:  ${
				theme.get(StyleResolution.ALL)?.get('design1RowBackgroundColor') ??
				styleDefaults.get('design1RowBackgroundColor')
			};
		}

		.comp.compTable._design2 ._row { height: ${
			theme.get(StyleResolution.ALL)?.get('design2RowHeight') ??
			styleDefaults.get('design2RowHeight')
		};
			background-color:  ${
				theme.get(StyleResolution.ALL)?.get('design2RowBackgroundColor') ??
				styleDefaults.get('design2RowBackgroundColor')
			};
		}

		.comp.compTable._design3 ._row { height: ${
			theme.get(StyleResolution.ALL)?.get('design3RowHeight') ??
			styleDefaults.get('design3RowHeight')
		};
			background-color:  ${
				theme.get(StyleResolution.ALL)?.get('design3RowBackgroundColor') ??
				styleDefaults.get('design3RowBackgroundColor')
			};
		}

		.comp.compTable._design4 ._row { height: ${
			theme.get(StyleResolution.ALL)?.get('design4RowHeight') ??
			styleDefaults.get('design4RowHeight')
		};
			background-color:  ${
				theme.get(StyleResolution.ALL)?.get('design4RowBackgroundColor') ??
				styleDefaults.get('design4RowBackgroundColor')
			};
		}

		.comp.compTable._design5 ._row { height: ${
			theme.get(StyleResolution.ALL)?.get('design5RowHeight') ??
			styleDefaults.get('design5RowHeight')
		};
			background-color:  ${
				theme.get(StyleResolution.ALL)?.get('design5RowBackgroundColor') ??
				styleDefaults.get('design5RowBackgroundColor')
			};
		}

		.comp.compTable._design6 ._row { height: ${
			theme.get(StyleResolution.ALL)?.get('design6RowHeight') ??
			styleDefaults.get('design6RowHeight')
		};
			background-color:  ${
				theme.get(StyleResolution.ALL)?.get('design6RowBackgroundColor') ??
				styleDefaults.get('design6RowBackgroundColor')
			};
		}

		.comp.compTable._design7 ._row { height: ${
			theme.get(StyleResolution.ALL)?.get('design7RowHeight') ??
			styleDefaults.get('design7RowHeight')
		};
			background-color:  ${
				theme.get(StyleResolution.ALL)?.get('design7RowBackgroundColor') ??
				styleDefaults.get('design7RowBackgroundColor')
			};
		}

		.comp.compTable._design8 ._row { height: ${
			theme.get(StyleResolution.ALL)?.get('design8RowHeight') ??
			styleDefaults.get('design8RowHeight')
		};
			background-color:  ${
				theme.get(StyleResolution.ALL)?.get('design8RowBackgroundColor') ??
				styleDefaults.get('design8RowBackgroundColor')
			};
		}

		.comp.compTable._design9 ._row { height: ${
			theme.get(StyleResolution.ALL)?.get('design9RowHeight') ??
			styleDefaults.get('design9RowHeight')
		};
			background-color:  ${
				theme.get(StyleResolution.ALL)?.get('design9RowBackgroundColor') ??
				styleDefaults.get('design9RowBackgroundColor')
			};
		}

		.comp.compTable._design10 ._row { height: ${
			theme.get(StyleResolution.ALL)?.get('design10RowHeight') ??
			styleDefaults.get('design10RowHeight')
		};
			background-color:  ${
				theme.get(StyleResolution.ALL)?.get('design10RowBackgroundColor') ??
				styleDefaults.get('design10RowBackgroundColor')
			};
		}

		.comp.compTable._design1 ._row:nth-child(even) {
			background-color:  ${
				theme.get(StyleResolution.ALL)?.get('design1EvenRowBackgroundColor') ??
				styleDefaults.get('design1EvenRowBackgroundColor')
			};
		}

		.comp.compTable._design5 ._row:nth-child(even) {
			background-color:  ${
				theme.get(StyleResolution.ALL)?.get('design5EvenRowBackgroundColor') ??
				styleDefaults.get('design1EvenRowBackgroundColor')
			};
		}

		.comp.compTable._design9 ._row:nth-child(even) {
			background-color:  ${
				theme.get(StyleResolution.ALL)?.get('design9EvenRowBackgroundColor') ??
				styleDefaults.get('design1EvenRowBackgroundColor')
			};
		}

		.comp.compTable._design3 ._row:nth-child(3n+1) {
			background-color:  ${
				theme.get(StyleResolution.ALL)?.get('design3SecondBackgroundColor') ??
				styleDefaults.get('design1EvenRowBackgroundColor')
			};
		}

		.comp.compTable._design7 ._row:nth-child(3n+1) {
			background-color:  ${
				theme.get(StyleResolution.ALL)?.get('design7SecondBackgroundColor') ??
				styleDefaults.get('design1EvenRowBackgroundColor')
			};
		}

		.comp.compTable._design3 ._row:nth-child(3n+2) {
			background-color:  ${
				theme.get(StyleResolution.ALL)?.get('design3ThridBackgroundColor') ??
				styleDefaults.get('design3ThridBackgroundColor')
			};
		}

		.comp.compTable._design7 ._row:nth-child(3n+2) {
			background-color:  ${
				theme.get(StyleResolution.ALL)?.get('design7ThridBackgroundColor') ??
				styleDefaults.get('design7ThridBackgroundColor')
			};
		}
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="TableColumnsCss">{css}</style>;
}
