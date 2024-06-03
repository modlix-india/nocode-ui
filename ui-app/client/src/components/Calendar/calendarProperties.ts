import {
	SCHEMA_ANY_COMP_PROP,
	SCHEMA_BOOL_COMP_PROP,
	SCHEMA_NUM_COMP_PROP,
	SCHEMA_STRING_COMP_PROP,
	SCHEMA_VALIDATION,
} from '../../constants';
import {
	ComponentPropertyDefinition,
	ComponentPropertyEditor,
	ComponentPropertyGroup,
} from '../../types/common';
import { COMMON_COMPONENT_PROPERTIES, COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const WEEK_DAYS = [
	{
		name: '0',
		displayName: 'Sunday',
	},
	{
		name: '1',
		displayName: 'Monday',
	},
	{
		name: '2',
		displayName: 'Tuesday',
	},
	{
		name: '3',
		displayName: 'Wednesday',
	},
	{
		name: '4',
		displayName: 'Thursday',
	},
	{
		name: '5',
		displayName: 'Friday',
	},
	{
		name: '6',
		displayName: 'Saturday',
	},
];

const DATE_FORMATS = [
	{
		name: 'DD/MM/YYYY',
		displayName: 'DD/MM/YYYY',
	},
	{
		name: 'MM/DD/YYYY',
		displayName: 'MM/DD/YYYY',
	},
	{
		name: 'DD/MM/YYYY HH:mm',
		displayName: 'DD/MM/YYYY HH:mm (24 Hr)',
	},
	{
		name: 'MM/DD/YYYY HH:mm',
		displayName: 'MM/DD/YYYY HH:mm (24 Hr)',
	},
	{
		name: 'DD/MM/YYYY hh:mm A',
		displayName: 'DD/MM/YYYY hh:mm A (12 Hr)',
	},
	{
		name: 'MM/DD/YYYY hh:mm A',
		displayName: 'MM/DD/YYYY hh:mm A (12 Hr)',
	},
	{
		name: 'DD/MM/YYYY HH:mm:ss',
		displayName: 'DD/MM/YYYY HH:mm:ss (24 Hr)',
	},
	{
		name: 'MM/DD/YYYY HH:mm:ss',
		displayName: 'MM/DD/YYYY HH:mm:ss (24 Hr)',
	},
	{
		name: 'DD/MM/YYYY hh:mm:ss A',
		displayName: 'DD/MM/YYYY hh:mm:ss A (12 Hr)',
	},
	{
		name: 'MM/DD/YYYY hh:mm:ss A',
		displayName: 'MM/DD/YYYY hh:mm:ss A (12 Hr)',
	},
	{
		name: 'x',
		displayName: 'Milliseconds Since Epoch',
	},
	{
		name: 'X',
		displayName: 'Seconds Since Epoch',
	},
];

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'placeholder',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Dropdown placeholder',
		description: "Placeholder that's shown when no date is selected.",
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'showMandatoryAsterisk',
		displayName: 'Show Mandatory Asterisk',
		description: 'Show Mandatory Asterisk',
		schema: SCHEMA_BOOL_COMP_PROP,
		defaultValue: false,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'noFloat',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'No Float Label',
		description: 'Dropdown without floating label.',
		translatable: true,
		defaultValue: false,
		group: ComponentPropertyGroup.BASIC,
	},

	{
		name: 'label',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Dropdown Label text',
		description: "Label text that's shown on top of dropdown.",
		group: ComponentPropertyGroup.BASIC,
	},

	{
		name: 'closeOnMouseLeave',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Close dropdown on mouse leave',
		description:
			'Dropdown will be closed on mouse cursor leaving dropdown container when this property is true.',
		defaultValue: true,
		group: ComponentPropertyGroup.ADVANCED,
	},

	{
		name: 'minDate',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Minimum Date (In Storage Format)',
		description: 'Calendar minimum date to be shown',
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'maxDate',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Mximum Date (In Storage Format)',
		description: 'Calendar maximum date to be shown',
		group: ComponentPropertyGroup.BASIC,
	},

	{
		name: 'displayDateFormat',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Display Date Format',
		group: ComponentPropertyGroup.BASIC,
		description: 'Date Format to display',
		defaultValue: 'DD/MM/YYYY',
		enumValues: DATE_FORMATS,
	},

	{
		name: 'storageFormat',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Storage Format',
		group: ComponentPropertyGroup.BASIC,
		description: 'Date Format to store uses display format if not provided',
		enumValues: DATE_FORMATS,
	},

	{
		name: 'validation',
		schema: SCHEMA_VALIDATION,
		displayName: 'Validation',
		description: 'Validation Rule',
		editor: ComponentPropertyEditor.VALIDATION,
		group: ComponentPropertyGroup.VALIDATION,
		validationList: [
			{ name: 'MANDATORY', displayName: 'Mandatory' },
			{ name: 'DATE', displayName: 'Date Validation' },
		],
		multiValued: true,
	},

	COMMON_COMPONENT_PROPERTIES.readOnly,
	COMMON_COMPONENT_PROPERTIES.visibility,
	{
		...COMMON_COMPONENT_PROPERTIES.designType,
		displayName: 'Text Box Design Type',
		description: 'Text Box Design Type',
		enumValues: [
			...COMMON_COMPONENT_PROPERTIES.designType.enumValues!,
			{
				name: '_outlined',
				displayName: 'Outline Dropdown',
				description: 'Outline Dropdown type',
			},
			{
				name: '_filled',
				displayName: 'Filled Dropdown',
				description: 'Filled Dropdown type',
			},
			{ name: '_bigDesign1', displayName: 'Big Design 1', description: 'Big Design 1 type' },
			{ name: '_text', displayName: 'Text Dropdown', description: 'Text Dropdown' },
		],
	},
	COMMON_COMPONENT_PROPERTIES.colorScheme,
	{
		name: 'dateType',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Date Type',
		description: 'Date type to be selected',
		defaultValue: 'startDate',
		group: ComponentPropertyGroup.BASIC,
		enumValues: [
			{
				name: 'startDate',
				displayName: 'Start Date',
				description: 'Start date type',
			},
			{
				name: 'endDate',
				displayName: 'endDate',
				description: 'End date type',
			},
		],
	},
	{
		name: 'numberOfDaysInRange',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Number of Days in Range',
		group: ComponentPropertyGroup.DATA,
	},
	{
		name: 'disableDates',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Disable Dates (In Storage Format)',
		description: 'Input the dates to disable those on calendar',
		multiValued: true,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'disableTemporalRange',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Disable Date Range',
		description: 'disbale disable dates which is either past or future',
		group: ComponentPropertyGroup.DATA,
		enumValues: [
			{
				name: 'disableTodayFuture',
				displayName: 'Disable Today and Future Dates',
			},
			{ name: 'disableTodayPast', displayName: 'Disable Today and Past Dates' },
			{ name: 'disableToday', displayName: 'Disable Today' },
			{ name: 'disableFuture', displayName: 'Disable Future Dates' },
			{ name: 'disablePast', displayName: 'Disable Past Dates' },
		],
	},
	{
		name: 'disableDays',
		schema: SCHEMA_STRING_COMP_PROP,
		multiValued: true,
		displayName: 'Disable Days',
		description: 'Disbale the selected day of week',
		group: ComponentPropertyGroup.DATA,
		enumValues: WEEK_DAYS,
	},
	{
		name: 'componentDesignType',
		schema: SCHEMA_ANY_COMP_PROP,
		displayName: 'Component Type',
		group: ComponentPropertyGroup.ADVANCED,
		defaultValue: 'simpleCalendar',
		enumValues: [
			{
				name: 'simpleCalendar',
				displayName: 'With Text Box',
				description: 'Calender with text box',
			},
			{
				name: 'fullCalendar',
				displayName: 'Only Calendar',
				description: 'Only Calendar',
			},
		],
	},
	{
		name: 'timeDesignType',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Time Type',
		description: 'Time type to be selected',
		defaultValue: 'none',
		group: ComponentPropertyGroup.ADVANCED,
		enumValues: [
			{
				name: 'None',
				displayName: 'None',
			},
			{
				name: 'comboBoxes12Hr',
				displayName: 'Combo Boxes 12 Hr',
			},
			{
				name: 'comboBoxes24Hr',
				displayName: 'Combo Boxes 24 Hr',
			},
			{
				name: 'dial',
				displayName: 'Dial',
			},
			{
				name: 'comboBoxes12HrAndSeconds',
				displayName: 'Combo Boxes 12 Hr and Seconds',
			},
			{
				name: 'comboBoxes24HrAndSeconds',
				displayName: 'Combo Boxes 24 Hr and Seconds',
			},
		],
	},
	{
		name: 'hourIntervalFrom',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Hour Interval From (0-23)',
		defaultValue: 0,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'hourInterval',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Hour Interval (0-23)',
		defaultValue: 1,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'minuteIntervalFrom',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Minute Interval From (0-59)',
		defaultValue: 0,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'minuteInterval',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Minute Interval (0-59)',
		defaultValue: 1,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'secondIntervalFrom',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Second Interval From (0-59)',
		defaultValue: 0,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'secondInterval',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Second Interval (0-59)',
		defaultValue: 1,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'arrowButtonsHorizontalPlacement',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Arrow Buttons Horizontal Placement',
		description: 'Arrow buttons Placement Horizontal',
		editor: ComponentPropertyEditor.ENUM,
		defaultValue: '_either',
		group: ComponentPropertyGroup.ADVANCED,
		enumValues: [
			{
				name: '_left',
				displayName: 'Left',
				description: 'Arrow navigations button positioned Left',
			},
			{
				name: '_right',
				displayName: 'Right',
				description: 'Arrow navigations button positioned Right',
			},
			{
				name: '_either',
				displayName: 'Either Side',
				description: 'Arrow navigations button positioned on either side',
			},
		],
	},
	{
		name: 'calendarFormat',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Calendar Format',
		description: 'Calendar Format',
		group: ComponentPropertyGroup.ADVANCED,
		defaultValue: 'showCurrentMonth',
		enumValues: [
			{
				name: 'showCurrentMonth',
				displayName: 'Show Current Month',
			},
			{
				name: 'showCurrentMonthAndNext',
				displayName: 'Show Current Month and Next',
			},
			{
				name: 'showCurrentMonthAndPrevious',
				displayName: 'Show Current Month and Previous',
			},
			{
				name: 'showPreviousCurrentAndNextMonth',
				displayName: 'Show Previous, Current and Next Month',
			},
			{
				name: 'showCurrentAndNextTwoMonths',
				displayName: 'Show Current and Next Two Months',
			},
			{
				name: 'showCurrentAndPreviousTwoMonths',
				displayName: 'Show Current and Previous Two Months',
			},
			{
				name: 'showFourMonths',
				displayName: 'Show Four Months',
			},
			{
				name: 'showSixMonths',
				displayName: 'Show Six Year',
			},
			{
				name: 'showTwelveMonths',
				displayName: 'Show Tweleve Months',
			},
			{
				name: 'showCurrentYear',
				displayName: 'Show Current Year',
			},
		],
	},
	{
		name: 'showWeekNumber',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show Week Number',
		group: ComponentPropertyGroup.ADVANCED,
		defaultValue: false,
	},
	{
		name: 'highlightToday',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Highlight Today',
		group: ComponentPropertyGroup.ADVANCED,
		defaultValue: true,
	},
	{
		name: 'weekStartsOn',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Week Starts On',
		group: ComponentPropertyGroup.ADVANCED,
		defaultValue: '0',
		enumValues: WEEK_DAYS,
	},
	{
		name: 'lowLightWeekEnds',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Low Light Week Ends',
		description: 'Low Light Number of days on Week Ends',
		group: ComponentPropertyGroup.ADVANCED,
		defaultValue: 0,
	},
	{
		name: 'showPreviousNextMonthDate',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show Previous Next Month Date',
		description:
			'Fill the empty spaces in the month start and end with previous and next month dates',
		group: ComponentPropertyGroup.ADVANCED,
		defaultValue: false,
	},
	{
		name: 'isMultiSelect',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Is MultiSelect',
		description: 'Allows the users to select multiple dates.',
		defaultValue: false,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'multipleDateSeparator',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Multiple Date Separator',
		description: 'Separator for multiple dates',
		defaultValue: ',',
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'disableTextEntry',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Disable Text Entry',
		description: 'Disable Text Entry',
		defaultValue: false,
	},
	COMMON_COMPONENT_PROPERTIES.onChange,
	{
		name: 'leftIcon',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Left Icon',
		description: 'Icon to be shown on the left side.',
		editor: ComponentPropertyEditor.ICON,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'leftArrowImage',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Left Arrow Image',
		group: ComponentPropertyGroup.ADVANCED,
		editor: ComponentPropertyEditor.IMAGE,
	},
	{
		name: 'rightArrowImage',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Right Arrow Image',
		group: ComponentPropertyGroup.ADVANCED,
		editor: ComponentPropertyEditor.IMAGE,
	},
];

const stylePropertiesDefinition = {
	'': [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	calendarHeader: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	calendarBodyContainer: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	calendarBody: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	leftArrow: [
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	rigthArrow: [
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	weekName: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	date: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	monthName: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	disabledDate: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	prevNextMonthDate: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	todayDate: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	selectedDate: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	weekendLowLightDate: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	leftIcon: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
	],
	rightIcon: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
	],
	inputBox: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	label: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	asterisk: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	supportText: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	errorText: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	errorTextContainer: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
};

export { propertiesDefinition, stylePropertiesDefinition };
