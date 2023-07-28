import { StyleGroupDefinition, StylePropertyDefinition } from '../../types/common';

// All the styles should be from Table Columns as this is the re-incarnation of Table Columns

export const styleProperties: Array<StylePropertyDefinition> = [];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.defaultValue)
		.map(({ name, defaultValue }) => [name, defaultValue!]),
);
