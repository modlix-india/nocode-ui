import { Schema } from '@fincity/kirun-js';
import {
    SCHEMA_REF_ANY_COMP_PROP,
    SCHEMA_REF_BOOL_COMP_PROP,
    SCHEMA_REF_NUM_COMP_PROP,
    SCHEMA_REF_STRING_COMP_PROP,
} from '../../constants';
import {
    ComponentPropertyEditor,
    ComponentPropertyDefinition,
    ComponentStylePropertyDefinition,
} from '../../types/common';
import { COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
    {
        name: 'uploadFileType',
        schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
        displayName: 'upload File UI type',
        description: `Show the UI type of the upload component which is selected.`,
        defaultValue: 'LARGE_VIEW',
        editor: ComponentPropertyEditor.ENUM,
        enumValues: [
            { name: 'MID_VIEW', displayName: 'Tablet like mid ui', description: 'A mid view of the component' },
            { name: 'SMALL_VIEW', displayName: 'Mobile like small ui', description: 'A small view of the component' }
        ]
    },
    {
        name: 'uploadIcon',
        schema: Schema.ofRef(SCHEMA_REF_ANY_COMP_PROP),
        displayName: 'Upload Icon',
        description: `Upload Icon.`,
        defaultValue: "fa fa-solid fa-upload"
    },
    {
        name: 'mainText',
        schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
        displayName: 'Main text for upload component',
        description: `Upload Component Main Text.`,
        defaultValue: "Upload"
    },
    {
        name: 'label',
        schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
        displayName: 'label text for upload component',
        description: `Upload Component label Text.`,
        defaultValue: "Or drag and drop here"
    },
    {
        name: 'placeholder',
        schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
        displayName: 'placeholder text for upload component',
        description: `Upload Component placeholder Text.`,
        defaultValue: "Select files..."
    },
    {
        name: 'multiple',
        schema: Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP),
        displayName: 'upload multiple file selected for upload component',
        description: `Upload multiple file when file selected for Upload Component.`,
        defaultValue: true
    },
    {
        name: 'readOnly',
        schema: Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP),
        displayName: 'Upload component disabled',
        description: 'Upload Component disabled'
    },
    {
        name: 'maxFileSize',
        schema: Schema.ofRef(SCHEMA_REF_NUM_COMP_PROP),
        displayName: 'Upload component max file size in bytes',
        description: 'Upload Component Max File Size in bytes',
        defaultValue: '1000000'
    },
    {
        name: 'options',
        schema: Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP),
        displayName: 'Upload file types options',
        description: 'Upload files type options',
        defaultValue: 'image/jpeg,image/png'
    }
];

