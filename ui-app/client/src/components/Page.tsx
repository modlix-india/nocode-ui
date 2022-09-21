import React, { ReactNode, useMemo } from 'react';
import { getData, addListener, store } from '../context/StoreContext';
import * as D from './index';

const getChildren = (root: any, current: any) => {
	let childrenComponents = Object.entries(current.children)
		.map(([k, v]) => {
			if (v) {
				return root.children[k];
			}
		})
		.filter((e: any) => !!e)
		.sort(
			(a: any, b: any) =>
				(a.properties.displayOrder || 0) -
				(b.properties.displayOrder || 0),
		);
	return childrenComponents;
};

const renderComponents = (
	rootComponent: any,
	childrenComponents: any,
	pageDefinition: any,
) => {
	let componentMap = new Map<string, React.ElementType>();
	Object.entries(D).forEach(([k, v]) => componentMap.set(k, v));
	const children = childrenComponents
		?.map((e: any) => {
			if (componentMap.get(e.type)) {
				if (e.children) {
					return renderComponents(
						e,
						getChildren(pageDefinition, e),
						pageDefinition,
					);
				}
				return React.createElement(componentMap.get(e.type)!, {
					definition: e,
					key: e.key,
				});
			}
		})
		.filter((e: any) => !!e);
	if (componentMap.get(rootComponent.type))
		return React.createElement(
			componentMap.get(rootComponent.type)!,
			{ definition: rootComponent, key: rootComponent.key },
			[...children],
		);
};

export function Page({ definition }: { definition: any }) {
	useMemo(() => {}, [definition]);
	if (!definition) return <>Loading...</>;
	const {
		properties: { definitionLocation },
	} = definition;
	const pageDefinition = getData(definitionLocation);
	if (!pageDefinition) return <>No Definition Found</>;
	if (!pageDefinition.children) return <></>;
	const rootComponent = pageDefinition.children[pageDefinition.rootComponent];

	let childrenComponents = getChildren(pageDefinition, rootComponent);
	const comps = renderComponents(
		rootComponent,
		childrenComponents,
		pageDefinition,
	);
	return <>{comps}</>;
}
