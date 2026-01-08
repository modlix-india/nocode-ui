import { TokenValueExtractor, isNullValue } from '@fincity/kirun-js';
import { getData ,UrlDetailsExtractor} from '../../context/StoreContext';
import {
	ComponentMultiProperty,
	ComponentPropertyDefinition,
	ComponentPropertyEditor,
	LocationHistory,
} from '../../types/common';
import { ANIMATION_PROPERTIES } from './properties';

export function makePropertiesObject(
	properties: ComponentPropertyDefinition[],
	propertyValues: any,
	locationHistory: LocationHistory[],
	tokenExtractors: TokenValueExtractor[],
): any {
	return properties
		.map(e => {
			let value = e.defaultValue;

			if (!propertyValues) return [e.name, value];

			if (e.multiValued) {
				if (!isNullValue(propertyValues[e.name])) {
					if (
						e.editor === ComponentPropertyEditor.ANIMATION ||
						e.editor === ComponentPropertyEditor.ANIMATIONOBSERVER
					) {
						value = Object.entries(
							propertyValues[e.name] as ComponentMultiProperty<any>,
						)
							.sort((a, b) => (a[1].order ?? 0) - (b[1].order ?? 0))
							.map(([key, each]) => {
								return {
									...makePropertiesObject(
										ANIMATION_PROPERTIES,
										each.property.value,
										locationHistory,
										tokenExtractors,
									),
									key,
								};
							});
					} else {
						if (propertyValues[e.name].fullValue)
							value = getData(
								propertyValues[e.name].fullValue.property,
								locationHistory,
								...tokenExtractors,
							);
						else
							value = Object.values(
								propertyValues[e.name] as ComponentMultiProperty<any>,
							)
								.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
								.map(each =>
									getData(each.property, locationHistory, ...tokenExtractors),
								);
					}
				}
			} else {
				value =
					getData(propertyValues[e.name], locationHistory, ...tokenExtractors) ?? value;
			}

			return [e.name, value];
		})
		.filter(e => !isNullValue(e[1]))
		.reduce((a: any, [k, v]) => {
			a[k] = v;
			return a;
		}, {});
}
