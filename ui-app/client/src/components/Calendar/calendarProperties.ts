import {
    SCHEMA_ANY_COMP_PROP,
    SCHEMA_BOOL_COMP_PROP,
    SCHEMA_STRING_COMP_PROP,
} from '../../constants';
import {
    ComponentPropertyDefinition,
    ComponentPropertyEditor,
    ComponentPropertyGroup,
} from '../../types/common';
import { COMMON_COMPONENT_PROPERTIES, COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
    {
        name: 'placeholder',
        schema: SCHEMA_STRING_COMP_PROP,
        displayName: 'placeholder',
        description: "Placeholder that show when nothing is given in the calendar input box.",
        group: ComponentPropertyGroup.BASIC,
    },
    {
        name: 'minDate',
        schema: SCHEMA_STRING_COMP_PROP,
        displayName: 'minimum date',
        description: "Calendar minimum date to be shown",
        group: ComponentPropertyGroup.BASIC,
    },
    {
        name: 'maxDate',
        schema: SCHEMA_STRING_COMP_PROP,
        displayName: 'maximum date',
        description: "Calendar maximum date to be shown",
        group: ComponentPropertyGroup.BASIC,
    },
    {
        name: 'dateFormat',
        schema: SCHEMA_STRING_COMP_PROP,
        displayName: 'Date Format',
        description: 'Date Format to select',
        group: ComponentPropertyGroup.ADVANCED,
        defaultValue: 'UTC_TO_MM/DD/YYYY',
        enumValues: [
            {
                name: 'UTC_TO_MM/DD/YYYY',
                displayName: 'MM/DD/YYYY',
                description: 'MM/DD/YYYY',
            },
            {
                name: 'UTC_TO_MM/DD/YYYY_HH:MM',
                displayName: 'MM/DD/YYYY HH:MM',
                description: 'MM/DD/YYYY HH:MM',
            },
            {
                name: 'UTC_TO_MM/DD/YYYY_HH:MM:SS',
                displayName: 'MM/DD/YYYY HH:MM:SS',
                description: 'MM/DD/YYYY HH:MM:SS',
            },
            {
                name: 'UTC_TO_MM/DD/YYYY_HH:MM:SS.SSS',
                displayName: 'MM/DD/YYYY HH:MM:SS.SSS',
                description: 'MM/DD/YYYY HH:MM:SS.SSS',
            },
            {
                name: 'UTC_TO_YYYY-MM-DD',
                displayName: 'YYYY-MM-DD',
                description: 'YYYY-MM-DD',
            },
            {
                name: 'UTC_TO_YYYY-MM-DD_HH:MM',
                displayName: 'YYYY-MM-DD HH:MM',
                description: 'YYYY-MM-DD HH:MM',
            },
            {
                name: 'UTC_TO_YYYY-MM-DD_HH:MM:SS',
                displayName: 'YYYY-MM-DD HH:MM:SS',
                description: 'YYYY-MM-DD HH:MM:SS',
            },
            {
                name: 'UTC_TO_YYYY-MM-DD_HH:MM:SS.SSS',
                displayName: 'YYYY-MM-DD HH:MM:SS.SSS',
                description: 'YYYY-MM-DD HH:MM:SS.SSS',
            },
            {
                name: 'UTC_TO_MONTH_DD,YYYY',
                displayName: 'Month DD, YYYY',
                description: 'Month DD, YYYY',
            },
            {
                name: 'UTC_TO_MONTH_DD,YYYY_HH:MM',
                displayName: 'Month DD, YYYY HH:MM',
                description: 'Month DD, YYYY HH:MM',
            },
            {
                name: 'UTC_TO_MONTH_DD,YYYY_HH:MM:SS',
                displayName: 'Month DD, YYYY HH:MM:SS',
                description: 'Month DD, YYYY HH:MM:SS',
            },
            {
                name: 'UTC_TO_MONTH_DD,YYYY_HH:MM:SS.SSS',
                displayName: 'Month DD, YYYY HH:MM:SS.SSS',
                description: 'Month DD, YYYY HH:MM:SS.SSS',
            }
        ],
    },
    {
        name: 'noFloat',
        schema: SCHEMA_BOOL_COMP_PROP,
        displayName: 'No Float Label',
        description: 'Calendar without floating label.',
        translatable: true,
        defaultValue: false,
        group: ComponentPropertyGroup.BASIC,
    },
    {
        name: 'onlyDays',
        schema: SCHEMA_BOOL_COMP_PROP,
        displayName: 'Show Only days',
        description: 'Show Days only hide year and month',
        translatable: true,
        defaultValue: true,
        group: ComponentPropertyGroup.BASIC,
    },
    {
        name: 'label',
        schema: SCHEMA_STRING_COMP_PROP,
        displayName: 'Label text',
        description: "Label text that's shown on top of calendar.",
        group: ComponentPropertyGroup.BASIC,
    },
    COMMON_COMPONENT_PROPERTIES.validation,
    COMMON_COMPONENT_PROPERTIES.readOnly,
    COMMON_COMPONENT_PROPERTIES.visibility,
    {
        name: 'iconType',
        schema: SCHEMA_STRING_COMP_PROP,
        displayName: 'Icon Type',
        description: 'Icon type for the calendar icon.',
        group: ComponentPropertyGroup.ADVANCED,
        defaultValue: 'regular',
        enumValues: [
            {
                name: 'regular',
                displayName: 'Regular Icon',
                description: 'Regular Calendar Icon type',
            },
            {
                name: 'solid',
                displayName: 'solid Icon',
                description: 'solid Calendar Icon type',
            }
        ]
    },
    {
        ...COMMON_COMPONENT_PROPERTIES.designType,
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
        name: "dateType",
        schema: SCHEMA_STRING_COMP_PROP,
        displayName: 'Date Type',
        description: 'Date type to be selected',
        defaultValue: 'startDate',
        group: ComponentPropertyGroup.BASIC,
        enumValues: [
            {
                name: 'startDate',
                displayName: 'Start Date',
                description: 'Start date type'
            },
            {
                name: 'endDate',
                displayName: 'endDate',
                description: 'End date type'
            }
        ]
    },
    {
        name: "disableDates",
        schema: SCHEMA_STRING_COMP_PROP,
        displayName: 'Disable Dates',
        description: 'Input the dates to disable those on calendar',
        group: ComponentPropertyGroup.BASIC,
    },
    {
        name: "disableTemporalRange",
        schema: SCHEMA_STRING_COMP_PROP,
        displayName: 'Disable Date Range',
        description: 'disbale disable dates which is either past or future',
        group: ComponentPropertyGroup.DATA,
        enumValues: [
            {
                name: '_disableFuture',
                displayName: 'Disable Future',
                description: 'disable future dates'
            },
            {
                name: '_disablePast',
                displayName: 'Disable Past',
                description: 'disable past dates'
            },
        ]
    },
    {
        ...COMMON_COMPONENT_PROPERTIES.datatype,
        enumValues: [
            {
                name: 'LIST_OF_STRINGS',
                displayName: 'List of strings',
                description: 'data has an array of strings',
            },
        ],
    },
    {
        name: "disbaleDays",
        schema: SCHEMA_STRING_COMP_PROP,
        multiValued: true,
        displayName: 'Disable Days',
        description: 'Disbale the selected day of week',
        group: ComponentPropertyGroup.DATA,
        enumValues: [
            {
                name: '0',
                displayName: 'Sunday',
                description: 'first day of week'
            },
            {
                name: '1',
                displayName: 'Monday',
                description: 'second day of week'
            },
            {
                name: '2',
                displayName: 'Tuesday',
                description: 'third day of week'
            },
            {
                name: '3',
                displayName: 'Wednesday',
                description: 'fourth day of week'
            },
            {
                name: '4',
                displayName: 'Thursday',
                description: 'fifth day of week'
            },
            {
                name: '5',
                displayName: 'Friday',
                description: 'sixth day of week'
            },
            {
                name: '6',
                displayName: 'Saturday',
                description: 'seventh day of week'
            }
        ]
    },
    COMMON_COMPONENT_PROPERTIES.uniqueKeyType,
    {
        name: "calendarDesignType",
        schema: SCHEMA_ANY_COMP_PROP,
        displayName: 'Calendar Designs',
        description: 'calendar design styles',
        group: ComponentPropertyGroup.BASIC,
        defaultValue: '_simpleCalendar',
        enumValues: [
            {
                name: '_simpleCalendar',
                displayName: 'Simple Calendar',
                description: 'simple calendar design',
            },
            {
                name: '_fullCalendar',
                displayName: 'Full Calendar',
                description: 'full calendar design',
            },
        ]
    },
    {
        name: 'arrowButtonsHorizontalPlacement',
        schema: SCHEMA_STRING_COMP_PROP,
        displayName: 'Arrow Buttons Horizontal Placement',
        description: 'Arrow buttons Placement Horizontal',
        editor: ComponentPropertyEditor.ENUM,
        defaultValue: '_center',
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
                name: '_center',
                displayName: 'Center',
                description: 'Arrow navigations button positioned Middle',
            },
        ],
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
    dateContainer: [
        COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
        COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
        COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
        COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
        COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
        COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
        COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
    ],
    dateText: [
        COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
        COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
        COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
        COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
        COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
    ],
    arrowButton: [
        COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
        COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
        COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
        COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
        COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
        COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
        COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
    ],
    calendar: [
        COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
        COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
        COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
        COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
        COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
        COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
        COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
    ],
    calendarHead: [
        COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
        COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
        COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
        COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
        COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
        COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
    ],
    calendarRow: [
        COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
        COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
        COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
        COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
        COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
        COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
    ],
    date: [
        COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
        COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
        COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
        COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
        COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
        COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
        COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
    ],
    calendarBody: [
        COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
        COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
        COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
        COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
        COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
        COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
    ]
};

export { propertiesDefinition, stylePropertiesDefinition };
