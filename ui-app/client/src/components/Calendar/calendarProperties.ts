import { Schema } from '@fincity/kirun-js';
import {
    SCHEMA_REF_ANY_COMP_PROP,
    SCHEMA_REF_BOOL_COMP_PROP,
    SCHEMA_REF_STRING_COMP_PROP,
} from '../../constants';
import {
    ComponentPropertyDefinition,
    ComponentPropertyEditor,
    ComponentPropertyGroup,
} from '../../types/common';
import { COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
    {
        name: 'defaultValue',
        schema: Schema.ofRef(SCHEMA_REF_ANY_COMP_PROP),
        displayName: 'Default Value',
        description: 'This value is use when the data entered is empty or not entered.',
    },
    {
        name: 'readOnly',
        schema: Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP),
        displayName: 'Read Only',
        description: 'Calendar will be rendered un editable when this property is true.',
        group: ComponentPropertyGroup.COMMON,
    },
    {
        name: 'dateFormat',
        schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
        displayName: 'Date Format',
        description: 'This value is used when we want to display the format of the input and parse the date.',
        editor: ComponentPropertyEditor.ENUM,
        defaultValue: 'MM/DD/YYYY',
        enumValues: [
            {
                name: 'MMM D, YY',
                displayName: 'MMM D, YY',
                description: 'Javascript MMM D, YY Format Type',
            },
            {
                name: 'YYYY-MM-DD',
                displayName: 'YYYY-MM-DD',
                description: 'Javascript YYYY-MM-DD Format Type',
            },
            {
                name: 'MM/DD/YY',
                displayName: 'MM/DD/YY',
                description: 'Javascript MM/DD/YY Format Type',
            },
            {
                name: 'MMM DD, YYYY',
                displayName: 'MMM DD, YYYY',
                description: 'Javascript MMM DD, YYYY Format Type',
            },
            {
                name: 'MMMM DD, YYYY',
                displayName: 'MMMM DD, YYYY',
                description: 'Javascript MMMM DD, YYYY Format Type',
            },
            {
                name: 'dd MMM D YY',
                displayName: 'dd MMM D YY',
                description: 'Javascript dd MMM D YY Format Type',
            },
            {
                name: 'YYYY-MM-DD',
                displayName: 'YYYY-MM-DD',
                description: 'Javascript YYYY-MM-DD Format Type',
            },
            {
                name: 'YYYY-MM-DD HH:mm',
                displayName: 'YYYY-MM-DD HH:mm',
                description: 'Javascript YYYY-MM-DD HH:mm Format Type',
            },
            {
                name: 'YYYY-MM-DD hh:mm A',
                displayName: 'YYYY-MM-DD hh:mm A',
                description: 'Javascript YYYY-MM-DD hh:mm A Format Type',
            },
            {
                name: 'YYYY-MM-DD HH:mm:ss',
                displayName: 'YYYY-MM-DD HH:mm:ss',
                description: 'Javascript YYYY-MM-DD HH:mm:ss Format Type',
            },
            {
                name: 'YYYY-MM-DD hh:mm:ss A',
                displayName: 'YYYY-MM-DD hh:mm:ss A',
                description: 'Javascript YYYY-MM-DD hh:mm:ss A Format Type',
            },
            {
                name: 'hh:mm A',
                displayName: 'hh:mm A',
                description: 'Javascript hh:mm A Format Type',
            },
            {
                name: 'ddd MMM D YY h:mm A',
                displayName: 'ddd MMM D YY h:mm A',
                description: 'Javascript ddd MMM D YY h:mm A Format Type',
            },
            {
                name: 'dddd, MMM D YYYY hh:mm A',
                displayName: 'dddd, MMM D YYYY hh:mm A',
                description: 'Javascript dddd, MMM D YYYY hh:mm A Format Type',
            },
        ],
    },
    {
        name: 'dateOnly',
        schema: Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP),
        displayName: 'Date Only',
        description: 'This value is use when we only want to show date',
    },
    {
        name: 'timeOnly',
        schema: Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP),
        displayName: 'Time Only',
        description: 'This value is use when we only want to show Time',
    },
    {
        name: 'minDate',
        schema: Schema.ofRef(SCHEMA_REF_ANY_COMP_PROP),
        displayName: 'Min Date',
        description: 'This value is use when we want to show Date after the min date, others will be disabled',
    },
    {
        name: 'maxDate',
        schema: Schema.ofRef(SCHEMA_REF_ANY_COMP_PROP),
        displayName: 'Max Date',
        description: 'This value is use when we want to show Date before the Max date, others will be disabled',
    },
    {
        name: 'yearAndMonthSelector',
        schema: Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP),
        displayName: 'Can Edit Year and Month At One go.',
        description: 'This value is use when we want to show Year and month in calendar for selection',
    },
    {
        name: 'isDateRange',
        schema: Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP),
        displayName: 'Can have date range selection.',
        description: 'This value is use when we want to show Date Range Selection.',
    },
    {
        name: 'is24hour',
        schema: Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP),
        displayName: 'Can have time type selection.',
        description: 'This value is use when we want to show time in 24hr format Selection.',
    },
    {
        name: 'calendarIcon',
        schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
        displayName: 'Can give any type of icon for calendar compoennt',
        description: 'This value is use when we want to add a icon to the calendar compoenent.',
    },
    {
        name: 'calendarDateRangeIcon',
        schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
        displayName: 'Can give any type of icon for calendar date range compoennt',
        description: 'This value is use when we want to add a icon to the calendar date range compoenent.',
    },
    {
        name: 'readOnlyTime',
        schema: Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP),
        displayName: 'Can give true or false for time dropdown readonly date compoennt',
        description: 'This value is use when we want to set time dropdown readonly in calendar date range compoenent.',
    },
    {
        name: 'closeOnMouseLeave',
        schema: Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP),
        displayName: 'Can give true or false for time dropdown to make the hover to close disable for date compoennt',
        description: 'This value is use when we want to set dropdown hover disable or enable in calendar date range compoenent.',
    },
];

const stylePropertiesDefinition = {
    '': {
        [COMPONENT_STYLE_GROUP_PROPERTIES.flex.type]: COMPONENT_STYLE_GROUP_PROPERTIES.flex,
        [COMPONENT_STYLE_GROUP_PROPERTIES.margin.type]: COMPONENT_STYLE_GROUP_PROPERTIES.margin,
        [COMPONENT_STYLE_GROUP_PROPERTIES.padding.type]: COMPONENT_STYLE_GROUP_PROPERTIES.padding,
        [COMPONENT_STYLE_GROUP_PROPERTIES.outline.type]: COMPONENT_STYLE_GROUP_PROPERTIES.outline,
        [COMPONENT_STYLE_GROUP_PROPERTIES.position.type]: COMPONENT_STYLE_GROUP_PROPERTIES.position,
        [COMPONENT_STYLE_GROUP_PROPERTIES.size.type]: COMPONENT_STYLE_GROUP_PROPERTIES.size,
        [COMPONENT_STYLE_GROUP_PROPERTIES.transform.type]:
            COMPONENT_STYLE_GROUP_PROPERTIES.transform,
        [COMPONENT_STYLE_GROUP_PROPERTIES.zIndex.type]: COMPONENT_STYLE_GROUP_PROPERTIES.zIndex,
    },
};

export { propertiesDefinition, stylePropertiesDefinition };