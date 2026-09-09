import { StylePropertyDefinition } from '../../types/common';

/**
 * These start empty on purpose. The real definitions live in `dist/styleProperties/Tree.json`
 * and are fetched and inflated at runtime by `TreeStyle.tsx`, so the `<treeDesign>` /
 * `<colorScheme>` placeholders can be cross-producted into concrete theme variables.
 */
export const styleProperties: Array<StylePropertyDefinition> = [];

export const styleDefaults = new Map<string, string>();

export const stylePropertiesForTheme: Array<StylePropertyDefinition> = [];
