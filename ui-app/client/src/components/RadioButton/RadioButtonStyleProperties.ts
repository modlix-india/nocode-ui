import { StylePropertyDefinition } from '../../types/common';

export const styleProperties: Array<StylePropertyDefinition> = [];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.defaultValue)
		.map(({ name, defaultValue }) => [name, defaultValue!]),
);
