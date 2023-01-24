import { Schema } from '@fincity/kirun-js';
import {
    NAMESPACE_UI_ENGINE,
    SCHEMA_REF_ANY_COMP_PROP,
    SCHEMA_REF_BOOL_COMP_PROP,
    SCHEMA_REF_DATA_LOCATION,
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
        defaultValue: new Date(),
    },

    {
        name: 'readOnly',
        schema: Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP),
        displayName: 'Read Only',
        description: 'Calendar will be rendered un editable when this property is true.',
        group: ComponentPropertyGroup.COMMON,
    },
    {
        name: 'placeholderType',
        schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
        displayName: 'Placeholder Type',
        description: 'This value is used when we want to display the format of the input placeholder',
        editor: ComponentPropertyEditor.ENUM,
        defaultValue: 'MM/DD/YYYY',
        enumValues: [],
    },
    {
        name: 'dateOnly',
        schema: Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP),
        displayName: 'Date Only',
        description: 'This value is use when we only want to show date',
    }
];

const stylePropertiesDefinition = {};

export { propertiesDefinition, stylePropertiesDefinition };