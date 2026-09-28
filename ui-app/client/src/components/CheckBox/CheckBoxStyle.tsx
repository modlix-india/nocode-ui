import { useEffect, useState } from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleDefaults, styleProperties, stylePropertiesForTheme } from './checkBoxStyleProperties';
import { usedComponents } from '../../App/usedComponents';
import { findPropertyDefinitions, inflateAndSetStyleProps } from '../util/lazyStylePropertyUtil';
import { propertiesDefinition } from './checkBoxProperties';

const PREFIX = '.comp.compCheckbox';
const NAME = 'CheckBox';
export default function CheckBoxStyle({
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
		const { designType, colorScheme } = findPropertyDefinitions(
			propertiesDefinition,
			'designType',
			'colorScheme',
		);

		const fn = () =>
			setTimeout(() => {
				inflateAndSetStyleProps(
					[designType, colorScheme],
					stylePropertiesForTheme,
					(props, _) => styleProperties.splice(0, 0, ...props),
					styleDefaults,
				);
				setReRender(Date.now());
			}, 100);

		if (usedComponents.used(NAME)) fn();
		usedComponents.register(NAME, fn);

		return () => usedComponents.deRegister(NAME);
	}, [setReRender]);

	// The shared `span.commonCheckbox` / `span.commonTriStateCheckbox` geometry
	// that used to sit here now lives in commonCheckboxCss.ts, emitted by
	// AppStyle. It is used by chrome that has no CheckBox on the page -- the
	// page editor's boolean properties, Dropdown, TableGrid, RadioButton -- and
	// this block is only emitted once a CheckBox has actually rendered.
	const css =
		`
    /*
     * The root is a block holding one inline-flex label, so its height came
     * from the INHERITED font's line-height strut, not from the label. Where
     * the surrounding text is larger than the checkbox's own, that left a few
     * pixels of dead space below the content, the label and box sat in the top
     * of the wrapper, and anything centred beside it in a flex row (a help
     * icon, say) came out low. Laying the root out as flex kills the strut, so
     * the wrapper is exactly the label's height.
     */
    ${PREFIX} {
        display: flex;
        align-items: center;
    }

    ${PREFIX} .checkbox {
        display: inline-flex;
        gap: 5px;
        justify-items: center;
        text-align: center;
        align-items: center;
        position: relative;
        
    }
    ${PREFIX} .checkbox.horizontal {
        flex-direction: row;
    }

    ${PREFIX} .checkbox.vertical {
        flex-direction: column;
    }

    ${PREFIX} span.commonCheckbox {
        min-width: 16px;
        min-height: 16px;
    }
    ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="CheckboxCss">{css}</style>;
}
