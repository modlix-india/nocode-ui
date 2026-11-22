import React, { useEffect, useState } from 'react';
import { PageStoreExtractor, UrlDetailsExtractor } from '../../../context/StoreContext';
import { ComponentProps } from '../../../types/common';
import { processComponentStylePseudoClasses } from '../../../util/styleProcessor';
import { HelperComponent } from '../../HelperComponents/HelperComponent';
import useDefinition from '../../util/useDefinition';
import { datasetFunctions } from '../datasetApi';
import { defaultCatalogFunction, defaultRunFunction, namespaceOf } from '../reportApi';
import { clearNotice, openBuilder, registerLibrary, useReportsPage } from '../reportsPage';
import { DatasetListDialog, dayOrderFor } from '../ui/Datasets';
import { DashboardView } from '../ui/DashboardView';
import { useCatalog, useTransport } from '../ui/hooks';
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
	const group = String(properties.group || properties.name || '').trim() || 'dashboard';
	const runFunction = (properties.runFunction as string) || defaultRunFunction(ns);
	const fns = properties.allowDataImport ? datasetFunctions(ns, runFunction) : undefined;
	const [showData, setShowData] = useState(false);
	const catalogFunction = (properties.catalogFunction as string) || defaultCatalogFunction(ns);
	const { catalog } = useCatalog(fns ? transport : undefined, catalogFunction);
	// With a ReportEditor of the same app on the page, this list is what the page opens on;
	// New report and Edit open that editor, and the list steps aside meanwhile (reportsPage.ts).
	const pageNs = ns || namespaceOf(runFunction) || 'reports';
	const page = useReportsPage(pageNs);
	useEffect(() => registerLibrary(pageNs), [pageNs]);
	const withBuilder = page.editors > 0;
	if (withBuilder && page.open)
		return (
			<div className="comp compReportLibrary" style={resolvedStyles.comp ?? {}}>
				<HelperComponent context={context} definition={definition} />
			</div>
		);
	return (
		<div className="comp compReportLibrary" style={resolvedStyles.comp ?? {}}>
			<HelperComponent context={context} definition={definition} />
			{fns && transport && showData ? (
				<DatasetListDialog
					transport={transport}
					fns={fns}
					dayOrder={dayOrderFor(catalog?.locale)}
					onClose={() => setShowData(false)}
				/>
			) : null}
			{page.notice ? (
				<div className="_rpMuted" role="status" style={{ marginBottom: 8 }}>
					{page.notice}
				</div>
			) : null}
			<DashboardView
				key={group}
				transport={transport}
				catalogFunction={catalogFunction}
				runFunction={runFunction}
				name={group}
				appNamespace={ns}
				editable={properties.editable !== false}
				mode="library"
				lockMode
				showFilters={false}
				title={properties.title}
				onYourData={fns ? () => setShowData(true) : undefined}
				onOpenBuilder={
					withBuilder
						? req => {
								clearNotice(pageNs);
								openBuilder(pageNs, { group, ...req });
							}
						: undefined
				}
			/>
		</div>
	);
}
