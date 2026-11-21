import { StylePropertyDefinition } from '../../../types/common';
import { reportStyleProperties } from '../reportStyle';

export const PREFIX = '.comp.compDashboard';

export const styleProperties: Array<StylePropertyDefinition> = reportStyleProperties(PREFIX);

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.dv)
		.map(({ n: name, dv: defaultValue }) => [name, defaultValue!]),
);
