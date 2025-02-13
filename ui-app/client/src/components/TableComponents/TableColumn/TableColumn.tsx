import React, { useState } from 'react';
import { getDataFromPath, PageStoreExtractor } from '../../../context/StoreContext';
import { ComponentProps } from '../../../types/common';
import { processComponentStylePseudoClasses } from '../../../util/styleProcessor';
import Children from '../../Children';
import { HelperComponent } from '../../HelperComponents/HelperComponent';
import useDefinition from '../../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './tableCloumnProperties';

export default function TableColumnComponent(props: Readonly<ComponentProps>) {
	const {
		definition: { children },
		pageDefinition,
		locationHistory = [],
		context,
		definition,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const { stylePropertiesWithPseudoStates, properties: { hideIfNotPersonalized } = {} } =
		useDefinition(
			definition,
			propertiesDefinition,
			stylePropertiesDefinition,
			locationHistory,
			pageExtractor,
		);

	const [hover, setHover] = useState(false);
	let entry = Object.entries(children ?? {}).find(([, v]) => v);

	const firstchild: any = {};
	if (entry) firstchild[entry[0]] = true;

	const styleProperties = processComponentStylePseudoClasses(
		props.pageDefinition,
		{ hover },
		stylePropertiesWithPseudoStates,
	);

	const personalizedObject = context.table.personalizationBindingPath
		? getDataFromPath(
				`${context.table.personalizationBindingPath}`,
				locationHistory,
				pageExtractor,
			)
		: undefined;

	if (
		(hideIfNotPersonalized && !personalizedObject?.hiddenFields?.[definition.key]) ||
		(!hideIfNotPersonalized && personalizedObject?.hiddenFields?.[definition.key])
	) {
		return null;
	}

	let dataPart;
	const isLoading =
		context.table.isLoading &&
		context.table.showSpinner &&
		context.table.spinnerType.startsWith('_emptyRow');

	if (isLoading) {
		dataPart = <div className={`_animateData ${context.table.spinnerType}`}>&nbsp;</div>;
	} else {
		dataPart = (
			<Children
				pageDefinition={pageDefinition}
				renderableChildren={firstchild}
				context={context}
				locationHistory={locationHistory}
			/>
		);
	}
	return (
		<div
			className="comp compTableColumn"
			style={styleProperties.comp}
			onMouseEnter={stylePropertiesWithPseudoStates?.hover ? () => setHover(true) : undefined}
			onMouseLeave={
				stylePropertiesWithPseudoStates?.hover ? () => setHover(false) : undefined
			}
		>
			<HelperComponent context={props.context} definition={definition} />
			{dataPart}
		</div>
	);
}
