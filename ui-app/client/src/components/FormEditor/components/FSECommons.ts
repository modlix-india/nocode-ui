export interface EditorProps {
    restrictToSchema: any;
    readOnly: boolean;
    onChange: (schema: any) => void;
    schema: any;
    styles: {
        regular: any;
        hover: any;
    };
    hideAddFieldButton?: boolean;
    path: string;
    detailType: 'details' | 'viewDetails';
}

export function getKeysInOrder(schema: any, detailType: 'details' | 'viewDetails') {
    if (!schema?.properties) return [];
    
    const keys = Object.keys(schema.properties);
    return keys.sort((a, b) => {

        const aOrder = schema.properties[a][detailType]?.order;
        const bOrder = schema.properties[b][detailType]?.order;

        if (aOrder === undefined && bOrder === undefined) return a.localeCompare(b);
        if (aOrder === undefined) return 1;
        if (bOrder === undefined) return -1;

        return aOrder - bOrder;
    });
}