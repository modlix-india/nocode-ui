import { isNullValue, Repository, Schema, SchemaType, SchemaUtil } from "@fincity/kirun-js";
import { useEffect, useState } from "react";
import { shortUUID } from "../../../util/shortUUID";
import { duplicate } from "@fincity/kirun-js";
import { PREVIEW_COMP_DEFINITION_MAP } from "../../FormStorageEditor/components/formCommons";
import { ComponentDefinition, DataLocation, PageDefinition } from "../../../types/common";

const NUMBER_SET = new Set([SchemaType.FLOAT, SchemaType.INTEGER, SchemaType.DOUBLE, SchemaType.LONG]);
const ALL_SET = Schema.ofAny("Any").getType()?.getAllowedSchemaTypes()!;

export default function generateChildren({
    schema: actualSchema = Schema.ofAny("Any"),
    schemaRepository,
    bindingPath
}: {
    schema?: Schema;
    schemaRepository: Repository<Schema>;
    bindingPath: any;
}) {
    const [schema, setSchema] = useState(actualSchema);

    useEffect(() => {
        if (isNullValue(actualSchema.getRef())) {
            setSchema(prev => (prev === actualSchema ? prev : actualSchema));
            return;
        }
    
        (async () => {
            const resolvedSchema = await SchemaUtil.getSchemaFromRef(actualSchema, schemaRepository, actualSchema.getRef());
    
            setSchema(prev => (prev === (resolvedSchema ?? actualSchema) ? prev : resolvedSchema ?? actualSchema));
        })();
    }, [actualSchema, schemaRepository]);

    let types: Set<SchemaType> = schema.getType()?.getAllowedSchemaTypes() ?? ALL_SET;

    if (types?.size === 1) {
        return generateFormPreview(schema, types,bindingPath);
    }

    return { children: {}, pageDef: {} as PageDefinition };
}


function compDefinitionGenerator(label: string, schemaTypes: Set<SchemaType>,bindingPath: any) {
    let compName = getComponentName(schemaTypes);
    if (!compName) return null;

    let uuid = shortUUID();
    let compDef: ComponentDefinition = {
        ...(duplicate(PREVIEW_COMP_DEFINITION_MAP.get(compName)) as ComponentDefinition),
        key: uuid,
        name: compName,
        displayOrder: 0,
        type: compName,
        properties: {},
        bindingPath: {
            value: `${bindingPath.value}`,
            type: "VALUE",
        } as DataLocation,
    };

    return compDef;
}


function generateFormPreview(schema: Schema, schemaTypes: Set<SchemaType>,bindingPath: any) {
    const label = schema.getTitle() || "defaultLabel";
    const compDef = compDefinitionGenerator(label, schemaTypes,bindingPath);
    if (!compDef) return { children: {}, pageDef: {} as PageDefinition };

    let pageDef: PageDefinition = {
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
    };

    let children = { [compDef.key]: true };

    return { children, pageDef };
}


function getComponentName(schemaType: Set<SchemaType>): string | null {
    if (schemaType.has(SchemaType.STRING) ||
        (schemaType.has(SchemaType.INTEGER)) ||
        (schemaType.has(SchemaType.FLOAT)) ||
        (schemaType.has(SchemaType.DOUBLE)) ||
        (schemaType.has(SchemaType.LONG)))
        return "TextBox";
    if (schemaType.has(SchemaType.BOOLEAN)) return "CheckBox";
    return null;
}
