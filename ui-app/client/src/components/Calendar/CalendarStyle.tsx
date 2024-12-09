import React, { useEffect, useState } from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleDefaults } from './calendarStyleProperties';
import { StylePropertyDefinition } from '../../types/common';
import { usedComponents } from '../../App/usedComponents';
import { lazyCSSURL, lazyStylePropertyLoadFunction } from '../util/lazyStylePropertyUtil';

const PREFIX = '.comp.compCalendar';
const NAME = 'Calendar';
export default function CalendarStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const [styleProperties, setStyleProperties] = useState<Array<StylePropertyDefinition>>([]);

	useEffect(() => {
		const fn = lazyStylePropertyLoadFunction(NAME, setStyleProperties, styleDefaults);

		if (usedComponents.used(NAME)) fn();
		else usedComponents.register(NAME, fn);

		return () => usedComponents.deRegister(NAME);
	}, []);

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
