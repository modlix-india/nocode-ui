import React from 'react';
import { formDefinition } from './formCommons';
import Children from '../../Children';
import { LocationHistory, RenderContext } from '../../../types/common';
import { generateFormPreview } from './formPreviewGeneration';

interface FormPreview {
	fieldDefinitionMap: formDefinition;
	formName: string;
	context: RenderContext;
	locationHistory?: Array<LocationHistory>;
}
export default function FormPreview({
	fieldDefinitionMap,
	context,
	formName,
	locationHistory,
}: FormPreview) {
	const { children, pageDef } = generateFormPreview(fieldDefinitionMap!, formName);
	return (
		<div className="_preview">
			<Children
				key={`${''}_chld`}
				pageDefinition={pageDef}
				children={children}
				context={{ ...context! }}
				locationHistory={locationHistory!}
			/>
		</div>
	);
}
