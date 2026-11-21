import React from 'react';
import { PageStoreExtractor, UrlDetailsExtractor } from '../../../context/StoreContext';
import { ComponentProps } from '../../../types/common';
import { processComponentStylePseudoClasses } from '../../../util/styleProcessor';
import { HelperComponent } from '../../HelperComponents/HelperComponent';
import useDefinition from '../../util/useDefinition';
import { defaultCatalogFunction, defaultRunFunction } from '../reportApi';
import { DashboardView } from '../ui/DashboardView';
import { useTransport } from '../ui/hooks';
import { propertiesDefinition, stylePropertiesDefinition } from './reportLibraryProperties';

/** The Dashboard in library mode, as its own component (CONTRACT section 5, `ReportLibrary`). */
export default function LazyReportLibrary(props: Readonly<ComponentProps>) {
	const { definition, locationHistory, context, pageDefinition } = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const urlExtractor = UrlDetailsExtractor.getForContext(context.pageName);
	const { properties = {}, stylePropertiesWithPseudoStates } = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
		urlExtractor,
	);
	const resolvedStyles = processComponentStylePseudoClasses(
		pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);
	const ns = properties.appNamespace as string | undefined;
	const transport = useTransport(properties.useFixtures);
	return (
		<div className="comp compReportLibrary" style={resolvedStyles.comp ?? {}}>
			<HelperComponent context={context} definition={definition} />
			<DashboardView
				key={properties.name ?? ''}
				transport={transport}
				catalogFunction={
					(properties.catalogFunction as string) || defaultCatalogFunction(ns)
				}
				runFunction={(properties.runFunction as string) || defaultRunFunction(ns)}
				name={(properties.name as string) || 'dashboard'}
				editable={properties.editable !== false}
				mode="library"
				lockMode
				showFilters={false}
				title={properties.title}
			/>
		</div>
	);
}
