import { StylePropertyDefinition } from '../../../types/common';
import { styleProperties as appStyleProperties } from '../../../App/appStyleProperties';
import { styleProperties as messageStyleProperies } from '../../../App/Messages/messageStyleProperies';
import ComponentDefinitions from '../../index';

export const APP_KEY = '_app';
export const MESSAGE_KEY = '_message';

export interface ThemableComponent {
	/** Key used for `currentComponent`: a component name, or `_app` / `_message`. */
	key: string;
	displayName: string;
	styleProps: StylePropertyDefinition[];
	propertiesForTheme: any[] | undefined;
	styleDefaults: Map<string, string> | undefined;
}

/**
 * Every place a theme variable can live, in the order the rail shows them.
 *
 * The rail and the cross-component search have to agree on this list, so it is
 * derived once here rather than filtered separately in each.
 */
export function themableComponents(): ThemableComponent[] {
	const out: ThemableComponent[] = [
		{
			key: APP_KEY,
			displayName: 'App',
			styleProps: appStyleProperties,
			propertiesForTheme: undefined,
			styleDefaults: undefined,
		},
		{
			key: MESSAGE_KEY,
			displayName: 'Messages',
			styleProps: messageStyleProperies,
			propertiesForTheme: undefined,
			styleDefaults: undefined,
		},
	];

	for (const comp of Array.from(ComponentDefinitions.values())) {
		if (!comp.stylePropertiesForTheme?.length) continue;
		if (comp.isHidden && comp.name !== 'TableColumnHeader') continue;
		out.push({
			key: comp.name,
			displayName: comp.displayName ?? comp.name,
			styleProps: comp.stylePropertiesForTheme,
			propertiesForTheme: comp.propertiesForTheme,
			styleDefaults: comp.styleDefaults,
		});
	}

	return out;
}

export function themableComponent(key: string): ThemableComponent | undefined {
	return themableComponents().find(e => e.key === key);
}
