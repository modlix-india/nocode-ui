/**
 * Utility for performing targeted updates on PageDefinition without full deep cloning
 * This significantly improves performance for large (10MB+) page definitions
 */

import { duplicate } from '@fincity/kirun-js';
import { PageDefinition, ComponentDefinition } from '../../../types/common';

/**
 * Updates a single component in componentDefinition without cloning the entire PageDefinition
 * Only clones: PageDefinition root, componentDefinition object, and the specific component
 */
export function updateComponentInPageDefinition(
	pageDef: PageDefinition,
	componentKey: string,
	updater: (componentDef: ComponentDefinition) => ComponentDefinition | void,
): PageDefinition {
	// Shallow clone the PageDefinition (doesn't clone nested objects)
	const newPageDef: PageDefinition = { ...pageDef };

	// Clone componentDefinition object (shallow)
	const newComponentDefinition = { ...pageDef.componentDefinition };

	// Get the component to update
	const existingComponent = pageDef.componentDefinition[componentKey];
	if (!existingComponent) {
		throw new Error(`Component ${componentKey} not found in page definition`);
	}

	// Clone the specific component (deep clone since it may be modified)
	const clonedComponent = duplicate(existingComponent);

	// Apply the updater
	const updatedComponent = updater(clonedComponent);

	// Update the component in the new componentDefinition
	if (updatedComponent !== undefined) {
		newComponentDefinition[componentKey] = updatedComponent;
	} else {
		// Updater modified in place
		newComponentDefinition[componentKey] = clonedComponent;
	}

	// Assign the new componentDefinition
	newPageDef.componentDefinition = newComponentDefinition;

	return newPageDef;
}

/**
 * Updates multiple components in componentDefinition
 * More efficient than calling updateComponentInPageDefinition multiple times
 */
export function updateMultipleComponentsInPageDefinition(
	pageDef: PageDefinition,
	updates: Array<{
		componentKey: string;
		updater: (componentDef: ComponentDefinition) => ComponentDefinition | void;
	}>,
): PageDefinition {
	// Shallow clone the PageDefinition
	const newPageDef: PageDefinition = { ...pageDef };

	// Clone componentDefinition object (shallow)
	const newComponentDefinition = { ...pageDef.componentDefinition };

	// Process each update
	for (const { componentKey, updater } of updates) {
		const existingComponent = pageDef.componentDefinition[componentKey];
		if (!existingComponent) {
			console.warn(`Component ${componentKey} not found, skipping update`);
			continue;
		}

		// Clone the specific component
		const clonedComponent = duplicate(existingComponent);

		// Apply the updater
		const updatedComponent = updater(clonedComponent);

		// Update the component
		if (updatedComponent !== undefined) {
			newComponentDefinition[componentKey] = updatedComponent;
		} else {
			newComponentDefinition[componentKey] = clonedComponent;
		}
	}

	newPageDef.componentDefinition = newComponentDefinition;
	return newPageDef;
}

/**
 * Updates page-level properties without cloning componentDefinition
 * Use this when only modifying properties, rootComponent, eventFunctions, etc.
 */
export function updatePageDefinitionProperties(
	pageDef: PageDefinition,
	updater: (pageDef: PageDefinition) => void,
): PageDefinition {
	// Shallow clone the PageDefinition
	const newPageDef: PageDefinition = { ...pageDef };

	// Reference the same componentDefinition (no clone needed)
	// This is safe because we're only updating page-level properties
	newPageDef.componentDefinition = pageDef.componentDefinition;

	// Apply the updater
	updater(newPageDef);

	return newPageDef;
}

/**
 * Removes components from componentDefinition efficiently
 */
export function removeComponentsFromPageDefinition(
	pageDef: PageDefinition,
	componentKeys: string[],
): PageDefinition {
	// Shallow clone the PageDefinition
	const newPageDef: PageDefinition = { ...pageDef };

	// Clone componentDefinition object (shallow)
	const newComponentDefinition = { ...pageDef.componentDefinition };

	// Remove the components
	for (const key of componentKeys) {
		delete newComponentDefinition[key];
	}

	newPageDef.componentDefinition = newComponentDefinition;
	return newPageDef;
}

/**
 * Adds a new component to componentDefinition efficiently
 */
export function addComponentToPageDefinition(
	pageDef: PageDefinition,
	componentKey: string,
	componentDef: ComponentDefinition,
): PageDefinition {
	// Shallow clone the PageDefinition
	const newPageDef: PageDefinition = { ...pageDef };

	// Clone componentDefinition object (shallow)
	const newComponentDefinition = { ...pageDef.componentDefinition };

	// Add the new component
	newComponentDefinition[componentKey] = componentDef;

	newPageDef.componentDefinition = newComponentDefinition;
	return newPageDef;
}

