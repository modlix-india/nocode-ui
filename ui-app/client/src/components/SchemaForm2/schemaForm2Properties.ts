import { SCHEMA_ANY_COMP_PROP } from "../../constants";
import {
  ComponentPropertyDefinition,
  ComponentPropertyEditor,
  ComponentStylePropertyDefinition,
} from "../../types/common";
import {
  COMMON_COMPONENT_PROPERTIES,
  COMPONENT_STYLE_GROUP_PROPERTIES,
} from "../util/properties";

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
  {
    name: "schema",
    displayName: "Schema",
    description: "Schema to generate form",
    schema: SCHEMA_ANY_COMP_PROP,
    editor: ComponentPropertyEditor.SCHEMA,
    defaultValue: {
      type: [
        "INTEGER",
        "LONG",
        "FLOAT",
        "DOUBLE",
        "STRING",
        "OBJECT",
        "ARRAY",
        "BOOLEAN",
        "NULL",
      ],
      name: "Any Type",
      namespace: "_",
    },
  },
  COMMON_COMPONENT_PROPERTIES.readOnly,
  COMMON_COMPONENT_PROPERTIES.visibility,
];

const stylePropertiesDefinition: ComponentStylePropertyDefinition = {
  "": [
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
