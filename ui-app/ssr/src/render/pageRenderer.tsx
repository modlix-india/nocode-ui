/**
 * SSR Page Renderer
 *
 * Renders a page definition to React elements for server-side rendering.
 * Based on the rendering logic from nocode-ui/ui-app/client/src/components/Children.tsx
 */

import React from 'react';
import type {
	ComponentDefinition,
	PageDefinition,
	ApplicationDefinition,
	ThemeDefinition,
} from '~/api/client';
import { getSSRComponent, type RenderContext } from './components';

interface PageRendererProps {
	pageDefinition: PageDefinition;
	application: ApplicationDefinition;
	theme?: ThemeDefinition;
}

/**
 * Render children components recursively
 */
function renderChildren(
	childrenMap: Record<string, boolean> | undefined,
	pageDefinition: PageDefinition,
	context: RenderContext,
	depth: number = 0
): React.ReactNode[] {
	if (!childrenMap || depth > 50) return []; // Prevent infinite recursion

	const { componentDefinition } = pageDefinition;

	// Get child component keys and sort by displayOrder
	const childKeys = Object.entries(childrenMap)
		.filter(([, enabled]) => enabled)
		.map(([key]) => key)
		.filter((key) => componentDefinition[key])
		.sort((a, b) => {
			const orderA = componentDefinition[a]?.displayOrder ?? 0;
			const orderB = componentDefinition[b]?.displayOrder ?? 0;
			if (orderA !== orderB) return orderA - orderB;
			return a.localeCompare(b);
		});

	return childKeys.map((key) => {
		const def = componentDefinition[key];
		return renderComponent(def, pageDefinition, context, depth + 1);
	});
}

/**
 * Render a single component
 */
function renderComponent(
	definition: ComponentDefinition,
	pageDefinition: PageDefinition,
	context: RenderContext,
	depth: number = 0
): React.ReactNode {
	if (!definition || depth > 50) return null;

	const Component = getSSRComponent(definition.type);

	// Render children if this component has them
	const children = definition.children
		? renderChildren(definition.children, pageDefinition, context, depth)
		: null;

	return (
		<Component
			key={definition.key}
			definition={definition}
			pageDefinition={pageDefinition}
			context={context}
		>
			{children}
		</Component>
	);
}

/**
 * Main page renderer component
 *
 * Output structure must match client's Page.tsx:218 output:
 * <div className="comp compPage" style={...}>
 *   {children}
 * </div>
 *
 * The _rendered marker div is now placed AFTER this in $.tsx, not wrapping it.
 */
export function SSRPageRenderer({
	pageDefinition,
	application,
	theme,
}: PageRendererProps): React.ReactElement {
	const { componentDefinition, rootComponent } = pageDefinition;

	const context: RenderContext = {
		pageName: pageDefinition.name,
		appCode: application.appCode,
		clientCode: application.clientCode,
		theme,
		application,
	};

	// Get the root component
	const rootDef = componentDefinition[rootComponent];

	if (!rootDef) {
		return (
			<div className="comp compPage">
				<p>Page structure error: root component not found</p>
			</div>
		);
	}

	// Render the component tree starting from root
	const renderedTree = renderComponent(rootDef, pageDefinition, context, 0);

	// Return Page wrapper matching client's Page.tsx output
	// Note: HelperComponent and page-specific style tags are skipped in SSR
	// as they're only used in design mode
	return (
		<div className="comp compPage">
			{renderedTree}
		</div>
	);
}

/**
 * Render page to string for debugging/testing
 */
export function renderPageToDebugString(props: PageRendererProps): string {
	const { pageDefinition, application } = props;
	const { componentDefinition, rootComponent } = pageDefinition;

	function debugComponent(key: string, depth: number): string {
		const def = componentDefinition[key];
		if (!def || depth > 20) return '';

		const indent = '  '.repeat(depth);
		const childKeys = def.children
			? Object.keys(def.children).filter((k) => def.children![k])
			: [];

		let result = `${indent}<${def.type} key="${def.key}" name="${def.name}"`;

		// Add some properties for context
		if (def.properties?.text?.value) {
			result += ` text="${String(def.properties.text.value).substring(0, 50)}..."`;
		}
		if (def.properties?.src?.value) {
			result += ` src="${String(def.properties.src.value).substring(0, 50)}..."`;
		}

		if (childKeys.length > 0) {
			result += '>\n';
			for (const childKey of childKeys) {
				result += debugComponent(childKey, depth + 1);
			}
			result += `${indent}</${def.type}>\n`;
		} else {
			result += ' />\n';
		}

		return result;
	}

	return `Page: ${pageDefinition.name} (App: ${application.appCode})\n` +
		`Root: ${rootComponent}\n` +
		`Components: ${Object.keys(componentDefinition).length}\n\n` +
		debugComponent(rootComponent, 0);
}

export default SSRPageRenderer;
