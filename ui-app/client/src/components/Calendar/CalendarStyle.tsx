import React, { useEffect, useState } from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './calendarStyleProperties';
import { StylePropertyDefinition } from '../../types/common';
import { usedComponents } from '../../App/usedComponents';
import { lazyCSSURL, lazyStylePropertyLoadFunction } from '../util/lazyStylePropertyUtil';

const PREFIX = '.comp.compCalendar';
const NAME = 'Calendar';
export default function CalendarStyle({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {

	const [_, setReRender] = useState<number>(Date.now());

	if (globalThis.styleProperties[NAME] && !styleProperties.length && !styleDefaults.size) {
		styleProperties.splice(0, 0, ...globalThis.styleProperties[NAME])
		styleProperties.filter((e: any) => !!e.dv)?.map(
			({ n: name, dv: defaultValue }: any) => styleDefaults.set(name, defaultValue),
		);
	}

	useEffect(() => {
		// const { designType, colorScheme } = findPropertyDefinitions(propertiesDefinition, 'designType', 'colorScheme');
		const fn = lazyStylePropertyLoadFunction(NAME, (props) => { styleProperties.splice(0, 0, ...props); setReRender(Date.now()) }, styleDefaults);

		if (usedComponents.used(NAME)) fn();
		usedComponents.register(NAME, fn);

		return () => usedComponents.deRegister(NAME);
	}, [setReRender]);


	const css = processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return (
		<>
			{styleProperties.length ? (
				<link key="externalCSS" rel="stylesheet" href={lazyCSSURL(NAME)} />
			) : undefined}
			<style id="CalendarCss">{css}</style>
		</>
	);
}
