import { useEffect, useState } from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './rangeSliderStyleProperties';
import { usedComponents } from '../../App/usedComponents';
import { lazyCSSURL } from '../util/lazyStylePropertyUtil';

const PREFIX = '.comp.compRangeSlider';
const NAME = 'RangeSlider';

export default function RangeSliderStyle({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
	const [used, setUsed] = useState(usedComponents.used(NAME));

	useEffect(() => {
		const fn = () => setTimeout(() => setUsed(true), 100);

		if (usedComponents.used(NAME)) fn();
		usedComponents.register(NAME, fn);

		return () => usedComponents.deRegister(NAME);
	}, [setUsed]);

	const css = processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return (
		<>
			{used ? <link key="externalCSS" rel="stylesheet" href={lazyCSSURL(NAME)} /> : <></>}
			<style id="RangeSliderCss">{css}</style>{' '}
		</>
	);
}