const stylePropertiesDefinition: ComponentStylePropertyDefinition = {
    '': {
        [COMPONENT_STYLE_GROUP_PROPERTIES.size.name]: COMPONENT_STYLE_GROUP_PROPERTIES.size,
        [COMPONENT_STYLE_GROUP_PROPERTIES.padding.name]: COMPONENT_STYLE_GROUP_PROPERTIES.padding,
        [COMPONENT_STYLE_GROUP_PROPERTIES.margin.name]: COMPONENT_STYLE_GROUP_PROPERTIES.margin,
        [COMPONENT_STYLE_GROUP_PROPERTIES.flex.name]: COMPONENT_STYLE_GROUP_PROPERTIES.flex,
        [COMPONENT_STYLE_GROUP_PROPERTIES.border.name]: {
            ...COMPONENT_STYLE_GROUP_PROPERTIES.border,
            target: ['uploadContainer'],
        },
        [COMPONENT_STYLE_GROUP_PROPERTIES.background.name]: {
            ...COMPONENT_STYLE_GROUP_PROPERTIES.background,
            target: ['uploadContainer'],
        },
        [COMPONENT_STYLE_GROUP_PROPERTIES.font.name]: {
            ...COMPONENT_STYLE_GROUP_PROPERTIES.font,
            target: ['icon'],
        },
        [COMPONENT_STYLE_GROUP_PROPERTIES.color.name]: {
            ...COMPONENT_STYLE_GROUP_PROPERTIES.color,
            target: ['icon'],
        },
    },
    uploadContainer: {
        [COMPONENT_STYLE_GROUP_PROPERTIES.padding.name]: {
            ...COMPONENT_STYLE_GROUP_PROPERTIES.padding,
            displayName: 'Upload Container Padding',
            description: "Upload Container Padding",
            prefix: 'uploadContainer',
            target: ['uploadContainer'],
        },
    },
    mainText: {
        [COMPONENT_STYLE_GROUP_PROPERTIES.font.name]: {
            ...COMPONENT_STYLE_GROUP_PROPERTIES.font,
            displayName: 'Upload Container Main Text Font Styles',
            description: "Upload Component Main Text Font Styles",
            prefix: 'mainText',
            target: ['mainText'],
        },
        [COMPONENT_STYLE_GROUP_PROPERTIES.color.name]: {
            ...COMPONENT_STYLE_GROUP_PROPERTIES.color,
            displayName: 'Upload Container Font color',
            description: "Upload Component Main Text Font Color",
            prefix: 'mainText',
            target: ['mainText'],
        },
    },
    label: {
        [COMPONENT_STYLE_GROUP_PROPERTIES.font.name]: {
            ...COMPONENT_STYLE_GROUP_PROPERTIES.font,
            displayName: 'Upload Container label Font Styles',
            description: "Upload Component label Font Styles",
            prefix: 'label',
            target: ['label'],
        },
        [COMPONENT_STYLE_GROUP_PROPERTIES.color.name]: {
            ...COMPONENT_STYLE_GROUP_PROPERTIES.color,
            displayName: 'Upload Container label Font color',
            description: "Upload Component label Font Color",
            prefix: 'label',
            target: ['label'],
        },
    },
    inputStyles: {
        [COMPONENT_STYLE_GROUP_PROPERTIES.font.name]: {
            ...COMPONENT_STYLE_GROUP_PROPERTIES.font,
            displayName: 'Upload Container inputStyles label Font Styles',
            description: "Upload Component inputStyles label Text Font Styles",
            prefix: 'inputStyles',
            target: ['inputStyles'],
        },
        [COMPONENT_STYLE_GROUP_PROPERTIES.color.name]: {
            ...COMPONENT_STYLE_GROUP_PROPERTIES.color,
            displayName: 'Upload Container inputStyles label Text Font color',
            description: "Upload Component inputStyles label Text Font Color",
            prefix: 'inputStyles',
            target: ['inputStyles'],
        },
        [COMPONENT_STYLE_GROUP_PROPERTIES.background.name]: {
            ...COMPONENT_STYLE_GROUP_PROPERTIES.background,
            displayName: 'Upload Container inputStyles label background color',
            description: "Upload Component inputStyles label background Color",
            prefix: 'inputStyles',
            target: ['inputStyles'],
        },
        [COMPONENT_STYLE_GROUP_PROPERTIES.border.name]: {
            ...COMPONENT_STYLE_GROUP_PROPERTIES.border,
            displayName: 'Upload Container inputStyles label border styles',
            description: "Upload Component inputStyles label border styles",
            prefix: 'inputStyles',
            target: ['inputStyles'],
        },
        [COMPONENT_STYLE_GROUP_PROPERTIES.padding.name]: {
            ...COMPONENT_STYLE_GROUP_PROPERTIES.padding,
            displayName: 'Upload Container inputStyles padding styles',
            description: "Upload Component inputStyles padding styles",
            prefix: 'inputStyles',
            target: ['inputStyles'],
        },
    },
    selectedFiles: {
        [COMPONENT_STYLE_GROUP_PROPERTIES.font.name]: {
            ...COMPONENT_STYLE_GROUP_PROPERTIES.font,
            displayName: 'Upload Container selectedFiles Font Styles',
            description: "Upload Component selectedFiles Font Styles",
            prefix: 'selectedFiles',
            target: ['selectedFiles'],
        },
        [COMPONENT_STYLE_GROUP_PROPERTIES.color.name]: {
            ...COMPONENT_STYLE_GROUP_PROPERTIES.color,
            displayName: 'Upload Container selectedFiles Font color',
            description: "Upload Component selectedFiles Font Color",
            prefix: 'selectedFiles',
            target: ['selectedFiles'],
        },
    },
    selectedMain: {
        [COMPONENT_STYLE_GROUP_PROPERTIES.flex.name]: {
            ...COMPONENT_STYLE_GROUP_PROPERTIES.flex,
            displayName: 'Upload Container selectedFiles Main Div flex style',
            description: "Upload Component selectedFiles Main Div flex style",
            prefix: 'selectedMain',
            target: ['selectedMain'],
        },
        [COMPONENT_STYLE_GROUP_PROPERTIES.container.name]: {
            ...COMPONENT_STYLE_GROUP_PROPERTIES.container,
            displayName: 'Upload Container selectedFiles Main Div container style',
            description: "Upload Component selectedFiles Main Div container style",
            prefix: 'selectedMain',
            target: ['selectedMain'],
        },
        [COMPONENT_STYLE_GROUP_PROPERTIES.scrollbar.name]: {
            ...COMPONENT_STYLE_GROUP_PROPERTIES.scrollbar,
            displayName: 'Upload Container selectedFiles Main Div sroll bar hide or show style',
            description: "Upload Component selectedFiles Main Div sroll bar hide or show style",
            prefix: 'selectedMain',
            target: ['selectedMain'],
        }
    },
    errorText: {
        [COMPONENT_STYLE_GROUP_PROPERTIES.font.name]: {
            ...COMPONENT_STYLE_GROUP_PROPERTIES.font,
            displayName: 'Upload Container errorText Font Styles',
            description: "Upload Component errorText Font Styles",
            prefix: 'errorText',
            target: ['errorText'],
        },
        [COMPONENT_STYLE_GROUP_PROPERTIES.color.name]: {
            ...COMPONENT_STYLE_GROUP_PROPERTIES.color,
            displayName: 'Upload Container errorText Font color',
            description: "Upload Component errorText Font Color",
            prefix: 'errorText',
            target: ['errorText'],
        },
    },
};

export { propertiesDefinition, stylePropertiesDefinition };