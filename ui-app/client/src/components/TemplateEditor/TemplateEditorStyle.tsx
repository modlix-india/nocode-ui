import React from 'react';
import { processStyleDefinition, processStyleValueWithFunction } from '../../util/styleProcessor';
import { styleDefaults, styleProperties } from './TemplateEditorStyleProperties';
import { StyleResolution } from '../../types/common';

const PREFIX = '.comp.compTemplateEditor';
export default function TemplateEditorStyle({
	theme,
}: Readonly<{
	theme: Map<string, Map<string, string>>;
}>) {
	const values = new Map([...(theme.get(StyleResolution.ALL) ?? []), ...styleDefaults]);

	const css =
		`
	${PREFIX} {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	${PREFIX} .language {
		display: flex;
		gap: 10px;
		flex-direction: row;
		align-items: flex-end;
	}

	${PREFIX} .editor {
		display: flex;
		flex-direction: row;
		gap: 10px;
		flex: 1;
	}

	${PREFIX} .editor .textEditors {
		display: flex;
		flex-direction: column;
		gap: 10px;
		flex: 1;
	}

	${PREFIX} .editor input,
	${PREFIX} .editor select,
	${PREFIX} .editor textarea {
		padding: 5px;
		border: 1px solid ${processStyleValueWithFunction(values.get('fontColorEight'), values)};
    	border-radius: 4px;
	}

	${PREFIX} .editor textarea {
		flex: 1;
	}

	${PREFIX} .editor .iframeContainer {
		
		border: none;
		display: flex;
		flex-direction: column;
	}

	${PREFIX} .editor .iframeContainer iframe {
		flex: 1;
		border: none;
	}

	${PREFIX} .editor .iframeContainer iframe.DESKTOP {
		width: 900px;
		height: 100%;
	}

	${PREFIX} .editor .iframeContainer iframe.TABLET {
		width: 600px;
		height: 100%;
	}


	${PREFIX} .editor .iframeContainer iframe.MOBILE {
		width: 400px;
		height: 100%;
	}


	${PREFIX} .editor .deviceSizes {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
	}

	${PREFIX} .editor .deviceSizes ._icon {
		padding: 5px;
		border-radius: 5px;
		height: 30px;
		display: flex;
		align-items: center;
		cursor: pointer;
	}

	${PREFIX} .editor .deviceSizes ._icon._selected,
	${PREFIX} .editor .deviceSizes ._icon:hover {
		background-color: #f7f7f7;
	}
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="TemplateEditorCss">{css}</style>;
}
