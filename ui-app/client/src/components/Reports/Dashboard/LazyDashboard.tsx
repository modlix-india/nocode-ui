import React from 'react';
import { PageStoreExtractor, UrlDetailsExtractor } from '../../../context/StoreContext';
import { ComponentProps } from '../../../types/common';
import { processComponentStylePseudoClasses } from '../../../util/styleProcessor';
import { HelperComponent } from '../../HelperComponents/HelperComponent';
import useDefinition from '../../util/useDefinition';
import { defaultCatalogFunction, defaultRunFunction } from '../reportApi';
import { GroupedDashboardView } from '../ui/GroupedDashboardView';
import { useTransport } from '../ui/hooks';
import { propertiesDefinition, stylePropertiesDefinition } from './dashboardProperties';

export default function LazyDashboard(props: Readonly<ComponentProps>) {
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
	// `group` (CONTRACT 9); `name` is the P1a name of the same thing.
	const group = String(properties.group || properties.name || '').trim() || 'dashboard';
	return (
		<div className="comp compDashboard" style={resolvedStyles.comp ?? {}}>
			<HelperComponent context={context} definition={definition} />
			<GroupedDashboardView
				key={`${group}|${properties.mode ?? ''}`}
				transport={transport}
				catalogFunction={
					(properties.catalogFunction as string) || defaultCatalogFunction(ns)
				}
				runFunction={(properties.runFunction as string) || defaultRunFunction(ns)}
				appNamespace={ns}
				group={group}
				groups={properties.groups}
				showGroupManager={!!properties.showGroupManager}
				groupPagePath={(properties.groupPagePath as string) || undefined}
				editable={!!properties.editable}
				mode={properties.mode === 'library' ? 'library' : 'dashboard'}
				showFilters={properties.showFilters !== false}
				title={properties.title}
			/>
		</div>
	);
}
