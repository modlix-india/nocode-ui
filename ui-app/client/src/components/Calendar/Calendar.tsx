import { isNullValue } from '@fincity/kirun-js';
import React, { Suspense } from 'react';
import { PageStoreExtractor } from '../../context/StoreContext';
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
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			icon: (
				<IconHelper viewBox="0 0 30 31">
					<path
						d="M9.375 1.875C9.375 0.837891 8.53711 0 7.5 0C6.46289 0 5.625 0.837891 5.625 1.875V3.75H2.8125C1.25977 3.75 0 5.00977 0 6.5625V11.25H26.25V6.5625C26.25 5.00977 24.9902 3.75 23.4375 3.75H20.625V1.875C20.625 0.837891 19.7871 0 18.75 0C17.7129 0 16.875 0.837891 16.875 1.875V3.75H9.375V1.875Z"
						fill="#EDEAEA"
					/>
					<path
						className="_calender31bg"
						d="M0 11H26.25V28C26.25 29.6569 24.9069 31 23.25 31H3C1.34315 31 0 29.6569 0 28V11Z"
						fill="#1D96F1"
					/>
					<path
						className="_calender31num"
						d="M9.62358 26.1392C8.84801 26.1392 8.16027 26.0066 7.56037 25.7415C6.96378 25.473 6.49313 25.1035 6.14844 24.6328C5.80374 24.1622 5.62808 23.6203 5.62145 23.0071H8.0973C8.10724 23.2292 8.1785 23.4264 8.31108 23.5987C8.44366 23.7678 8.62429 23.9003 8.85298 23.9964C9.08168 24.0926 9.34186 24.1406 9.63352 24.1406C9.92519 24.1406 10.1821 24.0893 10.4041 23.9865C10.6295 23.8804 10.8052 23.7363 10.9311 23.554C11.0571 23.3684 11.1184 23.1562 11.1151 22.9176C11.1184 22.679 11.0504 22.4669 10.9112 22.2812C10.772 22.0956 10.5748 21.9515 10.3196 21.8487C10.0677 21.746 9.76941 21.6946 9.42472 21.6946H8.43537V19.9446H9.42472C9.72633 19.9446 9.99148 19.8949 10.2202 19.7955C10.4522 19.696 10.6328 19.5568 10.7621 19.3778C10.8913 19.1955 10.9543 18.9867 10.951 18.7514C10.9543 18.5227 10.8996 18.3222 10.7869 18.1499C10.6776 17.9742 10.5234 17.8383 10.3246 17.7422C10.129 17.6461 9.90199 17.598 9.64347 17.598C9.37169 17.598 9.12476 17.6461 8.9027 17.7422C8.68395 17.8383 8.50994 17.9742 8.38068 18.1499C8.25142 18.3255 8.18348 18.5294 8.17685 18.7614H5.82528C5.83191 18.1548 6.00095 17.6212 6.33239 17.1605C6.66383 16.6965 7.11458 16.3336 7.68466 16.0717C8.25805 15.8099 8.91099 15.679 9.64347 15.679C10.3726 15.679 11.014 15.8066 11.5675 16.0618C12.121 16.317 12.5518 16.665 12.8601 17.1058C13.1683 17.5433 13.3224 18.0388 13.3224 18.5923C13.3258 19.1657 13.1385 19.638 12.7607 20.0092C12.3861 20.3804 11.9039 20.6091 11.3139 20.6953V20.7749C12.1027 20.8677 12.6977 21.1229 13.0987 21.5405C13.5031 21.9581 13.7036 22.4801 13.7003 23.1065C13.7003 23.6965 13.5263 24.2202 13.1783 24.6776C12.8336 25.1316 12.353 25.4896 11.7365 25.7514C11.1233 26.0099 10.419 26.1392 9.62358 26.1392ZM19.7967 15.8182V26H17.3407V18.1151H17.2811L15.0041 19.5071V17.3793L17.5147 15.8182H19.7967Z"
						fill="white"
					/>
					<path
						className="_calender01bg"
						d="M0 11H26.25V28C26.25 29.6569 24.9069 31 23.25 31H3C1.34315 31 0 29.6569 0 28V11Z"
						fill="#1D96F1"
						opacity={0}
					/>
					<path
						className="_calender01num"
						d="M9.96165 26.2486C9.07339 26.2486 8.30777 26.0381 7.66477 25.6172C7.02178 25.1929 6.52628 24.5848 6.17827 23.7926C5.83026 22.9972 5.65791 22.041 5.66122 20.924C5.66454 19.8071 5.83854 18.8591 6.18324 18.0803C6.53125 17.2981 7.02509 16.7031 7.66477 16.2955C8.30777 15.8845 9.07339 15.679 9.96165 15.679C10.8499 15.679 11.6155 15.8845 12.2585 16.2955C12.9048 16.7031 13.402 17.2981 13.75 18.0803C14.098 18.8625 14.2704 19.8104 14.267 20.924C14.267 22.0443 14.093 23.0021 13.745 23.7976C13.397 24.593 12.9015 25.2012 12.2585 25.6222C11.6188 26.0398 10.8532 26.2486 9.96165 26.2486ZM9.96165 24.2351C10.492 24.2351 10.9212 23.965 11.2493 23.4247C11.5774 22.8812 11.7398 22.0476 11.7365 20.924C11.7365 20.1882 11.6619 19.5817 11.5128 19.1044C11.3636 18.6238 11.1565 18.2659 10.8913 18.0305C10.6262 17.7952 10.3163 17.6776 9.96165 17.6776C9.43466 17.6776 9.00876 17.9444 8.68395 18.478C8.35914 19.0083 8.19508 19.8236 8.19176 20.924C8.18845 21.6697 8.25971 22.2879 8.40554 22.7784C8.55469 23.2689 8.76349 23.6352 9.03196 23.8771C9.30043 24.1158 9.61032 24.2351 9.96165 24.2351ZM20.3846 15.8182V26H17.9286V18.1151H17.869L15.592 19.5071V17.3793L18.1026 15.8182H20.3846Z"
						fill="white"
						opacity={0}
					/>
				</IconHelper>
			),
			mainComponent: true,
		},
		{
			name: 'calendarHeader',
			displayName: 'Calendar Header',
			description: 'Calendar Header',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'calendarBodyMonths',
			displayName: 'Calendar Body Months',
			description: 'Calendar Body Months',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'calendarBodyBrowseYears',
			displayName: 'Calendar Body Browse Years',
			description: 'Calendar Body Browse Years',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'calendarBodyBrowseMonths',
			displayName: 'Calendar Body Browse Months',
			description: 'Calendar Body Browse Months',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'calendarHeaderTitle',
			displayName: 'Calendar Header Title',
			description: 'Calendar Header Title',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'calendarHeaderMonthsContainer',
			displayName: 'Calendar Months Container Above Month',
			description: 'Calendar Months Container Above Month',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'calendarHeaderMonths',
			displayName: 'Calendar Month Above Month',
			description: 'Calendar Month Above Month',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'calendar',
			displayName: 'Calendar Body Container',
			description: 'Calendar Body Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'leftArrow',
			displayName: 'Left Arrow',
			description: 'Left Arrow',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'leftArrowImage',
			displayName: 'Left Arrow Image',
			description: 'Left Arrow Image',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'rightArrow',
			displayName: 'Right Arrow',
			description: 'Right Arrow',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'rightArrowImage',
			displayName: 'Right Arrow Image',
			description: 'Right Arrow Image',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'weekName',
			displayName: 'Week Name',
			description: 'Week Name',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'month',
			displayName: 'Month',
			description: 'Month',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'date',
			displayName: 'Date',
			description: 'Date',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'monthName',
			displayName: 'Month Name',
			description: 'Month Name',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'yearNumber',
			displayName: 'Year Number',
			description: 'Year Number',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'prevNextMonthDate',
			displayName: 'Prev Next Month Date',
			description: 'Prev Next Month Date',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'todayDate',
			displayName: 'Today Date',
			description: 'Today Date',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'selectedDate',
			displayName: 'Selected Date',
			description: 'Selected Date',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'emptyDate',
			displayName: 'Empty Date',
			description: 'Empty Date',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'weekendLowLightDate',
			displayName: 'Weekend Low Light Date',
			description: 'Weekend Low Light Date',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'weekNumber',
			displayName: 'Week Number',
			description: 'Week Number',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'dropDownContainer',
			displayName: 'Drop Down Container',
			description: 'Drop Down Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'leftIcon',
			displayName: 'Left Icon',
			description: 'Left Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'rightIcon',
			displayName: 'Right Icon',
			description: 'Right Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'inputBox',
			displayName: 'Input Box',
			description: 'Input Box',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'label',
			displayName: 'Label',
			description: 'Label',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'asterisk',
			displayName: 'Asterisk',
			description: 'Asterisk',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'supportText',
			displayName: 'Support Text',
			description: 'Support Text',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'errorText',
			displayName: 'Error Text',
			description: 'Error Text',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'errorTextContainer',
			displayName: 'Error Text Container',
			description: 'Error Text Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'editRequestIcon',
			displayName: 'Edit Request Icon',
			description: 'Edit Request Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'editConfirmIcon',
			displayName: 'Edit Confirm Icon',
			description: 'Edit Confirm Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'editCancelIcon',
			displayName: 'Edit Cancel Icon',
			description: 'Edit Cancel Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'editConfirmCancelContainer',
			displayName: 'Edit Confirm Cancel Container',
			description: 'Edit Confirm Cancel Container',
			icon: 'fa-solid fa-box',
		},
	],
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
