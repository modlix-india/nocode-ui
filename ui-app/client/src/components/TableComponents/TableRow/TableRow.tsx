import React, { useState } from 'react';
import { ComponentProps } from '../../../types/common';
import { processComponentStylePseudoClasses } from '../../../util/styleProcessor';
import Children from '../../Children';
import { HelperComponent } from '../../HelperComponents/HelperComponent';
import useDefinition from '../../util/useDefinition';
import { PageStoreExtractor, UrlDetailsExtractor } from '../../../context/StoreContext';
import { propertiesDefinition, stylePropertiesDefinition } from './tableRowProperties';

export default function TableRowComponent(props: Readonly<ComponentProps>) {
	const {
		definition: { children },
		pageDefinition,
		locationHistory = [],
		context,
		definition,
	} = props;

	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const urlExtractor = UrlDetailsExtractor.getForContext(context.pageName);

	const { stylePropertiesWithPseudoStates } = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
		urlExtractor,
	);

	const [hover, setHover] = useState(false);

	const styleProperties = processComponentStylePseudoClasses(
		props.pageDefinition,
		{ hover },
		stylePropertiesWithPseudoStates,
	);

	const colspan = context.table?.rowColSpan ?? 1;
	const isSelected = context.table?.isSelected;

	return (
		<td
			colSpan={colspan}
			className={`comp compTableRow _rowContainer ${isSelected ? '_selected' : ''}`}
			style={{ ...styleProperties.comp, ...styleProperties.rowContainer }}
			onMouseEnter={stylePropertiesWithPseudoStates?.hover ? () => setHover(true) : undefined}
			onMouseLeave={
				stylePropertiesWithPseudoStates?.hover ? () => setHover(false) : undefined
			}
		>
			<HelperComponent context={props.context} definition={definition} />
			<Children
				pageDefinition={pageDefinition}
				renderableChildren={children}
				context={context}
				locationHistory={locationHistory}
			/>
		</td>
	);
}
