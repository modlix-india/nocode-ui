import { isNullValue, Repository, Schema, SchemaType, SchemaUtil } from "@fincity/kirun-js";
import { useEffect, useState } from "react";
import { duplicate } from "@fincity/kirun-js";
import { PREVIEW_COMP_DEFINITION_MAP } from "../../FormStorageEditor/components/formCommons";
import { ComponentDefinition, ComponentProperty, PageDefinition } from "../../../types/common";

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

        (async () => {
            setSchema((await SchemaUtil.getSchemaFromRef(schema, schemaRepository, schema.getRef())) ?? actualSchema);
        })();
    }, [actualSchema, schemaRepository]);

    let types: Set<SchemaType> = schema.getType()?.getAllowedSchemaTypes() ?? ALL_SET;

    if (types.size > 0) {
        return generateFormPreview(schema, bindingPathPath);
    }

    return { children: {}, pageDef: {} as PageDefinition };
}

function compDefinitionGenerator(label: string, schema: Schema, bindingPathPath?: string) {

    let types: Set<SchemaType> = schema.getType()?.getAllowedSchemaTypes() ?? ALL_SET;

    const compName = getComponentName(types);
    if (!compName) return null;

    const compKey = `${compName}_${label.trim().replace(/\s+/g, "_")}`.toLowerCase();

    const compDef: ComponentDefinition = {
        ...(duplicate(PREVIEW_COMP_DEFINITION_MAP.get(compName)) as ComponentDefinition),
        key: compKey,
        name: compName,
        displayOrder: 0,
        type: compName,
        properties: componentPropertyMap[compName] ? componentPropertyMap[compName](schema, types) : {},
        bindingPath: bindingPathPath ? { type: "VALUE", value: `${bindingPathPath}` } : undefined,
    };

    return compDef;
}

function generateFormPreview(schema: Schema, bindingPathPath?: string) {

    const label = schema.getTitle() || "defaultLabel";
    const compDef = compDefinitionGenerator(label, schema, bindingPathPath);
    if (!compDef) return { children: {}, pageDef: {} as PageDefinition };

    return {
        children: { [compDef.key]: true },
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
            componentDefinition: { [compDef.key]: compDef },
        },
    };
}

function getComponentName(types: Set<SchemaType>) {

    if (!types || types.size === 9) return null;

    const hasString = types.has(SchemaType.STRING);
    const hasNumber = [...types].some(type => NUMBER_TYPES.has(type));
    const hasBoolean = types.has(SchemaType.BOOLEAN);
    const hasArray = types.has(SchemaType.ARRAY);

    if (hasBoolean) return "CheckBox";
    if (hasArray) return "Dropdown";

    if (hasString || hasNumber) return "TextBox";

    return null;
}


const componentPropertyMap : Record<string, (schema: Schema, types: Set<SchemaType>) => Record<string, ComponentProperty<any>>> = {
    TextBox: (schema, types) => {

        const hasString = types.has(SchemaType.STRING);
        const hasNumber = [...types].some(type => NUMBER_TYPES.has(type));

        if (hasString && hasNumber) return {};

        const properties: Record<string, ComponentProperty<any>> = {};

        if (!(hasString && hasNumber)) {
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

    CheckBox: () => ({
        valueType: { value: "boolean" },
    }),

    Dropdown: (schema) => ({
        options: { value: schema.getEnums() ?? [] },
        multiSelect: { value: false },
    }),
};




