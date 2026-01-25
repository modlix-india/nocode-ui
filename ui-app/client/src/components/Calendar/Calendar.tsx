import { isNullValue } from '@fincity/kirun-js';
import React, { Suspense } from 'react';
import { PageStoreExtractor, UrlDetailsExtractor } from '../../context/StoreContext';
import {
	Component,
	ComponentDefinition,
	ComponentPropertyDefinition,
	ComponentProps,
	LocationHistory,
} from '../../types/common';
import { IconHelper } from '../util/IconHelper';
import { findPropertyDefinitions } from '../util/lazyStylePropertyUtil';
import { makePropertiesObject } from '../util/make';
import CalendarStyle from './CalendarStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './calendarProperties';
import { styleDefaults, stylePropertiesForTheme } from './calendarStyleProperties';
import { getValidDate, validateWithProps } from './components/calendarFunctions';
import { CalendarValidationProps } from './components/calendarTypes';

const LazyCalendar = React.lazy(() => import(/* webpackChunkName: "Calendar" */ './LazyCalendar'));
function LoadLazyCalendar(props: Readonly<ComponentProps>) {
	return (
		<Suspense fallback={<>...</>}>
			<LazyCalendar {...props} />
		</Suspense>
	);
}

const { designType, colorScheme, calendarDesignType } = findPropertyDefinitions(
	propertiesDefinition,
	'designType',
	'colorScheme',
	'calendarDesignType',
);

const component: Component = {
	order: 17,
	name: 'Calendar',
	displayName: 'Calendar',
	description: 'Calendar component',
	component: LoadLazyCalendar,
	styleComponent: CalendarStyle,
	styleDefaults: styleDefaults,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	stylePseudoStates: ['hover', 'focus', 'disabled'],
	styleProperties: stylePropertiesDefinition,
	bindingPaths: {
		bindingPath: { name: 'Start Date Binding' },
		bindingPath2: { name: 'End Date Binding' },
		bindingPath3: { name: 'Browsing month-year (mm-yyyy) Binding ' },
	},
	defaultTemplate: {
		key: '',
		name: 'Calendar',
		type: 'Calendar',
		properties: {
			label: { value: 'Calendar' },
		},
	},
	sections: [],
		validations: {
		DATE: function (
			validation: any,
			value: any,
			def: ComponentDefinition,
			locationHistory: Array<LocationHistory>,
			pageExtractor: PageStoreExtractor,
		): Array<string> {
			if (!value) return [];

			let props = makePropertiesObject(
				propertiesDefinition,
				def.properties,
				locationHistory,
				pageExtractor ? [pageExtractor] : [],
			);

			let { storageFormat, displayDateFormat, multipleDateSeparator } = props;

			if (!storageFormat) storageFormat = displayDateFormat;

			let dates = ('' + value)
				.split(multipleDateSeparator)
				.map(e => getValidDate(e, storageFormat!))
				.map(e => validateWithProps(e, props as CalendarValidationProps));

			if (dates.findIndex(e => isNullValue(e)) != -1) return [validation.message];

			return [];
		},
	},
	stylePropertiesForTheme: stylePropertiesForTheme,
	externalStylePropsForThemeJson: true,
	propertiesForTheme: [calendarDesignType, designType, colorScheme],
};

export default component;
