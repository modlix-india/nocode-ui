import { useEffect, useState } from 'react';
import { usedComponents } from '../../App/usedComponents';
import { processStyleDefinition } from '../../util/styleProcessor';
import {
	findPropertyDefinitions,
	lazyCSSURL,
	lazyStylePropertyLoadFunction,
} from '../util/lazyStylePropertyUtil';
import { propertiesDefinition } from './calendarProperties';
import { styleDefaults, styleProperties, stylePropertiesForTheme } from './calendarStyleProperties';

const PREFIX = '.comp.compCalendar';
const NAME = 'Calendar';
export default function CalendarStyle({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
	const [_, setReRender] = useState<number>(Date.now());

	if (globalThis.styleProperties[NAME] && !styleProperties.length && !styleDefaults.size) {
		styleProperties.splice(0, 0, ...globalThis.styleProperties[NAME]);
		styleProperties
			.filter((e: any) => !!e.dv)
			?.map(({ n: name, dv: defaultValue }: any) => styleDefaults.set(name, defaultValue));
	}

	useEffect(() => {
		const { designType, colorScheme, calendarDesignType } = findPropertyDefinitions(
			propertiesDefinition,
			'calendarDesignType',
			'designType',
			'colorScheme',
		);
		const fn = lazyStylePropertyLoadFunction(
			NAME,
			(props, originalStyleProps) => {
				console.log(props);
				styleProperties.splice(0, 0, ...props);
				if (originalStyleProps) stylePropertiesForTheme.splice(0, 0, ...originalStyleProps);
				setReRender(Date.now());
			},
			styleDefaults,
			[calendarDesignType, designType, colorScheme],
		);

		if (usedComponents.used(NAME)) fn();
		usedComponents.register(NAME, fn);

		return () => usedComponents.deRegister(NAME);
	}, [setReRender]);

	const css = processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	console.log(styleDefaults);

	return (
		<>
			{styleProperties.length ? (
				<link key="externalCSS" rel="stylesheet" href={lazyCSSURL(NAME)} />
			) : undefined}
			<style id="CalendarCss">{css}</style>
		</>
	);
}
