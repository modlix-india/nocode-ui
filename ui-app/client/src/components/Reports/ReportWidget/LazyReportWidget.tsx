import React, { useEffect, useState } from 'react';
import {
	addListenerAndCallImmediately,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
	UrlDetailsExtractor,
} from '../../../context/StoreContext';
import { ComponentProps } from '../../../types/common';
import { processComponentStylePseudoClasses } from '../../../util/styleProcessor';
import { HelperComponent } from '../../HelperComponents/HelperComponent';
import useDefinition from '../../util/useDefinition';
import { usePageEvents } from '../pageEvents';
import { defaultCatalogFunction, defaultRunFunction } from '../reportApi';
import { ReportSpec } from '../reportTypes';
import { useCatalog, useTransport } from '../ui/hooks';
import { ReportWidgetView } from '../ui/ReportWidgetView';
import { propertiesDefinition, stylePropertiesDefinition } from './reportWidgetProperties';

function isSpec(v: any): v is ReportSpec {
	return !!v && typeof v === 'object' && typeof v.source === 'string' && !!v.view?.type;
}

export default function LazyReportWidget(props: Readonly<ComponentProps>) {
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
	const path = definition.bindingPath
		? getPathFromLocation(definition.bindingPath, locationHistory, pageExtractor)
		: undefined;
	const [bound, setBound] = useState<any>(undefined);
	useEffect(() => {
		if (!path) return;
		return addListenerAndCallImmediately(
			pageExtractor.getPageName(),
			(_, v) => setBound(v),
			path,
		);
	}, [path]);

	const ns = properties.appNamespace as string | undefined;
	const runFunction = (properties.runFunction as string) || defaultRunFunction(ns);
	const catalogFunction = (properties.catalogFunction as string) || defaultCatalogFunction(ns);
	const transport = useTransport(properties.useFixtures);
	const { catalog } = useCatalog(transport, catalogFunction);
	const event = usePageEvents(props);
	const spec = isSpec(bound) ? bound : isSpec(properties.spec) ? properties.spec : undefined;

	return (
		<div className="comp compReportWidget" style={resolvedStyles.comp ?? {}}>
			<HelperComponent context={context} definition={definition} />
			{spec ? (
				<ReportWidgetView
					transport={transport}
					runFunction={runFunction}
					catalog={catalog}
					spec={spec}
					name={properties.name}
					refreshMin={Number(properties.refreshMin) || 0}
					editable={!!properties.editable && !!path}
					onSpecChange={path ? s => setData(path, s, context.pageName) : undefined}
					onEdit={event(properties.onEdit)}
					onDuplicate={event(properties.onDuplicate)}
					onRemove={event(properties.onRemove)}
					onDelete={event(properties.onDelete)}
				/>
			) : (
				<div className="_rpWidget">
					<div className="_rpState _rpMuted">Set a report spec to show a widget.</div>
				</div>
			)}
		</div>
	);
}
