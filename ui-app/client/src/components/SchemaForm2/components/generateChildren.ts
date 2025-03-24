import { isNullValue, Repository, Schema, SchemaType, SchemaUtil, duplicate } from "@fincity/kirun-js";
import { useEffect, useMemo, useState } from "react";
import { PREVIEW_COMP_DEFINITION_MAP } from "../../FormStorageEditor/components/formCommons";
import { ComponentDefinition, ComponentProperty, PageDefinition } from "../../../types/common"; import { shortUUID } from "../../../util/shortUUID";

const NUMBER_TYPES = new Set([SchemaType.INTEGER, SchemaType.LONG, SchemaType.FLOAT, SchemaType.DOUBLE]);
const ALL_SET = Schema.ofAny("Any").getType()?.getAllowedSchemaTypes()!;

export default function generateChildren({
    schema: actualSchema = Schema.ofAny("Any"),
    schemaRepository,
    bindingPathPath,
}: {
    schema?: Schema;
    schemaRepository: Repository<Schema>;
    bindingPathPath?: string;
}) {
    const [schema, setSchema] = useState(actualSchema);

    useEffect(() => {
        if (isNullValue(actualSchema.getRef())) {
            setSchema(actualSchema);
            return;
        }

        const resolveSchema = async () => {
            const resolvedSchema = await SchemaUtil.getSchemaFromRef(actualSchema, schemaRepository, actualSchema.getRef());
            setSchema(resolvedSchema ?? actualSchema);
        };

        resolveSchema();
    }, [actualSchema, schemaRepository]);

    let types: Set<SchemaType> = schema.getType()?.getAllowedSchemaTypes() ?? ALL_SET;

    const formPreview = useMemo(() => {
        return types.size > 0 ? generateFormPreview(schema, bindingPathPath) : { children: {}, pageDef: {} as PageDefinition };
    }, [schema, bindingPathPath]);
    return formPreview;
}

function compDefinitionGenerator(
    label: string,
    schema: Schema,
    bindingPathPath?: string,
    displayOrder: number = 0,
) {
    let types: Set<SchemaType> = schema.getType()?.getAllowedSchemaTypes() ?? ALL_SET;

    const compName = getComponentName(types);
    if (!compName) return null;

    const compKey = `${compName}_${label.trim().replace(/\s+/g, "_")}`.toLowerCase();
    const properties = componentPropertyMap[compName] ? componentPropertyMap[compName](schema, types) : {};

    const compDef: ComponentDefinition = {
        ...(duplicate(PREVIEW_COMP_DEFINITION_MAP.get(compName)) as ComponentDefinition),
        key: compKey,
        name: compName,
        displayOrder: displayOrder,
        type: compName,
        properties: properties,
        bindingPath: bindingPathPath ? { type: "VALUE", value: `${bindingPathPath}` } : undefined,
    };

    return compDef;
}

function generateFormPreview(schema: Schema, bindingPathPath?: string, orderTracker: { currentOrder: number } = { currentOrder: 0 }) {
    const label = schema.getTitle() || "defaultLabel";
    let componentDefinitions: { [key: string]: ComponentDefinition } = {};
    let children: { [key: string]: boolean } = {};

    let types: Set<SchemaType> = schema.getType()?.getAllowedSchemaTypes() ?? ALL_SET;

    if (types.has(SchemaType.OBJECT)) {
        const properties = schema.getProperties() || {};

        if (properties instanceof Map) {
            const propertiesArray = Array.from(properties.entries());

            propertiesArray.forEach(([propName, subSchema]) => {
                const propBindingPath = bindingPathPath ? `${bindingPathPath}.${propName}` : bindingPathPath;

                const compDef = compDefinitionGenerator(propName, subSchema as Schema, propBindingPath, orderTracker.currentOrder);
                if (compDef) {
                    componentDefinitions[compDef.key] = compDef;
                    children[compDef.key] = true;
                    orderTracker.currentOrder++;
                }

                if (subSchema.getType()?.getAllowedSchemaTypes()?.has(SchemaType.OBJECT)) {
                    const nestedPreview = generateFormPreview(subSchema, propBindingPath, orderTracker);
                    Object.assign(componentDefinitions, nestedPreview.pageDef.componentDefinition);
                    Object.assign(children, nestedPreview.children);
                }
            });
        }
    } else {
        const compDef = compDefinitionGenerator(label, schema, bindingPathPath, orderTracker.currentOrder);
        if (compDef) {
            componentDefinitions[compDef.key] = compDef;
            children[compDef.key] = true;
            orderTracker.currentOrder++;
        }
    }

    return {
        children,
        pageDef: {
            name: "SchemaForm2",
            baseClientCode: "",
            permission: "",
            isFromUndoRedoStack: false,
            eventFunctions: {},
            clientCode: "",
            appCode: "",
            version: 0,
            translations: {},
            properties: {},
            rootComponent: "",
            componentDefinition: componentDefinitions,
        },
    };

}

function getComponentName(types: Set<SchemaType>) {
    if (!types || types.size === ALL_SET.size) return null;

    const hasBoolean = types.has(SchemaType.BOOLEAN);
    if (hasBoolean) return "CheckBox";

    const hasArray = types.has(SchemaType.ARRAY);
    if (hasArray) return "Dropdown";

    const hasString = types.has(SchemaType.STRING);
    const hasNumber = [...types].some(type => NUMBER_TYPES.has(type));
    if (hasString || hasNumber) return "TextBox";

    return null;
}

interface ComponentPropertyGenerator {
    (schema: Schema, types: Set<SchemaType>): { [key: string]: ComponentProperty<any> };
}

const componentPropertyMap: { [key: string]: ComponentPropertyGenerator } = {
    TextBox: (schema, types) => {
        const hasString = types.has(SchemaType.STRING);
        const hasNumber = [...types].some(type => NUMBER_TYPES.has(type));

        const properties: { [key: string]: ComponentProperty<any> } = {};

        if (!hasString || !hasNumber) {
            properties.valueType = { value: hasString ? "text" : "number" };

            if (hasNumber) {
                properties.numberType = {
                    value: types.has(SchemaType.FLOAT) || types.has(SchemaType.DOUBLE) ? "DECIMAL" : "INTEGER",
                };
            }
        }

        properties.maxChars = { value: schema.getMaximum() ?? schema.getMaxLength() ?? undefined };
        properties.minChars = { value: schema.getMinimum() ?? schema.getMinLength() ?? undefined };

        return properties;
    },

    CheckBox: (schema, types) => ({
        valueType: { value: types.has(SchemaType.BOOLEAN) ? "boolean" : undefined },
    }),

    Dropdown: (schema) => ({
        options: { value: schema.getEnums() ?? [] },
        multiSelect: { value: false },
    }),
};
