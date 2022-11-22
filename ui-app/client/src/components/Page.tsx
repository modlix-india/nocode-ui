import React, { useMemo } from 'react';
import { getData } from '../context/StoreContext';
import { renderChildren } from './util/renderChildren';

export function Page({ definition }: { definition: any }) {
	useMemo(() => {}, [definition]);
	if (!definition) return <>Loading...</>;
	const {
		properties: { definitionLocation },
	} = definition;
	const pageDefinition = getData(definitionLocation, []);
	if (!pageDefinition) return <>No Definition Found</>;
	if (!pageDefinition.children) return <></>;

	const comps = renderChildren(
		pageDefinition,
		{
			[pageDefinition.rootComponent]: true,
		},
		[],
	);
	return <>{comps}</>;
}
