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
}